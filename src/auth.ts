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
            id: "phone-otp",
            name: "Phone OTP",
            credentials: {
                phone: { label: "Téléphone", type: "text" },
                otp: { label: "Code OTP", type: "text" }
            },
            async authorize(credentials) {
                if (!credentials?.phone || !credentials?.otp) return null;

                const phone = credentials.phone as string;
                const otp = credentials.otp as string;

                // 1. Verify OTP in Redis (Part 3.3)
                let storedOtp: string | null = null;
                if (redis) {
                    storedOtp = await redis.get(`otp:${phone}`);
                }

                const isValid = storedOtp === otp;

                if (!isValid) {
                    throw new Error("Invalid or expired OTP");
                }

                // 2. Clear OTP
                if (redis) await redis.del(`otp:${phone}`);

                // 3. Find or Create User (Part 3.4.1)
                let user = await prisma.user.findUnique({
                    where: { phone }
                });

                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            phone,
                            role: 'TENANT',
                            status: 'PENDING_PROFILE'
                        }
                    });
                }

                return {
                    id: user.id,
                    phone: user.phone,
                    role: user.role,
                    status: user.status,
                    fullName: user.fullName
                };
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
                        phone: user.phone,
                        role: user.role,
                        status: user.status,
                        fullName: user.fullName
                    };
                } catch (error) {
                    console.error("[AUTH] Error in admin-password authorize:", error);
                    return null;
                }
            }
        })
    ],
})
