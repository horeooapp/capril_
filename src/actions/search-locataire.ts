"use server"

import { prisma } from "@/lib/prisma"

/**
 * M-CAND-AGENCE & INV-01 : Moteur de matching et recherche
 */

// INV-01 : Recherche par numéro (Propriétaire)
export async function findLocataireByPhone(phone: string) {
    try {
        const cleanPhone = phone.trim();
        const rawDigits = phone.replace(/\D/g, '');
        
        const variations = [cleanPhone];
        
        if (rawDigits.length === 10) {
            variations.push(`+225 ${rawDigits.slice(0,2)} ${rawDigits.slice(2,4)} ${rawDigits.slice(4,6)} ${rawDigits.slice(6,8)} ${rawDigits.slice(8,10)}`);
            variations.push(`+225${rawDigits}`);
            variations.push(rawDigits);
        } else if (rawDigits.length === 13 && rawDigits.startsWith('225')) {
            const num = rawDigits.slice(3);
            variations.push(`+225 ${num.slice(0,2)} ${num.slice(2,4)} ${num.slice(4,6)} ${num.slice(6,8)} ${num.slice(8,10)}`);
            variations.push(`+225${num}`);
            variations.push(num);
            variations.push(`0${num}`); // often domestic representation
        }

        const user = await (prisma.user as any).findFirst({
            where: {
                role: 'TENANT',
                phone: {
                    in: variations
                }
            },
            include: {
                profilPublic: true
            }
        })

        if (!user) {
            return null
        }

        // Si le profil public n'existe pas encore, on crée un profil vide fictif par défaut pour permettre l'invitation
        const profil = (user as any).profilPublic || {
            visibilite: 'TOUS',
            statutPro: 'NON_REIGNE',
            revenuFourchette: 0,
            communesSouhaitees: []
        };

        if (profil.visibilite === 'INVISIBLE') {
            return null
        }

        // Retourner uniquement les données autorisées
        return {
            id: user.id,
            fullName: (user.firstName ? user.firstName + " " : "") + (user.lastName || "") || "Locataire QAPRIL",
            kycLevel: user.kycLevel || 0,
            kycStatus: user.kycStatus || 'UNVERIFIED',
            visibilite: profil.visibilite,
            statutPro: profil.statutPro,
            revenuFourchette: profil.revenuFourchette,
            communesSouhaitees: (profil.communesSouhaitees as string[]) || [],
            scoreBadge: 'B' // Par défaut si aucun calcul
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
                        firstName: true, lastName: true,
                        kycLevel: true
                    }
                }
            },
            take: 50
        })

        // Anonymisation partielle pour l'agence (Ibrahim K. au lieu de Ibrahim Koné)
        return results.map((profil: any) => {
            const nameParts = (profil.user.firstName ? profil.user.firstName + " " : "") + (profil.user.lastName || "")?.split(' ') || []
            const anonymizedName = nameParts.length > 1 
                ? `${nameParts[0]} ${nameParts[1].charAt(0)}.` 
                : (profil.user.firstName ? profil.user.firstName + " " : "") + (profil.user.lastName || "") || "Locataire"
                
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
