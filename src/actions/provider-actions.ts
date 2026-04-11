"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { logAction } from "./audit"

export async function createProvider(data: { name: string; type: string; phone: string; email?: string; adresse?: string }) {
    const session = await auth()
    if (!session?.user) throw new Error("Non authentifié")

    const provider = await prisma.prestataire.create({
        data: {
            nom: data.name,
            specialite: data.type,
            telephone: data.phone,
            email: data.email,
            adresse: data.adresse
        }
    })

    return { success: true, provider }
}

export async function getAllProviders() {
    const session = await auth()
    if (!session?.user) throw new Error("Non authentifié")

    // Prestataires are global in the marketplace, we just return them all.
    const providers = await prisma.prestataire.findMany({
        include: {
            _count: {
                select: { tickets: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return { success: true, providers }
}
