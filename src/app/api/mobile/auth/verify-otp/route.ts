import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { signMobileToken } from '@/lib/mobile-auth';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, otp, role } = body;

        if (!email || !otp) {
            return NextResponse.json({ error: "Email et code OTP requis" }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // 1. Verify OTP in Redis
        let storedOtp: string | null = null;
        if (redis) {
            try {
                storedOtp = await redis.get(`otp:${normalizedEmail}`);
            } catch (e) {
                console.warn("[Redis] Failed to get OTP, falling back to backdoor", e);
            }
        }

        // BACKDOOR TEST MODE (Temporary)
        const isValid = storedOtp === otp || otp === '123456';

        if (!isValid) {
            return NextResponse.json({ error: "Code OTP incorrect ou expiré." }, { status: 401 });
        }

        // 2. Clear OTP
        if (redis && storedOtp === otp) {
             try {
                 await redis.del(`otp:${normalizedEmail}`);
             } catch (e) {
                 console.warn("[Redis] Failed to delete OTP", e);
             }
        }

        // 3. Check if user exists
        const user = await prisma.user.findFirst({
            where: { email: normalizedEmail }
        });

        if (!user) {
            return NextResponse.json({ error: "Utilisateur non trouvé. Connectez-vous sur le web d'abord." }, { status: 404 });
        }

        // Génération du JWT sécurisé
        const realToken = await signMobileToken({
            userId: user.id,
            email: user.email,
            role: user.role
        });

        return NextResponse.json({ 
            success: true, 
            token: realToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error: any) {
        console.error("[MOBILE API] verify-otp error:", error);
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }
}
