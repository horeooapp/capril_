import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

/**
 * PHASE 1 — RÈGLE SCORE ICL (Réf. QAPRIL/AGENT-PROMPTS/2026-001)
 * 750 base | +50 KYC | +2/mois ponctuel | -10 retard | -2 bailleur (SLA)
 */
export async function calculateReliabilityScore(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            leasesAsTenant: {
                include: { receipts: { orderBy: { periodMonth: 'asc' } } }
            },
            leasesAsLandlord: {
                include: { reclamations: { where: { statut: 'OUVERT' } } }
            }
        }
    });

    if (!user) throw new Error("Utilisateur introuvable.");

    let score = 750; // Base score for all
    const breakdown: any = { base: 750 };

    // 1. KYC (+50 pts)
    if (user.kycLevel >= 2) {
        score += 50;
        breakdown.kycBonus = 50;
    }

    // 2. Locataire Rules
    if (user.role === 'TENANT') {
        const allReceipts = user.leasesAsTenant.flatMap(l => l.receipts);
        
        // Punctuality (+2 per month)
        const onTimeCount = allReceipts.filter(r => r.status === 'paid' && !r.declarative).length;
        const punctualityPoints = onTimeCount * 2;
        score += punctualityPoints;
        breakdown.punctualityPoints = punctualityPoints;

        // Retard (-10 per incident)
        const lateCount = allReceipts.filter(r => r.status === 'unpaid' || r.status === 'disputed').length;
        const penalties = lateCount * 10;
        score -= penalties;
        breakdown.latePenalties = -penalties;

        // Bonus Long Term (+20 unique after 24 months)
        if (onTimeCount >= 24) {
            score += 20;
            breakdown.longTermBonus = 20;
        }
    }

    // 3. Bailleur Rules (SLA 144h)
    if (user.role === 'LANDLORD' || user.role === 'LANDLORD_PRO' || user.role === 'AGENCY') {
        // -2 pts if RCL ticket > 144h
        const allRcl = user.leasesAsLandlord.flatMap(l => l.reclamations);
        const overSlaCount = allRcl.filter(r => {
            const hours = (Date.now() - new Date(r.createdAt).getTime()) / 3600000;
            return r.statut === 'OUVERT' && hours > 144;
        }).length;

        const slaPenalties = overSlaCount * 2;
        score -= slaPenalties;
        breakdown.slaPenalties = -slaPenalties;
    }

    // Caps
    score = Math.max(0, Math.min(1000, score));

    // Grade Mapping (A: >900, B: >800, C: >700, D: >500)
    let grade = 'F';
    if (score >= 900) grade = 'A';
    else if (score >= 800) grade = 'B';
    else if (score >= 700) grade = 'C';
    else if (score >= 500) grade = 'D';

    return await prisma.reliabilityScore.create({
        data: {
            userId,
            score,
            grade,
            breakdown: breakdown as unknown as Prisma.InputJsonValue
        }
    });
}
