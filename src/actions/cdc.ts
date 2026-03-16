"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { CDCDepositInitiator, CDCDepositStatus } from "@prisma/client"
import { generateProofHash } from "@/lib/proof"
import { logAction } from "./audit"
import { revalidatePath } from "next/cache"

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
        module: "CDC_DEPOSIT",
        entityId: deposit.id,
        newValues: { initiator: data.initiator, amount: data.amount, proofHash }
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
        module: "CDC_DEPOSIT",
        entityId: depositId,
        newValues: { cdcReference }
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

/**
 * Part 11.6: Request CDC Restitution (Hybrid Automation)
 */
export async function requestCDCRestitution(leaseId: string, amountToReturn: number, deductionsReason?: string) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        throw new Error("Authentification requise.");
    }

    const lease = await prisma.lease.findUnique({
        where: { id: leaseId },
        select: { landlordId: true }
    });

    if (session.user.id !== lease?.landlordId && session.user.role !== 'ADMIN') {
        throw new Error("Vous n'êtes pas autorisé à demander cette restitution.");
    }

    const deposit = await prisma.cDCDeposit.update({
        where: { leaseId },
        data: {
            status: CDCDepositStatus.RETURN_REQUESTED,
            amount: amountToReturn, // Updated to what should be returned
            updatedAt: new Date()
        }
    });

    await logAction({
        action: "REQUEST_CDC_RESTITUTION",
        module: "CDC_DEPOSIT",
        entityId: deposit.id,
        newValues: { amountToReturn, deductionsReason }
    });

    revalidatePath(`/dashboard/leases/${leaseId}`);
    return { success: true };
}

/**
 * Part 11.7: Confirm/Validate CDC Restitution (Final Agent Step)
 */
export async function confirmCDCRestitution(leaseId: string) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'CDC_AGENT') {
        throw new Error("Action réservée aux agents CDC.");
    }

    const deposit = await prisma.cDCDeposit.update({
        where: { leaseId },
        data: {
            status: CDCDepositStatus.RETURNED,
            returnedAt: new Date()
        }
    });

    await logAction({
        action: "CONFIRM_CDC_RESTITUTION",
        module: "CDC_DEPOSIT",
        entityId: deposit.id,
        newValues: { status: "RETURNED" }
    });

    revalidatePath(`/dashboard/leases/${leaseId}`);
    return { success: true };
}
