import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"
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
                otp: { label: "Code OTP", type: "text" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.otp) return null;

                const email = (credentials.email as string).toLowerCase().trim();
                const otp = credentials.otp as string;

                // 1. Verify OTP in Redis
                let storedOtp: string | null = null;
                if (redis) {
                    storedOtp = await redis.get(`otp:${email}`);
                }

                const isValid = storedOtp === otp;

                if (!isValid) {
                    throw new Error("Invalid or expired OTP");
                }

                // 2. Clear OTP
                if (redis) await redis.del(`otp:${email}`);

                // 3. Find or Create User
                let user = await prisma.user.findFirst({
                    where: { email }
                });

                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            email,
                            role: 'TENANT',
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

                    const email = credentials.email as string;
                    const password = credentials.password as string;

                    const user = await prisma.user.findFirst({
                        where: { 
                            email,
                            role: { in: ['ADMIN', 'SUPER_ADMIN'] }
                        }
                    });

                    if (!user || !user.password) {
                        console.warn("[AUTH] Admin user not found or no password:", email);
                        throw new Error("Admin non trouvé ou mot de passe non configuré");
                    }

                    // 1. Verify password
                    const { compare } = await import("bcrypt-ts");
                    const isValidPassword = await compare(password, user.password);

                    if (!isValidPassword) {
                        console.warn("[AUTH] Invalid password for admin:", email);
                        throw new Error("Mot de passe incorrect");
                    }

                    console.log("[AUTH] Admin login success:", email);
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
                } catch (error) {
                    console.error("[AUTH] Error in admin-password authorize:", error);
                    return null;
                }
            }
        })
    ],
})
