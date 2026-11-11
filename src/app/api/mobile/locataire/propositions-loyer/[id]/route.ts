import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json().catch(() => ({}));
        const { reponse, commentaire } = body;

        if (typeof reponse !== 'boolean') {
            return NextResponse.json({ error: "La réponse (accepter ou refuser) est requise." }, { status: 400 });
        }

        const prop = await prisma.propositionLoyer.findUnique({
            where: { id },
            include: { lease: true }
        });

        if (!prop) {
            return NextResponse.json({ error: "Proposition introuvable" }, { status: 404 });
        }

        if (prop.lease.tenantId !== user.userId) {
            return NextResponse.json({ error: "Non autorisé sur ce bail" }, { status: 403 });
        }

        if (prop.statut !== "EN_ATTENTE") {
            return NextResponse.json({ error: "Cette proposition a déjà été traitée." }, { status: 400 });
        }

        const updated = await prisma.$transaction(async (tx) => {
            const consent = await tx.consentementLoyer.upsert({
                where: { propositionId: id },
                create: {
                    propositionId: id,
                    reponse,
                    commentaire: commentaire || (reponse ? "Accepté via mobile QAPRIL" : "Refusé via mobile QAPRIL")
                },
                update: {
                    reponse,
                    commentaire: commentaire || (reponse ? "Accepté via mobile QAPRIL" : "Refusé via mobile QAPRIL")
                }
            });

            const nouveauStatut = reponse ? "ACCEPTEE" : "REFUSEE";
            const updatedProp = await tx.propositionLoyer.update({
                where: { id },
                data: { statut: nouveauStatut }
            });

            if (reponse) {
                // Enregistrer dans l'historique des loyers et actualiser le montant si la date d'effet est passée
                await tx.leaseRentHistory.create({
                    data: {
                        leaseId: prop.leaseId,
                        ancienMontant: prop.montantActuel,
                        nouveauMontant: prop.nouveauMontant,
                        effectiveLe: prop.dateEffet,
                        motif: prop.raison || "Révision triennale acceptée",
                        hashSha256: null
                    }
                });

                if (new Date(prop.dateEffet) <= new Date()) {
                    await tx.lease.update({
                        where: { id: prop.leaseId },
                        data: { rentAmount: prop.nouveauMontant }
                    });
                }
            }

            return { consent, proposition: updatedProp };
        });

        return NextResponse.json({
            success: true,
            message: reponse 
                ? "Vous avez accepté la révision de loyer. Votre contrat est à jour." 
                : "Vous avez refusé la révision de loyer. Le bailleur a été notifié.",
            data: updated
        });
    } catch (e: any) {
        console.error("[MOBILE API] propositions-loyer error:", e);
        return NextResponse.json({ error: e.message || "Erreur serveur" }, { status: 500 });
    }
}
