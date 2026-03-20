"use server"

import { prisma } from "@/lib/prisma"
import { MandateStatus, MandateType, Role } from "@prisma/client"
import { logAction } from "./audit"
import { enforceAgentActive } from "@/lib/agents"
import { generateProofHash } from "@/lib/proof"
import { scoreAgentCompliance } from "@/lib/scoring"
import { ensureAuthenticated, ensureRole, ensurePropertyAccess } from "./auth-helpers"

export async function createMandate(data: {
    propertyId: string,
    type: MandateType,
    startDate: Date,
    endDate?: Date,
    documentUrl?: string,
    commissionPct?: number,
    commissionFixed?: number,
    scope?: any
}) {
    const session = await ensureAuthenticated()
    const agentId = session.user.id
    
    // Safety check: only agents or landlords (for direct mandates)
    await ensureRole([Role.AGENCY, Role.NON_CERTIFIED_AGENT, Role.LANDLORD, Role.LANDLORD_PRO, Role.ADMIN, Role.SUPER_ADMIN])

    // Enforce QAPRIL Regularization
    await enforceAgentActive()

    // Rule MM-01: Check for conflicting mandates
    // One active EXCLUSIVE mandate per property
    if (data.type === MandateType.EXCLUSIVE) {
        const existingExclusive = await prisma.mandate.findFirst({
            where: {
                propertyId: data.propertyId,
                status: MandateStatus.ACTIVE,
                mandateType: MandateType.EXCLUSIVE
            },
            include: { agent: { select: { fullName: true } } }
        })

        if (existingExclusive) {
            throw new Error(`Ce bien a déjà un mandat exclusif actif avec ${existingExclusive.agent?.fullName || 'une autre agence'}.`)
        }
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
            commissionPct: data.commissionPct || (data.type === MandateType.DIRECT ? 0 : 10),
            commissionFixed: data.commissionFixed || 0,
            startDate: data.startDate,
            endDate: data.endDate || null,
            status: MandateStatus.DRAFT,
            scope: data.scope || {},
            proofHash,
            pdfUrl: data.documentUrl
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
    const session = await ensureAuthenticated()
    const userId = session.user.id

    const mandate = await prisma.mandate.findUnique({
        where: { id: mandateId },
        include: { property: true }
    })

    if (!mandate || mandate.property.ownerUserId !== userId) {
        throw new Error("Unauthorized to validate this mandate")
    }

    const updatedMandate = await prisma.mandate.update({
        where: { id: mandateId },
        data: { status, signedAt: status === MandateStatus.ACTIVE ? new Date() : undefined }
    })

    // Update Agent Reliability Score if applicable
    if (mandate.agentUserId) {
        await scoreAgentCompliance(mandate.agentUserId, status === MandateStatus.ACTIVE)
    }

    // If validated, update property manager and mode
    if (status === MandateStatus.ACTIVE) {
        const managementMode = mandate.mandateType === MandateType.DIRECT ? 'DIRECT' : 'AGENCY'
        
        await prisma.property.update({
            where: { id: mandate.propertyId },
            data: { 
                managedByUserId: mandate.agentUserId,
                managementMode: managementMode as any // ManagementMode enum
            }
        })

        // Create initial history record
        await prisma.mandateHistory.create({
            data: {
                propertyId: mandate.propertyId,
                mandateId: mandate.id,
                agentUserId: mandate.agentUserId,
                mandateType: mandate.mandateType,
                startDate: mandate.startDate,
                endDate: mandate.endDate,
            }
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

export async function terminateMandate(mandateId: string, reason: string) {
    const session = await ensureAuthenticated()
    const userId = session.user.id

    const mandate = await prisma.mandate.findUnique({
        where: { id: mandateId },
        include: { property: true }
    })

    if (!mandate || (mandate.property.ownerUserId !== userId && mandate.agentUserId !== userId)) {
        throw new Error("Unauthorized")
    }

    const updatedMandate = await prisma.mandate.update({
        where: { id: mandateId },
        data: { 
            status: MandateStatus.CANCELLED,
            cancelledAt: new Date(),
            cancelledByUserId: userId,
            cancelReason: reason
        }
    })

    // Update history
    await prisma.mandateHistory.updateMany({
        where: { mandateId: mandate.id, propertyId: mandate.propertyId },
        data: { endDate: new Date() }
    })

    await logAction({
        action: "TERMINATE_MANDATE",
        module: "MANDATE",
        entityId: mandateId,
        newValues: { status: MandateStatus.CANCELLED, reason }
    })

    return updatedMandate
}

export async function getMandatesByProperty(propertyId: string) {
    await ensurePropertyAccess(propertyId)

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
    const session = await ensureAuthenticated()
    const agentId = session.user.id

    return await prisma.mandate.findMany({
        where: { agentUserId: agentId },
        include: {
            property: true
        },
        orderBy: { createdAt: 'desc' }
    })
}

export async function getLandlordMandates() {
    const session = await ensureAuthenticated()
    const userId = session.user.id

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
