"use server"

import { PrismaClient, LeaseStatus } from "@prisma/client"
import { auth } from "@/auth"

const prisma = new PrismaClient()

export async function createLease(data: {
    propertyId: string,
    tenantEmail: string,
    tenantName: string,
    startDate: Date,
    rentAmount: number,
    charges?: number,
    deposit?: number
}) {
    const session = await auth()

    // @ts-ignore
    const landlordId = session?.user?.id

    if (!landlordId) {
        throw new Error("Unauthorized")
    }

    // Verify property ownership
    const property = await prisma.property.findUnique({
        where: { id: data.propertyId }
    })

    if (!property || (property.ownerId !== landlordId && property.managerId !== landlordId)) {
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
    return await prisma.lease.create({
        data: {
            propertyId: data.propertyId,
            tenantId: tenant.id,
            startDate: data.startDate,
            rentAmount: data.rentAmount,
            charges: data.charges || 0,
            deposit: data.deposit,
            status: LeaseStatus.ACTIVE
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
