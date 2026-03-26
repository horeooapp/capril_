"use server"

import { prisma } from "@/lib/prisma"
import { Role, LeaseStatus } from "@prisma/client"

/**
 * Fetch the most recent market snapshots for public display
 */
export async function getGlobalMarketStats(limit = 6) {
    try {
        return await prisma.observatorySnapshot.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    } catch (error) {
        console.error("Error fetching market stats:", error);
        return [];
    }
}

/**
 * Admin: Get global activity statistics for the dashboard
 */
export async function getGlobalActivityStats() {
    try {
        const [users, properties, leases, mandates] = await Promise.all([
            prisma.user.count(),
            prisma.property.count(),
            prisma.lease.count({ where: { status: 'ACTIVE' } }),
            prisma.mandate.count({ where: { status: 'ACTIVE' } })
        ]);

        return {
            totalUsers: users,
            totalProperties: properties,
            totalLeases: leases,
            totalMandates: mandates,
            activeColocs: 0, // Placeholder or implement if schema allows
            landLeases: 0,   // Placeholder
            marketTrend: "+4.2%" // Dynamic trend or placeholder
        };
    } catch (error) {
        return { totalUsers: 0, totalProperties: 0, totalLeases: 0, totalMandates: 0, activeColocs: 0, landLeases: 0, marketTrend: "Stable" };
    }
}

/**
 * Admin: Get market insights (top communes by rent)
 */
export async function getMarketInsights() {
    try {
        const snapshots = await prisma.observatorySnapshot.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5
        });
        return snapshots.map(s => ({
            commune: s.commune,
            avgRent: s.avgRent,
            sampleCount: s.sampleCount
        }));
    } catch (error) {
        return [];
    }
}

/**
 * Admin: Get live event stream (recent audit logs or notifications)
 */
export async function getLiveEventStream() {
    try {
        const logs = await prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: { user: { select: { fullName: true } } }
        });
        return logs.map(l => ({
            id: l.id,
            action: l.action,
            user: l.user?.fullName || "Système",
            createdAt: l.createdAt
        }));
    } catch (error) {
        return [];
    }
}

/**
 * Admin: Get detailed communal stats
 */
export async function getCommunalStats() {
    try {
        const snapshots = await prisma.observatorySnapshot.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        return snapshots.map(s => ({
            name: s.commune,
            leaseCount: s.sampleCount,
            avgRent: s.avgRent,
            trend: s.trendPct >= 0 ? "up" : "down"
        }));
    } catch (error) {
        return [];
    }
}
