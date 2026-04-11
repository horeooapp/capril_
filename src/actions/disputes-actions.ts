"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import crypto from 'crypto'

export async function createDisputeDLC(formData: FormData) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { error: "Non autorisé" }
        }

        const leaseId = formData.get("leaseId") as string
        const type = formData.get("type") as string
        const isCryptoSealed = formData.get("isCryptoSealed") === "on"

        if (!leaseId || !type) {
            return { error: "Données manquantes" }
        }

        // Generate CACI Hash if sealed
        let hash = null
        if (isCryptoSealed) {
            hash = crypto.createHash('sha256').update(`${leaseId}-${type}-${Date.now()}`).digest('hex').substring(0, 16)
        }

        const dispute = await prisma.dispute.create({
            data: {
                leaseId,
                title: "Dossier Litige Certifié (DLC)",
                description: "Dossier instancié via l'orchestrateur CACI (V5)",
                type,
                severity: "CRITIQUE",
                hash,
                isCryptoSealed,
                status: "ESCALATED"
            }
        })

        revalidatePath("/dashboard/disputes")
        return { success: true, disputeId: dispute.id, hash }
    } catch (e) {
        console.error(e)
        return { error: "Erreur lors de la création du dossier contentieux" }
    }
}

export async function getAgencyDisputes() {
    const session = await auth()
    if (!session?.user?.id) return []

    const disputes = await prisma.dispute.findMany({
        where: {
            lease: {
                OR: [
                    { landlordId: session.user.id },
                    { agentId: session.user.id }
                ]
            }
        },
        include: {
            lease: {
                include: {
                    tenant: true,
                    property: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return disputes
}
