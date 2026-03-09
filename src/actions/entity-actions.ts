"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Role } from "@prisma/client"

export type RegisterEntityInput = {
    companyName: string
    rccmNumber: string
    nifNumber?: string
    registeredAddress?: string
    legalForm?: string
}

/**
 * Part 5.1: Level 4 KYC - Legal Entity Registration
 */
export async function registerLegalEntity(input: RegisterEntityInput) {
    const session = await auth()
    
    if (!session || !session.user || !session.user.id) {
        throw new Error("Authentification requise.")
    }

    // Check if user is at least Level 3 (Verified Identity)
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { kycLevel: true, role: true }
    })

    if (!user || user.kycLevel < 3) {
        throw new Error("L'identité individuelle doit être vérifiée (Niveau 3) avant de créer une entité.")
    }

    try {
        const entity = await prisma.legalEntity.create({
            data: {
                ...input,
                createdByUserId: session.user.id,
                status: 'pending'
            }
        })

        // Link user to entity and set role to non-certified agent or similar if needed
        // but typically user stays LANDLORD_PRO or AGENCY
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                legalEntityId: entity.id,
                kycStatus: 'under_review' // Waiting for Level 4 docs
            }
        })

        revalidatePath("/profile")
        revalidatePath("/dashboard")
        
        return { success: true, entityId: entity.id }

    } catch (error) {
        console.error("Erreur création entité:", error)
        return { error: "Erreur lors de la création de l'entité légale." }
    }
}

/**
 * Upgrades user to Level 4 (Validated Legal Entity)
 * This is usually called by an Admin after verifying RCCM/NIF
 */
export async function validateLegalEntity(entityId: string, action: 'approve' | 'reject') {
    const session = await auth()
    
    const authorizedRoles: Role[] = [Role.SUPER_ADMIN, Role.ADMIN, Role.CDC_AGENT]
    if (!session || !session.user || !authorizedRoles.includes(session.user.role as Role)) {
        throw new Error("Accès non autorisé.")
    }

    try {
        const isApproved = action === 'approve'

        await prisma.$transaction(async (tx) => {
            // 1. Update Entity
            await tx.legalEntity.update({
                where: { id: entityId },
                data: { status: isApproved ? 'active' : 'rejected' }
            })

            if (isApproved) {
                // 2. Upgrade all linked users to Level 4
                await tx.user.updateMany({
                    where: { legalEntityId: entityId },
                    data: {
                        kycLevel: 4,
                        kycStatus: "verified"
                    }
                })
            }
        })

        revalidatePath("/admin/agencies")
        return { success: true }
        
    } catch (error) {
        console.error("Erreur validation entité:", error)
        return { error: "Erreur lors de la validation de l'entité." }
    }
}
