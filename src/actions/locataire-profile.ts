"use server"

import { prisma } from "@/lib/prisma"
import { calculateUserScore } from "@/lib/scoring"
import { serializeObject } from "@/lib/serialize"

/**
 * M-LOC-DASHBOARD & M-LOC-SCORE (Profil centralisé)
 */

export async function getLocataireDashboardData(userId: string) {
    const data = await getLocataireDashboardDataRaw(userId)
    return serializeObject(data)
}

async function getLocataireDashboardDataRaw(userId: string) {
    // Profil existant ou création si premier accès
    let profile = await (prisma as any).locataireProfile.findUnique({
        where: { userId }
    })

    if (!profile) {
        profile = await (prisma as any).locataireProfile.create({
            data: { userId }
        })
    }

    // Récupérer les baux actifs du locataire
    const bailsList = await (prisma as any).lease.findMany({
        where: {
            tenantId: userId,
            status: { in: ['ACTIVE', 'ACTIVE_DECLARATIF'] }
        },
        include: { property: true }
    })

    // Récupérer la caution (si 1 seul bail, c'est plus simple)
    const activeBailIds = bailsList.map((b: any) => b.id)
    const caution = activeBailIds.length > 0 ? await (prisma as any).cautionBail.findFirst({
        where: { bailId: { in: activeBailIds }, restituee: false }
    }) : null

    // 3 dernières quittances
    const quittances = await (prisma as any).receipt.findMany({
        where: { leaseId: { in: activeBailIds } },
        orderBy: { periodMonth: 'desc' },
        take: 3
    })

    // Loyer du mois en cours
    const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
    const currentReceipt = quittances.find((q: any) => q.periodMonth === currentMonth)

    // Calculer la prochaine échéance
    // Par défaut, le loyer est dû au jour `paymentDay` (souvent le 5).
    const paymentDay = bailsList.length > 0 ? (bailsList[0].paymentDay || 5) : 5
    const today = new Date()
    let expectedPaymentDate = new Date(today.getFullYear(), today.getMonth(), paymentDay)
    
    // S'il a déjà payé ce mois-ci, la prochaine est le mois prochain
    if (currentReceipt && currentReceipt.status === 'paid') {
         expectedPaymentDate = new Date(today.getFullYear(), today.getMonth() + 1, paymentDay)
    }

    const diffTime = expectedPaymentDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return {
        profile,
        bails: bailsList,
        caution,
        quittances,
        currentReceipt,
        nextPaymentInDays: diffDays > 0 ? diffDays : 0,
        expectedPaymentDate
    }
}

export async function refreshLocataireScore(userId: string) {
    const scoreData = await calculateUserScore(userId)
    
    // Mise à jour du profil
    const updated = await (prisma as any).locataireProfile.update({
        where: { userId },
        data: {
            scoreActuel: scoreData.score,
            scoreBadge: scoreData.badge,
            scoreCalculeAt: new Date(),
            tauxPaiement12m: scoreData.tauxPaiement12m
        }
    })

    return updated
}

export async function getAlertesPreferences(userId: string) {
    const profile = await (prisma as any).locataireProfile.findUnique({
        where: { userId }
    })
    return profile
}

export async function updateAlertesPreferences(userId: string, data: { alerteJ3Active?: boolean, alerteJ1Active?: boolean, canalAlertePref?: string }) {
    const profile = await (prisma as any).locataireProfile.update({
        where: { userId },
        data
    })
    return profile
}
