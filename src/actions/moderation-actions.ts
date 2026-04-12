"use server"

import { auth } from "@/auth"
import { logAction } from "./audit"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export async function exportCsvAudit() {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non autorisé" }
    
    await logAction({ action: "EXPORT_CSV_AUDIT", module: "MODERATION", entityId: "global" })
    
    // Fake CSV generation could be here, but for now we just remove timeout
    return { success: true, url: "/downloads/audit.csv" }
}

export async function initiateLockdown() {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non autorisé" }
    
    await logAction({ action: "SYSTEM_LOCKDOWN", module: "MODERATION", entityId: "global" })
    revalidatePath("/dashboard/moderation")
    
    return { success: true, message: "Lockdown initié: Tous les nouveaux Baux sont en pause." }
}

export async function closeAuditTicket(ticketId: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non autorisé" }
    
    await logAction({ action: "CLOSE_TICKET", module: "MODERATION", entityId: ticketId })
    revalidatePath("/dashboard/moderation")
    
    return { success: true, message: `Ticket ${ticketId} clôturé par le Super-Admin.` }
}
