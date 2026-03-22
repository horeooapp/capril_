"use server"

import { prisma } from "@/lib/prisma"
import { sendSMS } from "@/lib/sms"

/**
 * M-SMS-DECLARATION : Traitement des déclarations en attente (Relances & Expiration)
 * Peut être appelé par un endpoint API (Vercel Cron) ou un script.
 */
export async function processPendingDeclarations() {
    try {
        const now = new Date()
        
        // 1. Trouver les déclarations EN_ATTENTE
        const pending = await (prisma as any).smsDeclaration.findMany({
            where: { statut: "EN_ATTENTE" },
            include: {
                tenant: true,
                lease: {
                    include: {
                        property: {
                            include: {
                                owner: true,
                                accessRoles: { where: { role: "MANAGER", statut: "ACTIF" }, include: { user: true } }
                            }
                        }
                    }
                }
            }
        })

        console.log(`[CRON] Processing ${pending.length} pending declarations...`)

        for (const dec of pending) {
            const ageHours = (now.getTime() - new Date(dec.createdAt).getTime()) / (1000 * 60 * 60)

            // A. EXPIRATION : > 6 heures
            if (ageHours > 6) {
                await (prisma as any).smsDeclaration.update({
                    where: { id: dec.id },
                    data: { statut: "EXPIRE" }
                })
                
                if (dec.tenant.phone) {
                    await sendSMS(
                        dec.tenant.phone, 
                        `QAPRIL : Votre déclaration de ${Number(dec.montantDeclare).toLocaleString()} FCFA a expiré car elle n'a pas été confirmée par le bailleur. Veuillez recommencer.`
                    )
                }
                continue
            }

            // B. RELANCE : > 2 heures et pas encore relancé
            if (ageHours > 2 && !dec.reminderSentAt) {
                // Déterminer les destinataires (managers ou owner)
                const managers = dec.lease.property.accessRoles
                const recipients = managers.length > 0 ? managers.map((m: any) => m.user) : [dec.lease.property.owner]
                
                const tenantName = dec.tenant.fullName || dec.tenant.phone
                const reminderMsg = `QAPRIL (RAPPEL) : ${tenantName} attend la confirmation de son paiement (${Number(dec.montantDeclare).toLocaleString()} FCFA). Répondez OUI ou NON.`

                for (const recipient of recipients) {
                    if (recipient.phone) {
                        await sendSMS(recipient.phone, reminderMsg)
                    }
                }

                await (prisma as any).smsDeclaration.update({
                    where: { id: dec.id },
                    data: { reminderSentAt: new Date() }
                })
            }
        }

        return { success: true, processed: pending.length }
    } catch (error) {
        console.error("[CRON ERROR]:", error)
        return { error: "Cron execution failed" }
    }
}
