"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { generateProofHash } from "@/lib/proof"
import { scoreRentPayment } from "@/lib/scoring"
import { generateReceiptRef } from "@/lib/receipt"
import { revalidatePath } from "next/cache"

import { serializeReceipt } from "@/lib/serialize"
import { NotificationService } from "@/lib/notification-service"

/**
 * Part 8.1: Create/Generate Receipt
 */
export async function createReceipt(data: {
    leaseId: string,
    periodMonth: string, // "YYYY-MM"
    rentAmount: number,
    chargesAmount: number,
    paymentChannel: string,
    paymentReference?: string,
    receiptType: string 
}) {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        return { error: "Non autorisé" }
    }

    const userId = session.user.id

    try {
        // 1. Verify lease access
        const lease = await prisma.lease.findUnique({
            where: { id: data.leaseId },
            include: { 
                property: true,
                tenant: true
            }
        })

        if (!lease) return { error: "Bail introuvable" }
        
        // Landlord or Agent check
        if (lease.landlordId !== userId && lease.agentId !== userId) {
            return { error: "Action non autorisée sur ce contrat" }
        }

        // 2. Generate v2.0 Reference
        const receiptRef = await generateReceiptRef()

        // 3. Document Proof Hash
        const documentHash = generateProofHash({
            receiptRef,
            leaseId: data.leaseId,
            totalAmount: data.rentAmount + data.chargesAmount,
            period: data.periodMonth,
            receiptType: data.receiptType
        })

        // 4. Create Receipt Record
        const receipt = await prisma.receipt.create({
            data: {
                receiptRef,
                leaseId: data.leaseId,
                periodMonth: data.periodMonth,
                rentAmount: data.rentAmount,
                chargesAmount: data.chargesAmount,
                totalAmount: data.rentAmount + data.chargesAmount,
                paymentMethod: data.paymentChannel,
                paymentRef: data.paymentReference,
                paidAt: new Date(),
                receiptHash: documentHash,
                status: "PAID"
            }
        })

        // 5. Update scoring (ICL) if it's a rent payment
        if (data.receiptType === "RENT") {
            try {
                // PART 13: Calculate punctuality based on periodMonth
                const [year, month] = data.periodMonth.split('-').map(Number);
                const dueDate = new Date(year, month - 1, 5); // 5th of the month
                const today = new Date();
                
                // Normalize dates to midnight for day calculation
                const d1 = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
                const d2 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                
                const diffTime = d2.getTime() - d1.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                await scoreRentPayment(lease.tenantId!, diffDays, receipt.id);
            } catch (e) {
                console.warn("[SCORING] Error updating score:", e);
            }
        }

        // 6. Trigger Multi-Channel Notification (ADD-09)
        if (lease.tenantId) {
            // FIRE AND FORGET - do not await to avoid blocking the user flow
            NotificationService.envoyerNotification(
                lease.tenantId,
                "QUITTANCE_GENEREE",
                {
                    referenceId: receipt.id,
                    payload: {
                        parameters: [lease.tenant?.fullName || "Locataire", lease.property.address || "Propriété"],
                        smsText: `Votre quittance de loyer pour ${data.periodMonth} est disponible sur QAPRIL. Montant: ${data.rentAmount + data.chargesAmount} FCFA.`,
                        html: `<p>Bonjour,</p><p>Votre quittance pour le mois de ${data.periodMonth} a été générée avec succès.</p><p>Montant total : <strong>${data.rentAmount + data.chargesAmount} FCFA</strong></p>`
                    }
                }
            ).catch(err => console.error("[NOTIF_TRIGGER] Failed QUITTANCE_GENEREE", err));
        }

        revalidatePath(`/dashboard/leases/${data.leaseId}`)
        return { success: true, receipt: serializeReceipt(receipt) }

    } catch (error) {
        console.error("[RECEIPT] Error:", error)
        return { error: "Erreur lors de la génération de la quittance" }
    }
}

/**
 * Part 8: Get Receipts for a Lease
 */
export async function getReceiptsForLease(leaseId: string) {
    const receipts = await prisma.receipt.findMany({
        where: { leaseId },
        orderBy: { periodMonth: 'desc' }
    })
    return receipts.map(serializeReceipt)
}

/**
 * Part 8: Get Receipt by ID
 */
export async function getReceiptById(id: string) {
    const receipt = await prisma.receipt.findUnique({
        where: { id },
        include: {
            lease: {
                include: {
                    property: true,
                    landlord: { select: { fullName: true, phone: true } },
                    tenant: { select: { fullName: true, phone: true } }
                }
            }
        }
    })
    if (!receipt) return null
    return serializeReceipt(receipt)
}

/**
 * Part 8: Get user last receipts
 */
export async function getMyReceipts() {
    const session = await auth()
    if (!session || !session.user || !session.user.id) return []

    const userId = session.user.id

    const receipts = await prisma.receipt.findMany({
        where: {
            OR: [
                { lease: { landlordId: userId } },
                { lease: { tenantId: userId } }
            ]
        },
        include: {
            lease: {
                select: {
                    leaseReference: true,
                    property: { select: { address: true } }
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
    })

    return receipts.map(serializeReceipt)
}

/**
 * Part 8.2: Get Receipts for the logged-in Tenant
 */
export async function getReceiptsForTenant() {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        return []
    }

    const receipts = await prisma.receipt.findMany({
        where: { lease: { tenantId: session.user.id } },
        include: {
            lease: {
                include: {
                    property: {
                        include: { owner: true }
                    }
                }
            }
        },
        orderBy: { periodMonth: 'desc' }
    })

    return receipts.map(serializeReceipt)
}
