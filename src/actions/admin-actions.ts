"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Role } from "@prisma/client"
import { getDemoMode } from "@/actions/demo-actions"
import { getDemoData } from "@/lib/demo-data"

/**
 * Sécurité : Vérifie si l'utilisateur actuel est un administrateur (Simple ou Super)
 */
async function ensureAdmin() {
    const session = await auth()
    if (!session || (session.user?.role !== Role.ADMIN && session.user?.role !== Role.SUPER_ADMIN)) {
        throw new Error("Accès non autorisé : Droits administrateur requis.")
    }
}

/**
 * Sécurité : Vérifie si l'utilisateur actuel est un SUPER_ADMIN
 */
async function ensureSuperAdmin() {
    const session = await auth()
    if (!session || session.user?.role !== Role.SUPER_ADMIN) {
        throw new Error("Accès non autorisé : Droits Super Administrateur requis.")
    }
}

/**
 * Récupère tous les utilisateurs pour l'administration
 */
export async function getAllUsers() {
    await ensureAdmin()
    
    if (await getDemoMode()) {
        return getDemoData().users
    }
    
    return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            kycLevel: true,
            kycStatus: true,
            status: true,
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
    
    if (await getDemoMode()) {
        return getDemoData().pendingValidations
    }
    
    return await prisma.user.findMany({
        where: {
            OR: [
                { role: Role.AGENCY },
                { role: Role.NON_CERTIFIED_AGENT }
            ],
            kycLevel: { lt: 4 } // Level 4 is for verified legal entities/agencies
        },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            legalEntity: {
                select: {
                    companyName: true
                }
            },
            createdAt: true,
            kycStatus: true
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
                kycLevel: 4,
                kycStatus: "verified",
                role: Role.AGENCY
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
 * Approuve un document d'identité (KYC)
 */
export async function approveDocument(docId: string) {
    await ensureAdmin()
    const session = await auth()
    
    try {
        await prisma.identityDocument.update({
            where: { id: docId },
            data: {
                status: "verified",
                verifiedAt: new Date(),
                verifiedByUserId: session?.user?.id
            }
        })
        revalidatePath("/admin")
        revalidatePath(`/admin/validation/${docId}`)
        return { success: true }
    } catch (error) {
        return { error: "Échec de l'approbation du document." }
    }
}

/**
 * Rejette un document d'identité (KYC)
 */
export async function rejectDocument(docId: string, reason: string) {
    await ensureAdmin()
    
    try {
        await prisma.identityDocument.update({
            where: { id: docId },
            data: {
                status: "rejected",
                rejectionReason: reason
            }
        })
        revalidatePath("/admin")
        revalidatePath(`/admin/validation/${docId}`)
        return { success: true }
    } catch (error) {
        return { error: "Échec du rejet du document." }
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
/**
 * Promeut un utilisateur au rôle ADMIN (Super Admin seulement)
 */
export async function toggleAdminRole(userId: string) {
    await ensureSuperAdmin()
    
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) return { error: "Utilisateur non trouvé" }
        
        const newRole = user.role === Role.ADMIN ? Role.TENANT : Role.ADMIN
        
        await prisma.user.update({
            where: { id: userId },
            data: { role: newRole }
        })
        
        revalidatePath("/admin/users")
        return { success: true, newRole }
    } catch (error) {
        return { error: "Erreur lors du changement de rôle." }
    }
}

/**
 * Récupère les logs d'audit globaux
 */
export async function getGlobalAuditLogs() {
    await ensureAdmin()
    return await prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: {
            user: {
                select: { fullName: true, email: true }
            }
        }
    })
}

/**
 * Création d'un utilisateur par l'admin
 */
export async function createUserByAdmin(data: { phone: string, email: string, fullName: string, role: Role }) {
    await ensureAdmin()
    
    try {
        const existing = await prisma.user.findUnique({ where: { phone: data.phone } })
        if (existing) return { error: "Un utilisateur avec ce numéro de téléphone existe déjà." }
        
        await prisma.user.create({
            data: {
                ...data,
                status: 'active',
                isCertified: true,
                kycLevel: 4,
                kycStatus: 'verified'
            }
        })
        
        revalidatePath("/admin/users")
        return { success: true }
    } catch (error) {
        return { error: "Erreur lors de la création de l'utilisateur." }
    }
}

/**
 * Met à jour le mot de passe d'un administrateur
 */
export async function updateAdminPassword(userId: string, newPassword: string) {
    const session = await auth()
    if (!session || !session.user) {
        throw new Error("Authentification requise")
    }

    const requesterId = session.user.id
    const requesterRole = session.user.role

    // Sécurité : Un ADMIN ne peut changer QUE son propre mot de passe.
    // Un SUPER_ADMIN peut changer le sien ou celui d'un autre ADMIN.
    if (requesterRole !== Role.SUPER_ADMIN && requesterId !== userId) {
        throw new Error("Vous n'avez pas l'autorisation de modifier ce mot de passe.")
    }

    try {
        const { hash } = await import("bcrypt-ts")
        const hashedPassword = await hash(newPassword, 12)

        const targetUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, fullName: true, email: true }
        })

        if (!targetUser) return { error: "Utilisateur non trouvé" }

        // S'assurer que la cible est bien un admin (on ne change pas les pass des tenants ici par sécurité)
        if (targetUser.role !== Role.ADMIN && targetUser.role !== Role.SUPER_ADMIN) {
            return { error: "Cette action est réservée aux comptes administratifs." }
        }

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        })

        // Log d'audit
        await prisma.auditLog.create({
            data: {
                userId: requesterId,
                action: `Modification du mot de passe de ${targetUser.fullName || targetUser.email}`,
                module: "AUTH",
                entityId: userId,
            }
        })

        return { success: true }
    } catch (error) {
        console.error("Erreur updateAdminPassword:", error)
        return { error: "Erreur lors de la mise à jour du mot de passe." }
    }
}
