import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';
import { createHash, randomUUID } from 'crypto';
import { sendSMS } from '@/lib/sms';

// ---------------------------------------------------------------------------
// S-14 — Confirmation idempotente côté bailleur
// Si la déclaration est déjà CONFIRME, retourne la quittance existante (200)
// sans recréer de quittance ni envoyer de SMS en double
// ---------------------------------------------------------------------------

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: declarationId } = await params;
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé. Jeton manquant ou invalide.' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const { action, reason } = body;

        const declaration = await prisma.declarationPaiement.findUnique({
            where:   { id: declarationId },
            include: {
                bail: {
                    include: {
                        property: true,
                        tenant:   true,
                    }
                },
                locataire: true,
            }
        });

        if (!declaration) {
            return NextResponse.json({ error: 'Déclaration de paiement introuvable.' }, { status: 404 });
        }

        // Vérification des droits : bailleur ou propriétaire du bien
        const isAuthorized =
            declaration.bail.landlordId             === user.userId ||
            declaration.bail.property?.ownerUserId  === user.userId ||
            declaration.bail.property?.managedByUserId === user.userId ||
            user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

        if (!isAuthorized) {
            return NextResponse.json({ error: "Vous n'êtes pas autorisé à valider ce paiement." }, { status: 403 });
        }

        // ----------------------------------------------------------------
        // ACTION : CONFIRM
        // ----------------------------------------------------------------
        if (action === 'CONFIRM') {

            // S-14 — Idempotence : si déjà confirmé, retourner la quittance
            if (declaration.statut === 'CONFIRME' && declaration.quittanceId) {
                const existingReceipt = await prisma.receipt.findUnique({
                    where: { id: declaration.quittanceId }
                });
                return NextResponse.json({
                    success:    true,
                    idempotent: true,
                    message:    'Ce paiement a déjà été confirmé. La quittance est disponible.',
                    receiptId:  declaration.quittanceId,
                    receiptRef: existingReceipt?.receiptRef ?? null,
                });
            }

            if (declaration.statut === 'CONTESTE') {
                return NextResponse.json({
                    error: 'Cette déclaration a déjà été contestée. Elle ne peut plus être confirmée.'
                }, { status: 409 });
            }

            const periodMonth = declaration.mois || new Date().toISOString().substring(0, 7);
            const total       = declaration.montant;
            const ref         = `REC-${periodMonth}-${randomUUID().slice(0, 6).toUpperCase()}`;
            const sha256      = createHash('sha256').update(JSON.stringify({
                leaseId:  declaration.bailId,
                total,
                ref,
                paidAt:   declaration.datePaiement,
            })).digest('hex');

            // Transaction atomique : upsert quittance + update déclaration
            const { receipt } = await prisma.$transaction(async (tx) => {
                // 1. Upsert quittance (anti-doublon si même période)
                const receipt = await tx.receipt.upsert({
                    where: {
                        leaseId_periodMonth: {
                            leaseId:     declaration.bailId,
                            periodMonth: periodMonth,
                        }
                    },
                    update: {
                        receiptRef:    ref,
                        rentAmount:    total,
                        chargesAmount: 0,
                        totalAmount:   total,
                        paymentMethod: declaration.moyen,
                        paymentRef:    `DECL-${declaration.id.slice(0, 8)}`,
                        paidAt:        declaration.datePaiement || new Date(),
                        receiptHash:   sha256,
                        status:        'PAID',
                    },
                    create: {
                        receiptRef:    ref,
                        leaseId:       declaration.bailId,
                        periodMonth:   periodMonth,
                        rentAmount:    total,
                        chargesAmount: 0,
                        totalAmount:   total,
                        paymentMethod: declaration.moyen,
                        paymentRef:    `DECL-${declaration.id.slice(0, 8)}`,
                        paidAt:        declaration.datePaiement || new Date(),
                        qrToken:       randomUUID(),
                        receiptHash:   sha256,
                        status:        'PAID',
                        declarative:   true,
                    },
                });

                // 2. Marquer la déclaration comme CONFIRME
                await tx.declarationPaiement.update({
                    where: { id: declaration.id },
                    data:  {
                        statut:      'CONFIRME',
                        decideLe:    new Date(),
                        quittanceId: receipt.id,
                    },
                });

                return { receipt };
            });

            // Notification SMS au locataire (non-bloquante)
            const tenantPhone = declaration.locataire?.phone || declaration.bail?.tenant?.phone;
            if (tenantPhone) {
                await sendSMS(
                    tenantPhone,
                    `QAPRIL : Votre paiement de ${total.toLocaleString('fr-FR')} FCFA (${periodMonth}) est confirmé ! Quittance officielle réf. ${ref} disponible dans votre application.`
                ).catch(() => null);
            }

            return NextResponse.json({
                success:    true,
                idempotent: false,
                message:    'Paiement confirmé ! La quittance officielle a été émise et transmise au locataire.',
                receiptId:  receipt.id,
                receiptRef: receipt.receiptRef,
            });

        // ----------------------------------------------------------------
        // ACTION : REJECT
        // ----------------------------------------------------------------
        } else if (action === 'REJECT') {

            // S-14 — Idempotence : si déjà contesté, ne pas incrémenter à nouveau
            if (declaration.statut === 'CONTESTE') {
                return NextResponse.json({
                    success:    true,
                    idempotent: true,
                    message:    'Cette déclaration avait déjà été rejetée.',
                });
            }

            await prisma.declarationPaiement.update({
                where: { id: declaration.id },
                data:  {
                    statut:       'CONTESTE',
                    decideLe:     new Date(),
                    tentativesNon: { increment: 1 },
                },
            });

            return NextResponse.json({
                success:    true,
                idempotent: false,
                message:    'La déclaration de paiement a été rejetée.',
            });

        } else {
            return NextResponse.json({ error: 'Action inconnue.' }, { status: 400 });
        }

    } catch (error: any) {
        console.error('[MOBILE API] proprietaire/declarations-paiement/action error:', error);
        return NextResponse.json({ error: 'Erreur lors de la validation du paiement.' }, { status: 500 });
    }
}
