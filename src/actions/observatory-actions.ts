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
            (prisma as any).mandate ? (prisma as any).mandate.count({ where: { status: "ACTIVE" } }).catch(() => 0) : Promise.resolve(0),
            (prisma as any).colocataire ? (prisma as any).colocataire.count({ where: { status: "ACTIF" } }).catch(() => 0) : Promise.resolve(0),
            (prisma as any).landLeaseInfo ? (prisma as any).landLeaseInfo.count().catch(() => 0) : Promise.resolve(0)
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
