import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { authenticateMobileRequest } from '@/lib/mobile-auth';
import { verifyPartiesDistinctes } from '@/lib/anti-auto-bail';

/**
 * IDN-11 — GET /api/v1/parties/controle
 * Règle RG-IDN-24 (ADD-33)
 * Vérifie si un numéro de téléphone peut être désigné comme autre partie d'un bail,
 * sans révéler à qui il appartient.
 *
 * Query params :
 * - numero : Numéro de téléphone saisi (+225...)
 * - direction : BAILLEUR_TO_LOCATAIRE (par défaut) | LOCATAIRE_TO_BAILLEUR
 */
export async function GET(req: NextRequest) {
    try {
        // Authentification hybride : Web (NextAuth session) ou Mobile (Bearer JWT)
        let userId: string | null = null;
        const session = await auth();
        if (session?.user?.id) {
            userId = session.user.id;
        } else {
            const mobileUser = await authenticateMobileRequest(req);
            if (mobileUser?.userId) {
                userId = mobileUser.userId;
            }
        }

        if (!userId) {
            return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const numero = searchParams.get('numero');
        const directionParam = searchParams.get('direction') as 'BAILLEUR_TO_LOCATAIRE' | 'LOCATAIRE_TO_BAILLEUR' || 'BAILLEUR_TO_LOCATAIRE';

        if (!numero) {
            return NextResponse.json({ error: "Paramètre 'numero' obligatoire." }, { status: 400 });
        }

        const result = await verifyPartiesDistinctes({
            initiatorUserId: userId,
            targetPhone: numero,
            direction: directionParam,
        });

        if (!result.valid) {
            return NextResponse.json({
                autorise: false,
                message: result.error,
                code: result.code,
            }, { status: 200 }); // Retour 200 pour consultation avec autorise = false
        }

        return NextResponse.json({
            autorise: true,
        }, { status: 200 });
    } catch (error: any) {
        console.error("[IDN-11 /api/v1/parties/controle]", error);
        return NextResponse.json({ error: "Erreur serveur lors de la vérification." }, { status: 500 });
    }
}
