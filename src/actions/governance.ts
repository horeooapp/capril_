"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * QAPRIL - Module M-GOVERNANCE
 * Transparence et Rapports de Gestion.
 */

export async function generateMonthlyReport(landlordId: string, month: Date) {
    try {
        const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
        const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0)

        // Récupérer tous les paiements confirmés pour ce bailleur
        const payments = await prisma.paymentPgw.findMany({
            where: {
                beneficiaireId: landlordId,
                statut: "CONFIRMEE",
                createdAt: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            },
            include: {
                tvaTransactions: true
            }
        })

        const totalEncaisse = payments.reduce((acc, p) => acc + Number(p.montant), 0)
        const totalTva = payments.reduce((acc, p) => acc + p.tvaTransactions.reduce((tacc, t) => tacc + Number(t.montantTva), 0), 0)

        // Rapport de transparence
        const report = {
            landlordId,
            period: `${month.getMonth() + 1}/${month.getFullYear()}`,
            totalEncaisse,
            totalTva,
            netVirement: totalEncaisse - totalTva, // Placeholder: déduire aussi les frais Qapril
            paymentCount: payments.length,
            generatedAt: new Date()
        }

        console.log(`GOVERNANCE_REPORT_GENERATED for ${landlordId}:`, report)

        return { success: true, report }
    } catch (error) {
        return { success: false, error: "Erreur lors de la génération du rapport de gouvernance." }
    }
}
