"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { generateQRToken } from "@/lib/financial-utils"

/**
 * QAPRIL - Module M-SCORE-CERT
 * Certification des bons locataires.
 */

export async function generateScoreCertificate(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                fullName: true,
                fraudScore: true,
                activePlanTier: true
            }
        })

        if (!user) return { success: false, error: "Utilisateur non trouvé." }

        // Uniquement pour les scores < 20 (Excellent payeur)
        if (user.fraudScore >= 20) {
            return { success: false, error: "Score insuffisant pour une certification." }
        }

        // Simuler la création d'un document de certification (PDF placeholder)
        const certId = `CERT-${userId.slice(0, 8).toUpperCase()}-${Date.now()}`
        const qrToken = generateQRToken()

        // On pourrait stocker cela dans une table `Certificate` dédiée
        // Pour l'instant on logue l'action
        console.log(`CERTIFICATE_GENERATED: ${certId} for ${user.fullName}`)

        return { 
            success: true, 
            certId,
            qrToken,
            issuedAt: new Date()
        }
    } catch (error) {
        return { success: false, error: "Erreur lors de la génération du certificat." }
    }
}
