 
import { prisma } from "./prisma"

/**
 * Updates the ICL score of a user and logs it to ReliabilityScore table.
 */
export async function updateICLScore(userId: string, points: number, _reason: string, _relatedEntityId?: string) {
    const latest = await prisma.reliabilityScore.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });

    const currentScore = latest?.score ?? 500;
    const newScore = Math.min(1000, Math.max(300, currentScore + points));

    await prisma.reliabilityScore.create({
        data: {
            userId,
            score: newScore,
            grade: scoreToGrade(newScore),
            breakdown: {
                kycPoints: 0,
                punctualityPoints: points > 0 ? points : 0,
                completenessPoints: 0,
                digitalSignaturePoints: 0,
                incidentFreePoints: 0,
                entityPresencePoints: 0,
                reason: _reason
            }
        }
    });
}

function scoreToGrade(score: number): string {
    if (score >= 900) return 'A';
    if (score >= 750) return 'B';
    if (score >= 600) return 'C';
    if (score >= 450) return 'D';
    if (score >= 300) return 'E';
    return 'F';
}

/**
 * Handles scoring logic for rent payments based on the Premium Addendum.
 */
export async function scoreRentPayment(tenantId: string, diffDays: number, receiptId?: string) {
    if (diffDays <= 0) {
        // Anticipated payment
        await updateICLScore(tenantId, 5, "Paiement anticipé", receiptId)
    } else if (diffDays === 0) {
        // Exactly on time (handled by <= 0 logic or dedicated)
        await updateICLScore(tenantId, 2, "Paiement à temps", receiptId)
    } else if (diffDays <= 7) {
        // Late < 7 days
        await updateICLScore(tenantId, -5, "Retard inférieur à 7 jours", receiptId)
    } else if (diffDays > 30) {
        // Late > 30 days
        await updateICLScore(tenantId, -30, "Retard critique supérieur à 30 jours", receiptId)
    } else {
        // Regular late
        await updateICLScore(tenantId, -15, "Retard de paiement", receiptId)
    }
}

/**
 * Penalty for confirmed unpaid rent.
 */
export async function scoreUnpaidRent(tenantId: string, leaseId: string) {
    await updateICLScore(tenantId, -100, "Impayé confirmé", leaseId)
}

/**
 * Reward for clean security deposit restitution.
 */
export async function scoreSecurityDepositRestitution(userId: string, isFair: boolean, leaseId: string) {
    if (isFair) {
        await updateICLScore(userId, 20, "Restitution correcte de caution", leaseId)
    } else {
        await updateICLScore(userId, -50, "Litige sur restitution de caution", leaseId)
    }
}

/**
 * Updates agent reliability score based on mandate compliance.
 */
export async function scoreAgentCompliance(agentId: string, isValidated: boolean) {
    if (isValidated) {
        await updateICLScore(agentId, 10, "Mandat validé avec succès")
    } else {
        await updateICLScore(agentId, -20, "Mandat rejeté ou expiré")
    }
}

// ═══════════════════════════════════════════════════════
// ADD-13 : MOTEUR DE SCORE LOCATAIRE (M-LOC-SCORE)
// ═══════════════════════════════════════════════════════

export async function calculateUserScore(userId: string) {
    let score = 0
    let tauxPaiement12m = 0

    // 1. Récupération des baux et quittances (40% régularité + 25% absence impayés = 65%)
    const bails = await prisma.lease.findMany({
        where: { tenantId: userId, status: { in: ['ACTIVE', 'ACTIVE_DECLARATIF'] } }
    })
    
    const bailIds = bails.map((b: any) => b.id)
    const quittances = await prisma.receipt.findMany({
        where: { leaseId: { in: bailIds } },
        orderBy: { periodMonth: 'desc' },
        take: 12
    })

    if (quittances.length > 0) {
        let payesATemps = 0
        let retards = 0
        let impayes = 0

        for (const quit of quittances) {
            if (quit.status === 'paid') {
                payesATemps++
                // Chaque paiement à temps contribue à la base des 400 pts (Régularité)
                score += (400 / quittances.length)
            } else if (quit.status === 'late') {
                retards++
                score -= 20
            } else {
                impayes++
                score -= 50
            }
        }

        tauxPaiement12m = (payesATemps / quittances.length) * 100
        
        // Bonus Absence impayés (250 pts)
        if (impayes === 0) {
            score += 250
        } else {
            score -= (150 * impayes) 
        }
    } else {
        // Nouveau locataire : Base neutre (Score B de départ ~ 600)
        score += 600 
    }

    // 2. Durée du bail (20% = 200 pts)
    for (const bail of bails) {
        const months = Math.floor((new Date().getTime() - new Date(bail.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30))
        if (months >= 36) score += 200
        else if (months >= 24) score += 180
        else if (months >= 12) score += 100
        else score += (months * 8) 
    }

    // 3. Complétude KYC (10% = 100 pts)
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { identityDocuments: true }
    })
    if (user && user.identityDocuments.length > 0) {
        const hasValidDoc = user.identityDocuments.some((d: any) => d.status === 'verified')
        if (hasValidDoc) score += 100
    }

    // 4. Historique multi-bails (5% = 50 pts)
    const profile = await (prisma as any).locataireProfile.findUnique({ where: { userId }})
    if (profile && profile.nbBailsClos > 0) {
        score += 50
    }

    // Normalisation 0-1000
    score = Math.min(1000, Math.max(0, Math.round(score)))

    return {
        score,
        badge: getScoreBadge(score),
        tauxPaiement12m: Math.round(tauxPaiement12m * 10) / 10
    }
}

export function getScoreBadge(score: number): 'A+' | 'A' | 'B' | 'C' | 'D' {
    if (score >= 850) return 'A+'
    if (score >= 700) return 'A'
    if (score >= 550) return 'B'
    if (score >= 400) return 'C'
    return 'D'
}

