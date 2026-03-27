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
        include: { 
            property: true,
            landlord: {
                select: { fullName: true }
            },
            reclamations: {
                where: { statut: { in: ['OUVERT', 'EN_COURS'] } }
            },
            dossiersLitige: {
                where: { statut: { in: ['GENERE', 'TRANSMIS_CACI', 'MEDIATION_EN_COURS'] } }
            }
        }
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

    // Utilities (CIE/SODECI)
    const facturesUtilities = activeBailIds.length > 0 ? await (prisma as any).factureUtility.findMany({
        where: { leaseId: { in: activeBailIds } },
        orderBy: { moisFacture: 'desc' },
        take: 6
    }) : []

    // Loyer du mois en cours
    const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
    const currentReceipt = quittances.find((q: any) => q.periodMonth === currentMonth)

    // Calculer la prochaine échéance
    const paymentDay = bailsList.length > 0 ? (bailsList[0].paymentDay || 5) : 5
    const today = new Date()
    let expectedPaymentDate = new Date(today.getFullYear(), today.getMonth(), paymentDay)
    
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
        facturesUtilities,
        mobileMoney: [
            { id: "MM-01", operateur: "Orange Money", numero: "+225 07 11 22 33", icon: "🟠", actif: true, defaut: true },
            { id: "MM-02", operateur: "Wave", numero: "+225 05 44 55 66", icon: "🔵", actif: true, defaut: false },
        ],
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
