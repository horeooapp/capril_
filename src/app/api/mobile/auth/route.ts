import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { sendOTPEmail } from "@/lib/email";
import crypto from 'crypto';
import { signMobileToken } from '@/lib/mobile-auth';

// [SEC-FIX F-03] Génération OTP cryptographiquement sécurisée (Node.js crypto)
// Math.random() est un PRNG non-crypto remplacé par crypto.randomInt()
function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        // [SEC-FIX F-01] Le paramètre 'role' n'est plus accepté depuis le client
        // Le rôle est toujours lu depuis la base de données
        const { action, email, otp } = body;

        if (!email) return NextResponse.json({ error: "L'adresse e-mail est requise." }, { status: 400 });
        const normalizedEmail = email.toLowerCase().trim();

        // 1. Demander un code OTP
        if (action === 'REQUEST_OTP') {
            const user = await prisma.user.findFirst({ where: { email: normalizedEmail } });
            if (!user) {
                return NextResponse.json({ error: "Compte introuvable, veuillez vous inscrire sur le web." }, { status: 403 });
            }

            const newOtp = generateOTP();
            
            // Créer le token dans la base de données
            await prisma.emailVerificationToken.create({
                data: {
                    userId: user.id,
                    token: newOtp,
                    email: normalizedEmail,
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
                }
            });

            // On garde Redis en optionnel si configuré, pour compatibilité
            if (redis) {
                await redis.set(`otp:${normalizedEmail}`, newOtp, 'EX', 600); 
            }

            const emailResult = await sendOTPEmail(normalizedEmail, newOtp);
            
            if (!emailResult.success) {
                return NextResponse.json({ error: "Échec de l'envoi de l'email" }, { status: 500 });
            }
            return NextResponse.json({ success: true, message: "Code OTP envoyé." });
        }

        // 2. Vérifier le code OTP
        if (action === 'VERIFY_OTP') {
            if (!otp) return NextResponse.json({ error: "Code OTP requis." }, { status: 400 });

            // Trouver le token dans la DB
            const record = await prisma.emailVerificationToken.findFirst({
                where: { 
                    token: otp,
                    email: normalizedEmail,
                    usedAt: null
                },
                orderBy: { createdAt: 'desc' }
            });

            if (!record || record.expiresAt < new Date()) {
                // Fallback optionnel sur Redis si jamais le record DB a échoué mais Redis a fonctionné (rare)
                let redisMatch = false;
                if (redis) {
                    const storedOtp = await redis.get(`otp:${normalizedEmail}`);
                    if (storedOtp === otp) redisMatch = true;
                }

                if (!redisMatch) {
                    return NextResponse.json({ error: "Code incorrect ou expiré." }, { status: 400 });
                }
            }

            // Récupérer l'utilisateur
            const userId = record?.userId;
            const user = await prisma.user.findFirst({ 
                where: userId ? { id: userId } : { email: normalizedEmail } 
            });
            
            if (!user) {
                return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
            }

            // Valider l'email et marquer le token comme utilisé
            await prisma.$transaction([
                ...(record ? [prisma.emailVerificationToken.update({
                    where: { id: record.id },
                    data: { usedAt: new Date() }
                })] : []),
                prisma.user.update({
                    where: { id: user.id },
                    data: { 
                        emailVerified: true, 
                        emailVerifiedAt: new Date() 
                    }
                })
            ]);

            // [SEC-FIX F-01] Rôle lu uniquement depuis la DB, jamais depuis le client
            const realToken = await signMobileToken({
                userId: user.id, 
                email: user.email || '', 
                role: user.role || 'TENANT'
            });

            return NextResponse.json({ 
                success: true, 
                token: realToken, 
                user: { id: user.id, email: user.email, role: user.role, emailVerified: true } 
            });
        }

        return NextResponse.json({ error: "Action invalide." }, { status: 400 });

    } catch (error: any) {
        // [SEC-FIX F-05] Ne jamais exposer error.message au client
        console.error('[MOBILE_AUTH_ERROR]', error);
        return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
    }
}
