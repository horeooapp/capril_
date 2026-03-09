import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "./auth.config"
import { redis } from "@/lib/redis"

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
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
                const storedOtp = await redis.get(`otp:${phone}`);
                
                // Dev bypass for testing if needed
                const isDev = process.env.NODE_ENV === 'development';
                const isValid = storedOtp === otp || (isDev && otp === '123456');

                if (!isValid) {
                    throw new Error("Invalid or expired OTP");
                }

                // 2. Clear OTP
                await redis.del(`otp:${phone}`);

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
        })
    ],
})
