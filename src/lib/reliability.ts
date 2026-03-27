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

    // 1. KYC Granular (+50 pts max) - REG-2026-001
    const kycDocs = await prisma.identityDocument.findMany({
        where: { userId, status: 'verified' }
    });

    let kycBonus = 0;
    if (kycDocs.some(d => d.docType === 'CNI_CI' || d.docType === 'PASS_CI')) kycBonus += 20;
    if (user.kycStatus === 'verified' && user.kycLevel >= 2) kycBonus += 15; // Assumption: level 2 implies photo verified
    // For more precision, we'd check specific metadata or fields.
    // Let's stick to the rule as closely as possible with existing fields.
    if (kycDocs.some(d => d.docType === 'JUSTIF_DOMICILE')) kycBonus += 10;
    if (user.phone) kycBonus += 5; // Phone presence implies OTP verified at registration

    score += Math.min(50, kycBonus);
    breakdown.kycBonus = kycBonus;

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
            // Penalty if OPEN > 144h OR already CLOSED automatically (REG-2026-001)
            return (['OUVERT', 'VU', 'EN_COURS'].includes(r.statut) && hours > 144) || (r.statut === 'FERME_AUTO');
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
