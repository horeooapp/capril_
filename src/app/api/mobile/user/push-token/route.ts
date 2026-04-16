import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token, pushToken } = body;

        if (!token || !pushToken) {
            return NextResponse.json({ error: "Token et PushToken requis" }, { status: 400 });
        }

        const payload = await verifyMobileToken(token);
        if (!payload) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const userId = payload.userId;

        // 1. Mettre à jour le jeton sur l'utilisateur pour compatibilité directe
        await prisma.user.update({
            where: { id: userId },
            data: { pushToken }
        });

        // 2. Initialiser/Mettre à jour les préférences de notification
        // On s'assure que l'utilisateur a des préférences et que le canal PUSH est actif.
        const allEvents = [
            "QUITTANCE_GENEREE", "PAIEMENT_RECU", "IMPAYE_DETECTE", "RAPPEL_ECHEANCE",
            "TICKET_MAINTENANCE_CREE", "TICKET_MAINTENANCE_MAJ", "TICKET_MAINTENANCE_RESOLU",
            "TICKET_MAINTENANCE_CONFIRME", "NOUVEAU_MESSAGE_BAIL"
        ];

        const defaultEvenementsActifs: Record<string, string[]> = {};
        allEvents.forEach(event => {
            defaultEvenementsActifs[event] = ["push", "sms"]; // Par défaut Push et SMS pour le mobile
        });

        await prisma.notificationPreference.upsert({
            where: { userId },
            create: {
                userId,
                pushToken,
                pushActif: true,
                smsActif: true,
                waActif: true, // Toujours bon d'avoir WhatsApp en secours
                evenementsActifs: defaultEvenementsActifs as any
            },
            update: {
                pushToken,
                pushActif: true
            }
        });

        return NextResponse.json({ success: true, message: "Token enregistré et préférences initialisées." });

    } catch (error: any) {
        console.error("Erreur Push Token API:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
