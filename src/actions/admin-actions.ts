"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Role } from "@prisma/client"

/**
 * Sécurité : Vérifie si l'utilisateur actuel est un administrateur
 */
async function ensureAdmin() {
    const session = await auth()
    if (!session || session.user?.role !== Role.ADMIN) {
        throw new Error("Accès non autorisé : Droits administrateur requis.")
    }
}

/**
 * Récupère tous les utilisateurs pour l'administration
 */
export async function getAllUsers() {
    await ensureAdmin()
    return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isCertified: true,
            createdAt: true,
            phone: true
        }
    })
}

/**
 * Récupère les demandes de validation (Agences non certifiées)
 */
export async function getPendingValidations() {
    await ensureAdmin()
    return await prisma.user.findMany({
        where: {
            OR: [
                { role: Role.AGENCY },
                { role: Role.NON_CERTIFIED_AGENT }
            ],
            isCertified: false
        },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            companyName: true,
            createdAt: true
        }
    })
}

/**
 * Certifie une agence ou un agent
 */
export async function certifyAgency(userId: string) {
    await ensureAdmin()
    
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                isCertified: true,
                certificationDate: new Date(),
                role: Role.AGENCY // S'assure qu'il est bien AGENCY s'il était NON_CERTIFIED
            }
        })
        
        revalidatePath("/admin/validation")
        revalidatePath("/admin")
        
        return { success: true }
    } catch (error) {
        console.error("Erreur certification agence:", error)
        return { error: "Erreur lors de la certification." }
    }
}

/**
 * Supprime un utilisateur (Action radicale d'admin)
 */
export async function deleteUser(userId: string) {
    await ensureAdmin()
    
    try {
        await prisma.user.delete({
            where: { id: userId }
        })
        revalidatePath("/admin/users")
        return { success: true }
    } catch (error) {
        return { error: "Impossible de supprimer l'utilisateur." }
    }
}
