"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { CDCDepositStatus } from "@prisma/client"
import { logAction } from "./audit"

export async function createEscrow(leaseId: string, amount: number) {
    const session = await auth()
    if (!session?.user) throw new Error("Non authentifié")

    const deposit = await prisma.cDCDeposit.create({
        data: {
            leaseId,
            amount,
            status: "PENDING",
        }
    })

    await logAction({
        action: "CREATE_ESCROW",
        module: "ESCROW",
        entityId: deposit.id,
        newValues: { leaseId, amount }
    })

    return deposit
}

export async function updateEscrowStatus(depositId: string, newStatus: CDCDepositStatus, reason: string) {
    const session = await auth()
    if (!session?.user) throw new Error("Non authentifié")

    const updatedDeposit = await prisma.cDCDeposit.update({
        where: { id: depositId },
        data: {
            status: newStatus,
        }
    })

    await logAction({
        action: "UPDATE_ESCROW_STATUS",
        module: "ESCROW",
        entityId: depositId,
        newValues: { newStatus, reason }
    })

    return updatedDeposit
}

export async function getEscrowByLease(leaseId: string) {
    return await prisma.cDCDeposit.findUnique({
        where: { leaseId }
    })
}
