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

    const [u, p, l, m, c, t] = await Promise.all([
        prisma.user.count(),
        prisma.property.count(),
        prisma.lease.count(),
        prisma.mandate.count({ where: { status: "ACTIVE" } }),
        prisma.colocataire.count({ where: { status: "ACTIF" } }),
        prisma.landLeaseInfo.count()
    ])

    return {
        totalUsers: u,
        totalProperties: p,
        totalLeases: l,
        totalMandates: m,
        activeColocs: c,
        landLeases: t,
        marketTrend: "+2.1%" // Calculation logic could be more complex
    }
}

export async function getMarketInsights() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
        throw new Error("Unauthorized")
    }

    // Get latest snapshots for the most active communes
    return await prisma.observatorySnapshot.findMany({
        distinct: ['commune'],
        orderBy: {
            createdAt: 'desc'
        },
        take: 12
    })
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
    })
}
