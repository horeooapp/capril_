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

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
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
                    throw new CustomAuthError("Code OTP incorrect ou expiré.");
                }

                try {
                    // 2. Clear OTP
                    if (redis) await redis.del(`otp:${email}`);

                    // 3. Find or Create User
                    const user = await prisma.user.findFirst({
                        where: { email },
                        include: {
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
                        // ROLE DETECTION & ENFORCEMENT
                        const userRole = (user.role || '').toUpperCase();
                        const isDiaspora = (user as any).diasporaAbonnement === true;
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

                        const reqRole = requestedRoleNormalise;

                        // Gestion stricte des privilèges d'administration
                        if (reqRole === 'ADMIN' || reqRole === 'SUPER_ADMIN') {
                            if (!isAdmin) {
                                throw new CustomAuthError("Accès refusé : Privilèges administrateur requis.");
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

                        const eligibleRoles = Array.from(eligibleRolesSet);

                        if (eligibleRoles.length === 0) {
                             throw new CustomAuthError("Compte sans rôle valide. Veuillez contacter le support.");
                        }

                        // PRIORITY: Determine chosen role based on Database State (V4)
                        let finalChosenRole = (user as any).capaciteActive || null;
                        let requiresSelection = false;

                        // If explicitly requested Tenant, respect it
                        if (reqRole === 'TENANT' && eligibleRoles.includes('TENANT')) {
                            finalChosenRole = 'TENANT';
                            requiresSelection = false;
                        } 
                        // If no DB choice but multiple options exist, force selection
                        else if (!finalChosenRole && eligibleRoles.length > 1) {
                            requiresSelection = true;
                        } 
                        // If only one choice, use it
                        else if (!finalChosenRole && eligibleRoles.length === 1) {
                            finalChosenRole = eligibleRoles[0];
                        }

                        return {
                            id: user.id,
                            email: user.email,
                            phone: user.phone,
                            role: user.role,
                            status: user.status,
                            fullName: (user.firstName ? user.firstName + " " : "") + (user.lastName || ""),
                            onboardingComplete: (user as any).onboardingComplete,
                            diasporaAbonnement: (user as any).diasporaAbonnement,
                            capaciteActive: (user as any).capaciteActive,
                            capacites: (user as any).capacites.map((c: any) => c.capacite),
                            eligibleRoles: eligibleRoles,
                            chosenRole: finalChosenRole,
                            requiresRoleSelection: requiresSelection
                        } as any;
                    }

                    if (!user) {
                        const { cookies } = await import("next/headers");
                        const cookieStore = await cookies();
                        const typeChoisi = cookieStore.get("qapril_type")?.value ?? "TENANT";
                        const roleBase = typeChoisi === "ADMIN" ? "ADMIN" : typeChoisi === "LOCATAIRE" ? "TENANT" : "LANDLORD";

                        const newUser = await prisma.user.create({
                            data: {
                                email,
                                role: roleBase,
                                status: 'PENDING_PROFILE',
                                phone: `PENDING_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
                                onboardingComplete: typeChoisi === "LOCATAIRE",
                                capaciteActive: typeChoisi === "LOCATAIRE" ? null : roleBase === "LANDLORD" ? "PROPRIETAIRE" : roleBase
                            }
                        });
                        
                        return {
                            id: newUser.id,
                            email: newUser.email,
                            phone: newUser.phone,
                            role: newUser.role,
                            status: newUser.status,
                            fullName: (newUser.firstName ? newUser.firstName + " " : "") + (newUser.lastName || ""),
                            onboardingComplete: newUser.onboardingComplete,
                            capaciteActive: (newUser as any).capaciteActive,
                            capacites: [],
                            eligibleRoles: [roleBase],
                            requiresRoleSelection: false
                        } as any;
                    }
                } catch (dbError: any) {
                    if (dbError instanceof CredentialsSignin) {
                        throw dbError;
                    }
                    console.error("[AUTH] Database Error in authorize:", dbError?.message || dbError);
                    throw new CustomAuthError("Database error");
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
                        throw new CustomAuthError("Accès restreint aux domaines autorisés (@qapril.ci, @qapril.net)");
                    }

                    const user = await prisma.user.findFirst({
                        where: { email }
                    });

                    if (!user) {
                        throw new CustomAuthError("Compte non trouvé.");
                    }

                    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
                        throw new CustomAuthError("Rôle insuffisant pour accéder à la console");
                    }

                    if (!user.password) {
                        throw new CustomAuthError("Mot de passe non configuré");
                    }

                    // 2. Verify password
                    const { compare } = await import("bcrypt-ts");
                    const isValidPassword = await compare(password, user.password);

                    if (!isValidPassword) {
                        throw new CustomAuthError("Mot de passe incorrect");
                    }

                    // 3. SuperAdmin Logic
                    let role = user.role;
                    if (email === "admin@qapril.ci") {
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
                        onboardingComplete: (user as any).onboardingComplete,
                        diasporaAbonnement: (user as any).diasporaAbonnement
                    } as any;
                } catch (error: any) {
                    console.error("[AUTH-ERROR] Admin failure:", error.message || error);
                    throw error; 
                }
            }
        })
    ],
})
