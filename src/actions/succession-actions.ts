"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { logAction } from "./audit"

export async function getSuccessions() {
    const session = await auth()
    if (!session?.user?.id) return []

    try {
        const data = await prisma.succession.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return data
    } catch {
        return []
    }
}

export async function createSuccession(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non autorisé" }

    const deceasedName = formData.get("deceasedName") as string
    const claimantName = formData.get("claimantName") as string
    const relation = formData.get("relation") as string
    const propertyInfo = formData.get("propertyInfo") as string
    const notaire = formData.get("notaire") as string

    if (!deceasedName || !claimantName || !relation || !propertyInfo) {
        return { error: "Veuillez remplir toutes les informations obligatoires." }
    }

    try {
        await prisma.succession.create({
            data: {
                deceasedName,
                claimantName,
                relation,
                propertyInfo,
                notaire,
                status: "TRANSFERT_LEGAL"
            }
        })

        await logAction({
            action: "CREATE_SUCCESSION_DOSSIER",
            module: "SUCCESSION",
            entityId: session.user.id
        })

        revalidatePath("/dashboard/succession")
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: "Erreur technique lors de la création du dossier." }
    }
}
