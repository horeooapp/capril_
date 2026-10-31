import { verifyCronAuth } from "@/lib/security";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RetentionService } from "@/lib/retention-service";
import { RiskAnalysisService } from "@/lib/risk-analysis-service";
import { NotificationService } from "@/lib/notification-service";

/**
 * [P5.E2] PROACTIVE ANALYTICS ALERTS
 * Daily scan of the portfolio to detect and notify critical risks.
 */
export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        // 1. CHURN RISK ANALYSIS (Retention)
        // Scans all active leases and identifies top risks
        const churnRisks = await RetentionService.getChurnRisks(100); // Analyze top 100 risks

        let churnAlertsCount = 0;
        for (const risk of churnRisks) {
            if (risk.probability >= 70) {
                const lease = await prisma.lease.findUnique({
                    where: { id: risk.leaseId },
                    include: { property: true }
                });
                
                if (lease) {
                    await NotificationService.envoyerNotification(lease.landlordId, "ALERTE_CHURN_CRITIQUE", {
                        payload: {
                            address: lease.property.address,
                            probability: risk.probability,
                            reason: risk.riskFactor
                        }
                    });
                    churnAlertsCount++;
                }
            }
        }

        // 2. PREDICTIVE ARREARS ANALYSIS
        // Analyzes all active tenants and filters for high/critical risks
        const highRisks = await RiskAnalysisService.getHighRiskTenants(100);

        let riskAlertsCount = 0;
        for (const risk of highRisks) {
            // Note: getHighRiskTenants already filters for ELEVE/CRITIQUE
            const currentLease = await prisma.lease.findFirst({ 
                where: { tenantId: risk.tenantId, status: "ACTIVE" } 
            });
            
            if (currentLease) {
                const tenant = await prisma.user.findUnique({ where: { id: risk.tenantId } });
                if (tenant) {
                    await NotificationService.envoyerNotification(currentLease.landlordId, "ALERTE_RISQUE_IMPAYE", {
                        payload: {
                            tenantName: `${tenant.firstName} ${tenant.lastName}`,
                            riskScore: risk.score,
                            riskLevel: risk.riskLevel
                        }
                    });
                    riskAlertsCount++;
                }
            }
        }

        return NextResponse.json({ 
            success: true, 
            summary: {
                churnAlertsSent: churnAlertsCount,
                riskAlertsSent: riskAlertsCount
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
