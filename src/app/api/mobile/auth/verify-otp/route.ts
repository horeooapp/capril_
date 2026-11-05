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

        // 1. Verify OTP in Database (emailVerificationToken) and Redis
        let isValid = false;

        const dbToken = await prisma.emailVerificationToken.findFirst({
            where: {
                token: otp,
                email: normalizedEmail,
                usedAt: null
            },
            orderBy: { createdAt: 'desc' }
        });

        if (dbToken && dbToken.expiresAt > new Date()) {
            isValid = true;
            // Mark token as used
            await prisma.emailVerificationToken.update({
                where: { id: dbToken.id },
                data: { usedAt: new Date() }
            });
        }

        if (!isValid && redis) {
            try {
                const storedOtp = await redis.get(`otp:${normalizedEmail}`);
                if (storedOtp === otp) {
                    isValid = true;
                    await redis.del(`otp:${normalizedEmail}`);
                }
            } catch (e) {
                console.warn("[Redis] Failed to get or delete OTP", e);
            }
        }

        if (!isValid) {
            return NextResponse.json({ error: "Code de sécurité incorrect ou expiré." }, { status: 401 });
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
