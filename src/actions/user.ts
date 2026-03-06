"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Role } from "@prisma/client"

export async function updateUserRole(role: Role) {
    const session = await auth()

    if (!session || !session.user || !session.user.id) {
        return { error: "Non autorisé" }
    }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: { role }
        })

        revalidatePath("/dashboard")
        revalidatePath("/locataire")
        
        return { success: true }
    } catch (error) {
        console.error("[SERVER ACTION] Error updating user role:", error)
        return { error: "Impossible de mettre à jour le profil. Veuillez réessayer." }
    }
}
