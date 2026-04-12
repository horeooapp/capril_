"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

async function requireAdmin() {
    const session = await auth()
    if (!session || !session.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized: Admin only")
    }
    return session.user.id
}

export async function getGuardLogs() {
    await requireAdmin()
    return await (prisma as any).gardeFousLog.findMany({
        include: { 
            user: {
                select: { id: true, firstName: true, lastName: true, phone: true, email: true, role: true, status: true }
            },
            traitePar: {
                select: { firstName: true, lastName: true }
            }
        },
        orderBy: { createdAt: "desc" }
    })
}

export async function resolveGuardLog(logId: string, actionDecision: string, notesAdmin: string) {
    const adminId = await requireAdmin()

    const log = await (prisma as any).gardeFousLog.findUnique({
        where: { id: logId },
        include: { user: true }
    })

    if (!log) throw new Error("Alerte de sécurité introuvable")
    if (log.traite) throw new Error("Cette alerte a déjà été traitée")

    // Update log
    const updatedLog = await (prisma as any).gardeFousLog.update({
        where: { id: logId },
        data: {
            traite: true,
            traiteParId: adminId,
            actionPrise: actionDecision,
            detail: `${log.detail || ''}\n\n[ADMIN-NOTE] ${notesAdmin}`
        }
    })

    // If we're pardoning the user, reactivate them
    if (actionDecision === 'PARDONNER') {
        await (prisma as any).user.update({
            where: { id: log.userId },
            data: { status: "ACTIF" }
        })
    }
    // If we're banning definitively
    else if (actionDecision === 'BANNISSEMENT_DEFINITIF') {
         await (prisma as any).user.update({
            where: { id: log.userId },
            data: { status: "BANNED" }
        })
    }

    return { success: true, log: updatedLog }
}
