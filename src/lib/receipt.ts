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

    // 2. Reference & Target Period Search (Idempotence & Anti-collision)
    const receiptRef = await generateReceiptRef();

    let targetPeriod = data.periodMonth;
    let existingReceipt = await prisma.receipt.findUnique({
        where: {
            leaseId_periodMonth: {
                leaseId: data.leaseId,
                periodMonth: targetPeriod,
            }
        }
    });

    // Si une quittance soldée existe déjà pour ce mois, chercher le premier mois suivant non soldé
    let loopGuard = 0;
    while (existingReceipt && (existingReceipt.status === 'paid' || existingReceipt.status === 'PAID') && loopGuard < 24) {
        loopGuard++;
        const [y, m] = targetPeriod.split('-').map(Number);
        const nextDate = new Date(Date.UTC(y, m, 1)); // m est 1-based, donc y, m donne le 1er du mois suivant
        targetPeriod = nextDate.toISOString().slice(0, 7);
        existingReceipt = await prisma.receipt.findUnique({
            where: {
                leaseId_periodMonth: {
                    leaseId: data.leaseId,
                    periodMonth: targetPeriod,
                }
            }
        });
    }

    const documentHash = await generateProofHash({
        receiptRef,
        leaseId: data.leaseId,
        totalAmount: data.rentAmount + data.chargesAmount,
        period: targetPeriod,
        receiptType: data.receiptType
    });

    // Generate Robust QR Token (PHASE 1)
    const qrToken = documentHash.slice(0, 12).toUpperCase();

    // 3. Database Record (Upsert sécurisé)
    const receipt = existingReceipt
        ? await prisma.receipt.update({
            where: { id: existingReceipt.id },
            data: {
                receiptRef,
                rentAmount: data.rentAmount,
                chargesAmount: data.chargesAmount,
                totalAmount: data.rentAmount + data.chargesAmount,
                paymentMethod: data.paymentChannel,
                paymentRef: data.paymentReference,
                paidAt: new Date(),
                receiptHash: documentHash,
                qrToken: qrToken,
                status: "PAID"
            }
        })
        : await prisma.receipt.create({
            data: {
                receiptRef,
                leaseId: data.leaseId,
                periodMonth: targetPeriod,
                rentAmount: data.rentAmount,
                chargesAmount: data.chargesAmount,
                totalAmount: data.rentAmount + data.chargesAmount,
                paymentMethod: data.paymentChannel,
                paymentRef: data.paymentReference,
                paidAt: new Date(),
                receiptHash: documentHash,
                qrToken: qrToken,
                status: "PAID"
            }
        });

    // 4. Scoring (ICL)
    if (data.receiptType === "RENT" && lease.tenantId) {
        try {
            const [year, month] = data.periodMonth.split('-').map(Number);
            const dueDate = new Date(year, month - 1, lease.paymentDay || 5);
            const today = new Date();
            const diffTime = today.getTime() - dueDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            await scoreRentPayment(lease.tenantId, diffDays, receipt.id);
        } catch (e) {
            console.warn("[SCORING_ERROR]", e);
        }
    }

    // 5. PDF Generation & Delivery (M-DOC-PDF - PHASE 1 ROBUST)
    if (lease.tenantId) {
        try {
            const { generateReceiptPDF } = await import('./pdf-generator');
            const pdfBuffer = await generateReceiptPDF({
                receiptRef,
                leaseRef: lease.leaseReference,
                periodMonth: data.periodMonth,
                rentAmount: data.rentAmount,
                chargesAmount: data.chargesAmount,
                totalAmount: data.rentAmount + data.chargesAmount,
                paymentMethod: data.paymentChannel,
                paidAt: new Date(),
                tenantName: (lease.tenant?.firstName ? lease.tenant.firstName + " " : "") + (lease.tenant?.lastName || "") || 'Locataire',
                propertyAddress: lease.property.address,
                landlordName: data.creatorName || (lease.landlord.firstName ? lease.landlord.firstName + " " : "") + (lease.landlord.lastName || "") || 'Propriétaire QAPRIL',
                receiptHash: documentHash,
                qrToken: qrToken,
                declarative: data.receiptType === 'DECLARATIVE'
            });

            // Trigger Notification (Async - Simultaneous SMS + WA)
            NotificationService.envoyerNotification(
                lease.tenantId,
                "QUITTANCE_GENEREE",
                {
                    referenceId: receiptRef,
                    receiptBuffer: pdfBuffer,
                    payload: {
                        parameters: [(lease.tenant?.firstName ? lease.tenant.firstName + " " : "") + (lease.tenant?.lastName || "") || "Locataire", lease.property.address || "Propriété"],
                        smsText: `[QAPRIL] Votre quittance Certifiée SHA-256 pour ${data.periodMonth} est disponible. Réf: ${receiptRef}.`,
                        html: `<p>Votre quittance certifiée pour le mois de ${data.periodMonth} a été générée.</p>`
                    }
                }
            ).catch(err => console.error("[NOTIF_ERROR]", err));

        } catch (e) {
            console.error("[PDF_ERROR]", e);
        }
    }

    return receipt;
}
