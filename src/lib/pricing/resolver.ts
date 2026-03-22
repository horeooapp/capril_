import { prisma } from "@/lib/prisma"

/**
 * MOTEUR DE RESOLUTION TARIFAIRE - ADD-12
 * Règle de priorité:
 * 1. Tarif Négocié (Account override)
 * 2. Code Promo Actif sur le compte ou souscription
 * 3. Offre d'Abonnement (Forfait)
 * 4. Grille Tarifaire Globale (Cas par défaut)
 */

export async function resolveQuittancePrice(userId: string): Promise<number> {
    const today = new Date()

    // PRIORITE 1 : Tarif Négocié pour la quittance
    const negocie = await (prisma as any).tarifNegocie.findFirst({
        where: {
            userId,
            type: "QUITTANCE_DEROGATOIRE",
            dateDebut: { lte: today },
            OR: [
                { dateFin: null },
                { dateFin: { gte: today } }
            ]
        },
        orderBy: { createdAt: 'desc' }
    })

    if (negocie) {
        return Number(negocie.prixNegocieTtc)
    }

    // PRIORITE 2 : Offre Abonnement (Vérifier le volume inclus)
    // Ici nous simulons la vérification de l'abonnement actif de l'utilisateur
    // Dans ADD-07, l'utilisateur a un "activePlanTier", mais dans ADD-12 on peut 
    // lier une OffreAbonnement spécifique ou la déduire du tier.
    
    // Pour simplifier l'exemple, nous cherchons si le user a une offre liée (implémentation future 
    // ou via un lien user -> offre). Si l'agence a épuisé son forfait, on utilise prixUniteTtc.
    // Supposons une méthode getUserActiveSubscription(userId) qui renverrait l'offre.
    const activeSub = await getUserActiveSubscription(userId)
    
    if (activeSub && activeSub.offre) {
        const usageCeMois = await countQuittancesUsage(userId, today.getMonth(), today.getFullYear())
        
        if (activeSub.offre.quittancesInclus === 0 || usageCeMois < activeSub.offre.quittancesInclus) {
            return 0 // Inclus dans le forfait
        } else {
            return Number(activeSub.offre.prixUniteTtc) // Dépassement de forfait
        }
    }

    // PRIORITE 3 & 4 : Code Promo ou Grille Globale
    // Si pas d'offre, c'est le tarif standard ou un code promo global
    const configTarif = await (prisma as any).configTarif.findUnique({
        where: { cle: "quittance_ttc" }
    })

    const basePrice = configTarif ? Number(configTarif.valeur) : 75 // 75 FCFA par défaut

    return basePrice
}

/**
 * Helpers pour la résolution tarifaire
 */
async function getUserActiveSubscription(userId: string): Promise<any> {
    // A implémenter : lier le User à une OffreAbonnement active via Subscription
    // Pour l'instant on retourne null.
    return null
}

async function countQuittancesUsage(userId: string, month: number, year: number) {
    // Calculer le nombre de SMS/WA envoyés ce mois-ci par ce user
    return 0
}

/**
 * Validation d'un code promo (Endpoint TAR-15)
 */
export async function validateCodePromo(code: string, userId?: string) {
    const today = new Date()
    const cleanCode = code.toUpperCase().trim()

    const promo = await (prisma as any).codePromo.findUnique({
        where: { code: cleanCode }
    })

    if (!promo || !promo.actif) {
        return { valid: false, message: "Code promo invalide ou inactif." }
    }

    if (promo.dateDebut > today) {
        return { valid: false, message: "Ce code promo n'est pas encore actif." }
    }

    if (promo.dateFin && promo.dateFin < today) {
        return { valid: false, message: "Ce code promo a expiré." }
    }

    if (promo.maxUtilisations && promo.nbUtilisations >= promo.maxUtilisations) {
        return { valid: false, message: "Ce code promo a atteint sa limite d'utilisation." }
    }

    // Profil target validation
    if (userId && promo.cibleProfil !== "TOUS") {
        const user = await prisma.user.findUnique({ where: { id: userId }})
        if (user && promo.cibleProfil === "AGENCE" && user.role !== "AGENCY" && user.role !== "NON_CERTIFIED_AGENT") {
            return { valid: false, message: "Ce code est réservé aux agences." }
        }
    }

    return { 
        valid: true, 
        typeRemise: promo.typeRemise, 
        valeurRemise: Number(promo.valeurRemise),
        offreCibleId: promo.offreCibleId
    }
}
