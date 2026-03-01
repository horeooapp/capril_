"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { MediationStatus } from "@prisma/client"
import { logAction } from "./audit"

/**
 * Initiates a mediation process for a lease.
 */
export async function initiateMediation(leaseId: string, subject: string) {
    const session = await auth()
    if (!session?.user) throw new Error("Non authentifié")

    const lease = await prisma.lease.findUnique({
        where: { id: leaseId },
        include: { property: true }
    })

    if (!lease) throw new Error("Bail introuvable")

    // Only tenant, owner or manager can initiate
    const userId = session.user.id
    if (lease.tenantId !== userId && lease.property.ownerId !== userId && lease.property.managerId !== userId) {
        throw new Error("Accès non autorisé")
    }

    const mediation = await prisma.mediation.create({
        data: {
            leaseId,
            subject,
            status: MediationStatus.OPEN
        }
    })

    await logAction({
        action: "INITIATE_MEDIATION",
        entityType: "MEDIATION",
        entityId: mediation.id,
        details: { leaseId, subject }
    })

    return mediation
}

/**
 * Adds a message to an active mediation.
 */
export async function addMediationMessage(mediationId: string, content: string) {
    const session = await auth()
    if (!session?.user) throw new Error("Non authentifié")

    const mediation = await prisma.mediation.findUnique({
        where: { id: mediationId },
        include: { lease: { include: { property: true } } }
    })

    if (!mediation) throw new Error("Médiation introuvable")

    const userId = session.user.id
    const lease = mediation.lease
    if (lease.tenantId !== userId && lease.property.ownerId !== userId && lease.property.managerId !== userId) {
        throw new Error("Accès non autorisé")
    }

    const message = await prisma.mediationMessage.create({
        data: {
            mediationId,
            senderId: userId,
            content
        }
    })

    // Update mediation status to IN_PROGRESS on first message
    if (mediation.status === MediationStatus.OPEN) {
        await prisma.mediation.update({
            where: { id: mediationId },
            data: { status: MediationStatus.IN_PROGRESS }
        })
    }

    return message
}

/**
 * Resolves or closes a mediation.
 */
export async function resolveMediation(mediationId: string, status: MediationStatus) {
    const session = await auth()
    if (!session?.user) throw new Error("Non authentifié")

    // In a real scenario, this might requires both parties' consent or an admin override
    const updatedMediation = await prisma.mediation.update({
        where: { id: mediationId },
        data: { status }
    })

    await logAction({
        action: "RESOLVE_MEDIATION",
        entityType: "MEDIATION",
        entityId: mediationId,
        details: { status }
    })

    return updatedMediation
}

export async function getMediationByLease(leaseId: string) {
    return await prisma.mediation.findUnique({
        where: { leaseId },
        include: { messages: { orderBy: { createdAt: 'asc' } } }
    })
}
