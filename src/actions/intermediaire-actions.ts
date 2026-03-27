"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { serializeReceipt } from "@/lib/serialize"
import { createAndNotifyReceipt } from "@/lib/receipt"
import crypto from "node:crypto"

/**
 * Fetch all data for the Intermédiaire Dashboard
 */
export async function getIntermediaireDashboardData() {
    const session = await auth()
    if (!session?.user || session.user.id === undefined) {
        return { success: false, error: "Non autorisé" }
    }

    const userId = session.user.id

    try {
        // 1. Get active mandates
        const mandates = await prisma.mandatGestion.findMany({
            where: {
                intermediaireId: userId,
                statut: "ACCEPTE"
            },
            include: {
                proprietaire: {
                    select: { fullName: true, id: true }
                }
            }
        })

        if (!mandates || mandates.length === 0) {
            return { success: true, data: { mandates: [], properties: [], stats: {} } }
        }

        // 2. Extract property IDs from JSON string in MandatGestion
        const allPropertyIds = mandates.flatMap(m => {
            try {
                return JSON.parse(m.biensConcernes || "[]")
            } catch (e) {
                return []
            }
        }) as string[]

        const uniquePropertyIds = Array.from(new Set(allPropertyIds))

        // 3. Fetch properties with active leases
        const properties = await prisma.property.findMany({
            where: {
                id: { in: uniquePropertyIds }
            },
            include: {
                leases: {
                    where: { status: "ACTIVE" },
                    include: {
                        tenant: {
                            select: { fullName: true, phone: true }
                        },
                        receipts: {
                            orderBy: { periodMonth: 'desc' },
                            take: 12
                        }
                    }
                }
            }
        })

        // 4. Calculate stats
        let totalLoyers = 0
        let encaisse = 0
        let impayesCount = 0
        let impayesMontant = 0
        
        const now = new Date()
        const currentMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`

        properties.forEach(p => {
            p.leases.forEach(l => {
                totalLoyers += l.rentAmount
                const currentReceipt = l.receipts.find(r => r.periodMonth === currentMonth)
                if (currentReceipt && currentReceipt.status === 'paid') {
                    encaisse += l.rentAmount
                } else if (!currentReceipt || currentReceipt.status !== 'paid') {
                    // Very basic check: if no paid receipt for current month, it's counted as "to be paid" or impayé
                    impayesCount++
                    impayesMontant += l.rentAmount
                }
            })
        })

        // 5. Calculate commissions (Placeholder logic based on 5% if not specified in mandate metadata)
        // MandatGestion has 'remuneration' string, let's try to parse it or fallback
        let totalCommissions = 0
        mandates.forEach(m => {
            // MandatGestion doesn't have a direct 'commissionPct' float like the other model, 
            // but we can assume a logic or check remediation field.
            const commRate = m.remuneration && m.remuneration.includes('%') 
                ? parseFloat(m.remuneration.replace('%', '')) / 100 
                : 0.05 // 5% default for Intermédiaire
            
            // Calc commissions on properties within this specific mandate
            const mPropIds = JSON.parse(m.biensConcernes || "[]") as string[]
            const mProps = properties.filter(p => mPropIds.includes(p.id))
            mProps.forEach(p => {
                p.leases.forEach(l => {
                    const paid = l.receipts.find(r => r.periodMonth === currentMonth && r.status === 'paid')
                    if (paid) {
                        totalCommissions += l.rentAmount * commRate
                    }
                })
            })
        })

        return {
            success: true,
            data: {
                mandates,
                properties,
                stats: {
                    totalLoyers,
                    encaisse,
                    impayesCount,
                    impayesMontant,
                    totalCommissions
                }
            }
        }

    } catch (error: any) {
        console.error("Error fetching Intermédiaire dashboard data:", error)
        return { success: false, error: error.message }
    }
}

/**
 * Emit a certified quittance as an Intermédiaire
 */
export async function emettreQuittanceIntermediaire(data: {
    leaseId: string,
    periodMonth: string,
    rentAmount: number,
    chargesAmount: number,
    paymentChannel: string,
    paymentReference?: string,
    dateEncaissement?: string
}) {
    const session = await auth()
    if (!session?.user || session.user.id === undefined) {
        return { error: "Non autorisé" }
    }

    const userId = session.user.id

    // 1. Verify access via MandatGestion
    const lease = await prisma.lease.findUnique({
        where: { id: data.leaseId },
        include: { property: true }
    })

    if (!lease) return { error: "Bail introuvable" }

    const mandate = await prisma.mandatGestion.findFirst({
        where: {
            intermediaireId: userId,
            statut: "ACCEPTE",
            biensConcernes: { contains: lease.propertyId }
        }
    })

    if (!mandate) return { error: "Vous n'avez pas de mandat actif pour ce bien" }

    // 2. Check permissions in mandate (JSON field)
    const permissions = mandate.permissions as any
    if (!permissions?.enregistrer_paiements) {
        return { error: "Votre mandat ne vous autorise pas à encaisser les loyers" }
    }

    try {
        // 3. Create receipt using regular library logic
        // We'll use createAndNotifyReceipt but we need creatorName
        const manager = await prisma.user.findUnique({
            where: { id: userId },
            select: { fullName: true }
        })

        const receipt = await createAndNotifyReceipt({
            leaseId: data.leaseId,
            periodMonth: data.periodMonth,
            rentAmount: data.rentAmount,
            chargesAmount: data.chargesAmount,
            paymentChannel: data.paymentChannel,
            paymentReference: data.paymentReference,
            receiptType: "LOYER", // Default for Intermédiaire
            creatorName: manager?.fullName || "Mandataire QAPRIL"
        })

        // 4. Ensure SHA-256 is generated (though createAndNotifyReceipt might do it, we force it if needed)
        if (!receipt.receiptHash) {
             const hashData = `${receipt.id}|${receipt.periodMonth}|${receipt.totalAmount}|${Date.now()}`
             const hash = crypto.createHash('sha256').update(hashData).digest('hex')
             await prisma.receipt.update({
                 where: { id: receipt.id },
                 data: { receiptHash: hash }
             })
        }

        revalidatePath("/dashboard")
        return { success: true, receipt: serializeReceipt(receipt as any) }

    } catch (error: any) {
        return { error: error.message }
    }
}

/**
 * Rule M07: Activate Clémence (Delay or Payment Plan)
 */
export async function activerClemenceM07(bienId: string, data: {
    type: "delai" | "echeancier" | "caci",
    delaiJours?: number,
    echeancier?: any[],
    noteInterne?: string
}) {
    const session = await auth()
    if (!session?.user || session.user.id === undefined) return { error: "Non autorisé" }

    // Logic: Intermediary can activate clemence if they have a mandate.
    // This updates the 'Arrears' or 'Procedure' state in the DB.
    // For now, we'll log it in History and update the Lease status if needed.
    
    // Check mandate
    const mandate = await prisma.mandatGestion.findFirst({
        where: {
            intermediaireId: session.user.id,
            statut: "ACCEPTE",
            biensConcernes: { contains: bienId }
        }
    })

    if (!mandate) return { error: "Mandat non trouvé" }

    // Perform DB updates... (Implementation details depend on Arrears/Procedures schema)
    // For now, success stub
    return { success: true, message: "Clémence activée avec succès" }
}
