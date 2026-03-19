import { headers } from "next/headers";
import { prisma } from "./prisma";

export interface RiskContext {
    userId: string;
    action: "SIGNATURE" | "PAYMENT" | "MIGRATION";
    ip?: string;
    userAgent?: string;
}

export interface RiskResult {
    isSafe: boolean;
    riskScore: number; // 0-100
    reason?: string;
}

/**
 * M-GUARD: Proactive Risk Evaluation
 * Analyzes session metadata to prevent fraud.
 */
export async function evaluateTransactionRisk(context: RiskContext): Promise<RiskResult> {
    const head = await headers();
    const currentIp = context.ip || head.get("x-forwarded-for") || "127.0.0.1";
    const currentUA = context.userAgent || head.get("user-agent") || "Unknown";

    let riskScore = 0;
    const flags: string[] = [];

    // 1. Check for Headless Browsers (Basic)
    if (currentUA.includes("Headless") || currentUA.includes("Puppeteer") || currentUA.includes("Playwright")) {
        riskScore += 90;
        flags.push("BOT_DETECTED");
    }

    // 2. Check for Country Velocity (Sprint 2)
    // We'll check the last audit log for this user
    const lastLog = await (prisma as any).auditLog.findFirst({
        where: { userId: context.userId },
        orderBy: { createdAt: 'desc' },
    });

    if (lastLog && lastLog.metadata) {
        const meta = lastLog.metadata as any;
        if (meta.ip && meta.ip !== currentIp) {
            // In a real app, we would use GeoIP to compare countries.
            // Here, we simulate a risk if IP changes too fast between major actions.
            const timeDiff = (new Date().getTime() - new Date(lastLog.createdAt).getTime()) / 1000;
            if (timeDiff < 300) { // Less than 5 mins
                riskScore += 40;
                flags.push("IP_VELOCITY_HIGH");
            }
        }
    }

    // 3. Blacklist Check
    const isBlacklisted = await (prisma as any).user.findUnique({
        where: { id: context.userId },
        select: { fraudScore: true }
    });

    if (isBlacklisted && isBlacklisted.fraudScore > 80) {
        riskScore = 100;
        flags.push("USER_ALREADY_SUSPECT");
    }

    const isSafe = riskScore < 70;

    if (!isSafe) {
        console.error(`[M-GUARD] HIGH RISK DETECTED for user ${context.userId}: ${flags.join(", ")}`);
        // Log to Audit for Admin visibility
        await (prisma as any).auditLog.create({
            data: {
                userId: context.userId,
                action: "SECURITY_BLOCK",
                module: "GUARD",
                entityId: context.userId,
                details: `Blocked ${context.action} due to high risk score (${riskScore}). Flags: ${flags.join(", ")}`,
                metadata: {
                    ip: currentIp,
                    ua: currentUA,
                    riskScore,
                    flags
                }
            }
        });
    }

    return {
        isSafe,
        riskScore,
        reason: flags.length > 0 ? flags[0] : undefined
    };
}
