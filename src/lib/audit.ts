import { prisma } from "./prisma";
import { headers } from "next/headers";
import { chainAuditHash } from "./proof";

export type AuditModule =
    | 'AUTH' | 'KYC' | 'LEASE' | 'PAYMENT' | 'RECEIPT'
    | 'CDC' | 'DISPUTE' | 'CERTIFICATE' | 'MANDATE' | 'ADMIN' | 'SYSTEM' | 'M17_FISCAL' | 'M16_ANAH'
    // Privacy by Design — module dédié aux opérations sur données personnelles
    | 'PRIVACY' | 'CONSENT' | 'DATA_RETENTION' | 'ANONYMIZATION';

export type AuditActionInput = {
    userId?: string;
    action: string;
    module: string;
    entityId?: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
};

/**
 * Part 23.1: Write an audit log entry
 * Call from any server action for security-critical operations.
 */
export async function writeAuditLog(input: AuditActionInput): Promise<void> {
    try {
        const { auth } = await import("@/auth");
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

        const proofHash = await chainAuditHash(lastLog?.proofHash || null, {
            userId: userId,
            action: input.action,
            module: input.module,
            entityId: input.entityId,
            details: input.newValues
        });

/**
 * Privacy by Design — Champs PII à masquer dans les audit logs.
 * Ces valeurs ne doivent jamais apparaître en clair dans les logs.
 */
const PII_FIELDS_TO_MASK = [
    'password', 'phone', 'email', 'docNumber', 'mrzRawData',
    'bankAccount', 'taxId', 'companyRegNumber', 'otp', 'token',
    'refreshToken', 'accessToken', 'pushToken', 'salary',
];

/**
 * Masque les valeurs PII sensibles dans les données auditées.
 * Remplace les valeurs par '***MASKED***' pour protéger les données personnelles.
 */
function maskPiiFields(data?: Record<string, any>): Record<string, any> | undefined {
    if (!data) return data;
    const masked = { ...data };
    for (const field of PII_FIELDS_TO_MASK) {
        if (field in masked && masked[field] !== null && masked[field] !== undefined) {
            masked[field] = '***MASKED***';
        }
    }
    return masked;
}

        await prisma.auditLog.create({
            data: {
                userId: userId ?? null,
                action: input.action,
                module: input.module,
                entityId: input.entityId ?? null,
                // Privacy by Design : masquer les PII dans les logs d'audit
                oldValues: maskPiiFields(input.oldValues) ?? undefined,
                newValues: maskPiiFields(input.newValues) ?? undefined,
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
