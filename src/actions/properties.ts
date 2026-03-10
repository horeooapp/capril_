"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { generatePropertyCode } from "@/lib/property"
import { revalidatePath } from "next/cache"
import { serializeLease } from "@/lib/serialize"

/**
 * Part 5: List Owner Properties
 */
export async function getProperties() {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        throw new Error("Unauthorized")
    }

    const properties = await prisma.property.findMany({
        where: { ownerUserId: session.user.id },
        include: {
            leases: {
                include: {
                    tenant: { select: { fullName: true, phone: true } }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return properties.map(p => ({
        ...p,
        declaredRentFcfa: p.declaredRentFcfa?.toString() || "0",
        leases: p.leases.map(serializeLease)
    }))
}

/**
 * Part 5: Register Property
 */
export async function registerProperty(data: {
    leaseType: 'residential' | 'commercial',
    address: string,
    commune: string,
    declaredRentFcfa: number,
    propertyType: string,
    rooms?: number,
    areaSqm?: number
}) {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        return { error: "Non autorisé" }
    }

    try {
        const propertyCode = await generatePropertyCode(data.leaseType)

        const property = await prisma.property.create({
            data: {
                propertyCode,
                leaseType: data.leaseType,
                ownerUserId: session.user.id,
                address: data.address,
                commune: data.commune,
                declaredRentFcfa: data.declaredRentFcfa,
                propertyType: data.propertyType,
                rooms: data.rooms,
                areaSqm: data.areaSqm,
                status: 'active'
            }
        })

        revalidatePath("/dashboard")
        revalidatePath("/dashboard/properties")
        
        return { success: true, propertyCode: property.propertyCode }
    } catch (error) {
        console.error("[SERVER ACTION] Error registering property:", error)
        return { error: "Impossible d'enregistrer la propriété." }
    }
}

/**
 * Part 5: Get Property Details
 */
export async function getPropertyById(id: string) {
    const property = await prisma.property.findUnique({
        where: { id },
        include: {
            leases: {
                include: {
                    tenant: {
                        select: { fullName: true, phone: true }
                    }
                }
            }
        }
    })

    if (!property) return null

    return {
        ...property,
        declaredRentFcfa: property.declaredRentFcfa?.toString() || "0"
    }
}

/**
 * Part 6.3: Get Property Passport (Digital Identity)
 */
export async function getPropertyPassport(id: string) {
    const property = await prisma.property.findUnique({
        where: { id },
        include: {
            leases: {
                include: {
                    tenant: {
                        select: { fullName: true, email: true }
                    }
                },
                orderBy: { startDate: 'desc' }
            }
        }
    })

    if (!property) return null

    // Transform for UI (Passport page expects specific names)
    return {
        ...property,
        type: property.propertyType,
        surface: property.areaSqm,
        leases: property.leases.map(lease => ({
            ...lease,
            tenant: lease.tenant ? {
                name: lease.tenant.fullName || lease.tenant.email || "Inconnu",
                email: lease.tenant.email
            } : { name: "Inconnu", email: null },
            incidents: [] // Stub for now
        }))
    }
}
