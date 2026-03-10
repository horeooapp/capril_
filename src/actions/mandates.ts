"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
// These are plain string fields in the schema (no Prisma enums generated)
type MandateStatus = string
type MandateType = string
const MandateStatus = { VALIDATED: 'active', PENDING: 'draft', REJECTED: 'terminated' } as const
const MandateType = { EXCLUSIVE: 'management_extended', NON_EXCLUSIVE: 'management_simple', RENTAL: 'rental' } as const
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
            mandateRef: `MAND-${Date.now()}-${agentId.slice(-5)}`,
            propertyId: data.propertyId,
            agentUserId: agentId,
            mandateType: data.type,
            commissionPct: 10, // Default 10% for the simplified action
            startDate: data.startDate,
            endDate: data.endDate || null,
            status: MandateStatus.PENDING,
            proofHash
        }
    })

    await logAction({
        action: "CREATE_MANDATE",
        module: "MANDATE",
        entityId: mandate.id,
        newValues: { propertyId: data.propertyId, proofHash }
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

    if (!mandate || mandate.property.ownerUserId !== userId) {
        throw new Error("Unauthorized to validate this mandate")
    }

    const updatedMandate = await prisma.mandate.update({
        where: { id: mandateId },
        data: { status }
    })

    // Update Agent Reliability Score
    await scoreAgentCompliance(mandate.agentUserId, status === MandateStatus.VALIDATED)

    // If validated, update property manager
    if (status === MandateStatus.VALIDATED) {
        await prisma.property.update({
            where: { id: mandate.propertyId },
            data: { managedByUserId: mandate.agentUserId }
        })
    }

    await logAction({
        action: "VALIDATE_MANDATE",
        module: "MANDATE",
        entityId: mandateId,
        newValues: { status }
    })

    return updatedMandate
}

export async function getMandatesByProperty(propertyId: string) {
    return await prisma.mandate.findMany({
        where: { propertyId },
        include: {
            agent: {
                select: { fullName: true, email: true, role: true }
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
        where: { agentUserId: agentId },
        include: {
            property: true
        },
        orderBy: { createdAt: 'desc' }
    })
}
export async function getLandlordMandates() {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) return []

    return await prisma.mandate.findMany({
        where: {
            property: {
                ownerUserId: userId
            }
        },
        include: {
            property: true,
            agent: {
                select: { fullName: true, email: true, role: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    })
}
