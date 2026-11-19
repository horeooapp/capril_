import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

export interface ActionItem {
    id: string;
    type: 'LEASE_SIGNATURE' | 'RENT_DUE' | 'UNREAD_MESSAGE' | 'RENT_REVISION' | 'PAYMENT_CONFIRMATION' | 'MAINTENANCE_TICKET' | 'INFO';
    priority: 'URGENT' | 'HIGH' | 'NORMAL';
    title: string;
    description: string;
    actionLabel: string;
    actionRoute: string;
    createdAt: string;
    metadata?: Record<string, any>;
}

export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const userId = user.userId;
        const actions: ActionItem[] = [];

        // 1. VÉRIFIER LES BAUX EN ATTENTE DE SIGNATURE
        // A) Locataire : Bail formel en attente de signature
        const pendingLeasesLocataire = await prisma.lease.findMany({
            where: {
                tenantId: userId,
                status: 'PENDING_SIGNATURE',
                deletedAt: null
            },
            include: {
                property: { select: { id: true, name: true, address: true, commune: true } },
                landlord: { select: { firstName: true, lastName: true, phone: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        for (const pl of pendingLeasesLocataire) {
            const propName = pl.property?.name || pl.property?.address || 'votre logement';
            actions.push({
                id: `lease-sig-${pl.id}`,
                type: 'LEASE_SIGNATURE',
                priority: 'URGENT',
                title: 'Signature de contrat requise',
                description: `Votre contrat de bail pour ${propName} attend votre signature et code de validation.`,
                actionLabel: 'Signer mon contrat',
                actionRoute: `/signature/${pl.id}`,
                createdAt: pl.createdAt.toISOString(),
                metadata: {
                    leaseId: pl.id,
                    leaseReference: pl.leaseReference,
                    rentAmount: pl.rentAmount
                }
            });
        }

        // B) Propriétaire : Baux en attente de finalisation ou validation
        const pendingLeasesBailleur = await prisma.lease.findMany({
            where: {
                OR: [
                    { landlordId: userId },
                    { property: { ownerUserId: userId } },
                    { property: { managedByUserId: userId } }
                ],
                status: { in: ['PENDING_SIGNATURE', 'PENDING_CONFIRMATION'] },
                deletedAt: null
            },
            include: {
                property: { select: { id: true, name: true, address: true, commune: true } },
                tenant: { select: { firstName: true, lastName: true, phone: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        for (const pl of pendingLeasesBailleur) {
            const tenantName = `${pl.tenant?.firstName || ''} ${pl.tenant?.lastName || ''}`.trim() || 'Le locataire';
            const propName = pl.property?.name || pl.property?.address || 'le logement';
            actions.push({
                id: `lease-owner-pending-${pl.id}`,
                type: 'LEASE_SIGNATURE',
                priority: 'HIGH',
                title: 'Contrat en attente de validation',
                description: `Le bail pour ${propName} avec ${tenantName} attend finalisation.`,
                actionLabel: 'Consulter le bail',
                actionRoute: `/(tabs)/baux`,
                createdAt: pl.createdAt.toISOString(),
                metadata: {
                    leaseId: pl.id,
                    leaseReference: pl.leaseReference
                }
            });
        }

        // 2. VÉRIFIER LES MESSAGES NON LUS DANS LA MESSAGERIE INSTANTANÉE
        const accessibleLeases = await prisma.lease.findMany({
            where: {
                OR: [
                    { tenantId: userId },
                    { landlordId: userId },
                    { property: { ownerUserId: userId } },
                    { property: { managedByUserId: userId } }
                ],
                status: { notIn: ['CANCELLED', 'ARCHIVED'] },
                deletedAt: null
            },
            select: { id: true }
        });

        const leaseIds = accessibleLeases.map(l => l.id);
        if (leaseIds.length > 0) {
            const unreadMessagesCount = await prisma.messagerieBail.count({
                where: {
                    leaseId: { in: leaseIds },
                    expediteurId: { not: userId },
                    statut: { not: 'LU' }
                }
            });

            if (unreadMessagesCount > 0) {
                actions.push({
                    id: `unread-chat-${userId}`,
                    type: 'UNREAD_MESSAGE',
                    priority: 'HIGH',
                    title: unreadMessagesCount === 1 ? 'Nouveau message reçu' : `${unreadMessagesCount} nouveaux messages`,
                    description: `Vous avez ${unreadMessagesCount} message(s) en attente de lecture dans vos échanges.`,
                    actionLabel: 'Ouvrir les messages',
                    actionRoute: `/(tabs)/chat`,
                    createdAt: new Date().toISOString(),
                    metadata: { unreadCount: unreadMessagesCount }
                });
            }
        }

        // 3. VÉRIFIER LES PAIEMENTS À CONFIRMER (POUR BAILLEUR / PROPRIÉTAIRE)
        const pendingPaymentsToConfirm = await prisma.declarationPaiement.findMany({
            where: {
                bail: {
                    OR: [
                        { landlordId: userId },
                        { property: { ownerUserId: userId } },
                        { property: { managedByUserId: userId } }
                    ]
                },
                statut: 'DECLARE'
            },
            include: {
                locataire: { select: { firstName: true, lastName: true } },
                bail: { include: { property: { select: { name: true, address: true } } } }
            },
            take: 3
        });

        for (const pp of pendingPaymentsToConfirm) {
            const locName = `${pp.locataire?.firstName || ''} ${pp.locataire?.lastName || ''}`.trim() || 'Locataire';
            const propName = pp.bail?.property?.name || 'le logement';
            actions.push({
                id: `payment-declaration-${pp.id}`,
                type: 'PAYMENT_CONFIRMATION',
                priority: 'HIGH',
                title: 'Paiement à confirmer',
                description: `${locName} a déclaré un paiement de ${pp.montant} F pour ${propName}.`,
                actionLabel: 'Valider le paiement',
                actionRoute: `/(tabs)/finance`,
                createdAt: pp.createdAt.toISOString(),
                metadata: { declarationId: pp.id, montant: pp.montant }
            });
        }

        // 4. VÉRIFIER LES LOYERS EN RETARD / ÉCHUS (POUR LOCATAIRE)
        const currentMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM
        const activeTenantLeases = await prisma.lease.findMany({
            where: {
                tenantId: userId,
                status: { in: ['ACTIVE', 'ACTIVE_DECLARATIF', 'LOYER_IMPAYE'] },
                isSignedElectronically: true,
                signedAt: { not: null },
                deletedAt: null
            },
            include: {
                property: { select: { name: true, address: true } },
                receipts: {
                    where: { periodMonth: currentMonthStr },
                    select: { id: true, status: true }
                }
            }
        });

        for (const atl of activeTenantLeases) {
            const hasPaid = atl.receipts.some(r => r.status === 'paid' || r.status === 'PAID');
            if (!hasPaid) {
                // Vérifier si une déclaration de paiement est en cours
                const pendingDec = await prisma.declarationPaiement.findFirst({
                    where: { bailId: atl.id, mois: currentMonthStr, statut: 'DECLARE' }
                });
                if (!pendingDec) {
                    const propName = atl.property?.name || 'votre logement';
                    actions.push({
                        id: `rent-due-${atl.id}-${currentMonthStr}`,
                        type: 'RENT_DUE',
                        priority: 'HIGH',
                        title: 'Loyer du mois en cours',
                        description: `Le règlement de votre loyer pour ${propName} (${atl.rentAmount} F) est attendu.`,
                        actionLabel: 'Régler mon loyer',
                        actionRoute: `/(tabs)/payer`,
                        createdAt: new Date().toISOString(),
                        metadata: { leaseId: atl.id, rentAmount: atl.rentAmount }
                    });
                }
            }
        }

        // 5. VÉRIFIER LES PROPOSITIONS DE RÉVISION DE LOYER EN ATTENTE (POUR LOCATAIRE)
        const pendingPropositions = await prisma.propositionLoyer.findMany({
            where: {
                bail: { tenantId: userId, deletedAt: null },
                statut: 'PROPOSE'
            },
            include: {
                bail: { include: { property: { select: { name: true } } } }
            }
        });

        for (const prop of pendingPropositions) {
            actions.push({
                id: `proposition-loyer-${prop.id}`,
                type: 'RENT_REVISION',
                priority: 'HIGH',
                title: 'Avis de révision de loyer',
                description: `Une proposition de révision à ${prop.nouveauMontant} F CFA est en attente de votre réponse.`,
                actionLabel: 'Examiner la proposition',
                actionRoute: `/(tabs)/bail`,
                createdAt: prop.createdAt.toISOString(),
                metadata: { propositionId: prop.id, nouveauMontant: prop.nouveauMontant }
            });
        }

        // Trier par priorité : URGENT d'abord, puis HIGH, puis NORMAL
        const priorityOrder: Record<string, number> = { URGENT: 0, HIGH: 1, NORMAL: 2 };
        actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        return NextResponse.json({
            success: true,
            totalCount: actions.length,
            actions
        });

    } catch (error: any) {
        console.error("[MOBILE API] actions-required error:", error);
        return NextResponse.json({ error: "Erreur interne: " + error.message }, { status: 500 });
    }
}
