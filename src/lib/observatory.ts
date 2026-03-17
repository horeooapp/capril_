/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "./prisma";
import { Decimal } from "@prisma/client/runtime/library";

/**
 * Part 17.1: Compute Communal Rent Statistics
 * Triggered when a new lease is signed. Aggregates current period data.
 */
export async function computeCommunalStats(commune: string, propertyType: string) {
    const now = new Date();
    const quarter = Math.ceil((now.getMonth() + 1) / 3);
    const period = `${now.getFullYear()}-Q${quarter}`;

    // Fetch all active leases with their property data
    const activeLeases = await prisma.lease.findMany({
        where: { status: "ACTIVE" },
        include: {
            property: true
        }
    });

    // Filter by commune and property type in JS (avoids nested Prisma filter complexity)
    const filtered = activeLeases.filter(
        l => l.property?.commune === commune && l.property?.propertyType === propertyType
    );

    if (filtered.length < 3) {
        return null; // Not enough data — avoid statistical bias
    }

    const amounts = filtered.map(l => l.rentAmount).sort((a, b) => a - b);
    const count = amounts.length;
    const minRent = amounts[0];
    const maxRent = amounts[count - 1];
    const avgRent = Math.round(amounts.reduce((s, v) => s + v, 0) / count);

    // Median
    const mid = Math.floor(count / 2);
    const medianRent = count % 2 === 0
        ? Math.round((amounts[mid - 1] + amounts[mid]) / 2)
        : amounts[mid];

    // Trend: compare to previous period snapshot
    const previousPeriod = await prisma.observatorySnapshot.findFirst({
        where: { commune, propertyType },
        orderBy: { createdAt: 'desc' }
    });

    const trendPct = previousPeriod
        ? parseFloat(((avgRent - previousPeriod.avgRent) / previousPeriod.avgRent * 100).toFixed(2))
        : 0;

    return await prisma.observatorySnapshot.create({
        data: {
            commune,
            propertyType,
            period,
            avgRent,
            medianRent,
            minRent,
            maxRent,
            sampleCount: count,
            trendPct: new Decimal(trendPct)
        }
    });
}

/**
 * Part 17.2: Get Market Report for a Commune
 */
export async function getCommuneMarketReport(commune: string) {
    return await prisma.observatorySnapshot.findMany({
        where: { commune },
        orderBy: { createdAt: 'desc' },
        take: 10
    });
}
