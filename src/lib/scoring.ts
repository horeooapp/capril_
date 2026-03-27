 
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
    let score = 0;
    let punctuality = 0;
    let stability = 0;
    let kyc = 0;

    // 1. Ponctualité (60% = 600 pts max)
    const bails = await prisma.lease.findMany({
        where: { tenantId: userId, status: { in: ['ACTIVE', 'ACTIVE_DECLARATIF'] } }
    });
    
    const bailIds = bails.map((b: any) => b.id);
    const quittances = await prisma.receipt.findMany({
        where: { leaseId: { in: bailIds } },
        orderBy: { periodMonth: 'desc' },
        take: 12
    });

    if (quittances.length > 0) {
        const payesATemps = quittances.filter(q => q.status === 'paid').length;
        punctuality = Math.round((payesATemps / quittances.length) * 600);
    } else {
        // Nouveau locataire : Base ponctualité neutre (Silver start candidate)
        punctuality = 500; 
    }

    // 2. Stabilité (20% = 200 pts max)
    if (bails.length > 0) {
        const now = new Date().getTime();
        let totalMonths = 0;
        for (const bail of bails) {
            const start = new Date(bail.startDate).getTime();
            totalMonths += Math.floor((now - start) / (1000 * 60 * 60 * 24 * 30));
        }
        
        if (totalMonths >= 24) stability = 200;
        else if (totalMonths >= 12) stability = 100;
        else if (totalMonths >= 6) stability = 50;
        else stability = 25;
    }

    // 3. Conformité KYC (20% = 200 pts max)
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { identityDocuments: true }
    });

    if (user) {
        const hasVerifiedID = user.identityDocuments.some(d => d.status === 'verified');
        if (hasVerifiedID) kyc += 100;

        if (user.kycLevel >= 2 || user.kycStatus === 'verified') {
            kyc += 100;
        }
    }

    score = Math.min(1000, punctuality + stability + kyc);

    return {
        score,
        badge: getScoreBadge(score),
        breakdown: { punctuality, stability, kyc },
        tauxPaiement12m: quittances.length > 0 
            ? Math.round((quittances.filter(q => q.status === 'paid').length / quittances.length) * 100) 
            : 100
    };
}

export function getScoreBadge(score: number): 'A+' | 'A' | 'B' | 'C' | 'D' {
    if (score >= 850) return 'A+' // Gold
    if (score >= 750) return 'A'  // Silver
    if (score >= 650) return 'B'  // Bronze
    if (score >= 500) return 'C'  // Standard
    return 'D'                   // Risqué
}

