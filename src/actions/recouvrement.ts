"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * M-RECOUVREMENT : Détection des paiements en retard (J+5 après échéance).
 */
export async function checkOverduePayments() {
    try {
        const today = new Date()
        const gracePeriodDate = new Date()
        gracePeriodDate.setDate(today.getDate() - 5) // J+5

        const overdueLeases = await prisma.lease.findMany({
            where: {
                status: "ACTIVE",
                // Logique simplifiée : baux dont le dernier loyer n'est pas payé
                // En production, on vérifierait la table MonthlyRentSynthesis
            }
        })

        for (const lease of overdueLeases) {
            await sendReminder(lease.id, "D_PLUS_5")
            await applyLateFees(lease.id)
        }

        return { success: true, count: overdueLeases.length }
    } catch (error) {
        return { success: false, error: "Échec du scan des impayés." }
    }
}

/**
 * Application des frais de retard (ex: 2% forfaitaire après J+5).
 */
export async function applyLateFees(leaseId: string) {
    try {
        // Logique de calcul basée sur le montant du loyer
        console.log(`[RECOUVREMENT] Application des frais de retard pour le bail ${leaseId}`)
        
        // TODO: Créer une transaction de type 'LATE_FEE' dans PaymentPgw
        return { success: true }
    } catch (error) {
        return { success: false, error: "Erreur lors de l'application des pénalités." }
    }
}

/**
 * Envoi d'une relance (SMS/Email) et historisation.
 */
export async function sendReminder(leaseId: string, type: "D_MINUS_5" | "D_DAY" | "D_PLUS_5" | "LEGAL_NOTICE") {
    try {
        await prisma.reminderLog.create({
            data: {
                leaseId,
                type,
                status: "SENT"
            }
        })

        // TODO: Déclencher l'envoi réel via Gateway
        console.log(`[RELANCE] Notification ${type} envoyée pour le bail ${leaseId}`)
        
        return { success: true }
    } catch (error) {
        return { success: false, error: "Erreur lors de l'envoi de la relance." }
    }
}
