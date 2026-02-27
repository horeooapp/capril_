"use server"

import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth"

const prisma = new PrismaClient()

export async function getCurrentUser() {
    const session = await auth()

    if (!session?.user?.email) {
        return null
    }

    const user = await prisma.user.findUnique({
        where: {
            email: session.user.email
        }
    })

    return user
}

export async function getUserProfile(userId: string) {
    return await prisma.user.findUnique({
        where: { id: userId },
        include: {
            propertiesOwned: true,
            propertiesManaged: true,
        }
    })
}

export async function updateUserProfile(userId: string, data: { name?: string, phone?: string }) {
    const session = await auth()

    // Basic authorization: user can only update themselves
    // @ts-ignore
    if (!session?.user || session.user.id !== userId) {
        throw new Error("Unauthorized")
    }

    return await prisma.user.update({
        where: { id: userId },
        data
    })
}
