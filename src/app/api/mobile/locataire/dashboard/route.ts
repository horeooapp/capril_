import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';
import { calculerEcheanceBail } from '@/lib/echeance';

export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        
        if (!user) {
            return NextResponse.json({ error: "Non autorisé. Jeton invalide ou manquant." }, { status: 401 });
        }

        const userRecord = await prisma.user.findUnique({
            where: { id: user.userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                avatarUrl: true,
                kycLevel: true,
                kycStatus: true,
            }
        });

        // Récupérer TOUS les baux (Leases) actifs du locataire pour multi-biens
        const allActiveLeases = await prisma.lease.findMany({
            where: {
                tenantId: user.userId,
                status: { in: ['ACTIVE', 'ACTIVE_DECLARATIF', 'LOYER_IMPAYE'] }
            },
            include: {
                property: {
                    include: {
                        images: {
                            orderBy: [{ isMain: 'desc' }, { createdAt: 'desc' }],
                            take: 5
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Bail actif principal (le plus récent)
        const lease = allActiveLeases[0] ?? null;

        // Fetch pending lease (BailDeclaratif) for the tenant
        const pendingLease = await prisma.bailDeclaratif.findFirst({
            where: {
                OR: [
                    { locataireId: user.userId },
                    ...(userRecord?.phone ? [{ telephoneLocataire: userRecord.phone }] : [])
                ],
                statut: 'PENDING_LOCATAIRE'
            },
            include: {
                property: true,
                bailleur: {
                    select: { firstName: true, lastName: true, phone: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!lease) {
            return NextResponse.json({
                hasLease: false,
                user: userRecord,
                rentedProperties: [],
                pendingDeclaration: pendingLease ? {
                    id: pendingLease.id,
                    landlordName: `${pendingLease.bailleur?.firstName || ''} ${pendingLease.bailleur?.lastName || ''}`.trim() || 'Bailleur',
                    landlordPhone: pendingLease.bailleur?.phone || '',
                    housingDesc: pendingLease.descriptionLogement,
                    rentAmount: pendingLease.loyerDeclareMensuel,
                    status: pendingLease.statut,
                    sourceCreation: pendingLease.sourceCreation
                } : null,
                message: "Aucun bail actif trouvé."
            });
        }

        const currentRentAmount = lease.rentAmount || 0;
        const depositAmount = lease.depositAmount || currentRentAmount * 2;
        const propertyName = lease.property?.name || 'Votre logement';
        const propertyCommune = lease.property?.commune || '';
        const propertyAddress = lease.property?.address || '';

        // Check landlord information
        let landlordName = 'Bailleur';
        let landlordPhone: string | null = null;
        const landlordIdToFind = lease.landlordId || lease.property?.ownerUserId;
        if (landlordIdToFind) {
            const landlord = await prisma.user.findUnique({
                where: { id: landlordIdToFind },
                select: { firstName: true, lastName: true, phone: true }
            });
            if (landlord) {
                landlordName = lease.bailleurMasque 
                    ? 'Bailleur certifié' 
                    : `${landlord.firstName || ''} ${landlord.lastName || ''}`.trim() || 'Bailleur';
                landlordPhone = lease.bailleurMasque ? null : landlord.phone;
            }
        }

        // Check if there is a receipt for the current month
        const currentMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM
        const currentReceipt = await prisma.receipt.findFirst({
            where: {
                leaseId: lease.id,
                periodMonth: currentMonthStr
            }
        });

        // Check if there is a pending payment declaration (P0-04)
        const pendingPayment = await prisma.declarationPaiement.findFirst({
            where: {
                bailId: lease.id,
                mois: currentMonthStr,
                statut: 'DECLARE'
            },
            orderBy: { createdAt: 'desc' }
        });
        
        let rentStatus = 'PENDING';
        if (currentReceipt && (currentReceipt.status === 'paid' || currentReceipt.status === 'PAID')) {
            rentStatus = 'PAID';
        } else if (pendingPayment) {
            rentStatus = 'DECLARED_PENDING';
        }

        // Fetch recent receipts & punctuality stats
        const [recentReceipts, totalReceiptsCount, paidReceiptsCount] = await Promise.all([
            prisma.receipt.findMany({
                where: { leaseId: lease.id },
                orderBy: { createdAt: 'desc' },
                take: 10,
                select: {
                    id: true,
                    receiptRef: true,
                    periodMonth: true,
                    status: true,
                    totalAmount: true,
                    rentAmount: true,
                    paymentMethod: true,
                    receiptHash: true,
                    paidAt: true,
                    createdAt: true
                }
            }),
            prisma.receipt.count({ where: { leaseId: lease.id } }),
            prisma.receipt.count({ where: { leaseId: lease.id, status: { in: ['paid', 'PAID'] } } })
        ]);
        
        const mappedReceipts = recentReceipts.map(r => ({
            id: r.id,
            receiptRef: r.receiptRef,
            periodMonth: r.periodMonth,
            status: r.status,
            amount: r.totalAmount || r.rentAmount || 0,
            paymentMethod: r.paymentMethod,
            receiptHash: r.receiptHash,
            paidAt: r.paidAt || r.createdAt
        }));

        // Count open maintenance requests
        const openMaintenanceCount = await prisma.ticketMaintenance.count({
            where: {
                locataireId: user.userId,
                statut: { in: ['EN_ATTENTE', 'PRIS_EN_CHARGE'] }
            }
        });

        // Calcul d'échéance certifiée côté serveur (Ticket S-07)
        const allPaidReceipts = await prisma.receipt.findMany({
            where: {
                leaseId: lease.id,
                status: { in: ['PAID', 'paid'] }
            },
            select: { periodMonth: true }
        });
        const paidMonthsList = allPaidReceipts.map(r => r.periodMonth);
        const echeance = calculerEcheanceBail({
            paymentDay: lease.paymentDay,
            paidMonths: paidMonthsList,
            startDate: lease.startDate,
        });

        // Proposition de révision de loyer active (MRL-01)
        const pendingPropositionLoyer = await prisma.propositionLoyer.findFirst({
            where: {
                leaseId: lease.id,
                statut: "EN_ATTENTE"
            },
            include: {
                consentement: true
            },
            orderBy: { createdAt: "desc" }
        }).catch(() => null);

        // État d'ouverture Deux Horloges (reprise de bail)
        const leaseOpeningState = await prisma.leaseOpeningState.findUnique({
            where: { leaseId: lease.id }
        }).catch(() => null);

        // Construction des biens en location (multi-biens) avec images complètes
        const rentedProperties = await Promise.all(allActiveLeases.map(async (l) => {
            let lName = 'Bailleur certifié';
            let lPhone: string | null = null;
            const landlordId = l.landlordId || l.property?.ownerUserId;
            if (landlordId && !l.bailleurMasque) {
                const landlord = await prisma.user.findUnique({
                    where: { id: landlordId },
                    select: { firstName: true, lastName: true, phone: true }
                });
                if (landlord) {
                    lName = `${landlord.firstName || ''} ${landlord.lastName || ''}`.trim() || 'Bailleur';
                    lPhone = landlord.phone;
                }
            }

            const mainImg = l.property?.images?.find(i => i.isMain)?.s3Key || l.property?.images?.[0]?.s3Key || null;
            const allImages = l.property?.images?.map(i => i.s3Key).filter(Boolean) || [];

            return {
                leaseId: l.id,
                leaseReference: l.leaseReference,
                rentAmount: Number(l.rentAmount || 0),
                depositAmount: Number(l.depositAmount || (l.rentAmount ? l.rentAmount * 2 : 0)),
                paymentDay: l.paymentDay || 5,
                startDate: l.startDate,
                endDate: l.endDate,
                durationMonths: l.durationMonths,
                status: l.status,
                propertyId: l.property?.id,
                propertyName: l.property?.name || 'Logement certifié QAPRIL',
                propertyCode: l.property?.propertyCode,
                propertyType: l.property?.propertyType || 'Résidentiel',
                leaseType: l.property?.leaseType || 'residential',
                commune: l.property?.commune || 'Abidjan',
                quartier: l.property?.quartier || '',
                address: l.property?.address || '',
                city: l.property?.city || '',
                rooms: l.property?.rooms || null,
                bedrooms: l.property?.bedrooms || null,
                superficieM2: l.property?.superficieM2 ? Number(l.property.superficieM2) : null,
                mainImage: mainImg,
                images: allImages,
                landlordName: lName,
                landlordPhone: lPhone,
            };
        }));

        return NextResponse.json({
            hasLease: true,
            user: userRecord,
            rentedProperties,
            lease: {
                id: lease.id,
                leaseReference: lease.leaseReference,
                startDate: lease.startDate,
                endDate: lease.endDate,
                durationMonths: lease.durationMonths,
                paymentDay: lease.paymentDay,
                depositAmount: depositAmount,
                status: lease.status
            },
            propertyName,
            propertyCommune,
            propertyAddress,
            landlordName,
            landlordPhone,
            currentRentAmount,
            depositAmount,
            rentStatus,
            totalReceiptsCount,
            paidReceiptsCount,
            currency: 'XOF',
            recentReceipts: mappedReceipts,
            openMaintenanceCount,
            nextPaymentDate: echeance.prochaine_echeance_date,
            prochaine_echeance_date: echeance.prochaine_echeance_date,
            jours_restants: echeance.jours_restants,
            retard_jours: echeance.retard_jours,
            est_en_retard: echeance.est_en_retard,
            est_jour_j: echeance.est_jour_j,
            texte_echeance: echeance.texte_echeance,
            echeancePeriodeMois: echeance.periode_mois,
            pendingPayment: pendingPayment ? {
                id: pendingPayment.id,
                amount: pendingPayment.montant,
                paymentMethod: pendingPayment.moyen,
                date: pendingPayment.datePaiement,
                month: pendingPayment.mois,
                status: pendingPayment.statut,
            } : null,
            pendingPropositionLoyer: pendingPropositionLoyer ? {
                id: pendingPropositionLoyer.id,
                montantActuel: pendingPropositionLoyer.montantActuel,
                nouveauMontant: pendingPropositionLoyer.nouveauMontant,
                dateEffet: pendingPropositionLoyer.dateEffet,
                raison: pendingPropositionLoyer.raison,
                statut: pendingPropositionLoyer.statut,
                estConformeDelaiAns: pendingPropositionLoyer.estConformeDelaiAns,
                estConformePreavis: pendingPropositionLoyer.estConformePreavis,
                motifNullite: pendingPropositionLoyer.motifNullite,
            } : null,
            leaseOpeningState: leaseOpeningState ? {
                id: leaseOpeningState.id,
                dateReprise: leaseOpeningState.dateReprise,
                loyerEnVigueur: leaseOpeningState.loyerEnVigueur,
                chargesEnVigueur: leaseOpeningState.chargesEnVigueur,
                dernierMoisPaye: leaseOpeningState.dernierMoisPaye,
                soldeOuverture: leaseOpeningState.soldeOuverture,
                statut: leaseOpeningState.statut,
                motifContestation: leaseOpeningState.motifContestation,
                confirmeBailleurAt: leaseOpeningState.confirmeBailleurAt,
                confirmeLocataireAt: leaseOpeningState.confirmeLocataireAt,
            } : null,
        });

    } catch (error: any) {
        console.error("[MOBILE API] locataire/dashboard error:", error);
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }
}
