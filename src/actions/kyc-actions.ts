"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Role } from "@prisma/client"

/**
 * Part 5.3: Manual Verification by ANAH/CDC Agent
 * Upgrades user to KYC Level 3 upon successful verification.
 */
export async function verifyUserIdentity(
    userId: string, 
    documentId: string, 
    action: 'verify' | 'reject', 
    rejectionReason?: string
) {
    const session = await auth()
    
    // Security: Only Admin or ANAH/CDC Agents can verify identities
    const authorizedRoles: Role[] = [Role.SUPER_ADMIN, Role.ADMIN, Role.ANAH_AGENT, Role.CDC_AGENT]
    if (!session || !session.user || !authorizedRoles.includes(session.user.role as Role)) {
        throw new Error("Accès non autorisé : Droits de vérification requis.")
    }

    try {
        const isVerified = action === 'verify'

        await prisma.$transaction([
            // 1. Update the Identity Document
            prisma.identityDocument.update({
                where: { id: documentId },
                data: {
                    status: isVerified ? 'verified' : 'rejected',
                    rejectionReason: isVerified ? null : rejectionReason,
                    verifiedAt: isVerified ? new Date() : null,
                    verifiedByUserId: session.user.id
                }
            }),

            // 2. Update the User Status & Level
            prisma.user.update({
                where: { id: userId },
                data: {
                    // Level 3 is "Verified Identity" in v3.0
                    kycLevel: isVerified ? 3 : 2, 
                    kycStatus: isVerified ? 'verified' : 'rejected'
                }
            })
        ])

        revalidatePath("/admin/validation")
        revalidatePath(`/admin/users/${userId}`)
        
        return { 
            success: true, 
            message: isVerified ? "Identité validée avec succès (KYC Level 3)." : "Document rejeté." 
        }

    } catch (error) {
        console.error("Erreur action KYC:", error)
        return { error: "Une erreur est survenue lors de la validation." }
    }
}
