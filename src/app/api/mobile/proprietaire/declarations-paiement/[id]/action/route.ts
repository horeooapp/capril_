import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';
import { createHash, randomUUID } from 'crypto';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: declarationId } = await params;
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: "Non autorisé. Jeton manquant ou invalide." }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const { action, reason } = body;

        const declaration = await prisma.declarationPaiement.findUnique({
            where: { id: declarationId },
            include: {
                bail: {
                    include: {
                        property: true,
                        tenant: true,
                    }
                },
                locataire: true
            }
        });

        if (!declaration) {
            return NextResponse.json({ error: "Déclaration de paiement introuvable." }, { status: 404 });
        }

        // Vérification des droits : le bailleur ou propriétaire du bien
        const isAuthorized = 
            declaration.bail.landlordId === user.userId ||
            declaration.bail.property?.ownerUserId === user.userId ||
            declaration.bail.property?.managedByUserId === user.userId ||
            user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

        if (!isAuthorized) {
            return NextResponse.json({ error: "Vous n'êtes pas autorisé à valider ce paiement." }, { status: 403 });
        }

        if (action === 'CONFIRM') {
            const periodMonth = declaration.mois || new Date().toISOString().substring(0, 7);
            const total = declaration.montant;
            const ref = `REC-${periodMonth}-${randomUUID().slice(0, 6).toUpperCase()}`;
            const sha256 = createHash('sha256').update(JSON.stringify({ 
                leaseId: declaration.bailId, 
                total, 
                ref, 
                paidAt: declaration.datePaiement 
            })).digest('hex');

            // 1. Créer la quittance officielle
            const receipt = await prisma.receipt.create({
                data: {
                    receiptRef: ref,
                    leaseId: declaration.bailId,
                    periodMonth: periodMonth,
                    rentAmount: total,
                    chargesAmount: 0,
                    totalAmount: total,
                    paymentMethod: declaration.moyen,
                    paymentRef: `DECL-${declaration.id.slice(0, 8)}`,
                    paidAt: declaration.datePaiement || new Date(),
                    qrToken: randomUUID(),
                    receiptHash: sha256,
                    status: 'PAID'
                }
            });

            // 2. Mettre à jour la déclaration
            await prisma.declarationPaiement.update({
                where: { id: declaration.id },
                data: {
                    statut: 'CONFIRME',
                    decideLe: new Date(),
                    quittanceId: receipt.id
                }
            });

            return NextResponse.json({
                success: true,
                message: "Paiement confirmé ! La quittance officielle a été émise et transmise au locataire.",
                receiptId: receipt.id,
                receiptRef: receipt.receiptRef
            });

        } else if (action === 'REJECT') {
            await prisma.declarationPaiement.update({
                where: { id: declaration.id },
                data: {
                    statut: 'CONTESTE',
                    decideLe: new Date(),
                    tentativesNon: { increment: 1 }
                }
            });

            return NextResponse.json({
                success: true,
                message: "La déclaration de paiement a été rejetée."
            });

        } else {
            return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
        }

    } catch (error: any) {
        console.error("[MOBILE API] proprietaire/declarations-paiement/action error:", error);
        return NextResponse.json({ error: "Erreur lors de la validation du paiement." }, { status: 500 });
    }
}
