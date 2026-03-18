"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function getOwnerConsolidatedDashboard() {
    const session = await auth()
    const ownerId = session?.user?.id

    if (!ownerId) throw new Error("Unauthorized")

    // Get all properties owned or managed by owner (if owner is agency)
    // According to specification: Dashboard unique for portfolio
    const properties = await prisma.property.findMany({
        where: { ownerUserId: ownerId },
        include: {
            mandates: {
                where: { status: "ACTIVE" },
                include: { agent: { select: { fullName: true } } }
            },
            leases: {
                where: { status: "ACTIVE" },
                include: {
                    receipts: {
                        orderBy: { createdAt: 'desc' },
                        take: 5
                    },
                    synthesesLoyer: {
                        orderBy: { month: 'desc' },
                        take: 1
                    }
                }
            }
        }
    })

    // Aggregations
    const totalProperties = properties.length
    const totalUnits = properties.reduce((acc, p) => acc + (p.rooms || 0), 0)
    
    // Revenue and arrears calculations (placeholder for business logic)
    // In a real app, this would involve complex quittance and synthesis aggregation
    
    return {
        properties,
        stats: {
            totalProperties,
            totalUnits,
            // ... more stats as per section 5.1
        }
    }
}

export async function getMandateHistoryByProperty(propertyId: string) {
    return await prisma.mandateHistory.findMany({
        where: { propertyId },
        include: { mandate: true },
        orderBy: { startDate: 'desc' }
    })
}
