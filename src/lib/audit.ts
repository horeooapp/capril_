import { prisma } from "./prisma";
import { headers } from "next/headers";
import { auth } from "@/auth";

export type AuditModule =
    | 'AUTH' | 'KYC' | 'LEASE' | 'PAYMENT' | 'RECEIPT'
    | 'CDC' | 'DISPUTE' | 'CERTIFICATE' | 'MANDATE' | 'ADMIN' | 'SYSTEM' | 'M17_FISCAL' | 'M16_ANAH';

export type AuditActionInput = {
    userId?: string;
    action: string;
    module: string; // Made it string to be more flexible while keeping type safety for known ones
    entityId?: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
};

import { chainAuditHash } from "./proof";

/**
 * Part 23.1: Write an audit log entry
 * Call from any server action for security-critical operations.
 */
export async function writeAuditLog(input: AuditActionInput): Promise<void> {
    try {
        const session = await auth();
        const userId = input.userId || session?.user?.id;

        const headersList = await headers();
        const ipAddress = headersList.get("x-forwarded-for") ||
            headersList.get("x-real-ip") ||
            "unknown";
        const userAgent = headersList.get("user-agent") || "unknown";

        // Get latest log to chain the hash
        const lastLog = await prisma.auditLog.findFirst({
            orderBy: { createdAt: 'desc' }
        });

        const proofHash = chainAuditHash(lastLog?.proofHash || null, {
            userId: userId,
            action: input.action,
            module: input.module,
            entityId: input.entityId,
            details: input.newValues
        });

        await prisma.auditLog.create({
            data: {
                userId: userId ?? null,
                action: input.action,
                module: input.module,
                entityId: input.entityId ?? null,
                oldValues: input.oldValues ?? undefined,
                newValues: input.newValues ?? undefined,
                ipAddress,
                userAgent: userAgent.substring(0, 255),
                proofHash
            }
        });
    } catch (err) {
        // Never throw from audit logging — should be fire-and-forget
        console.error("[AuditLog] Failed to write audit entry:", err);
    }
}

/**
 * Part 23.2: Retrieve audit trail for a specific entity
 */
export async function getEntityAuditTrail(entityId: string, module?: AuditModule) {
    return await prisma.auditLog.findMany({
        where: {
            entityId,
            ...(module ? { module } : {})
        },
        orderBy: { createdAt: 'desc' },
        take: 50
    });
}
