import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { signMobileToken } from '@/lib/mobile-auth';
import { normalizePhone, maskPhone } from '@/lib/phone';

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const identifier = (body.identifier || body.email || body.phone || '').trim();
        const otp = (body.otp || '').trim();
        const role = body.role || 'TENANT';

        if (!identifier || !otp) {
            return NextResponse.json(
                { error: "L'identifiant (e-mail ou téléphone) et le code OTP sont obligatoires." },
                { status: 400 }
            );
        }

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
        const cleanPhone = identifier.replace(/[\s-]/g, '');
        const isPhone = !isEmail && /^\+?[0-9]{8,15}$/.test(cleanPhone);

        if (!isEmail && !isPhone) {
            return NextResponse.json(
                { error: "Format d'identifiant invalide. Saisissez un e-mail ou un numéro de téléphone ivoirien." },
                { status: 400 }
            );
        }

        const normalizedEmail = isEmail ? identifier.toLowerCase() : null;
        const normalizedPhone = isPhone ? normalizePhone(cleanPhone) : null;

        // 1. Vérification du code OTP dans Redis
        let isValid = false;
        if (redis) {
            try {
                if (isEmail && normalizedEmail) {
                    const storedOtp = await redis.get(`otp:${normalizedEmail}`);
                    if (storedOtp === otp) {
                        isValid = true;
                        await redis.del(`otp:${normalizedEmail}`);
                    }
                } else if (normalizedPhone) {
                    const storedOtp1 = await redis.get(`otp:${normalizedPhone}`);
                    const storedOtp2 = await redis.get(`otp:${cleanPhone}`);
                    if (storedOtp1 === otp || storedOtp2 === otp) {
                        isValid = true;
                        await redis.del(`otp:${normalizedPhone}`);
                        await redis.del(`otp:${cleanPhone}`);
                    }
                }
            } catch (e) {
                console.warn("[Redis] Erreur vérification OTP mobile:", e);
            }
        }

        // Fallback: table emailVerificationToken si email
        if (!isValid && normalizedEmail) {
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
                await prisma.emailVerificationToken.update({
                    where: { id: dbToken.id },
                    data: { usedAt: new Date() }
                });
            }
        }

        if (!isValid) {
            return NextResponse.json(
                { error: "Code de sécurité incorrect ou expiré. Veuillez réessayer." },
                { status: 401 }
            );
        }

        // 2. Recherche de l'utilisateur existant
        let user = await prisma.user.findFirst({
            where: isEmail
                ? { email: normalizedEmail! }
                : {
                    OR: [
                        { phone: normalizedPhone! },
                        { phone: normalizedPhone!.replace('+', '') },
                        { phone: cleanPhone },
                        { phone: identifier }
                    ]
                }
        });

        // 3. Inscription automatique si nouvel utilisateur
        if (!user) {
            const assignedRole = (role === 'LANDLORD' || role === 'BAILLEUR' || role === 'PROPRIETAIRE')
                ? 'LANDLORD'
                : (role === 'AGENCY' || role === 'AGENCE')
                    ? 'AGENCE_AGREE'
                    : 'TENANT';

            user = await prisma.user.create({
                data: {
                    email: normalizedEmail,
                    phone: normalizedPhone || `PENDING_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                    role: assignedRole as any,
                    status: 'ACTIVE',
                    capaciteActive: assignedRole,
                    onboardingComplete: assignedRole === 'TENANT'
                }
            });
        }

        // 4. Signature du token JWT mobile
        const token = await signMobileToken({
            userId: user.id,
            email: user.email || user.phone || 'mobile@qapril.ci',
            role: user.role
        });

        return NextResponse.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone?.startsWith("PENDING_") ? null : maskPhone(user.phone),
                rawPhone: user.phone?.startsWith("PENDING_") ? null : user.phone,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                onboardingComplete: user.onboardingComplete
            }
        });
    } catch (error: any) {
        console.error("[MOBILE API] verify-otp error:", error);
        return NextResponse.json(
            { error: "Erreur serveur lors de la validation du code." },
            { status: 500 }
        );
    }
}
