"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getDemoMode } from "./demo-actions"
import { getDemoData } from "@/lib/demo-data"

export async function getGlobalActivityStats() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
        throw new Error("Unauthorized")
    }

    if (await getDemoMode()) {
        const demo = getDemoData()
        return {
            totalUsers: demo.totalUsers,
            totalProperties: demo.totalProperties,
            totalLeases: demo.totalLeases,
            totalMandates: demo.totalMandates || 42,
            activeColocs: demo.activeColocs || 18,
            landLeases: demo.landLeases || 7,
            marketTrend: "+5.4%"
        }
    }

    let u = 0, p = 0, l = 0, m = 0, c = 0, t = 0;

    try {
        const counts = await Promise.all([
            prisma.user.count().catch(() => 0),
            prisma.property.count().catch(() => 0),
            prisma.lease.count().catch(() => 0),
            prisma.mandate.count({ where: { status: "ACTIVE" } }).catch(() => 0),
            prisma.colocataire.count({ where: { status: "ACTIF" } }).catch(() => 0),
            prisma.landLeaseInfo.count().catch(() => 0)
        ]);
        [u, p, l, m, c, t] = counts;
    } catch (e) {
        console.error("Database sync error in Observatory:", e);
    }

    return {
        totalUsers: u,
        totalProperties: p,
        totalLeases: l,
        totalMandates: m,
        activeColocs: c,
        landLeases: t,
        marketTrend: "+2.1%"
    }
}

export async function getMarketInsights() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
        throw new Error("Unauthorized")
    }

    // Get latest snapshots for the most active communes
    try {
        return await prisma.observatorySnapshot.findMany({
            distinct: ['commune'],
            orderBy: {
                createdAt: 'desc'
            },
            take: 12
        })
    } catch (e) {
        console.error("Observatory Snapshot missing:", e);
        return [];
    }
}

export async function getLiveEventStream() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
        throw new Error("Unauthorized")
    }

    if (await getDemoMode()) {
        return getDemoData().recentAuditLogs
    }

    return await prisma.auditLog.findMany({
        include: {
            user: { select: { fullName: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 15
    }).catch(() => [])
}

export async function getCommunalStats() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
        throw new Error("Unauthorized")
    }

    // Agrégation par commune : Nombre de baux et Loyer moyen
    // Note: Prisma ne permet pas directement groupby sur une relation lointaine facilement avec aggregations complexes
    // On va faire une requête brute ou récupérer et traiter (pour la démo, on traite en JS)
    
    const properties = await prisma.property.findMany({
        select: {
            commune: true,
            leases: {
                select: {
                    rentAmount: true,
                    status: true
                }
            }
        }
    });

    const statsMap: Record<string, { count: number, totalRent: number }> = {};

    properties.forEach(p => {
        if (!p.commune) return;
        if (!statsMap[p.commune]) statsMap[p.commune] = { count: 0, totalRent: 0 };
        
        const activeLeases = p.leases.filter(l => l.status === "ACTIVE" || l.status === "ACTIVE_DECLARATIF");
        statsMap[p.commune].count += activeLeases.length;
        statsMap[p.commune].totalRent += activeLeases.reduce((acc, l) => acc + Number(l.rentAmount), 0);
    });

    return Object.entries(statsMap).map(([name, data]) => ({
        name,
        leaseCount: data.count,
        avgRent: data.count > 0 ? Math.round(data.totalRent / data.count) : 0,
        trend: Math.random() > 0.5 ? "up" : "down" // Simulated trend
    })).sort((a, b) => b.leaseCount - a.leaseCount);
}
