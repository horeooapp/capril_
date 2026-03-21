"use server"

import { prisma } from "@/lib/prisma"
import { sendPaymentReminder } from "@/lib/notifications"
import { revalidatePath } from "next/cache"
import { writeAuditLog } from "@/lib/audit"
import { auth } from "@/auth"

/**
 * Phase 10.1: Process Overdue Rents and Send Reminders
 */
export async function triggerOverdueReminders() {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
        throw new Error("Unauthorized: Admin only")
    }

    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM

    // Fetch synthesis records that are unpaid for the current or past months
    const overdueRecords = await prisma.monthlyRentSynthesis.findMany({
        where: {
            status: { in: ['EN_ATTENTE', 'IMPAYE'] },
            month: { lte: currentMonth }
        },
        include: {
            lease: {
                include: {
                    tenant: {
                        select: {
                            id: true,
                            fullName: true
                        }
                    }
                }
            }
        }
    })

    const results = {
        processed: 0,
        skipped: 0,
        errors: 0
    }

    for (const record of overdueRecords) {
        if (!record.lease.tenantId) {
            results.skipped++
            continue
        }

        try {
            await sendPaymentReminder(
                record.lease.tenantId,
                record.totalExpected,
                record.month
            )
            
            // Log the reminder in AuditLog
            await writeAuditLog({
                action: 'PAYMENT_REMINDER_SENT',
                module: 'PAYMENT',
                entityId: record.id,
                newValues: {
                    tenantName: record.lease.tenant?.fullName,
                    amount: record.totalExpected,
                    month: record.month
                }
            })

            results.processed++
        } catch (error) {
            console.error(`Failed to send reminder for lease ${record.leaseId}:`, error)
            results.errors++
        }
    }

    revalidatePath('/admin')
    return results
}

/**
 * Get overdue stats for Admin Dashboard
 */
export async function getOverdueStats() {
    const currentMonth = new Date().toISOString().slice(0, 7)
    
    const count = await prisma.monthlyRentSynthesis.count({
        where: {
            status: { in: ['EN_ATTENTE', 'IMPAYE'] },
            month: { lte: currentMonth }
        }
    })

    const totalAmount = await prisma.monthlyRentSynthesis.aggregate({
        _sum: {
            totalExpected: true
        },
        where: {
            status: { in: ['EN_ATTENTE', 'IMPAYE'] },
            month: { lte: currentMonth }
        }
    })

    return {
        count,
        totalAmount: Number(totalAmount._sum.totalExpected || 0)
    }
}
