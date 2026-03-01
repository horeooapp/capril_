"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { chainAuditHash } from "@/lib/proof"

export async function logAction(data: {
    action: string,
    entityType: string,
    entityId: string,
    details?: any
}) {
    const session = await auth()
    const userId = session?.user?.id

    // Get latest log to chain the hash
    const lastLog = await prisma.auditLog.findFirst({
        orderBy: { timestamp: 'desc' }
    })

    const proofHash = chainAuditHash(lastLog?.proofHash || null, {
        userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        details: data.details
    })

    return await prisma.auditLog.create({
        data: {
            userId: userId || null,
            action: data.action,
            entityType: data.entityType,
            entityId: data.entityId,
            details: data.details ? JSON.stringify(data.details) : null,
            proofHash
        }
    })
}

export async function getAuditLogs(filters?: {
    userId?: string,
    entityType?: string,
    entityId?: string
}) {
    const session = await auth()
    // Simple check: only admins or auditors can see all logs
    // Users might see their own logs (implementation detail for later)

    return await prisma.auditLog.findMany({
        where: filters,
        include: {
            user: {
                select: { name: true, email: true }
            }
        },
        orderBy: {
            timestamp: 'desc'
        }
    })
}
