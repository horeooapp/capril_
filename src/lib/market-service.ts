import { prisma } from "./prisma";

export interface BenchmarkResult {
  propertyId: string;
  propertyName: string;
  currentRent: number;
  marketAvg: number;
  marketMedian: number;
  gapPct: number; // Percent difference
  recommendation: "AUGMENTER" | "DIMINUER" | "MAINTENIR";
  potentialGain?: number;
  confidence: "HAUTE" | "MOYENNE" | "BASSE";
}

export class MarketService {
  /**
   * [P4.1] Benchmarks a property against the latest Observatory data.
   */
  static async getPropertyBenchmark(propertyId: string): Promise<BenchmarkResult> {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        leases: {
          where: { status: "ACTIVE" },
          take: 1
        }
      }
    });

    if (!property) throw new Error("Propriété introuvable");

    const currentRent = property.leases[0]?.rentAmount || 0;
    
    // Find latest snapshot for this commune and property type
    const snapshot = await prisma.observatorySnapshot.findFirst({
      where: {
        commune: { equals: property.commune, mode: 'insensitive' },
        propertyType: property.propertyType
      },
      orderBy: { period: 'desc' }
    });

    if (!snapshot) {
      // Fallback to general market data if no specific snapshot
      const marketData = await prisma.marketData.findFirst({
        where: {
          commune: { equals: property.commune, mode: 'insensitive' },
          propertyType: property.propertyType
        }
      });

      if (!marketData) {
        return {
          propertyId,
          propertyName: property.name || property.propertyCode,
          currentRent,
          marketAvg: 0,
          marketMedian: 0,
          gapPct: 0,
          recommendation: "MAINTENIR",
          confidence: "BASSE"
        };
      }

      return this.calculateBenchmark(property, currentRent, marketData.averageRent, marketData.averageRent, marketData.sampleSize);
    }

    return this.calculateBenchmark(property, currentRent, snapshot.avgRent, snapshot.medianRent, snapshot.sampleCount);
  }

  private static calculateBenchmark(
    property: any,
    current: number,
    avg: number,
    median: number,
    sample: number
  ): BenchmarkResult {
    const gap = ((avg - current) / current) * 100;
    
    let recommendation: "AUGMENTER" | "DIMINUER" | "MAINTENIR" = "MAINTENIR";
    if (gap > 10) recommendation = "AUGMENTER";
    else if (gap < -10) recommendation = "DIMINUER";

    const potentialGain = gap > 0 ? (avg - current) : 0;
    const confidence = sample > 50 ? "HAUTE" : sample > 10 ? "MOYENNE" : "BASSE";

    return {
      propertyId: property.id,
      propertyName: property.name || property.propertyCode,
      currentRent: current,
      marketAvg: Math.round(avg),
      marketMedian: Math.round(median),
      gapPct: Math.round(gap),
      recommendation,
      potentialGain: Math.round(potentialGain),
      confidence
    };
  }

  /**
   * [P4.1] Get optimization opportunities for a whole portfolio.
   */
  static async getPortfolioOpportunities(ownerId: string) {
    const properties = await prisma.property.findMany({
      where: { ownerUserId: ownerId }
    });

    const benchmarks = await Promise.all(
        properties.map(p => this.getPropertyBenchmark(p.id))
    );

    return benchmarks.filter(b => b.recommendation === "AUGMENTER");
  }
}
