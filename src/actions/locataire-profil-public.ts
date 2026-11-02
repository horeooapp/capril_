"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { serializeObject } from "@/lib/serialize"

/**
 * M-PROFIL-LOC : Profil Locataire Autonome
 */

export async function getPublicProfile(userId: string) {
    try {
        let profil = await (prisma as any).locataireProfilPublic.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        phone: true,
                        kycLevel: true,
                        neighborhood: true,
                        email: true
                    }
                }
            }
        })

        if (!profil) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    firstName: true,
                    lastName: true,
                    phone: true,
                    kycLevel: true,
                    neighborhood: true,
                    email: true
                }
            });

            if (user) {
                profil = {
                    userId,
                    user,
                    statutRecherche: "EN_RECHERCHE",
                    statutPro: "SALARIE_CDI",
                    revenuFourchette: "250K_500K",
                    employeurType: "",
                    city: "Abidjan · Cocody",
                    communesSouhaitees: user.neighborhood ? [user.neighborhood] : ["Angré (8e Tranche, Djibi, Soleil)"],
                    budgetMaxFcfa: 250000,
                    typeLogement: ["2 Pièces (1 chambre)", "3 Pièces (2 chambres)"],
                    disponibleAPartir: null,
                    visibilite: "TOUS",
                    nbInvitationsRecues: 0,
                    nbConsultationsProfil: 0
                };
            }
        }

        if (profil) {
            if (!Array.isArray(profil.communesSouhaitees)) profil.communesSouhaitees = [];
            if (!Array.isArray(profil.typeLogement)) profil.typeLogement = [];
        }

        return serializeObject(profil)
    } catch (error) {
        console.error("Error fetching public profile:", error)
        throw new Error("Erreur lors de la récupération du profil")
    }
}

export async function upsertPublicProfile(userId: string, data: any) {
    try {
        const profilDataToSave: any = {
            statutRecherche: data.statutRecherche || "EN_RECHERCHE",
            statutPro: data.statutPro || null,
            revenuFourchette: data.revenuFourchette || null,
            employeurType: data.employeurType || null,
            city: data.city || null,
            budgetMaxFcfa: data.budgetMaxFcfa ? Math.round(Number(data.budgetMaxFcfa)) : null,
            disponibleAPartir: data.disponibleAPartir ? new Date(data.disponibleAPartir) : null,
            communesSouhaitees: Array.isArray(data.communesSouhaitees) ? data.communesSouhaitees.filter(Boolean) : [],
            typeLogement: Array.isArray(data.typeLogement) ? data.typeLogement.filter(Boolean) : []
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

        // Mettre à jour neighborhood de l'utilisateur avec la localisation principale
        const mainLoc = data.city || (data.communesSouhaitees && data.communesSouhaitees[0]);
        if (mainLoc) {
            await prisma.user.update({
                where: { id: userId },
                data: { neighborhood: mainLoc }
            }).catch(() => {});
        }

        // 🔔 NOTIFICATION AUTOMATIQUE : Vérifier les biens déjà disponibles correspondant aux critères
        try {
            const budget = data.budgetMaxFcfa ? Number(data.budgetMaxFcfa) : null;
            const searchLocation = (mainLoc || '').split('·')[0].trim();

            const matchingCount = await prisma.property.count({
                where: {
                    status: { not: "archived" },
                    ...(budget ? {
                        OR: [
                            { declaredRentFcfa: { lte: budget } },
                            { leases: { some: { rentAmount: { lte: budget } } } }
                        ]
                    } : {}),
                    ...(searchLocation ? {
                        OR: [
                            { commune: { contains: searchLocation, mode: 'insensitive' } },
                            { city: { contains: searchLocation, mode: 'insensitive' } },
                            { address: { contains: searchLocation, mode: 'insensitive' } }
                        ]
                    } : {})
                }
            });

            if (matchingCount > 0) {
                await prisma.notification.create({
                    data: {
                        userId,
                        channel: "PUSH",
                        type: "MATCHING_ALERTE",
                        title: "🏠 Biens disponibles selon vos critères !",
                        content: `${matchingCount} bien(s) à ${mainLoc || 'Abidjan'} correspondent à votre budget (${(budget || 0).toLocaleString('fr-FR')} XOF). Consultez la Marketplace pour postuler.`,
                        link: "/mon-espace-locataire/marketplace",
                        status: "sent"
                    }
                }).catch(() => {});
            } else {
                await prisma.notification.create({
                    data: {
                        userId,
                        channel: "PUSH",
                        type: "MATCHING_ALERTE",
                        title: "🔔 Alerte automatique activée",
                        content: `Vos critères pour ${mainLoc || 'votre zone'} (budget max ${(budget || 0).toLocaleString('fr-FR')} XOF) sont enregistrés. Vous recevrez une notification automatique dès qu'un bien compatible sera publié.`,
                        link: "/mon-espace-locataire/profil-public",
                        status: "sent"
                    }
                }).catch(() => {});
            }
        } catch (notifErr) {
            console.warn("[Matching Notification] Non-fatal notification error:", notifErr);
        }

        revalidatePath("/mon-espace-locataire/profil-public")
        revalidatePath("/mon-espace-locataire")
        return serializeObject(profil)
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


/**
 * Alerte automatique : Notifie tous les locataires en recherche active dès qu'un nouveau bien est publié
 */
export async function notifyMatchingTenantsForProperty(propertyData: {
    id: string;
    name?: string;
    commune?: string;
    city?: string;
    neighborhood?: string;
    rentAmount: number;
}) {
    try {
        if (!propertyData.rentAmount) return;

        // Trouver les profils locataires actifs dont le budget max est >= loyer du bien
        const activeProfiles = await (prisma as any).locataireProfilPublic.findMany({
            where: {
                statutRecherche: "EN_RECHERCHE",
                budgetMaxFcfa: { gte: propertyData.rentAmount }
            },
            include: {
                user: { select: { id: true, email: true, phone: true } }
            }
        });

        if (!activeProfiles || activeProfiles.length === 0) return;

        const propLoc = (propertyData.commune || propertyData.city || propertyData.neighborhood || '').toLowerCase();

        for (const p of activeProfiles) {
            // Vérifier correspondance géographique
            const cityMatch = !p.city || p.city.toLowerCase().includes(propLoc) || propLoc.includes(p.city.toLowerCase());
            const communeMatch = !p.communesSouhaitees || p.communesSouhaitees.length === 0 || p.communesSouhaitees.some((c: string) => {
                const cLower = c.toLowerCase();
                return propLoc.includes(cLower) || cLower.includes(propLoc);
            });

            if (cityMatch || communeMatch) {
                // Création de la notification automatique pour le locataire
                await prisma.notification.create({
                    data: {
                        userId: p.userId,
                        channel: "PUSH",
                        type: "MATCHING_ALERTE",
                        title: `🏠 Nouveau bien disponible à ${propertyData.commune || propertyData.city || 'Abidjan'} !`,
                        content: `Un logement (${propertyData.name || 'Bien vérifié'}) à ${propertyData.rentAmount.toLocaleString('fr-FR')} XOF/mois correspond exactement à vos critères. Soyez parmi les premiers à postuler !`,
                        link: "/mon-espace-locataire/marketplace",
                        status: "sent"
                    }
                }).catch(() => {});
            }
        }
    } catch (err) {
        console.error("[Matching Alert] Error notifying matching tenants:", err);
    }
}
