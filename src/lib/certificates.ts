import { prisma } from "./prisma";
import { randomBytes } from "node:crypto";
import { generateQRToken } from "./financial-utils";

const db = prisma as any; // Bypass stale generated client until next `prisma generate`

/**
 * Part 14.1: Generate CNL Reference
 * Format: CNL-{YYYY}-{MM}-{SEQUENCE}-{USER_PART}
 */
export async function generateCNLRef(userId: string): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    
    const count = await db.certificate.count({
        where: {
            certType: 'CNL',
            issuedAt: {
                gte: new Date(`${year}-01-01`),
                lt: new Date(`${year + 1}-01-01`)
            }
        }
    });

    const sequence = (count + 1).toString().padStart(5, '0');
    const userPart = userId.substring(0, 4).toUpperCase();
    return `CNL-${year}-${month}-${sequence}-${userPart}`;
}

/**
 * Part 14.2: Issue Digital Tenant Certificate (CNL)
 */
export async function issueCNL(userId: string) {
    const latestScore = await db.reliabilityScore.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });

    if (!latestScore) {
        throw new Error("Aucun score de fiabilité disponible. Veuillez rafraîchir votre score.");
    }

    // Eligibility check (Grade C or higher)
    const eligibleGrades = ['A', 'B', 'C'];
    if (!eligibleGrades.includes(latestScore.grade)) {
        throw new Error(`Votre grade actuel (${latestScore.grade}) est insuffisant pour obtenir un CNL. Grade C minimum requis.`);
    }

    // Check for existing valid certificate
    const existingCert = await db.certificate.findFirst({
        where: {
            userId,
            certType: 'CNL',
            status: 'valid',
            expiresAt: { gt: new Date() }
        }
    });

    if (existingCert) return existingCert;

    const qrToken = generateQRToken();
    const certRef = await generateCNLRef(userId);
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 6); // 6 months validity

    return await db.certificate.create({
        data: {
            userId,
            certType: 'CNL',
            expiresAt,
            qrToken,
            status: 'valid'
            // In a real app, we would also generate the PDF and set the reference
        }
    });
}
