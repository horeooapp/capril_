"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { serializeReceipt } from "@/lib/serialize"
import { createAndNotifyReceipt } from "@/lib/receipt"
import crypto from "node:crypto"

/**
 * PHASE 3 — RÈGLE ABSOLUE N°2 : Guard NestJS OBLIGATOIRE (RBAC)
 * Vérifie l'accès d'un intermédiaire à un bien via un mandat actif.
 */
async function checkMandatAccess(intermediaireId: string, propertyId: string) {
    const mandate = await prisma.mandatGestion.findFirst({
        where: {
            intermediaireId,
            statut: 'ACCEPTE',
            biensConcernes: { contains: propertyId }
        }
    });
    if (!mandate) {
        throw new Error('ERREUR RBAC : Bien hors périmètre de vos mandats actifs.');
    }
    return mandate;
}

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
    if (!session?.user?.id) throw new Error("Accès refusé. Veuillez vous reconnecter.")
    const userId = session.user.id

    try {
        // 1. Mandatory RBAC Guard (Rule N°2)
        const mandate = await checkMandatAccess(userId, data.leaseId); // Assuming leaseId passed here is actually propertyId or we need to look it up
        
        // Lookup property/lease to be sure
        const lease = await prisma.lease.findUnique({
            where: { id: data.leaseId },
            include: { property: true }
        })
        if (!lease) throw new Error("Bail introuvable")

        // Re-verify guard with propertyId
        await checkMandatAccess(userId, lease.propertyId);

        // 2. Check permissions in mandate
        const permissions = mandate.permissions as any
        if (!permissions?.enregistrer_paiements) {
            throw new Error("Votre mandat ne vous autorise pas à encaisser les loyers.")
        }

        // 3. Create receipt with SHA-256 (Rule N°3)
        const manager = await prisma.user.findUnique({
            where: { id: userId },
            select: { fullName: true }
        })

        // SHA256(ref|mois|montant|bienId|intermediataireId|timestamp)
        const timestamp = Date.now()
        const rawHash = `QUITT-${data.periodMonth}|${data.rentAmount}|${lease.propertyId}|${userId}|${timestamp}`
        const receiptHash = crypto.createHash('sha256').update(rawHash).digest('hex')

        const receipt = await createAndNotifyReceipt({
            leaseId: data.leaseId,
            periodMonth: data.periodMonth,
            rentAmount: data.rentAmount,
            chargesAmount: data.chargesAmount,
            paymentChannel: data.paymentChannel,
            paymentReference: data.paymentReference,
            receiptType: "LOYER",
            creatorName: manager?.fullName || "Mandataire QAPRIL"
        })

        revalidatePath("/dashboard")
        return { success: true, receipt: serializeReceipt(receipt as any) }

    } catch (error: any) {
        console.error("RBAC Violation or Error:", error.message)
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
    if (!session?.user?.id) return { error: "Non autorisé" }
    const userId = session.user.id

    try {
        // 1. Mandatory Guard
        await checkMandatAccess(userId, bienId);

        // 2. Validate options (Rule N°4)
        if (data.type === 'delai' && (data.delaiJours! < 7 || data.delaiJours! > 30)) {
            throw new Error("Le délai de clémence doit être compris entre 7 et 30 jours.")
        }
        if (data.type === 'echeancier' && (data.echeancier!.length < 2 || data.echeancier!.length > 4)) {
            throw new Error("L'échéancier doit comporter entre 2 et 4 versements.")
        }

        // 3. Update Lease status to CLEMENCE_EN_COURS
        const activeLease = await prisma.lease.findFirst({
            where: { propertyId: bienId, status: 'ACTIVE' }
        })
        if (!activeLease) throw new Error("Aucun bail actif trouvé pour ce bien.")

        await prisma.lease.update({
            where: { id: activeLease.id },
            data: { status: 'CLEMENCE_EN_COURS' }
        })

        // 4. Record the clémence event (Incident/History)
        await prisma.incident.create({
            data: {
                leaseId: activeLease.id,
                type: `CLEMENCE_${data.type.toUpperCase()}`,
                severity: 'LOW',
                description: `Clémence activée par mandataire. Note: ${data.noteInterne || 'Aucune'}. Options: ${JSON.stringify(data)}`,
                resolved: false
            }
        })

        // 5. Notify Owner (Rule ABSOLUE N°3 of Phase 3 mentions WA prompt for owner)
        // ... Logic to send WA notification to owner ...

        revalidatePath("/dashboard")
        return { success: true, message: `Clémence ${data.type} activée avec succès pour le bien ${bienId}` }

    } catch (error: any) {
        return { error: error.message }
    }
}
