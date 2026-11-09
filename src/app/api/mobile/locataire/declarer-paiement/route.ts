import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

export async function POST(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: "Non autorisé. Jeton manquant ou invalide." }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const { moyen, montant, datePaiement, mois, preuveUrl } = body;

        // Récupérer le bail actif du locataire
        const lease = await prisma.lease.findFirst({
            where: {
                tenantId: user.userId,
                status: 'ACTIVE'
            },
            include: { property: true }
        });

        if (!lease) {
            return NextResponse.json({ 
                error: "Aucun contrat de bail actif trouvé pour déclarer un paiement." 
            }, { status: 400 });
        }

        const amountNum = Math.round(parseFloat(String(montant || lease.rentAmount || '').replace(/\s/g, '')));
        if (isNaN(amountNum) || amountNum <= 0) {
            return NextResponse.json({ error: "Montant du paiement invalide." }, { status: 400 });
        }

        const currentMonthStr = mois || new Date().toISOString().substring(0, 7); // YYYY-MM
        const pDate = datePaiement ? new Date(datePaiement) : new Date();

        // Vérifier si une déclaration existe déjà en attente pour ce mois
        const existingDecl = await prisma.declarationPaiement.findFirst({
            where: {
                bailId: lease.id,
                mois: currentMonthStr,
                statut: 'DECLARE'
            }
        });

        if (existingDecl) {
            return NextResponse.json({
                error: `Une déclaration de paiement pour ${currentMonthStr} est déjà en cours de confirmation par votre bailleur.`
            }, { status: 409 });
        }

        // Créer la déclaration de paiement
        const declaration = await prisma.declarationPaiement.create({
            data: {
                bailId: lease.id,
                locataireId: user.userId,
                montant: amountNum,
                mois: currentMonthStr,
                moyen: (moyen || 'MOBILE_MONEY').toUpperCase(),
                datePaiement: pDate,
                statut: 'DECLARE',
                preuveUrl: preuveUrl || null,
            }
        });

        return NextResponse.json({
            success: true,
            message: "Votre paiement a été déclaré avec succès. Dès que votre bailleur aura confirmé sa réception, votre quittance officielle sera émise automatiquement.",
            declarationId: declaration.id,
            statut: declaration.statut
        });

    } catch (error: any) {
        console.error("[MOBILE API] locataire/declarer-paiement error:", error);
        return NextResponse.json({ error: "Erreur lors de l'enregistrement de la déclaration de paiement." }, { status: 500 });
    }
}

