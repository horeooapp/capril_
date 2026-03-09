"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateProfile(data: { fullName?: string, email?: string, role?: string }) {
    const session = await auth()

    if (!session || !session.user || !session.user.id) {
        return { error: "Non autorisé" }
    }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                ...data,
                status: 'ACTIVE' 
            } as any
        })

        revalidatePath("/dashboard")
        revalidatePath("/locataire")
        
        return { success: true }
    } catch (error) {
        console.error("[SERVER ACTION] Error updating user profile:", error)
        return { error: "Impossible de mettre à jour le profil. Veuillez réessayer." }
    }
}
