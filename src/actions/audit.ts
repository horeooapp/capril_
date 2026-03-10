"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { chainAuditHash } from "@/lib/proof"
import { Prisma } from "@prisma/client"

export async function logAction(data: {
    action: string,
    module: string,
    entityId: string,
    newValues?: Prisma.InputJsonValue
}) {
    const session = await auth()
    const userId = session?.user?.id

    // Get latest log to chain the hash
    const lastLog = await prisma.auditLog.findFirst({
        orderBy: { createdAt: 'desc' }
    })

    const proofHash = chainAuditHash(lastLog?.proofHash || null, {
        userId,
        action: data.action,
        module: data.module,
        entityId: data.entityId,
        details: data.newValues
    })

    return await prisma.auditLog.create({
        data: {
            userId: userId || null,
            action: data.action,
            module: data.module,
            entityId: data.entityId,
            newValues: data.newValues || Prisma.JsonNull,
            proofHash
        }
    })
}

export async function getAuditLogs(filters?: {
    userId?: string,
    module?: string,
    entityId?: string
}) {
    // Simple check: only admins or auditors can see all logs
    // Users might see their own logs (implementation detail for later)

    return await prisma.auditLog.findMany({
        where: filters,
        include: {
            user: {
                select: { fullName: true, email: true }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
}
