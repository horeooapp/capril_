"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * M-RECOUVREMENT : Détection des paiements en retard (J+5 après échéance).
 */
/**
 * M-RECOUVREMENT : Détection des paiements en retard (J+5 après échéance).
 */
export async function checkOverduePayments() {
    try {
        const today = new Date()
        const currentMonth = today.toISOString().slice(0, 7) // YYYY-MM
        
        // Trouver les synthèses du mois en cours qui sont IMPAYEES ou en retard (J+5)
        const dayOfMonth = today.getDate()
        
        const overdueSyntheses = await (prisma as any).monthlyRentSynthesis.findMany({
            where: {
                month: currentMonth,
                status: { in: ["EN_ATTENTE", "PARTIEL", "IMPAYE"] },
                lease: {
                    status: "ACTIVE",
                    paymentDay: { lt: dayOfMonth - 5 } // Echéance dépassée de 5 jours
                }
            },
            include: { lease: true }
        })

        for (const synthesis of overdueSyntheses) {
            await applyLateFees(synthesis.leaseId)
            await sendReminder(synthesis.leaseId, "D_PLUS_5")
        }

        return { success: true, count: overdueSyntheses.length }
    } catch (error) {
        console.error("[RECOUVREMENT] Error checking overdue:", error)
        return { success: false, error: "Échec du scan des impayés." }
    }
}

/**
 * Application des frais de retard (ex: 2% forfaitaire après J+5).
 */
export async function applyLateFees(leaseId: string) {
    try {
        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            include: { landlord: true }
        })

        if (!lease) throw new Error("Lease not found")

        const penaltyAmount = Math.floor(lease.rentAmount * 0.02)
        
        console.log(`[RECOUVREMENT] Application de ${penaltyAmount} FCFA de frais pour le bail ${leaseId}`)
        
        // Créer une transaction de frais de retard
        await (prisma as any).paymentPgw.create({
            data: {
                leaseId,
                moisConcerne: new Date(),
                montant: penaltyAmount,
                payeurId: lease.tenantId || "SYSTEM",
                beneficiaireId: lease.landlordId,
                canal: "SMS_DECLARATIF", // Frais internes
                statut: "EN_ATTENTE_PAIEMENT",
                refInterne: `PENALTY-${leaseId}-${Date.now()}`,
            }
        })

        return { success: true, amount: penaltyAmount }
    } catch (error) {
        console.error("[RECOUVREMENT] Error applying fees:", error)
        return { success: false, error: "Erreur lors de l'application des pénalités." }
    }
}

/**
 * Envoi d'une relance (SMS/Email) et historisation.
 */
export async function sendReminder(leaseId: string, type: "D_MINUS_5" | "D_DAY" | "D_PLUS_5" | "LEGAL_NOTICE") {
    try {
        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            include: { tenant: true }
        })

        if (!lease || !lease.tenantId) return { success: false, error: "Locataire non trouvé" }

        await prisma.reminderLog.create({
            data: {
                leaseId,
                type,
                status: "SENT"
            }
        })

        // Déclencher l'envoi réel via NotificationService
        const { NotificationService } = await import("@/lib/notification-service")
        
        await NotificationService.envoyerNotification(lease.tenantId, "IMPAYE_DETECTE", {
            referenceId: lease.leaseReference,
            payload: {
                smsText: `[RELANCE QAPRIL] Votre loyer pour le bail ${lease.leaseReference} est en attente. Merci de régulariser pour éviter des frais supplémentaires.`,
                parameters: [lease.leaseReference]
            }
        })

        console.log(`[RELANCE] Notification ${type} envoyée via NotificationService pour le bail ${leaseId}`)
        
        return { success: true }
    } catch (error) {
        console.error("[RECOUVREMENT] Error sending reminder:", error)
        return { success: false, error: "Erreur lors de l'envoi de la relance." }
    }
}

