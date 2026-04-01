"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

/**
 * Gets the AgenceProfile for the current authenticated user.
 */
export async function getAgencyProfile() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { error: "Non autorisé." }
        }

        const profile = await prisma.agenceProfile.findUnique({
            where: { userId: session.user.id }
        })

        return { data: profile }
    } catch (error: any) {
        console.error("Erreur getAgencyProfile:", error)
        return { error: "Impossible de récupérer le profil de l'agence." }
    }
}

/**
 * Creates or updates the AgenceProfile for the current user.
 */
export async function upsertAgencyProfile(data: {
    nomAgence: string
    rccm: string
    dfe: string
    numEnregistrement?: string
    adresseLocal?: string
}) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { error: "Non autorisé." }
        }

        // Optional validation
        if (!data.nomAgence || !data.rccm || !data.dfe) {
            return { error: "Nom de l'agence, RCCM et DFE sont obligatoires." }
        }

        const profile = await prisma.agenceProfile.upsert({
            where: { userId: session.user.id },
            update: {
                nomAgence: data.nomAgence,
                rccm: data.rccm,
                dfe: data.dfe,
                numEnregistrement: data.numEnregistrement || null,
                adresseLocal: data.adresseLocal || null,
            },
            create: {
                userId: session.user.id,
                nomAgence: data.nomAgence,
                rccm: data.rccm,
                dfe: data.dfe,
                numEnregistrement: data.numEnregistrement || null,
                adresseLocal: data.adresseLocal || null,
            }
        })

        return { success: true, data: profile }
    } catch (error: any) {
        console.error("Erreur upsertAgencyProfile:", error)
        return { error: "Une erreur est survenue lors de l'enregistrement du profil de l'agence." }
    }
}
