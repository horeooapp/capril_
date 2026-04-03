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
        const totalBlacklisted = await prisma.fraudBlacklist.count();
        const pendingVerification = await prisma.identityDocument.count({ where: { status: "pending" } });
        
        const avgFraudScore = await prisma.userFraudProfile.aggregate({
            _avg: { fraudScore: true }
        });

        // 2. Profils Suspects (Top 5 par fraudScore)
        const suspiciousProfiles = await prisma.userFraudProfile.findMany({
            where: { fraudScore: { gt: 0 } },
            orderBy: { fraudScore: 'desc' },
            take: 5,
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true, lastName: true
                    }
                }
            }
        });

        // 3. Journal de Surveillance (Audit Logs récents de type KYC/AUTH)
        const surveillanceLogs = await prisma.auditLog.findMany({
            where: {
                module: { in: ["KYC", "AUTH", "FRAUD"] }
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { user: { select: { firstName: true, lastName: true } } }
        });

        return {
            success: true,
            stats: {
                avgScore: Math.round(avgFraudScore._avg?.fraudScore || 0),
                certified: totalCertified,
                blacklisted: totalBlacklisted,
                alerts: pendingVerification,
            },
            suspiciousProfiles: (suspiciousProfiles || []).map((fp) => ({
                name: (fp.user.firstName ? fp.user.firstName + " " : "") + (fp.user.lastName || "") || "Utilisateur Inconnu",
                score: (fp.fraudScore || 0),
                reason: (fp.fraudFlags as any)?.reason || "Score de risque élevé"
            })),
            logs: (surveillanceLogs || []).map((l) => ({
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
