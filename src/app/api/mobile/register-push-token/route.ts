import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token, pushToken } = body;

        if (!token || !pushToken) {
            return NextResponse.json({ error: "Token mobile et pushToken requis." }, { status: 400 });
        }

        const payload = await verifyMobileToken(token);
        if (!payload) {
            return NextResponse.json({ error: "Non autorisé. Jeton invalide ou expiré." }, { status: 401 });
        }

        const userId = payload.userId;

        // Mise à jour du token push pour l'utilisateur
        await prisma.user.update({
            where: { id: userId },
            data: { pushToken }
        });

        console.log(`[PushToken] Token enregistré pour l'utilisateur ${userId}`);

        return NextResponse.json({
            success: true,
            message: "Push token enregistré avec succès."
        });

    } catch (error: any) {
        console.error("Erreur enregistrement PushToken:", error);
        return NextResponse.json({ error: "Erreur serveur : " + error.message }, { status: 500 });
    }
}
