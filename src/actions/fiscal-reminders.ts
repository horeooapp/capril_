"use server"

import { prisma } from "@/lib/prisma"
import { writeAuditLog } from "@/lib/audit"
import { sendNotification } from "@/lib/notifications"
import { revalidatePath } from "next/cache"

/**
 * Phase 3: Fiscal Reminders Management
 * Scans for pending fiscal dossiers and sends reminders.
 */
export async function triggerFiscalReminders() {
    try {
        const now = new Date();
        const reminderThreshold = new Date();
        reminderThreshold.setDate(now.getDate() + 5); // 5 days from now

        // 1. Find dossiers needing a reminder
        const pendingDossiers = await prisma.fiscalDossier.findMany({
            where: {
                statut: "EN_ATTENTE_DECLARATION",
                dateLimiteLegale: {
                    lte: reminderThreshold
                }
            },
            include: {
                lease: {
                    select: {
                        leaseReference: true,
                        landlordId: true,
                        landlord: {
                            select: { fullName: true }
                        }
                    }
                }
            }
        });

        let sentCount = 0;

        for (const dossier of pendingDossiers) {
            const daysLeft = Math.ceil((dossier.dateLimiteLegale.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            let message = "";
            if (daysLeft < 0) {
                message = `URGENT: La date limite légale pour la déclaration de votre bail ${dossier.lease.leaseReference} est dépassée. Merci de régulariser au plus vite pour éviter des pénalités supplémentaires.`;
            } else {
                message = `RAPPEL: Il vous reste ${daysLeft} jours pour enregistrer votre bail ${dossier.lease.leaseReference} à la DGI sans pénalités.`;
            }

            // Send notification
            await sendNotification({
                userId: dossier.lease.landlordId,
                title: "Rappel Fiscalité M17",
                content: message,
                channels: ['PUSH', 'EMAIL', 'SMS']
            });

            sentCount++;
        }

        // 2. Audit Log
        await writeAuditLog({
            action: "FISCAL_REMINDERS_SENT",
            module: "M17_FISCAL",
            newValues: { totalSent: sentCount, timestamp: now.toISOString() }
        });

        revalidatePath("/admin/fiscal");
        return { success: true, sentCount };

    } catch (error) {
        console.error("[FiscalReminders] Error:", error);
        return { error: "Échec de l'envoi des relances fiscales." };
    }
}
