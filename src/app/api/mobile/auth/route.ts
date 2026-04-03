import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { sendOTPEmail } from "@/lib/email";
import crypto from 'crypto';

// Fonction interne de génération OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, email, otp, role } = body;

        if (!email) return NextResponse.json({ error: "L'adresse e-mail est requise." }, { status: 400 });
        const normalizedEmail = email.toLowerCase().trim();

        // 1. Demander un code OTP
        if (action === 'REQUEST_OTP') {
            const newOtp = generateOTP();
            if (!redis) return NextResponse.json({ error: "Service indisponible" }, { status: 500 });
            
            await redis.set(`otp:${normalizedEmail}`, newOtp, 'EX', 600); // 10 minutes
            const emailResult = await sendOTPEmail(normalizedEmail, newOtp);
            
            if (!emailResult.success) {
                return NextResponse.json({ error: "Échec de l'envoi de l'email" }, { status: 500 });
            }
            return NextResponse.json({ success: true, message: "Code OTP envoyé." });
        }

        // 2. Vérifier le code OTP
        if (action === 'VERIFY_OTP') {
            if (!otp) return NextResponse.json({ error: "Code OTP requis." }, { status: 400 });
            if (!redis) return NextResponse.json({ error: "Service indisponible" }, { status: 500 });

            const storedOtp = await redis.get(`otp:${normalizedEmail}`);
            if (!storedOtp || storedOtp !== otp) {
                return NextResponse.json({ error: "Code incorrect ou expiré." }, { status: 400 });
            }

            // Récupérer l'utilisateur pour vérifier son rôle
            let user = await prisma.user.findFirst({ where: { email: normalizedEmail } });
            
            // Si l'utilisateur n'existe pas, ou vérifier qu'il a le bon rôle selon l'app ciblée...
            // Pour l'instant, validation simple:
            if (!user) {
                // Auto-créer selon le rôle si nécessaire (simplifié pour la démo)
                return NextResponse.json({ error: "Compte introuvable, veuillez vous inscrire sur le web." }, { status: 403 });
            }

            // Simulation d'un Token JWT de session (à implémenter via Jose ou NextAuth adapter)
            // Dans ce MVP, on retourne les infos de base pour valider l'écran d'accueil React Native.
            const fakeAuthToken = crypto.randomUUID();

            return NextResponse.json({ 
                success: true, 
                token: fakeAuthToken, 
                user: { id: user.id, email: user.email, role: user.role } 
            });
        }

        return NextResponse.json({ error: "Action invalide." }, { status: 400 });

    } catch (error: any) {
        return NextResponse.json({ error: "Erreur serveur : " + error.message }, { status: 500 });
    }
}
