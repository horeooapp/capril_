import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * RPT-05 : PUT /api/v1/admin/rapports/preferences
 * Configurer les préférences d'envoi de rapports (canal, fréquence, heure).
 */
export async function PUT(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
        }

        const body = await req.json();
        const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string);
        const targetUserId = isAdmin && body.user_id ? body.user_id : session.user.id;

        const existingUser = await prisma.user.findUnique({
            where: { id: targetUserId },
            select: { notificationPrefs: true },
        });

        if (!existingUser) {
            return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
        }

        const currentPrefs = (existingUser.notificationPrefs as Record<string, any>) || {};
        const updatedPrefs = {
            ...currentPrefs,
            rapports: {
                canal: body.canal || currentPrefs?.rapports?.canal || "WHATSAPP_EMAIL",
                frequence: body.frequence || currentPrefs?.rapports?.frequence || "MENSUEL",
                heure_envoi: body.heure_envoi || currentPrefs?.rapports?.heure_envoi || "07:00",
                envoyer_whatsapp: body.envoyer_whatsapp ?? true,
                envoyer_email: body.envoyer_email ?? true,
                updated_at: new Date().toISOString(),
            },
        };

        await prisma.user.update({
            where: { id: targetUserId },
            data: { notificationPrefs: updatedPrefs },
        });

        return NextResponse.json({
            statut: "PREFERENCES_MISES_A_JOUR",
            user_id: targetUserId,
            preferences: updatedPrefs.rapports,
        });
    } catch (error: any) {
        console.error("[RPT-05 PUT Error]:", error);
        return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string);
        const targetUserId = isAdmin && searchParams.get("userId") ? searchParams.get("userId")! : session.user.id;

        const user = await prisma.user.findUnique({
            where: { id: targetUserId },
            select: { notificationPrefs: true },
        });

        const prefs = (user?.notificationPrefs as Record<string, any>)?.rapports || {
            canal: "WHATSAPP_EMAIL",
            frequence: "MENSUEL",
            heure_envoi: "07:00",
            envoyer_whatsapp: true,
            envoyer_email: true,
        };

        return NextResponse.json({ user_id: targetUserId, preferences: prefs });
    } catch (error: any) {
        console.error("[RPT-05 GET Error]:", error);
        return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
    }
}

