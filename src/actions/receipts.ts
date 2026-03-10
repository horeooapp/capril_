"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { generateProofHash } from "@/lib/proof"
import { scoreRentPayment } from "@/lib/scoring"
import { generateReceiptRef } from "@/lib/receipt"
import { revalidatePath } from "next/cache"

/**
 * Helper to serialize BigInt
 */
const serializeReceipt = (receipt: any) => ({
    ...receipt,
    rentAmount: receipt.rentAmount?.toString(),
    chargesAmount: receipt.chargesAmount?.toString(),
    totalAmount: receipt.totalAmount?.toString(),
    paidAt: receipt.paidAt?.toISOString(),
    createdAt: receipt.createdAt?.toISOString(),
})

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
                status: "paid"
            }
        })

        // 5. Update scoring (ICL) if it's a rent payment
        if (data.receiptType === "RENT") {
            // Scoring logic needs update for periodMonth (Part 13)
            // For now, simple mock or skip
            try {
                await scoreRentPayment(lease.tenantId!, 0, receipt.id)
            } catch (e) {
                console.warn("[SCORING] Skipping score update due to schema mismatch")
            }
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
