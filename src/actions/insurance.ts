"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { InsuranceStatus } from "@prisma/client"
import { logAction } from "./audit"

export async function subscribeInsurance(leaseId: string, provider: string = "NSIA Assurances") {
    const session = await auth()
    if (!session?.user) throw new Error("Non authentifié")

    return await prisma.$transaction(async (tx) => {
        const lease = await tx.lease.findUnique({
            where: { id: leaseId },
            include: { 
                property: true,
                tenant: {
                    include: { fraudProfile: true }
                }
            }
        })

        if (!lease) throw new Error("Bail introuvable")

        if (lease.status !== "ACTIVE") {
            throw new Error("L'assurance ne peut être activée que sur un bail actif.")
        }

        const existing = await tx.insurance.findUnique({ where: { leaseId } });
        if (existing) throw new Error("Ce bail est déjà assuré.");

        // Calculate Premium based on Tenant Fraud Score
        const fraudScore = lease.tenant?.fraudProfile?.fraudScore || 0;
        const annualRent = (lease.rentAmount || 0) * 12;
        
        let premiumRate = 0.02; // 2% Base
        if (fraudScore > 50) premiumRate = 0.035; // 3.5% High Risk
        
        const premiumAmount = Math.round(annualRent * premiumRate);
        const platformCommission = Math.round(premiumAmount * 0.20); // 20% platform cut
        
        // Debit Landlord Wallet
        const walletTransactions = await tx.walletTransaction.findMany({
            where: { userId: session.user.id, status: "COMPLETED" }
        });

        const balance = walletTransactions.reduce((acc: number, t: any) => {
            return t.type === "CREDIT" ? acc + t.amount : acc - t.amount;
        }, 0);

        if (balance < premiumAmount) {
            throw new Error(`Solde insuffisant. La prime annuelle est de ${premiumAmount} XOF.`);
        }

        await tx.walletTransaction.create({
            data: {
                userId: session.user.id,
                type: "DEBIT",
                amount: premiumAmount,
                status: "COMPLETED",
                motif: `Souscription Assurance Loyer Impayé (${provider}) - Bail ${leaseId}`,
                referenceId: leaseId
            }
        });

        // Create Insurance
        const insurance = await tx.insurance.create({
            data: {
                leaseId,
                provider,
                status: "ACTIVE",
                policyNo: `QINS-${lease.id.substring(0, 8).toUpperCase()}`
            }
        })

        await logAction({
            action: "SUBSCRIBE_INSURANCE",
            module: "INSURANCE",
            entityId: insurance.id,
            newValues: { leaseId, provider, premiumAmount, platformCommission }
        })

        return { success: true, insurance, premiumAmount };
    });
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
        module: "INSURANCE_CLAIM",
        entityId: claim.id,
        newValues: { insuranceId, amount, reason }
    })

    return claim
}

export async function getInsuranceByLease(leaseId: string) {
    return await prisma.insurance.findUnique({
        where: { leaseId },
        include: { claims: true }
    })
}

export async function getAllInsurances() {
    const session = await auth()
    if (!session?.user) throw new Error("Non authentifié")
    
    let targetId = session.user.id;
    const userAny = session.user as any;
    if ((session.user.role === "NON_CERTIFIED_AGENT" || session.user.role === "AGENCY") && userAny.agencyId) {
        targetId = userAny.agencyId;
    }

    const insurances = await prisma.insurance.findMany({
        where: {
            lease: {
                landlordId: targetId
            }
        },
        include: {
            claims: true,
            lease: {
                include: {
                    property: { select: { name: true, address: true } },
                    tenant: { select: { firstName: true, lastName: true } }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return { success: true, insurances };
}

export async function getLeasesWithoutInsurance() {
    const session = await auth()
    if (!session?.user) throw new Error("Non authentifié")

    const leases = await prisma.lease.findMany({
        where: {
            landlordId: session.user.id,
            status: "ACTIVE",
            insurance: null
        },
        include: {
            property: true,
            tenant: {
                include: { fraudProfile: true }
            }
        }
    });

    return { success: true, leases };
}
