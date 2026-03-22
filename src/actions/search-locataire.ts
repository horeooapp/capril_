"use server"

import { prisma } from "@/lib/prisma"

/**
 * M-CAND-AGENCE & INV-01 : Moteur de matching et recherche
 */

// INV-01 : Recherche par numéro (Propriétaire)
export async function findLocataireByPhone(phone: string) {
    try {
        const user = await (prisma.user as any).findUnique({
            where: { phone },
            include: {
                profilPublic: true
            }
        })

        if (!user || !(user as any).profilPublic || (user as any).profilPublic.visibilite === 'INVISIBLE') {
            return null
        }

        // Retourner uniquement les données autorisées
        const profil = (user as any).profilPublic
        return {
            id: user.id,
            fullName: user.fullName || "Utilisateur QAPRIL",
            kycLevel: user.kycLevel,
            kycStatus: user.kycStatus,
            visibilite: profil.visibilite,
            statutPro: profil.statutPro,
            revenuFourchette: profil.revenuFourchette,
            communesSouhaitees: (profil.communesSouhaitees as string[]) || [],
            scoreBadge: 'A' // TODO: Récupérer via calculateScore
        }
    } catch (error) {
        console.error("Error finding locataire by phone:", error)
        return null
    }
}

// CAND-01 : Recherche par critères (Agences Pro+)
export async function searchLocataires(filters: {
    communes?: string[],
    budgetMax?: number,
    typeLogement?: string[],
    statutPro?: string,
    kycNiveauMin?: number
}) {
    try {
        // TODO: Vérifier le rôle de l'utilisateur appelant (doit être AGENCY + PlanTier PRO/PREMIUM)
        
        const where: any = {
            visibilite: { in: ['TOUS', 'INVITATION_AGENCE'] },
            statutRecherche: 'EN_RECHERCHE'
        }

        if (filters.communes && filters.communes.length > 0) {
            // SQLite doesn't support hasSome on Json. Fallback for local dev.
            where.communesSouhaitees = { not: null } 
        }

        if (filters.budgetMax) {
            where.budgetMaxFcfa = { lte: filters.budgetMax }
        }

        if (filters.typeLogement && filters.typeLogement.length > 0) {
            // SQLite doesn't support hasSome on Json. Fallback for local dev.
            where.typeLogement = { not: null }
        }

        if (filters.statutPro) {
            where.statutPro = filters.statutPro
        }

        if (filters.kycNiveauMin) {
            where.kycNiveau = { gte: filters.kycNiveauMin }
        }

        const results = await (prisma as any).locataireProfilPublic.findMany({
            where,
            include: {
                user: {
                    select: {
                        fullName: true,
                        kycLevel: true
                    }
                }
            },
            take: 50
        })

        // Anonymisation partielle pour l'agence (Ibrahim K. au lieu de Ibrahim Koné)
        return results.map((profil: any) => {
            const nameParts = profil.user.fullName?.split(' ') || []
            const anonymizedName = nameParts.length > 1 
                ? `${nameParts[0]} ${nameParts[1].charAt(0)}.` 
                : profil.user.fullName || "Locataire"
                
            return {
                id: profil.userId,
                anonymizedName,
                kycNiveau: profil.kycNiveau,
                statutPro: profil.statutPro,
                communes: (profil.communesSouhaitees as string[]) || [],
                budget: profil.budgetMaxFcfa,
                nbConsultations: profil.nbConsultationsProfil
            }
        })
    } catch (error) {
        console.error("Error in locataire search:", error)
        throw new Error("Erreur lors de la recherche")
    }
}
