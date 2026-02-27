"use server"

import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth"

const prisma = new PrismaClient()

export async function getProperties() {
    const session = await auth()

    // @ts-ignore
    const userId = session?.user?.id

    if (!userId) {
        throw new Error("Unauthorized")
    }

    // Fetch properties owned or managed by the user
    return await prisma.property.findMany({
        where: {
            OR: [
                { ownerId: userId },
                { managerId: userId }
            ]
        },
        include: {
            leases: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
}

export async function createProperty(data: { name?: string, address: string, city: string, postalCode?: string, country?: string }) {
    const session = await auth()

    // @ts-ignore
    const ownerId = session?.user?.id

    if (!ownerId) {
        throw new Error("Unauthorized")
    }

    return await prisma.property.create({
        data: {
            ...data,
            ownerId
        }
    })
}

export async function getPropertyById(id: string) {
    return await prisma.property.findUnique({
        where: { id },
        include: {
            leases: {
                include: {
                    tenant: {
                        select: { id: true, name: true, email: true, phone: true }
                    }
                }
            }
        }
    })
}
