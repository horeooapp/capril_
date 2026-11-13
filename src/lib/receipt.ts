import { prisma } from "./prisma"
import { generateProofHash } from "./proof"
import { scoreRentPayment } from "./scoring"
import { NotificationService } from "./notification-service"

/**
 * Generates a unique receipt reference according to v2.0 spec: REC-YYYY-MM-XXXX
 */
export async function generateReceiptRef(): Promise<string> {
    const now = new Date()
    const year = now.getFullYear().toString()
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const prefix = `REC-${year}-${month}-`

    const count = await prisma.receipt.count({
        where: {
            receiptRef: {
                startsWith: prefix
            }
        }
    })

    const sequence = (count + 1).toString().padStart(4, '0')
    return `${prefix}${sequence}`
}

/**
 * Helper sécurisé pour émettre une quittance unitaire avec protection absolue contre les collisions d'unicité
 */
async function issueSingleReceipt(params: {
    lease: any,
    initialPeriod: string,
    rentAmount: number,
    chargesAmount: number,
    paymentChannel: string,
    paymentReference?: string,
    receiptType: string,
    creatorName?: string
}) {
    let targetPeriod = params.initialPeriod;
    let receipt: any = null;
    let attempts = 0;

    while (!receipt && attempts < 24) {
        attempts++;

        // 1. Chercher si une quittance existe déjà pour ce mois
        const existing = await prisma.receipt.findUnique({
            where: {
                leaseId_periodMonth: {
                    leaseId: params.lease.id,
                    periodMonth: targetPeriod,
                }
            }
        });

        // Si déjà payée, avancer au mois suivant
        if (existing && (existing.status === 'paid' || existing.status === 'PAID')) {
            const [y, m] = targetPeriod.split('-').map(Number);
            const nextDate = new Date(Date.UTC(y, m, 1));
            targetPeriod = nextDate.toISOString().slice(0, 7);
            continue;
        }

        const receiptRef = await generateReceiptRef();
        const totalAmountInt = params.rentAmount + params.chargesAmount;
        const documentHash = await generateProofHash({
            receiptRef,
            leaseId: params.lease.id,
            totalAmount: totalAmountInt,
            period: targetPeriod,
            receiptType: params.receiptType
        });
        const qrToken = documentHash.slice(0, 12).toUpperCase();

        try {
            if (existing) {
                receipt = await prisma.receipt.update({
                    where: { id: existing.id },
                    data: {
                        receiptRef,
                        rentAmount: params.rentAmount,
                        chargesAmount: params.chargesAmount,
                        totalAmount: totalAmountInt,
                        paymentMethod: params.paymentChannel,
                        paymentRef: params.paymentReference,
                        paidAt: new Date(),
                        receiptHash: documentHash,
                        qrToken: qrToken,
                        status: "PAID"
                    }
                });
            } else {
                receipt = await prisma.receipt.create({
                    data: {
                        receiptRef,
                        leaseId: params.lease.id,
                        periodMonth: targetPeriod,
                        rentAmount: params.rentAmount,
                        chargesAmount: params.chargesAmount,
                        totalAmount: totalAmountInt,
                        paymentMethod: params.paymentChannel,
                        paymentRef: params.paymentReference,
                        paidAt: new Date(),
                        receiptHash: documentHash,
                        qrToken: qrToken,
                        status: "PAID"
                    }
                });
            }
        } catch (dbErr: any) {
            // Collision d'unicité lease_id + period_month interceptée en toute sécurité
            if (dbErr?.code === 'P2002' || (dbErr?.message && dbErr.message.includes('Unique constraint'))) {
                console.warn(`[RECEIPT_COLLISION] Conflit sur période ${targetPeriod} pour bail ${params.lease.id}, passage au mois suivant...`);
                const [y, m] = targetPeriod.split('-').map(Number);
                const nextDate = new Date(Date.UTC(y, m, 1));
                targetPeriod = nextDate.toISOString().slice(0, 7);
                continue;
            }
            throw dbErr;
        }
    }

    if (!receipt) {
        throw new Error(`Impossible de trouver une période libre pour émettre la quittance du bail ${params.lease.id}`);
    }

    // 4. Scoring (ICL)
    if (params.receiptType === "RENT" && params.lease.tenantId) {
        try {
            const [year, month] = targetPeriod.split('-').map(Number);
            const dueDate = new Date(year, month - 1, params.lease.paymentDay || 5);
            const today = new Date();
            const diffTime = today.getTime() - dueDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            await scoreRentPayment(params.lease.tenantId, diffDays, receipt.id);
        } catch (e) {
            console.warn("[SCORING_ERROR]", e);
        }
    }

    // 5. PDF Generation & Delivery (M-DOC-PDF - PHASE 1 ROBUST)
    if (params.lease.tenantId) {
        try {
            const { generateReceiptPDF } = await import('./pdf-generator');
            const { formatQuittanceEmiseSMS } = await import('./sms-templates');
            const tenantDisplayName = (params.lease.tenant?.firstName ? params.lease.tenant.firstName + " " : "") + (params.lease.tenant?.lastName || "") || 'Locataire';
            const pdfBuffer = await generateReceiptPDF({
                receiptRef: receipt.receiptRef,
                leaseRef: params.lease.leaseReference,
                periodMonth: receipt.periodMonth,
                rentAmount: receipt.rentAmount,
                chargesAmount: receipt.chargesAmount,
                totalAmount: receipt.totalAmount,
                paymentMethod: params.paymentChannel,
                paidAt: receipt.paidAt || new Date(),
                tenantName: tenantDisplayName,
                propertyAddress: params.lease.property?.address || "Adresse non spécifiée",
                landlordName: params.creatorName || (params.lease.landlord?.firstName ? params.lease.landlord.firstName + " " : "") + (params.lease.landlord?.lastName || "") || 'Bailleur QAPRIL',
                receiptHash: receipt.receiptHash || undefined,
                qrToken: receipt.qrToken || undefined,
                declarative: params.receiptType === 'DECLARATIVE',
                bailleurMasque: Boolean(params.lease.bailleurMasque || params.lease.typeGestion === 'AGREE'),
                agencyName: (params.lease as any).agency?.name || (params.lease.typeGestion === 'AGREE' ? 'Agence de gestion agréée' : undefined),
                agencyLicense: (params.lease as any).agency?.licenseNumber || undefined,
                mandateRef: (params.lease as any).mandatGestionId || undefined,
            });

            // Trigger Notification (Async - Simultaneous SMS + WA)
            NotificationService.envoyerNotification(
                params.lease.tenantId,
                "QUITTANCE_GENEREE",
                {
                    referenceId: receipt.receiptRef,
                    receiptBuffer: pdfBuffer,
                    payload: {
                        parameters: [tenantDisplayName, params.lease.property?.address || "Propriété"],
                        smsText: formatQuittanceEmiseSMS({ locataire: tenantDisplayName, mois: receipt.periodMonth, ref: receipt.receiptRef }),
                        html: `<p>Votre quittance pour le mois de ${receipt.periodMonth} a été générée. Référence : ${receipt.receiptRef}.</p>`
                    }
                }
            ).catch(err => console.error("[NOTIF_ERROR]", err));

        } catch (e) {
            console.error("[PDF_ERROR]", e);
        }
    }

    return receipt;
}

/**
 * CORE LOGIC: Create and notify receipt (System-level)
 * Does NOT check auth - assumption is that it's called by a trusted source (WEBHOOK, ACTION, CRON)
 */
export async function createAndNotifyReceipt(data: {
    leaseId: string,
    periodMonth: string,
    rentAmount: number,
    chargesAmount: number,
    paymentChannel: string,
    paymentReference?: string,
    receiptType: string,
    bypassPaywall?: boolean,
    creatorName?: string
}) {
    // 1. Fetch lease and characters
    const lease = await prisma.lease.findUnique({
        where: { id: data.leaseId },
        include: { 
            property: true,
            tenant: true,
            landlord: true
        }
    });

    if (!lease) throw new Error("Bail introuvable");

    const rentAmountInt = Math.round(Number(data.rentAmount) || 0);
    const chargesAmountInt = Math.round(Number(data.chargesAmount) || 0);
    const totalAmountInt = rentAmountInt + chargesAmountInt;

    const contractualMonthlyRent = Math.round(Number(lease.rentAmount) || 0);
    const contractualMonthlyCharges = Math.round(Number(lease.chargesAmount) || 0);
    const contractualMonthlyTotal = contractualMonthlyRent + contractualMonthlyCharges;

    // Détection de paiement multi-mois (ex: 500 000 F pour un loyer de 250 000 F = 2 mois)
    const nbMois = (contractualMonthlyTotal > 0 && totalAmountInt >= (contractualMonthlyTotal * 2))
        ? Math.floor(totalAmountInt / contractualMonthlyTotal)
        : 1;

    let startPeriod = data.periodMonth;
    let primaryReceipt: any = null;

    if (nbMois > 1) {
        console.log(`[RECEIPT] Paiement multi-mois détecté : ${nbMois} mois couverts (Montant total: ${totalAmountInt} XOF)`);
        for (let i = 0; i < nbMois; i++) {
            const r = await issueSingleReceipt({
                lease,
                initialPeriod: startPeriod,
                rentAmount: contractualMonthlyRent,
                chargesAmount: contractualMonthlyCharges,
                paymentChannel: data.paymentChannel,
                paymentReference: data.paymentReference,
                receiptType: data.receiptType,
                creatorName: data.creatorName
            });
            if (!primaryReceipt) primaryReceipt = r;

            // Préparer le mois suivant pour la prochaine quittance
            const [y, m] = r.periodMonth.split('-').map(Number);
            const nextDate = new Date(Date.UTC(y, m, 1));
            startPeriod = nextDate.toISOString().slice(0, 7);
        }
    } else {
        primaryReceipt = await issueSingleReceipt({
            lease,
            initialPeriod: startPeriod,
            rentAmount: rentAmountInt,
            chargesAmount: chargesAmountInt,
            paymentChannel: data.paymentChannel,
            paymentReference: data.paymentReference,
            receiptType: data.receiptType,
            creatorName: data.creatorName
        });
    }

    return primaryReceipt;
}
