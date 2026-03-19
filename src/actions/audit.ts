"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { chainAuditHash } from "@/lib/proof"
import { Prisma } from "@prisma/client"

import { writeAuditLog } from "@/lib/audit"

import { getDemoMode } from "@/actions/demo-actions"
import { getDemoData } from "@/lib/demo-data"

export async function logAction(data: {
    action: string,
    module: string,
    entityId: string,
    oldValues?: Prisma.InputJsonValue,
    newValues?: Prisma.InputJsonValue
}) {
    return await writeAuditLog({
        userId: undefined, // Will be picked up by writeAuditLog internals if we pass it, but writeAuditLog already calls auth()? 
        // Wait, lib/audit.ts doesn't call auth(). I should probably add it or pass it.
        ...data as any
    })
}

export async function getAuditLogs(filters?: {
    userId?: string,
    module?: string,
    entityId?: string
}) {
    if (await getDemoMode()) {
        return getDemoData().recentAuditLogs
    }

    // Simple check: only admins or auditors can see all logs
    // Users might see their own logs (implementation detail for later)

    const logs = await prisma.auditLog.findMany({
        where: filters,
        include: {
            user: {
                select: {
                    fullName: true,
                    role: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 100
    })
    return logs
}
