"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { EscrowStatus } from "@prisma/client"
import { logAction } from "./audit"

export async function createEscrow(leaseId: string, amount: number) {
    const session = await auth()
    if (!session?.user) throw new Error("Non authentifié")

    const escrow = await prisma.escrow.create({
        data: {
            leaseId,
            amount,
            status: "ACTIVE",
            history: JSON.stringify([{
                status: "ACTIVE",
                timestamp: new Date(),
                reason: "Initialisation du bail"
            }])
        }
    })

    await logAction({
        action: "CREATE_ESCROW",
        entityType: "ESCROW",
        entityId: escrow.id,
        details: { leaseId, amount }
    })

    return escrow
}

export async function updateEscrowStatus(escrowId: string, newStatus: EscrowStatus, reason: string) {
    const session = await auth()
    if (!session?.user) throw new Error("Non authentifié")

    const currentEscrow = await prisma.escrow.findUnique({
        where: { id: escrowId }
    })

    if (!currentEscrow) throw new Error("Séquestre introuvable")

    const history = JSON.parse(currentEscrow.history || "[]")
    history.push({
        status: newStatus,
        timestamp: new Date(),
        reason
    })

    const updatedEscrow = await prisma.escrow.update({
        where: { id: escrowId },
        data: {
            status: newStatus,
            history: JSON.stringify(history)
        }
    })

    await logAction({
        action: "UPDATE_ESCROW_STATUS",
        entityType: "ESCROW",
        entityId: escrowId,
        details: { oldStatus: currentEscrow.status, newStatus, reason }
    })

    return updatedEscrow
}

export async function getEscrowByLease(leaseId: string) {
    return await prisma.escrow.findUnique({
        where: { leaseId }
    })
}
