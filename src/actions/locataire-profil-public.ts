"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { serializeObject } from "@/lib/serialize"

/**
 * M-PROFIL-LOC : Profil Locataire Autonome
 */

export async function getPublicProfile(userId: string) {
    try {
        const profil = await (prisma as any).locataireProfilPublic.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        fullName: true,
                        phone: true,
                        kycLevel: true
                    }
                }
            }
        })
        return profil
    } catch (error) {
        console.error("Error fetching public profile:", error)
        throw new Error("Erreur lors de la récupération du profil")
    }
}

export async function upsertPublicProfile(userId: string, data: any) {
    try {
        const profil = await (prisma as any).locataireProfilPublic.upsert({
            where: { userId },
            create: {
                userId,
                ...data
            },
            update: {
                ...data
            }
        })
        revalidatePath("/locataire/profil-public")
        return profil
    } catch (error) {
        console.error("Error upserting public profile:", error)
        throw new Error("Erreur lors de la mise à jour du profil")
    }
}

export async function updateProfilVisibilite(userId: string, visibilite: any) {
    try {
        const profil = await (prisma as any).locataireProfilPublic.update({
            where: { userId },
            data: { visibilite }
        })
        revalidatePath("/locataire/profil-public")
        return profil
    } catch (error) {
        console.error("Error updating visibility:", error)
        throw new Error("Erreur lors de la mise à jour de la visibilité")
    }
}

export async function getConsultationJournal(userId: string) {
    try {
        const profil = await (prisma as any).locataireProfilPublic.findUnique({
            where: { userId },
            select: { id: true }
        })

        if (!profil) return []

        const logs = await (prisma as any).consultationProfil.findMany({
            where: { locataireId: profil.id },
            orderBy: { createdAt: 'desc' },
            take: 20
        })
        return logs
    } catch (error) {
        console.error("Error fetching consultations:", error)
        throw new Error("Erreur lors de la récupération du journal")
    }
}

export async function logProfileConsultation(locataireId: string, consultantId: string, consultantType: 'PROPRIETAIRE' | 'AGENCE', consultantNom?: string) {
    try {
        await (prisma as any).consultationProfil.create({
            data: {
                locataireId,
                consultantId,
                consultantType,
                consultantNomAffiche: consultantNom
            }
        })
        
        // Incrémenter le compteur sur le profil
        await (prisma as any).locataireProfilPublic.update({
            where: { id: locataireId },
            data: { nbConsultationsProfil: { increment: 1 } }
        })
    } catch (error) {
        console.warn("Failed to log consultation:", error)
    }
}

export async function completeOnboarding(userId: string, data: any) {
    console.log(`[ONBOARDING] MINIMAL DEBUG START for user: ${userId}`);
    try {
        console.log(`[ONBOARDING] Returning SUCCESS without any DB write...`);
        return { success: true }
    } catch (error: any) {
        console.error("Error in completeOnboarding minimal:", error)
        return { success: false, error: error.message }
    }
}
