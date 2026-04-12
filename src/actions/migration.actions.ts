"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { Role } from "@prisma/client"
import { normalizePhone, isNormalized } from "@/lib/phone"
import { writeAuditLog } from "@/lib/audit"

/**
 * Migration Action: Unifies all phone numbers to the standard format.
 * Merges accounts if duplicates are found after normalization.
 */
export async function runPhoneMigration(dryRun: boolean = true) {
    const session = await auth()
    if (!session || session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.ADMIN) {
        throw new Error("Acces refuse : Droits administrateur requis.")
    }

    const summary = {
        totalProcessed: 0,
        alreadyCorrect: 0,
        updated: 0,
        merged: 0,
        errors: 0,
        details: [] as string[]
    }

    try {
        const users = await prisma.user.findMany()
        summary.totalProcessed = users.length

        for (const user of users) {
            if (!user.phone) continue;

            const originalPhone = user.phone
            const normalized = normalizePhone(originalPhone)

            if (originalPhone === normalized) {
                summary.alreadyCorrect++
                continue
            }

            if (dryRun) {
                summary.details.push(`[DRY-RUN] Would update ${originalPhone} -> ${normalized}`)
                summary.updated++
                continue
            }

            // Check if another user already has this normalized phone
            const existingUser = await prisma.user.findUnique({
                where: { phone: normalized }
            })

            if (existingUser) {
                // MERGE REQUIRED
                // Move all relations from 'user' (older/wrong format) to 'existingUser' (standard format)
                summary.details.push(`Merging ${originalPhone} into existing ${normalized}`)
                
                // Transactions safely move leases and delete old user
                await prisma.$transaction([
                    // Update Leases (Tenant)
                    prisma.lease.updateMany({
                        where: { tenantId: user.id },
                        data: { tenantId: existingUser.id }
                    }),
                    // Update Leases (Landlord)
                    prisma.lease.updateMany({
                        where: { landlordId: user.id },
                        data: { landlordId: existingUser.id }
                    }),
                    // Update Leases (Agent)
                    prisma.lease.updateMany({
                        where: { agentId: user.id },
                        data: { agentId: existingUser.id }
                    }),
                    // Update Notifications
                    prisma.notification.updateMany({
                        where: { userId: user.id },
                        data: { userId: existingUser.id }
                    }),
                    // Delete the duplicate user
                    prisma.user.delete({
                        where: { id: user.id }
                    })
                ])
                summary.merged++
            } else {
                // SIMPLE UPDATE
                await prisma.user.update({
                    where: { id: user.id },
                    data: { phone: normalized }
                })
                summary.updated++
            }
        }

        if (!dryRun) {
            await writeAuditLog({
                action: "PHONE_MIGRATION_EXECUTED",
                module: "SYSTEM",
                entityId: session.user.id,
                newValues: { updated: summary.updated, merged: summary.merged }
            })
        }

        return { success: true, summary }
    } catch (error: any) {
        console.error("[Migration] Error:", error)
        return { success: false, error: error.message }
    }
}
