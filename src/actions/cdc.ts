"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { CDCDepositInitiator, CDCDepositStatus } from "@prisma/client"
import { generateProofHash } from "@/lib/proof"
import { logAction } from "./audit"

/**
 * Initiates a CDC Deposit (Scenario A or B).
 */
export async function initiateCDCDeposit(data: {
    leaseId: string,
    initiator: CDCDepositInitiator,
    amount: number,
    cdcReference?: string
}) {
    const session = await auth()
    if (!session?.user) throw new Error("Non authentifié")

    // Verify lease exists
    const lease = await prisma.lease.findUnique({
        where: { id: data.leaseId }
    })
    if (!lease) throw new Error("Bail introuvable")

    // Generate Verification Hash
    const proofHash = generateProofHash({
        leaseId: data.leaseId,
        initiator: data.initiator,
        amount: data.amount,
        timestamp: new Date().toISOString()
    })

    const deposit = await prisma.cDCDeposit.create({
        data: {
            leaseId: data.leaseId,
            initiator: data.initiator,
            amount: data.amount,
            cdcReference: data.cdcReference,
            status: CDCDepositStatus.PENDING,
            proofHash
        }
    })

    await logAction({
        action: "INITIATE_CDC_DEPOSIT",
        entityType: "CDC_DEPOSIT",
        entityId: deposit.id,
        details: { initiator: data.initiator, amount: data.amount, proofHash }
    })

    return deposit
}

/**
 * Validates a CDC Deposit (Scenario B: when owner provides proof).
 */
export async function validateCDCDeposit(depositId: string, cdcReference: string) {
    const session = await auth()
    if (!session?.user) throw new Error("Non authentifié")

    const deposit = await prisma.cDCDeposit.update({
        where: { id: depositId },
        data: {
            status: CDCDepositStatus.CONSIGNED,
            cdcReference
        }
    })

    await logAction({
        action: "VALIDATE_CDC_DEPOSIT",
        entityType: "CDC_DEPOSIT",
        entityId: depositId,
        details: { cdcReference }
    })

    return deposit
}

/**
 * Retrieves the CDC Deposit for a lease.
 */
export async function getCDCDepositByLease(leaseId: string) {
    return await prisma.cDCDeposit.findUnique({
        where: { leaseId }
    })
}
