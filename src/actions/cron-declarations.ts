"use server"

import { prisma } from "@/lib/prisma"
import { sendSMS } from "@/lib/sms"
import { DeclStatut } from "@prisma/client"

/**
 * ADD-11 Section 3.2 — Traitement automatique des déclarations SMS (2h, 6h, 24h)
 * - R11-UAT-05 : > 2 heures sans réponse -> Rappel SMS au gestionnaire (rappel_1_at)
 * - R11-UAT-06 : > 6 heures sans réponse -> Alerte directe au propriétaire sans accusation (alerte_proprio_at)
 * - > 24 heures -> Expiration (statut = EXPIRE)
 */
export async function processPendingDeclarations() {
    try {
        const now = new Date()

        const pending = await prisma.smsDeclaration.findMany({
            where: { statut: DeclStatut.EN_ATTENTE },
            include: {
                tenant: true,
                lease: {
                    include: {
                        property: {
                            include: {
                                owner: true,
                                accessRoles: {
                                    where: {
                                        role: { in: ["MANAGER", "INTERMEDIAIRE"] as any },
                                        statut: "ACTIF"
                                    },
                                    include: { user: true }
                                }
                            }
                        }
                    }
                }
            }
        })

        let remindersSent = 0
        let ownerAlertsSent = 0
        let expiredCount = 0

        for (const dec of pending) {
            const ageHours = (now.getTime() - new Date(dec.createdAt).getTime()) / (1000 * 60 * 60)
            const tenantName =
                [dec.tenant.firstName, dec.tenant.lastName].filter(Boolean).join(" ").trim() ||
                dec.tenant.phone ||
                "Locataire"
            const amountStr = Number(dec.montantDeclare).toLocaleString("fr-FR")
            const managers = dec.lease.property?.accessRoles || []
            const managerName =
                managers[0]?.user?.firstName ||
                managers[0]?.user?.lastName ||
                "votre gestionnaire"

            // 1. Expiration après 24h (ADD-11 Section 3.3)
            if (ageHours >= 24 || (dec.expireAt && new Date(dec.expireAt) < now)) {
                await prisma.smsDeclaration.update({
                    where: { id: dec.id },
                    data: { statut: DeclStatut.EXPIRE }
                })
                expiredCount++
                continue
            }

            // 2. Alerte propriétaire après 6h sans réponse (R11-UAT-06)
            if (ageHours >= 6 && !dec.alerteProprioAt) {
                const owner = dec.lease.property?.owner
                if (owner?.phone) {
                    const ownerAlertMsg = `⚠️ ${tenantName} déclare avoir payé ${amountStr} FCFA ce jour. Votre gestionnaire ${managerName} n'a pas encore confirmé depuis 6h. Veuillez vérifier.`
                    await sendSMS(owner.phone, ownerAlertMsg).catch(() => null)
                }

                await prisma.smsDeclaration.update({
                    where: { id: dec.id },
                    data: { alerteProprioAt: now }
                })
                ownerAlertsSent++
                continue
            }

            // 3. Rappel gestionnaire après 2h sans réponse (R11-UAT-05)
            if (ageHours >= 2 && !dec.rappel1At) {
                const recipients =
                    managers.length > 0
                        ? managers.map((m) => m.user).filter(Boolean)
                        : dec.lease.property?.owner
                        ? [dec.lease.property.owner]
                        : []

                const reminderMsg = `Rappel : ${tenantName} attend la confirmation de son paiement de ${amountStr} FCFA. Répondez OUI ou NON.`
                for (const r of recipients) {
                    if (r?.phone) {
                        await sendSMS(r.phone, reminderMsg).catch(() => null)
                    }
                }

                await prisma.smsDeclaration.update({
                    where: { id: dec.id },
                    data: { rappel1At: now }
                })
                remindersSent++
            }
        }

        return {
            success: true,
            processed: pending.length,
            remindersSent,
            ownerAlertsSent,
            expiredCount
        }
    } catch (error) {
        console.error("[CRON DECLARATIONS ERROR]:", error)
        return { success: false, error: "Cron execution failed" }
    }
}
