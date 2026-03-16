"use server"

import { prisma } from "@/lib/prisma"
import { calculateFiscalDroits } from "@/lib/fiscal"
import { revalidatePath } from "next/cache"
import { generateQRToken } from "@/lib/financial-utils"
import crypto from "crypto"
import { logAction } from "./audit"
import { ensureFeatureEnabled } from "@/lib/features"

/**
 * Récupère ou crée un dossier fiscal pour un bail donné
 */
export async function getOrCreateFiscalDossier(leaseId: string) {
    await ensureFeatureEnabled("M17_FISCAL")
    try {
        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            include: { fiscalDossiers: true }
        })

        if (!lease) return { error: "Bail non trouvé" }

        // Si un dossier existe déjà et est ENREGISTRE, on le retourne
        const existing = lease.fiscalDossiers.find(d => d.statut === "ENREGISTRE" || d.statut === "PAYE_CONFIRME")
        if (existing) return { success: true, data: existing }

        // Sinon on calcule les droits actuels
        const calculation = calculateFiscalDroits(
            lease.rentAmount,
            lease.durationMonths,
            lease.startDate,
            lease.leaseType as any
        )

        // Date limite légale : Signature + 30 jours
        const dateLimite = new Date(lease.startDate)
        dateLimite.setDate(dateLimite.getDate() + 30)

        // On crée ou met à jour le dossier "EN_ATTENTE"
        const dossier = await prisma.fiscalDossier.upsert({
            where: { id: lease.fiscalDossiers[0]?.id || 'new' }, // Simplified for the logic
            create: {
                leaseId,
                loyerMensuel: calculation.loyerMensuel,
                dureeBailMois: calculation.dureeBailMois,
                dureeRetenueMois: calculation.dureeRetenueMois,
                baseCalcul: calculation.baseCalcul,
                tauxApplique: 0.025,
                droitsEnregistrement: calculation.droitsEnregistrement,
                fraisTimbre: calculation.fraisTimbre,
                fraisQapril: calculation.fraisQapril,
                totalDgi: calculation.totalDgi,
                totalBailleur: calculation.totalBailleur,
                penaltyAmount: calculation.penaltyAmount,
                dateLimiteLegale: dateLimite,
                statut: "EN_ATTENTE_DECLARATION"
            },
            update: {
                loyerMensuel: calculation.loyerMensuel,
                dureeBailMois: calculation.dureeBailMois,
                baseCalcul: calculation.baseCalcul,
                droitsEnregistrement: calculation.droitsEnregistrement,
                penaltyAmount: calculation.penaltyAmount,
                totalDgi: calculation.totalDgi,
                totalBailleur: calculation.totalBailleur,
                statut: "EN_ATTENTE_DECLARATION"
            }
        })

        return { success: true, data: dossier }
    } catch (error) {
        console.error("[ACTION] getOrCreateFiscalDossier error:", error)
        return { error: "Erreur lors de la récupération du dossier fiscal" }
    }
}

/**
 * Simule l'initiation d'un paiement CinetPay (Sandbox)
 * Dans une version réelle, on appellerait l'API CinetPay ici.
 */
export async function initiateFiscalPayment(dossierId: string) {
    await ensureFeatureEnabled("M17_FISCAL")
    try {
        const dossier = await prisma.fiscalDossier.findUnique({
            where: { id: dossierId },
            include: { lease: true }
        })

        if (!dossier) return { error: "Dossier non trouvé" }

        // Simulation de génération d'URL de paiement CinetPay
        const transId = `fiscal_${dossier.id}_${Date.now()}`
        const paymentUrl = `https://sandbox.cinetpay.com/pay/${transId}`

        await prisma.fiscalDossier.update({
            where: { id: dossierId },
            data: {
                statut: "EN_COURS_PAIEMENT",
                cinetpayTransId: transId,
                cinetpayPaymentUrl: paymentUrl
            }
        })

        await logAction({
            action: "INITIATE_FISCAL_PAYMENT",
            module: "M17_FISCAL",
            entityId: dossierId,
            newValues: { transId, paymentUrl }
        })

        revalidatePath(`/dashboard/leases/${dossier.leaseId}`)
        return { success: true, paymentUrl }
    } catch (error) {
        console.error("[ACTION] initiateFiscalPayment error:", error)
        return { error: "Erreur lors de l'initiation du paiement" }
    }
}

/**
 * Génère le numéro séquentiel du certificat (CEN)
 * Format: QPRF-YYYY-XXXXXX
 */
async function generateCENRef() {
    const year = new Date().getFullYear()
    const count = await prisma.certificatFiscal.count({
        where: {
            issuedAt: {
                gte: new Date(`${year}-01-01`),
                lt: new Date(`${year + 1}-01-01`)
            }
        }
    })
    const sequence = (count + 1).toString().padStart(6, '0')
    return `QPRF-${year}-${sequence}`
}

/**
 * Crée le certificat fiscal numérique (CEN)
 */
export async function generateFiscalCert(fiscalId: string) {
    await ensureFeatureEnabled("M17_FISCAL")
    try {
        const dossier = await prisma.fiscalDossier.findUnique({
            where: { id: fiscalId },
            include: { lease: true }
        })

        if (!dossier) return { error: "Dossier non trouvé" }
        if (dossier.statut !== "PAYE_CONFIRME") return { error: "Paiement non confirmé" }

        // 1. Génération des métadonnées
        const numeroCertificat = await generateCENRef()
        const qrToken = generateQRToken()
        const pdfPath = `/certificates/fiscal/CEN-${numeroCertificat}.pdf`
        
        // Hash de sécurité (simulé pour l'instant sur les données du dossier)
        const content = `${numeroCertificat}|${dossier.id}|${dossier.totalBailleur}`
        const hashSha256 = crypto.createHash("sha256").update(content).digest("hex")

        // 2. Création de l'enregistrement
        const cert = await prisma.certificatFiscal.create({
            data: {
                fiscalId,
                numeroCertificat,
                qrToken,
                pdfPath,
                hashSha256,
                status: "VALIDE"
            }
        })

        // 3. Passage en statut ENREGISTRE
        await prisma.fiscalDossier.update({
            where: { id: fiscalId },
            data: { statut: "ENREGISTRE" }
        })

        await logAction({
            action: "GENERATE_FISCAL_CERT",
            module: "M17_FISCAL",
            entityId: cert.id,
            newValues: { numeroCertificat: cert.numeroCertificat }
        })

        revalidatePath(`/dashboard/leases/${dossier.leaseId}`)
        return { success: true, data: cert }
    } catch (error) {
        console.error("[ACTION] generateFiscalCert error:", error)
        return { error: "Erreur lors de la génération du certificat" }
    }
}

/**
 * M16/M17: Dashboard Stats pour la DGI
 */
export async function getFiscalStats() {
    await ensureFeatureEnabled("M17_FISCAL")
    try {
        await logAction({
            action: "ACCESS_DGI_STATS",
            module: "M16_ANAH",
            entityId: "DGI_DASHBOARD"
        })
        const totalDossiers = await prisma.fiscalDossier.count()
        const registeredCount = await prisma.fiscalDossier.count({ where: { statut: "ENREGISTRE" } })
        
        const totals = await prisma.fiscalDossier.aggregate({
            _sum: {
                totalDgi: true,
                droitsEnregistrement: true,
                penaltyAmount: true
            }
        })

        const recentRegistrations = await prisma.fiscalDossier.findMany({
            where: { statut: "ENREGISTRE" },
            include: { lease: { include: { property: true } } },
            orderBy: { updatedAt: 'desc' },
            take: 10
        })

        return {
            success: true,
            stats: {
                totalDossiers,
                registeredCount,
                complianceRate: totalDossiers > 0 ? (registeredCount / totalDossiers) * 100 : 0,
                totalCollected: totals._sum.totalDgi || 0,
                totalDroits: totals._sum.droitsEnregistrement || 0,
                totalPenalties: totals._sum.penaltyAmount || 0
            },
            recentRegistrations
        }
    } catch (error) {
        console.error("[ACTION] getFiscalStats error:", error)
        return { error: "Erreur lors de la récupération des statistiques" }
    }
}
