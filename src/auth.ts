import NextAuth, { CredentialsSignin } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"

class CustomAuthError extends CredentialsSignin {
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

                // 1. Verify OTP in Redis
                let storedOtp: string | null = null;
                if (redis) {
                    storedOtp = await redis.get(`otp:${email}`);
                }

                const isValid = storedOtp === otp;

                if (!isValid) {
                    throw new CustomAuthError("Invalid or expired OTP");
                }

                try {
                    // 2. Clear OTP
                    if (redis) await redis.del(`otp:${email}`);

                    // 3. Find or Create User
                    let user = await prisma.user.findFirst({
                        where: { email }
                    });

                    if (user) {
                        // ROLE ENFORCEMENT: Check if DB role matches requested space category
                        const userRole = (user.role || '').toUpperCase();
                        const reqRole = (requestedRole || '').toUpperCase();

                        const DASHBOARD_ROLES = ['LANDLORD', 'LANDLORD_PRO', 'AGENCY', 'DIASPORA'];
                        const TENANT_ROLES = ['TENANT'];

                        let isAuthorized = false;
                        if (reqRole === 'TENANT') {
                            isAuthorized = TENANT_ROLES.includes(userRole);
                        } else if (reqRole === 'LANDLORD') {
                            isAuthorized = DASHBOARD_ROLES.includes(userRole);
                        } else if (reqRole === 'ADMIN') {
                            isAuthorized = true; // Admin bypass
                        }

                        if (!isAuthorized) {
                            let label = "Propriétaire";
                            if (userRole === 'TENANT') label = "Locataire";
                            if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') label = "Administrateur";
                            
                            throw new CustomAuthError(`Accès refusé : Ce compte est un compte ${label}. Veuillez utiliser l'espace de connexion dédié.`);
                        }
                    }

                    if (!user) {
                        user = await prisma.user.create({
                            data: {
                                email,
                                role: requestedRole as any,
                                status: 'PENDING_PROFILE',
                                phone: `PENDING_${Date.now()}` // Bypass NOT NULL constraint in production DB
                            }
                        });
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        phone: user.phone,
                        role: user.role,
                        status: user.status,
                        fullName: user.fullName,
                        onboardingComplete: (user as any).onboardingComplete,
                        diasporaAbonnement: (user as any).diasporaAbonnement
                    } as any;
                } catch (dbError: any) {
                    console.error("[AUTH] Database Error in authorize:", dbError.message || dbError);
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

                    return {
                        id: user.id,
                        email: user.email,
                        phone: user.phone,
                        role: role,
                        status: user.status,
                        fullName: user.fullName,
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
