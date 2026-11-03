"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * M-LOC-ALERTS & PATCH DLP-001 : Alertes et Rappels calibrés sur date_limite_paiement (paymentDay)
 * En Côte d'Ivoire, le loyer est payé d'avance avant le 5 ou le 10 du mois.
 */

function computeDateLimiteMois(annee: number, mois: number, limiteJour = 5): Date {
    const safeDay = Math.min(28, Math.max(1, limiteJour || 5))
    return new Date(annee, mois - 1, safeDay, 8, 0, 0)
}

/**
 * PATCH DLP-001 : Planifie les 6 alertes dynamiques d'un bail pour un mois donné
 * à partir de paymentDay (date_limite_paiement).
 */
export async function planifierAlertesBail(bailId: string, mois: number, annee: number) {
    const lease = await prisma.lease.findUnique({
        where: { id: bailId },
        select: { id: true, tenantId: true, paymentDay: true, dateReprise: true },
    })

    if (!lease || !lease.tenantId) {
        return { success: false, error: "Bail ou locataire introuvable" }
    }

    // Horloge de gestion : ne jamais planifier d'alertes pour une période antérieure à la date de reprise
    if (lease.dateReprise) {
        const targetPeriod = `${annee}-${String(mois).padStart(2, "0")}`
        const reprisePeriod = `${lease.dateReprise.getFullYear()}-${String(lease.dateReprise.getMonth() + 1).padStart(2, "0")}`
        if (targetPeriod < reprisePeriod) {
            return {
                success: false,
                horsHorlogeGestion: true,
                error: `Période (${targetPeriod}) antérieure à la date de reprise QAPRIL (${reprisePeriod}).`,
            }
        }
    }

    const dl = computeDateLimiteMois(annee, mois, lease.paymentDay || 5)
    const offsets = [
        { typeAlerte: "RAPPEL_J_MOINS_3", offset: -3 },
        { typeAlerte: "RAPPEL_J_MOINS_1", offset: -1 },
        { typeAlerte: "RELANCE_LIMITE_1", offset: 1 },
        { typeAlerte: "RELANCE_LIMITE_5", offset: 5 },
        { typeAlerte: "RELANCE_LIMITE_10", offset: 10 },
        { typeAlerte: "ALERTE_PROPRIO", offset: 15 },
    ]

    const alertsData = offsets.map((item) => {
        const d = new Date(dl)
        d.setDate(d.getDate() + item.offset)
        return {
            bailId: lease.id,
            locataireId: lease.tenantId!,
            typeAlerte: item.typeAlerte,
            datePrevue: d,
            envoyee: false,
        }
    })

    await prisma.alerteLoyer.createMany({
        data: alertsData,
        skipDuplicates: true,
    })

    return {
        success: true,
        date_limite: dl.toISOString().split("T")[0],
        nb_alertes_planifiees: alertsData.length,
    }
}

/**
 * PATCH DLP-001 (DLP-UAT-10 & DLP-UAT-11) :
 * Détermine si un loyer est en retard : non payé ET date actuelle > date_limite_mois.
 * Un locataire qui paie le 3 (avant la limite du 5) n'est JAMAIS en retard.
 */
export async function verifierLoyerEnRetard(bailId: string, mois: number, annee: number, referenceDate?: Date) {
    const lease = await prisma.lease.findUnique({
        where: { id: bailId },
        select: { id: true, paymentDay: true, dateReprise: true },
    })

    if (!lease) return { enRetard: false, paye: false }

    const periodStr = `${annee}-${String(mois).padStart(2, "0")}`

    // Horloge de gestion : une échéance antérieure à dateReprise n'est jamais traitée comme retard de gestion QAPRIL
    if (lease.dateReprise) {
        const reprisePeriod = `${lease.dateReprise.getFullYear()}-${String(lease.dateReprise.getMonth() + 1).padStart(2, "0")}`
        if (periodStr < reprisePeriod) {
            return {
                enRetard: false,
                paye: false,
                horsHorlogeGestion: true,
                dateReprise: lease.dateReprise.toISOString().split("T")[0],
            }
        }
    }
    const paidReceipt = await prisma.receipt.findFirst({
        where: {
            leaseId: bailId,
            periodMonth: periodStr,
            status: { in: ["paid", "PAID"] },
        },
        select: { id: true },
    })

    const isPaid = Boolean(paidReceipt)
    const dateLimite = computeDateLimiteMois(annee, mois, lease.paymentDay || 5)
    const now = referenceDate || new Date()

    const enRetard = !isPaid && now.getTime() > dateLimite.getTime()

    return {
        enRetard,
        paye: isPaid,
        dateLimite: dateLimite.toISOString().split("T")[0],
        paymentDay: lease.paymentDay || 5,
    }
}

export async function scheduleAlerteLoyer(bailId: string, locataireId: string, dateEcheance: Date) {
    const jMinus3 = new Date(dateEcheance)
    jMinus3.setDate(jMinus3.getDate() - 3)

    const jMinus1 = new Date(dateEcheance)
    jMinus1.setDate(jMinus1.getDate() - 1)

    await prisma.alerteLoyer.createMany({
        data: [
            { bailId, locataireId, typeAlerte: "RAPPEL_J_MOINS_3", datePrevue: jMinus3, envoyee: false },
            { bailId, locataireId, typeAlerte: "RAPPEL_J_MOINS_1", datePrevue: jMinus1, envoyee: false },
        ],
    })

    revalidatePath("/mon-espace-locataire/profile")
}

export async function getAlertesLocataire(userId: string) {
    return await prisma.alerteLoyer.findMany({
        where: { locataireId: userId },
        orderBy: { datePrevue: "desc" },
    })
}

export async function markAlerteAsSent(alerteId: string, canal: string) {
    return await prisma.alerteLoyer.update({
        where: { id: alerteId },
        data: {
            envoyee: true,
            envoyeeAt: new Date(),
            canal: canal as any,
        },
    })
}
