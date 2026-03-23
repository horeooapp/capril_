"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { serializeReceipt } from "@/lib/serialize"
import { createAndNotifyReceipt } from "@/lib/receipt"

/**
 * Part 8.1: Create/Generate Receipt (Server Action)
 * ADD-09 / ADD-12 Implementation
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
        // 1. Verify user and plan (Paywall)
        const creator = await prisma.user.findUnique({
            where: { id: userId },
            select: { activePlanTier: true, walletBalance: true, fullName: true, role: true }
        });
        
        if (!creator) return { error: "Utilisateur inconnu" };

        if (creator.role === "TENANT") {
            return { error: "Un locataire ne peut pas émettre de quittance." };
        }

        const RECEIPT_COST = 150; // 150 FCFA
        
        // ADD-09 Logic: Free 3 receipts for ESSENTIEL
        if (creator.activePlanTier === "ESSENTIEL") {
            const usageCount = await prisma.receipt.count({
                where: { lease: { landlordId: userId } }
            });

            if (usageCount >= 3) {
                if (creator.walletBalance < RECEIPT_COST) {
                    return { 
                        error: "INSUFFICIENT_FUNDS", 
                        message: `Limite de 3 quittances gratuites atteinte. Solde insuffisant pour la suivante (${RECEIPT_COST} FCFA).`
                    };
                }
                // Deduct from wallet
                await prisma.user.update({
                    where: { id: userId },
                    data: { walletBalance: { decrement: RECEIPT_COST } }
                });
            }
        }

        // 2. Delegate to shared library logic
        const receipt = await createAndNotifyReceipt({
            ...data,
            creatorName: creator.fullName || undefined
        });

        revalidatePath(`/dashboard/leases/${data.leaseId}`)
        return { success: true, receipt: serializeReceipt(receipt as any) }

    } catch (error: any) {
        console.error("[RECEIPT_ACTION_ERROR]", error)
        return { error: error.message || "Erreur lors de la génération de la quittance" }
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
