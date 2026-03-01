"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { InsuranceStatus } from "@prisma/client"
import { logAction } from "./audit"

/**
 * Activates insurance for a lease.
 * Checks for lease compliance before activation.
 */
export async function activateInsurance(leaseId: string, provider: string) {
    const session = await auth()
    if (!session?.user) throw new Error("Non authentifié")

    const lease = await prisma.lease.findUnique({
        where: { id: leaseId },
        include: { property: true }
    })

    if (!lease) throw new Error("Bail introuvable")

    // Optimization: Ensure lease is ACTIVE and has valid financials (simplified check)
    if (lease.status !== "ACTIVE") {
        throw new Error("L'assurance ne peut être activée que sur un bail actif.")
    }

    const insurance = await prisma.insurance.create({
        data: {
            leaseId,
            provider,
            status: "ACTIVE",
            policyNo: `QINS-${lease.id.substring(0, 8).toUpperCase()}`
        }
    })

    await logAction({
        action: "ACTIVATE_INSURANCE",
        entityType: "INSURANCE",
        entityId: insurance.id,
        details: { leaseId, provider, policyNo: insurance.policyNo }
    })

    return insurance
}

/**
 * Reports a claim (impayé) for an insured lease.
 */
export async function reportInsuranceClaim(insuranceId: string, amount: number, reason: string) {
    const session = await auth()
    if (!session?.user) throw new Error("Non authentifié")

    const insurance = await prisma.insurance.findUnique({
        where: { id: insuranceId },
        include: { lease: true }
    })

    if (!insurance || insurance.status !== "ACTIVE") {
        throw new Error("Assurance inactive ou introuvable")
    }

    const claim = await prisma.insuranceClaim.create({
        data: {
            insuranceId,
            amount,
            reason,
            status: "OPEN"
        }
    })

    await logAction({
        action: "REPORT_INSURANCE_CLAIM",
        entityType: "INSURANCE_CLAIM",
        entityId: claim.id,
        details: { insuranceId, amount, reason }
    })

    return claim
}

export async function getInsuranceByLease(leaseId: string) {
    return await prisma.insurance.findUnique({
        where: { leaseId },
        include: { claims: true }
    })
}
