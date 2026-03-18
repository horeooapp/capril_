"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { TerrainUsage, Periodicite } from "@prisma/client"
import { logAction } from "./audit"

export async function createLandLease(data: {
    leaseId: string,
    superficieLouee: number,
    usage: TerrainUsage,
    periodicity: Periodicite,
    eventEndDate?: Date,
    annualIndexation?: number,
    conditions?: string
}) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    // Check if property is of type supporting land leases (optional but recommended)
    // Here we just create the info record
    const landInfo = await prisma.landLeaseInfo.create({
        data: {
            leaseId: data.leaseId,
            superficieLouee: data.superficieLouee,
            usage: data.usage,
            periodicity: data.periodicity,
            eventEndDate: data.eventEndDate,
            annualIndexation: data.annualIndexation || 0,
            conditions: data.conditions,
        }
    })

    await logAction({
        action: "CREATE_LAND_LEASE_INFO",
        module: "TERRAIN",
        entityId: landInfo.id,
        newValues: data
    })

    return landInfo
}

export async function updateLandLeaseInventory(leaseId: string, type: 'entry' | 'exit', status: boolean) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const updateData = type === 'entry' 
        ? { hasEntryInventory: status } 
        : { hasExitInventory: status }

    const updated = await prisma.landLeaseInfo.update({
        where: { leaseId },
        data: updateData
    })

    await logAction({
        action: "UPDATE_LAND_LEASE_INVENTORY",
        module: "TERRAIN",
        entityId: updated.id,
        newValues: updateData
    })

    return updated
}

export async function getLandLeaseDetails(leaseId: string) {
    return await prisma.landLeaseInfo.findUnique({
        where: { leaseId },
        include: { 
            lease: { 
                include: { 
                    property: true,
                    landlord: { select: { fullName: true } },
                    tenant: { select: { fullName: true } }
                } 
            } 
        }
    })
}
