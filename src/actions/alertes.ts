"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * M-LOC-ALERTS : Alertes et Rappels (M4)
 */

export async function scheduleAlerteLoyer(bailId: string, locataireId: string, dateEcheance: Date) {
    // Calcul des dates d'alertes
    const jMinus3 = new Date(dateEcheance)
    jMinus3.setDate(jMinus3.getDate() - 3)

    const jMinus1 = new Date(dateEcheance)
    jMinus1.setDate(jMinus1.getDate() - 1)

    // Création des alertes en base
    await (prisma as any).alerteLoyer.createMany({
        data: [
            { bailId, locataireId, typeAlerte: "J_MOINS_3", datePrevue: jMinus3, envoyee: false },
            { bailId, locataireId, typeAlerte: "J_MOINS_1", datePrevue: jMinus1, envoyee: false }
        ]
    })

    revalidatePath("/locataire/preferences")
}

export async function getAlertesLocataire(userId: string) {
    return await (prisma as any).alerteLoyer.findMany({
        where: { locataireId: userId },
        orderBy: { datePrevue: 'desc' }
    })
}

export async function markAlerteAsSent(alerteId: string, canal: string) {
    return await (prisma as any).alerteLoyer.update({
        where: { id: alerteId },
        data: {
            envoyee: true,
            envoyeeAt: new Date(),
            canal
        }
    })
}
