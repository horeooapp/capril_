"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { MandateStatus, MandateType } from "@prisma/client"
import { logAction } from "./audit"
import { enforceAgentActive } from "@/lib/agents"
import { generateProofHash } from "@/lib/proof"
import { scoreAgentCompliance } from "@/lib/scoring"

export async function createMandate(data: {
    propertyId: string,
    type: MandateType,
    startDate: Date,
    endDate?: Date,
    documentUrl?: string
}) {
    const session = await auth()
    const agentId = session?.user?.id

    if (!agentId) {
        throw new Error("Unauthorized")
    }

    // Enforce QAPRIL Regularization
    await enforceAgentActive()

    // Check for conflicting mandates (non-exclusive allows multiple, exclusive blocks others)
    const existingMandates = await prisma.mandate.findMany({
        where: {
            propertyId: data.propertyId,
            status: MandateStatus.VALIDATED,
            OR: [
                { type: MandateType.EXCLUSIVE },
                { type: data.type === MandateType.EXCLUSIVE ? MandateType.NON_EXCLUSIVE : undefined }
            ].filter(Boolean) as any
        }
    })

    if (existingMandates.length > 0 && data.type === MandateType.EXCLUSIVE) {
        throw new Error("Une gestion exclusive est déjà en cours pour ce bien.")
    }

    const proofHash = generateProofHash({
        propertyId: data.propertyId,
        agentId: agentId,
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate
    })

    const mandate = await prisma.mandate.create({
        data: {
            propertyId: data.propertyId,
            agentId: agentId,
            type: data.type,
            startDate: data.startDate,
            endDate: data.endDate,
            documentUrl: data.documentUrl,
            status: MandateStatus.PENDING,
            proofHash
        }
    })

    await logAction({
        action: "CREATE_MANDATE",
        entityType: "MANDATE",
        entityId: mandate.id,
        details: { propertyId: data.propertyId, proofHash }
    })

    return mandate
}

export async function validateMandate(mandateId: string, status: MandateStatus) {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
        throw new Error("Unauthorized")
    }

    const mandate = await prisma.mandate.findUnique({
        where: { id: mandateId },
        include: { property: true }
    })

    if (!mandate || mandate.property.ownerId !== userId) {
        throw new Error("Unauthorized to validate this mandate")
    }

    const updatedMandate = await prisma.mandate.update({
        where: { id: mandateId },
        data: { status }
    })

    // Update Agent Reliability Score
    await scoreAgentCompliance(mandate.agentId, status === MandateStatus.VALIDATED)

    // If validated, update property manager
    if (status === MandateStatus.VALIDATED) {
        await prisma.property.update({
            where: { id: mandate.propertyId },
            data: { managerId: mandate.agentId }
        })
    }

    await logAction({
        action: "VALIDATE_MANDATE",
        entityType: "MANDATE",
        entityId: mandateId,
        details: { status }
    })

    return updatedMandate
}

export async function getMandatesByProperty(propertyId: string) {
    return await prisma.mandate.findMany({
        where: { propertyId },
        include: {
            agent: {
                select: { name: true, email: true, role: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    })
}

export async function getMandatesByAgent() {
    const session = await auth()
    const agentId = session?.user?.id

    if (!agentId) return []

    return await prisma.mandate.findMany({
        where: { agentId },
        include: {
            property: true
        },
        orderBy: { createdAt: 'desc' }
    })
}
