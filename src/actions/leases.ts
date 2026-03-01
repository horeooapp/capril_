"use server"

import { LeaseStatus } from "@prisma/client"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { validateLeaseFinancials } from "@/lib/validation"
import { logAction } from "./audit"
import { enforceAgentActive } from "@/lib/agents"
import { createEscrow } from "./escrow"

export async function createLease(data: {
    propertyId: string,
    tenantEmail: string,
    tenantName: string,
    startDate: Date,
    rentAmount: number,
    charges?: number,
    deposit?: number,
    advancePayment?: number,
    agencyFee?: number
}) {
    const session = await auth()

    // @ts-ignore
    const userId = session?.user?.id

    if (!userId) {
        throw new Error("Unauthorized")
    }

    // Enforce QAPRIL Regularization for Agents
    await enforceAgentActive()

    // 1. Financial Validation (QAPRIL Regulation)
    const validation = validateLeaseFinancials({
        rentAmount: data.rentAmount,
        deposit: data.deposit,
        advancePayment: data.advancePayment,
        agencyFee: data.agencyFee
    })

    if (!validation.isValid) {
        throw new Error(`Règlementation QAPRIL: ${validation.errors.join(" ")}`)
    }

    // Verify property ownership or management
    const property = await prisma.property.findUnique({
        where: { id: data.propertyId }
    })

    if (!property || (property.ownerId !== userId && property.managerId !== userId)) {
        throw new Error("Unauthorized to manage this property")
    }

    // Find or create tenant user account placeholder
    let tenant = await prisma.user.findUnique({
        where: { email: data.tenantEmail }
    })

    if (!tenant) {
        tenant = await prisma.user.create({
            data: {
                email: data.tenantEmail,
                name: data.tenantName,
                role: "TENANT"
            }
        })
    }

    // Create the lease
    const lease = await prisma.lease.create({
        // @ts-ignore
        data: {
            propertyId: data.propertyId,
            tenantId: tenant.id,
            startDate: data.startDate,
            rentAmount: data.rentAmount,
            charges: data.charges || 0,
            deposit: data.deposit,
            advancePayment: data.advancePayment || 0,
            agencyFee: data.agencyFee || 0,
            status: "ACTIVE"
        }
    })

    // Create Digital Escrow if deposit exists
    if (data.deposit && data.deposit > 0) {
        await createEscrow(lease.id, data.deposit)
    }

    // 2. Audit Logging
    await logAction({
        action: "CREATE_LEASE",
        entityType: "LEASE",
        entityId: lease.id,
        details: {
            rentAmount: data.rentAmount,
            tenantEmail: data.tenantEmail
        }
    })

    return lease
}

export async function getLeaseById(id: string) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    return await prisma.lease.findUnique({
        where: { id },
        // @ts-ignore
        include: {
            property: true,
            tenant: true,
            escrow: true,
            insurance: { include: { claims: true } },
            cdcDeposit: true,
            mediation: { include: { messages: true } }
        }
    })
}

export async function getLeasesByProperty(propertyId: string) {
    return await prisma.lease.findMany({
        where: { propertyId },
        include: {
            tenant: { select: { name: true, email: true, phone: true } },
            receipts: {
                orderBy: { paymentDate: 'desc' },
                take: 5 // get recent receipts
            }
        }
    })
}
