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
                        firstName: true, lastName: true,
                        phone: true,
                        kycLevel: true
                    }
                }
            }
        })

        if (profil) {
            // Arrays are natively supported in Postgres. Ensure they are arrays.
            if (!Array.isArray(profil.communesSouhaitees)) profil.communesSouhaitees = [];
            if (!Array.isArray(profil.typeLogement)) profil.typeLogement = [];
        }

        return profil
    } catch (error) {
        console.error("Error fetching public profile:", error)
        throw new Error("Erreur lors de la récupération du profil")
    }
}

export async function upsertPublicProfile(userId: string, data: any) {
    try {
        // Postgres natively supports String[]
        const profilDataToSave = {
            ...data,
            communesSouhaitees: Array.isArray(data.communesSouhaitees) ? data.communesSouhaitees : [],
            typeLogement: Array.isArray(data.typeLogement) ? data.typeLogement : []
        }

        const profil = await (prisma as any).locataireProfilPublic.upsert({
            where: { userId },
            create: {
                userId,
                ...profilDataToSave
            },
            update: {
                ...profilDataToSave
            }
        })
        revalidatePath("/mon-espace-locataire/profil-public")
        return profil
    } catch (error) {
        console.error("Error upserting public profile:", error)
        throw new Error("Erreur lors de la mise à jour du profil")
    }
}

export async function updateProfilVisibilite(userId: string, visibilite: any) {
    try {
        const profil = await (prisma as any).locataireProfilPublic.upsert({
            where: { userId },
            create: {
                userId,
                visibilite
            },
            update: { visibilite }
        })
        revalidatePath("/mon-espace-locataire/profil-public")
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
    console.log(`[ONBOARDING] Initiating for user: ${userId}`);
    
    try {
        if (!userId) {
            console.error("[ONBOARDING] Missing userId");
            return { success: false, error: "Utilisateur non identifié" }
        }

        // Préparer ProfilData pour PostgreSQL
        const profilDataToSave: any = {
            ...data.profilData,
            communesSouhaitees: Array.isArray(data.profilData?.communesSouhaitees) ? data.profilData.communesSouhaitees : [],
            typeLogement: Array.isArray(data.profilData?.typeLogement) ? data.profilData.typeLogement : []
        }
        
        // Supprimer explicitement city s'il est présent pour éviter les erreurs de client non-mis à jour
        delete profilDataToSave.city;

        // 1. Mettre à jour l'utilisateur (onboardingComplete + infos de base)
        const updateData: any = { onboardingComplete: true }
        if (data.firstName) updateData.firstName = data.firstName;
        if (data.lastName) updateData.lastName = data.lastName;
        if (data.email) updateData.email = data.email
        
        console.log(`[ONBOARDING] Updating user...`);
        await prisma.user.update({
            where: { id: userId },
            data: updateData
        })

        if ((prisma as any).locataireProfilPublic) {
            console.log(`[ONBOARDING] Upserting public profile...`);
            await (prisma as any).locataireProfilPublic.upsert({
                where: { userId },
                create: {
                    userId,
                    ...profilDataToSave
                },
                update: {
                    ...profilDataToSave
                }
            })
        }

        console.log(`[ONBOARDING] Action complete, success:true`);
        
        revalidatePath("/mon-espace-locataire")
        revalidatePath("/onboarding/tenant")
        
        return { success: true }
    } catch (error: any) {
        console.error("Error completing onboarding:", error)
        return { 
            success: false, 
            error: error.message || "Erreur lors de la finalisation" 
        }
    }
}
