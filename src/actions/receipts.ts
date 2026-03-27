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
        // 1. Verify user, plan (Paywall) and ConfigTarif (ADD-07 v3)
        const [creator, config] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, activePlanTier: true, walletBalance: true, fullName: true, role: true }
            }),
            prisma.configTarif.findUnique({
                where: { cle: "quittance_ttc" }
            })
        ]);
        
        if (!creator) return { error: "Utilisateur inconnu" };
        if (creator.role === "TENANT") {
            return { error: "Un locataire ne peut pas émettre de quittance." };
        }

        const RECEIPT_COST = config?.valeur || 75; // Défault 75 FCFA (ADD-07 v3)
        const OVERDRAFT_LIMIT = -1500; // Limite de tolérance (REG-2026-001)
        
        // ADD-09 / ADD-11 Logic: Free 3 receipts for ESSENTIEL
        let shouldDeduct = true;
        if (creator.activePlanTier === "ESSENTIEL") {
            const usageCount = await prisma.receipt.count({
                where: { lease: { landlordId: userId } }
            });
            if (usageCount < 3) shouldDeduct = false;
        }

        if (shouldDeduct) {
            const currentBalance = creator.walletBalance || 0;
            const nextBalance = currentBalance - RECEIPT_COST;

            // Bloquer seulement si on dépasse la limite critique de crédit (-1500 FCFA)
            if (nextBalance < OVERDRAFT_LIMIT) {
                return { 
                    error: "INSUFFICIENT_FUNDS", 
                    message: `Solde insuffisant (${currentBalance} FCFA). La limite de crédit de ${Math.abs(OVERDRAFT_LIMIT)} FCFA est atteinte.`
                };
            }

            // Déduction effective (Peut devenir négatif)
            await prisma.user.update({
                where: { id: userId },
                data: { walletBalance: { decrement: RECEIPT_COST } }
            });

            // TRIGGER IMMEDIAT: Si le solde devient négatif, on active le mode crédit (ADD-07 v3)
            if (nextBalance < 0) {
                const { triggerCreditGenere } = await import("@/lib/wallet/triggers");
                triggerCreditGenere(creator.id).catch(err => console.error("[CREDIT_TRIGGER_ERROR]", err));
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
