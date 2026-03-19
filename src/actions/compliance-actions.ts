"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getComplianceDashboard() {
    try {
        const session = await auth();
        if (session?.user?.role !== "SUPER_ADMIN" && session?.user?.role !== "ADMIN") {
            throw new Error("Accès refusé");
        }

        // 1. Statistiques Globales
        const totalCertified = await prisma.user.count({ where: { kycStatus: "verified" } });
        const totalBlacklisted = await (prisma as any).fraudBlacklist.count();
        const pendingVerification = await (prisma as any).identityDocument.count({ where: { status: "pending" } });
        
        const avgFraudScore = await (prisma as any).user.aggregate({
            _avg: { fraudScore: true }
        });

        // 2. Profils Suspects (Top 5 par fraudScore)
        const suspiciousProfiles = await (prisma as any).user.findMany({
            where: { fraudScore: { gt: 0 } },
            orderBy: { fraudScore: 'desc' },
            take: 5,
            select: {
                id: true,
                fullName: true,
                fraudScore: true,
                fraudFlags: true
            }
        });

        // 3. Journal de Surveillance (Audit Logs récents de type KYC/AUTH)
        const surveillanceLogs = await (prisma as any).auditLog.findMany({
            where: {
                module: { in: ["KYC", "AUTH", "FRAUD"] }
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { user: { select: { fullName: true } } }
        });

        return {
            success: true,
            stats: {
                avgScore: Math.round(avgFraudScore._avg?.fraudScore || 0),
                certified: totalCertified,
                blacklisted: totalBlacklisted,
                alerts: pendingVerification,
            },
            suspiciousProfiles: (suspiciousProfiles || []).map((u: any) => ({
                name: u.fullName || "Utilisateur Inconnu",
                score: u.fraudScore,
                reason: (u.fraudFlags as any)?.reason || "Score de risque élevé"
            })),
            logs: (surveillanceLogs || []).map((l: any) => ({
                time: new Date(l.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                msg: l.action,
                type: l.module === 'FRAUD' ? 'alert' : 'info'
            }))
        };
    } catch (error: any) {
        console.error("[Compliance Action] Error:", error);
        return { success: false, error: error.message };
    }
}
