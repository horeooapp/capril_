import NextAuth, { CredentialsSignin } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"

class CustomAuthError extends CredentialsSignin {
  code: string;
  constructor(code: string) {
    super();
    this.code = code;
  }
}

import { authConfig } from "./auth.config"
import { redis } from "@/lib/redis"
import { writeAuditLog } from "@/lib/audit"

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
    secret: process.env.AUTH_SECRET,
    trustHost: true,
    debug: process.env.NODE_ENV === "development",
    adapter: PrismaAdapter(prisma),
    providers: [
        Credentials({
            id: "email-otp",
            name: "Email OTP",
            credentials: {
                email: { label: "Email", type: "email" },
                otp: { label: "Code OTP", type: "text" },
                role: { label: "Role", type: "text" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.otp) return null;

                const email = (credentials.email as string).toLowerCase().trim();
                const otp = credentials.otp as string;
                const requestedRole = (credentials.role as string) || 'TENANT';

                const ROLE_MAP: Record<string, string> = {
                  BAILLEUR:     "LANDLORD",
                  LOCATAIRE:    "TENANT",
                  ADMIN:        "ADMIN",
                  PROPRIETAIRE: "LANDLORD",
                  AGENCE:       "AGENCE_AGREE",
                  GESTIONNAIRE: "AGENCE_NON_AGREE",
                };

                const requestedRoleNormalise = ROLE_MAP[requestedRole.toUpperCase()] ?? requestedRole.toUpperCase();
                // ────────────────────────────────────────────────────────

                // 1. Verify OTP in Redis
                let storedOtp: string | null = null;
                if (redis) {
                    storedOtp = await redis.get(`otp:${email}`);
                }

                const isValid = storedOtp === otp;

                if (!isValid) {
                    await writeAuditLog({
                        action: "LOGIN_FAILED_OTP",
                        module: "AUTH",
                        newValues: { email, requestedRole }
                    });
                    throw new CustomAuthError("invalid_otp");
                }

                try {
                    // 2. Clear OTP
                    if (redis) await redis.del(`otp:${email}`);

                    // 3. Find or Create User
                    const user = await prisma.user.findFirst({
                        where: { email },
                        include: {
                            diasporaProfile: true,
                            capacites: { where: { actif: true } },
                            _count: {
                                select: {
                                    propertiesOwned: true,
                                    leasesAsTenant: true,
                                    mandates: true
                                }
                            }
                        }
                    });

                    if (user) {
                        await writeAuditLog({
                            userId: user.id,
                            action: "LOGIN_SUCCESS",
                            module: "AUTH",
                            newValues: { email, role: user.role }
                        });
                        // KICK-OUT IF SUSPENDED OR BANNED (God Mode Control)
                        if (user.status === "BANNED" || user.status === "SUSPENDED") {
                             throw new CustomAuthError("account_suspended");
                        }

                        // AUTO-ACTIVATE AGENCY COLLABORATORS ON FIRST LOGIN
                        const conf = (user as any).agencyConfig;
                        if (conf && conf.status === "INVITED") {
                            const newConfig = { ...conf, status: "ACTIVE", inviteToken: null };
                            await (prisma.user as any).update({
                                where: { id: user.id },
                                data: { agencyConfig: newConfig, status: "ACTIVE" }
                            });
                            (user as any).agencyConfig = newConfig;
                            user.status = "ACTIVE";
                        }

                        // ROLE DETECTION & ENFORCEMENT
                        const userRole = (user.role || '').toUpperCase();
                        const isDiaspora = !!(user as any).diasporaProfile?.diasporaAbonnement || (user as any).diasporaAbonnement === true || userRole === 'DIASPORA';
                        const isLandlord = userRole === 'LANDLORD' || userRole === 'LANDLORD_PRO' || user._count.propertiesOwned > 0;
                        const isTenant = userRole === 'TENANT' || user._count.leasesAsTenant > 0;
                        const isAgency = userRole === 'AGENCY' || userRole === 'NON_CERTIFIED_AGENT' || user._count.mandates > 0;
                        const isIntermediary = (user as any).profileType === 'INTERMEDIARY';
                        const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

                        // Compile eligible roles
                        const eligibleRolesSet = new Set<string>();
                        if (isLandlord) eligibleRolesSet.add('LANDLORD');
                        if (isTenant) eligibleRolesSet.add('TENANT');
                        if (isAgency) {
                            eligibleRolesSet.add('AGENCY');
                            if (userRole === 'NON_CERTIFIED_AGENT') eligibleRolesSet.add('NON_CERTIFIED_AGENT');
                        }
                        if (isIntermediary) eligibleRolesSet.add('INTERMEDIARY');
                        if (isDiaspora) eligibleRolesSet.add('DIASPORA');
                        if (isAdmin) eligibleRolesSet.add('ADMIN');

                        // ADD MISSING CAPACITIES FROM DATABASE
                        if (user.capacites && user.capacites.length > 0) {
                            user.capacites.forEach((c: any) => {
                                const cap = c.capacite.toUpperCase();
                                if (cap === 'PROPRIETAIRE' || cap === 'LANDLORD' || cap === 'LANDLORD_PRO') eligibleRolesSet.add('LANDLORD');
                                else if (cap === 'LOCATAIRE' || cap === 'TENANT') eligibleRolesSet.add('TENANT');
                                else if (cap === 'AGENCE_AGREE' || cap === 'AGENCY') {
                                    eligibleRolesSet.add('AGENCY');
                                    eligibleRolesSet.add('AGENCE_AGREE');
                                }
                                else if (cap === 'AGENCE_NON_AGREE' || cap === 'GESTIONNAIRE' || cap === 'NON_CERTIFIED_AGENT') {
                                    eligibleRolesSet.add('NON_CERTIFIED_AGENT');
                                    eligibleRolesSet.add('AGENCE_NON_AGREE');
                                }
                                else if (cap === 'INTERMEDIAIRE' || cap === 'INTERMEDIARY') eligibleRolesSet.add('INTERMEDIARY');
                                else if (cap === 'DIASPORA') eligibleRolesSet.add('DIASPORA');
                                else eligibleRolesSet.add(cap); // fallback
                            });
                        }

                        const reqRole = requestedRoleNormalise;

                        // Gestion stricte des privilèges d'administration
                        if (reqRole === 'ADMIN' || reqRole === 'SUPER_ADMIN') {
                            if (!isAdmin) {
                                throw new CustomAuthError("admin_access_denied");
                            }
                            eligibleRolesSet.add(reqRole);
                        }

                        // ASSOUPLISSEMENT DES RÈGLES : Un utilisateur peut cumuler Locataire et Propriétaire
                        const isDashboardRequest = ['LANDLORD', 'AGENCY', 'NON_CERTIFIED_AGENT', 'INTERMEDIARY', 'DIASPORA'].includes(reqRole);

                        if (isDashboardRequest) {
                            const hasAnyDashboardRole = Array.from(eligibleRolesSet).some(r => ['LANDLORD', 'AGENCY', 'NON_CERTIFIED_AGENT', 'INTERMEDIARY', 'DIASPORA'].includes(r));
                            if (!hasAnyDashboardRole) {
                                // On lui octroie dynamiquement le rôle demandé (ex: LANDLORD) pour qu'il puisse y accéder
                                eligibleRolesSet.add(reqRole);
                            }
                        } else if (reqRole === 'TENANT') {
                            if (!eligibleRolesSet.has('TENANT')) {
                                // Octroi dynamique de l'accès locataire
                                eligibleRolesSet.add('TENANT');
                            }
                        }

                        // ────────────────────────────────────────────────────────
                        // RÔLE ACTIF = STRICTEMENT CELUI DEMANDÉ À LA CONNEXION (reqRole)
                        // Une session = Un utilisateur + Un rôle actif choisi à la connexion.
                        // ────────────────────────────────────────────────────────
                        const activeRole = reqRole;

                        if (!eligibleRolesSet.has(activeRole)) {
                            eligibleRolesSet.add(activeRole);
                        }

                        // Mettre à jour en base de données pour aligner les requêtes Prisma ultérieures
                        await prisma.user.update({
                            where: { id: user.id },
                            data: { capaciteActive: activeRole }
                        }).catch((err: any) => console.error("[AUTH] Could not update capaciteActive:", err));

                        return {
                            id: user.id,
                            email: user.email,
                            phone: user.phone,
                            role: activeRole, // Le rôle actif de la session
                            status: user.status as any,
                            fullName: (user.firstName ? user.firstName + " " : "") + (user.lastName || ""),
                            onboardingComplete: (user as any).onboardingComplete,
                            diasporaAbonnement: (user as any).diasporaAbonnement,
                            capaciteActive: activeRole,
                            capacites: Array.from(eligibleRolesSet),
                            eligibleRoles: Array.from(eligibleRolesSet),
                            chosenRole: activeRole,
                            requiresRoleSelection: false
                        } as any;
                    }

                    if (!user) {
                        const roleBase = requestedRoleNormalise === "ADMIN"
                            ? "ADMIN"
                            : requestedRoleNormalise === "LANDLORD"
                                ? "LANDLORD"
                                : requestedRoleNormalise === "AGENCY"
                                    ? "AGENCY"
                                    : "TENANT";

                        const newUser = await prisma.user.create({
                            data: {
                                email,
                                role: roleBase,
                                status: 'PENDING_PROFILE',
                                phone: `PENDING_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
                                onboardingComplete: roleBase === "TENANT",
                                capaciteActive: roleBase
                            }
                        });

                        return {
                            id: newUser.id,
                            email: newUser.email,
                            phone: newUser.phone,
                            role: roleBase,
                            status: newUser.status,
                            fullName: (newUser.firstName ? newUser.firstName + " " : "") + (newUser.lastName || ""),
                            onboardingComplete: newUser.onboardingComplete,
                            capaciteActive: roleBase,
                            capacites: [roleBase],
                            eligibleRoles: [roleBase],
                            chosenRole: roleBase,
                            requiresRoleSelection: false
                        } as any;
                    }
                } catch (dbError: any) {
                    if (dbError instanceof CredentialsSignin) {
                        throw dbError;
                    }
                    console.error("[AUTH] Database Error in authorize:", dbError?.message || dbError);
                    // Append the actual error message so we can debug it on the live site
                    throw new Error(`database_error: ${dbError?.message || "Unknown Prisma Error"}`);
                }
            }
        }),
        Credentials({
            id: "admin-password",
            name: "Admin Password",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    console.log("[AUTH] Admin authorize attempt:", credentials?.email);
                    if (!credentials?.email || !credentials?.password) return null;

                    const email = (credentials.email as string).toLowerCase().trim();
                    const password = credentials.password as string;

                    // 1. Domain Restriction
                    if (!email.endsWith("@qapril.ci") && !email.endsWith("@qapril.net")) {
                        throw new CustomAuthError("domain_restricted");
                    }

                    const user = await prisma.user.findFirst({
                        where: { email }
                    });

                    if (!user) {
                        throw new CustomAuthError("account_not_found");
                    }

                    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
                        throw new CustomAuthError("insufficient_role");
                    }

                    if (!user.password) {
                        throw new CustomAuthError("password_not_configured");
                    }

                    // 2. Verify password
                    const { compare } = await import("bcrypt-ts");
                    const isValidPassword = await compare(password, user.password);

                    if (!isValidPassword) {
                        throw new CustomAuthError("invalid_password");
                    }

                    // 3. SuperAdmin Logic
                    let role = user.role;
                    if (email === "admin@qapril.ci" || email === "admin@qapril.net") {
                        role = "SUPER_ADMIN";
                        if (user.role !== "SUPER_ADMIN") {
                            await prisma.user.update({
                                where: { id: user.id },
                                data: { role: "SUPER_ADMIN" }
                            });
                        }
                    }

                    if (['ADMIN', 'SUPER_ADMIN'].includes(role)) {
                        // Désactivation automatique de la landing page lorsqu'un admin se connecte
                        await prisma.featureFlag.upsert({
                            where: { id: "LANDING_PAGE" },
                            update: { enabled: false },
                            create: { id: "LANDING_PAGE", name: "Page d'Accueil Marketing", description: "Active ou désactive la Landing Page marketing pour les utilisateurs connectés.", enabled: false }
                        }).catch(e => console.error("Failed to auto-disable landing page:", e));
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        phone: user.phone,
                        role: role,
                        status: user.status,
                        fullName: (user.firstName ? user.firstName + " " : "") + (user.lastName || ""),
                        onboardingComplete: true,
                        eligibleRoles: [role, 'ADMIN', 'SUPER_ADMIN'],
                        chosenRole: role,
                        capaciteActive: role,
                        capacites: [role],
                        requiresRoleSelection: false
                    } as any;
                } catch (error: any) {
                    console.error("[AUTH-ERROR] Admin failure:", error.message || error);
                    throw error;
                }
            }
        })
    ],
})