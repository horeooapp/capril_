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
                select: { id: true, activePlanTier: true, walletConfig: { select: { walletBalance: true } }, firstName: true, lastName: true, role: true }
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
            const currentBalance = ((creator?.walletConfig?.walletBalance || 0) || 0) || 0;
            const nextBalance = currentBalance - RECEIPT_COST;

            // Bloquer seulement si on dépasse la limite critique de crédit (-1500 FCFA)
            if (nextBalance < OVERDRAFT_LIMIT) {
                return { 
                    error: "INSUFFICIENT_FUNDS", 
                    message: `Solde insuffisant (${currentBalance} FCFA). La limite de crédit de ${Math.abs(OVERDRAFT_LIMIT)} FCFA est atteinte.`
                };
            }

            // Déduction effective (Peut devenir négatif). Utilisation de upsert pour éviter RecordNotFound.
            await prisma.userWalletConfig.upsert({
                where: { userId: userId },
                update: { walletBalance: { decrement: RECEIPT_COST } },
                create: {
                    userId: userId,
                    walletBalance: -RECEIPT_COST,
                    landlordCode: Math.random().toString(36).substring(2, 8).toUpperCase()
                }
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
            creatorName: (creator.firstName ? creator.firstName + " " : "") + (creator.lastName || "") || undefined
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
                    landlord: { select: { firstName: true, lastName: true, phone: true } },
                    tenant: { select: { firstName: true, lastName: true, phone: true } }
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

    try {
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
    } catch (error: any) {
        console.error("[GET_TENANT_RECEIPTS_ERROR]", error)
        return []
    }
}

/**
 * Part 8.3: Pay Receipt (Tenant Action)
 * Marks a pending/unpaid receipt as PAID.
 */
export async function payReceipt(receiptId: string, channel: string = "WAVE_CI") {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        return { error: "Non autorisé" }
    }

    try {
        const receipt = await prisma.receipt.findUnique({
            where: { id: receiptId },
            include: { lease: true }
        })

        if (!receipt) throw new Error("Quittance introuvable.")
        if (receipt.lease.tenantId !== session.user.id) {
            throw new Error("Vous n'êtes pas le locataire de ce bail.")
        }

        const updatedReceipt = await prisma.receipt.update({
            where: { id: receiptId },
            data: {
                status: 'paid',
                paymentMethod: channel,
                paymentRef: "PAY-" + Math.random().toString(36).substring(7).toUpperCase(),
                paidAt: new Date()
            }
        })

        // Audit Log
        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: "RECEIPT_PAID",
                module: "WALLET",
                entityId: receiptId,
                newValues: { channel, reference: updatedReceipt.paymentRef }
            }
        })

        revalidatePath("/dashboard/wallet")
        return { success: true, receipt: serializeReceipt(updatedReceipt as any) }

    } catch (error: any) {
        console.error("[PAY_RECEIPT_ERROR]", error)
        return { error: error.message || "Erreur lors du paiement" }
    }
}

/**
 * Part 8.4: Get Active Leases for Select (Landlord/Agency utility)
 */
export async function getActiveLeasesForSelect() {
    const session = await auth()
    if (!session || !session.user || !session.user.id) return []

    const userId = session.user.id

    try {
        const leases = await prisma.lease.findMany({
            where: {
                OR: [
                    { landlordId: userId },
                    { agentId: userId },
                    { property: { managedByUserId: userId } }
                ],
                status: { in: ['ACTIVE', 'LOYER_IMPAYE', 'MISE_EN_DEMEURE', 'ACTIVE_DECLARATIF'] }
            },
            select: {
                id: true,
                leaseReference: true,
                rentAmount: true,
                tenant: { select: { firstName: true, lastName: true } },
                property: { select: { name: true, address: true } }
            },
            orderBy: { createdAt: 'desc' }
        })

        return leases.map(l => ({
            id: l.id,
            label: `${l.leaseReference} - ${l.tenant?.firstName || ''} ${l.tenant?.lastName || ''} (${l.property.name || l.property.address})`,
            rentAmount: l.rentAmount
        }))
    } catch (error) {
        console.error("[GET_ACTIVE_LEASES_FOR_SELECT_ERROR]", error)
        return []
    }
}

/**
 * Part 8.5: Update Receipt (Landlord/Agency Action)
 */
export async function updateReceipt(receiptId: string, data: {
    periodMonth?: string,
    rentAmount?: number,
    chargesAmount?: number,
    paymentChannel?: string,
    paymentReference?: string,
    status?: string
}) {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        return { error: "Non autorisé" }
    }

    try {
        const receipt = await prisma.receipt.findUnique({
            where: { id: receiptId },
            include: { lease: true }
        })

        if (!receipt) throw new Error("Quittance introuvable.")
        
        // Basic Security check: only landlord/agent can update
        const isOwner = receipt.lease.landlordId === session.user.id || receipt.lease.agentId === session.user.id
        if (!isOwner) throw new Error("Seul le gestionnaire de ce bail peut modifier la quittance.")

        // Block update if already PAID (unless it's just a ref or small correction, but better to be safe)
        if (receipt.status === 'PAID') {
            // throw new Error("Une quittance déjà payée/certifiée ne peut plus être modifiée pour garantir l'intégrité.")
        }

        const updatedReceipt = await prisma.receipt.update({
            where: { id: receiptId },
            data: {
                periodMonth: data.periodMonth,
                rentAmount: data.rentAmount,
                chargesAmount: data.chargesAmount,
                paymentMethod: data.paymentChannel as any,
                paymentRef: data.paymentReference,
                status: data.status as any
            }
        })

        revalidatePath("/dashboard/receipts")
        return { success: true, receipt: serializeReceipt(updatedReceipt as any) }

    } catch (error: any) {
        console.error("[UPDATE_RECEIPT_ERROR]", error)
        return { error: error.message || "Erreur lors de la modification" }
    }
}
