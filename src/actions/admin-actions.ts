"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Role } from "@prisma/client"
import { getDemoMode } from "@/actions/demo-actions"
import { getDemoData } from "@/lib/demo-data"
import { writeAuditLog } from "@/lib/audit"

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
    try {
        await ensureAdmin()
        
        if (await getDemoMode()) {
            return getDemoData().users
        }
        
        const users = await prisma.user.findMany({
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

        // Ensure serialization and data safety
        return users.map(user => ({
            ...user,
            createdAt: user.createdAt.toISOString()
        }))
    } catch (error) {
        console.error("[getAllUsers] Critical Error:", error)
        return [] // Return empty list to prevent page crash
    }
}

/**
 * Récupère les demandes de validation (Agences non certifiées)
 */
export async function getPendingValidations() {
    try {
        await ensureAdmin()
        
        if (await getDemoMode()) {
            return getDemoData().pendingValidations
        }
        
        const users = await prisma.user.findMany({
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

        return users.map(user => ({
            ...user,
            createdAt: user.createdAt.toISOString()
        }))
    } catch (error) {
        console.error("[getPendingValidations] Critical Error:", error)
        return []
    }
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
    try {
        await ensureAdmin()
        return (await prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100,
            include: {
                user: {
                    select: { fullName: true, email: true }
                }
            }
        })).map(log => ({
            ...log,
            createdAt: log.createdAt.toISOString()
        }))
    } catch (error) {
        console.error("[getGlobalAuditLogs] Critical Error:", error)
        return []
    }
}

/**
 * Création d'un utilisateur par l'admin
 */
export async function createUserByAdmin(data: { phone: string, email: string, fullName: string, role: Role, password?: string }) {
    await ensureAdmin()
    
    try {
        const existing = await prisma.user.findUnique({ where: { phone: data.phone } })
        if (existing) return { error: "Un utilisateur avec ce numéro de téléphone existe déjà." }
        
        // Hash password if provided, otherwise leave null (can be set later)
        let hashedPassword = undefined
        if (data.password) {
            const { hash } = await import("bcrypt-ts")
            hashedPassword = await hash(data.password, 10)
        }

        const { password, ...userData } = data;

        await prisma.user.create({
            data: {
                ...userData,
                password: hashedPassword,
                status: 'active',
                isCertified: true,
                kycLevel: 4,
                kycStatus: 'verified'
            }
        })
        
        revalidatePath("/admin/users")
        return { success: true }
    } catch (error) {
        console.error("[ACTION] createUserByAdmin error:", error)
        return { error: error instanceof Error ? error.message : "Erreur lors de la création de l'utilisateur." }
    }
}

/**
 * Met à jour le mot de passe d'un administrateur
 */
export async function updateAdminPassword(userId: string, newPassword: string) {
    try {
        const session = await auth()
        if (!session || !session.user) {
            throw new Error("Non authentifié")
        }
        const requesterId = session.user.id
        const requesterRole = session.user.role

        // 1. Authorization: Only SUPER_ADMIN can change others' passwords. 
        // ADMIN can change their own (though usually they do it via Profile page)
        if (requesterRole !== Role.SUPER_ADMIN && requesterId !== userId) {
            throw new Error("Vous n'avez pas l'autorisation de modifier ce mot de passe.");
        }

        if (newPassword.length < 8) {
            throw new Error("Le mot de passe doit faire au moins 8 caractères.")
        }

        // 2. Standardize rounds to 10 (consistency and performance)
        const { hash } = await import("bcrypt-ts")
        const hashedPassword = await hash(newPassword, 10)

        const targetUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true }
        })

        if (!targetUser) {
            throw new Error("Utilisateur cible introuvable.")
        }

        const adminRoles: Role[] = [Role.ADMIN, Role.SUPER_ADMIN]
        if (!adminRoles.includes(targetUser.role)) {
            throw new Error("Cette action est réservée aux comptes administratifs.")
        }

        // 3. Update
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        })

        // 4. Audit Log
        await writeAuditLog({
            userId: requesterId,
            action: "ADMIN_PASSWORD_UPDATED",
            module: "ADMIN",
            newValues: { targetUserId: userId }
        })

        return { success: true }
    } catch (error) {
        console.error("[ACTION] updateAdminPassword error:", error)
        return { error: error instanceof Error ? error.message : "Une erreur est survenue lors de la mise à jour du mot de passe." }
    }
}
