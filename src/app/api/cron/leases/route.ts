import { verifyCronAuth } from "@/lib/security";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * CRON : Auto-Expiration des Baux non signés (5 jours)
 * Une mesure demandée pour libérer le patrimoine foncier si le processus traîne.
 */
export async function GET(req: Request) {
    if (!verifyCronAuth(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

        // Trouver et Archiver les baux qui n'ont pas été signés dans les 5 jours
        const expiredLeases = await prisma.lease.findMany({
            where: {
                status: { in: ["DRAFT", "PENDING_SIGNATURE", "PENDING_CONFIRMATION"] },
                createdAt: { lt: fiveDaysAgo },
                signedAt: null
            },
            select: { id: true, propertyId: true }
        });

        if (expiredLeases.length === 0) {
            return NextResponse.json({ success: true, message: "Aucun bail à expirer." });
        }

        const leaseIds = expiredLeases.map(l => l.id);

        const result = await prisma.lease.updateMany({
            where: { id: { in: leaseIds } },
            data: {
                status: "ARCHIVED",
                terminationReason: "EXPIRATION_AUTO_5J"
            }
        });

        console.log(`[CRON-AUTO-EXP] ${result.count} baux expirés et archivés.`);

        return NextResponse.json({
            success: true,
            expiredCount: result.count,
            leaseIds,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error("[CRON] Lease Cleanup Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
