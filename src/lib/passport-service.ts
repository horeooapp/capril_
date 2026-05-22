import { prisma } from "./prisma";
import { calculateUserScore } from "./scoring";
import { generateProofHash } from "./proof";

export class PasseportService {
  /**
   * Récupère ou génère un nouveau snapshot du passeport locatif.
   */
  static async getOrCreatePassport(userId: string, forceRefresh = false) {
    // 1. Check if a valid passport exists (less than 30 days old)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const existing = await prisma.passeportLocatif.findFirst({
      where: { 
        locataireId: userId,
        createdAt: { gte: thirtyDaysAgo }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (existing && !forceRefresh) {
      return existing;
    }

    // 2. Calculate current score
    const scoreResult = await calculateUserScore(userId);

    // 3. Prepare summary data for the snapshot
    const activeLeases = await prisma.lease.findMany({
        where: { tenantId: userId, status: 'ACTIVE' },
        include: { property: true }
    });

    const snapshotBails = activeLeases.map(l => ({
        ref: l.leaseReference,
        property: l.property.name || l.property.propertyCode,
        startDate: l.startDate,
        rent: l.rentAmount
    }));

    // 4. Reference and Hash
    const count = await prisma.passeportLocatif.count();
    const refPasseport = `PAS-${new Date().getFullYear()}-${(count + 1).toString().padStart(5, '0')}`;
    
    const passportHash = await generateProofHash({
        refPasseport,
        userId,
        score: scoreResult.score,
        date: new Date().toISOString()
    });

    // 5. Create Record
    const passport = await prisma.passeportLocatif.create({
      data: {
        locataireId: userId,
        refPasseport,
        scoreGlobal: scoreResult.score,
        tauxPaiementGlobal: scoreResult.tauxPaiement12m,
        nbBailsInclus: activeLeases.length,
        periodeCouverteDebut: thirtyDaysAgo, // Approximation or based on first lease
        periodeCouverteFin: new Date(),
        snapshotBails: snapshotBails as any,
        hashSha256: passportHash,
      }
    });

    return passport;
  }

  /**
   * Statistiques de fiabilité pour l'affichage propriétaire
   */
  static async getTenantReliabilitySummary(userId: string) {
    const scoreResult = await calculateUserScore(userId);
    const passport = await this.getOrCreatePassport(userId);

    return {
        score: scoreResult.score ?? 500,
        badge: scoreResult.badge ?? 'C',
        tauxPaiement: scoreResult.tauxPaiement12m ?? 100,
        refPasseport: passport.refPasseport,
        lastUpdated: passport.createdAt
    };
  }
}
