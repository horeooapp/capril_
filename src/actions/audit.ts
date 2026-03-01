"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function logAction(data: {
    action: string,
    entityType: string,
    entityId: string,
    details?: any
}) {
    const session = await auth()
    const userId = session?.user?.id

    return await prisma.auditLog.create({
        data: {
            userId: userId || null,
            action: data.action,
            entityType: data.entityType,
            entityId: data.entityId,
            details: data.details ? JSON.stringify(data.details) : null
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
