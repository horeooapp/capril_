"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NotificationService } from "@/lib/notification-service"
import { revalidatePath } from "next/cache"
import { generateMonthlyReportPDF } from "@/lib/pdf-reports"
import { Role } from "@prisma/client"
import { serializeObject } from "@/lib/serialize"

const MOIS_NOMS = [
    "",
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre"
]

/**
 * ADD-15 Section 2.1 — Formatage exact du texte WhatsApp du Rapport Mensuel QAPRIL
 */
function formatRapportWhatsAppText(data: any): string {
    const detailLines = (data.detail_par_logement || [])
        .map((d: any) => {
            if (d.statut === "VACANT") {
                return `  ${d.label} · [Vacant]       —  Logement vide`
            }
            if (d.statut === "PAYE") {
                return `  ${d.label} · ${d.locataire}   ✅ ${Number(d.montant).toLocaleString("fr-FR")} FCFA · ${d.date_paiement_court || ""}`
            }
            return `  ${d.label} · ${d.locataire}  ⏳ ${Number(d.montant).toLocaleString("fr-FR")} FCFA · EN ATTENTE`
        })
        .join("\n")

    const actionsLines =
        (data.actions_requises || []).length > 0
            ? data.actions_requises.map((a: any) => `  ⚠️  ${a.label} : ${a.locataire} — ${a.message}`).join("\n")
            : "  ✅ Aucun impayé en attente ce mois."

    return [
        "═══════════════════════════════════════════",
        "  RAPPORT MENSUEL QAPRIL",
        `  ${data.proprietaire_nom} · ${data.mois_label} ${data.periode_annee}`,
        "═══════════════════════════════════════════",
        "",
        "  RÉSUMÉ FINANCIER",
        "  ─────────────────────────────────────────",
        `  Loyers attendus ce mois   :  ${Number(data.resume_financier.loyers_attendus).toLocaleString("fr-FR")} FCFA`,
        `  Loyers reçus              :  ${Number(data.resume_financier.loyers_recus).toLocaleString("fr-FR")} FCFA`,
        `  Taux d'encaissement       :  ${data.resume_financier.taux_encaissement_pct}%`,
        `  Loyers en attente         :  ${Number(data.resume_financier.loyers_en_attente).toLocaleString("fr-FR")} FCFA`,
        "",
        "  DÉTAIL PAR LOGEMENT",
        "  ─────────────────────────────────────────",
        detailLines,
        "",
        "  ACTIONS REQUISES",
        "  ─────────────────────────────────────────",
        actionsLines,
        "",
        `  RÉCAPITULATIF ANNUEL (${data.periode_annee})`,
        "  ─────────────────────────────────────────",
        `  Total encaissé             :  ${Number(data.recap_annuel.total_encaisse_annuel).toLocaleString("fr-FR")} FCFA`,
        `  Taux moyen d'encaissement  :  ${data.recap_annuel.taux_moyen_annuel_pct}%`,
        `  Meilleur payeur            :  ${data.recap_annuel.meilleur_payeur || "—"}`,
        "",
        "  WALLET QAPRIL",
        "  ─────────────────────────────────────────",
        `  Solde actuel               :  ${Number(data.wallet.solde_actuel).toLocaleString("fr-FR")} FCFA`,
        `  Quittances ce mois         :  ${data.wallet.quittances_ce_mois} (${Number(data.wallet.frais_quittances_fcfa).toLocaleString("fr-FR")} FCFA débités)`,
        "",
        `  📱 Voir le détail complet : qapril.ci/rapport/${data.code_court}`,
        "═══════════════════════════════════════════"
    ].join("\n")
}

/**
 * M-RAPPORT-01 : Générer ou regénérer le rapport mensuel complet pour un propriétaire ou une agence (ADD-15 Section 2)
 */
export async function generateOwnerMonthlyReport(
    ownerId: string,
    month: number,
    year: number,
    typeRapport: "MENSUEL" | "HEBDOMADAIRE" | "ANNUEL" = "MENSUEL"
) {
    try {
        const periodStr = `${year}-${String(month).padStart(2, "0")}`
        const moisLabel = MOIS_NOMS[month] || `Mois ${month}`

        const owner = await prisma.user.findUnique({
            where: { id: ownerId },
            include: {
                walletConfig: true,
                diasporaProfile: true,
                propertiesOwned: {
                    where: { deletedAt: null },
                    include: {
                        leases: {
                            where: {
                                status: { in: ["ACTIVE", "ACTIVE_DECLARATIF", "LOYER_IMPAYE"] as any }
                            },
                            include: {
                                tenant: { select: { id: true, firstName: true, lastName: true, phone: true } },
                                receipts: true
                            }
                        }
                    }
                }
            }
        })

        if (!owner) return { success: false, error: "Propriétaire introuvable" }

        let loyersAttendus = 0
        let loyersRecus = 0
        let quittancesMoisCount = 0
        let quittancesPayantesCount = 0
        const detailParLogement: any[] = []
        const actionsRequises: any[] = []

        // Suivi annuel pour le récapitulatif annuel
        let totalAttenduAnnuel = 0
        let totalEncaisseAnnuel = 0
        const tenantPaymentStats: Record<string, { nom: string; paid: number; total: number }> = {}

        for (const prop of owner.propertiesOwned) {
            const activeLease = prop.leases[0]
            const unitLabel = prop.unitLabel || prop.name || prop.address || prop.propertyCode

            if (!activeLease) {
                detailParLogement.push({
                    property_id: prop.id,
                    label: unitLabel,
                    locataire: "[Vacant]",
                    telephone_locataire: null,
                    montant: 0,
                    statut: "VACANT",
                    date_paiement: null
                })
                continue
            }

            const loyerMensuel = Number(activeLease.rentAmount || 0) + Number(activeLease.chargesAmount || 0)
            loyersAttendus += loyerMensuel

            const tenantName =
                [activeLease.tenant?.firstName, activeLease.tenant?.lastName].filter(Boolean).join(" ").trim() ||
                activeLease.tenant?.phone ||
                "Locataire"

            const receiptMois = activeLease.receipts.find(
                (r) => r.periodMonth === periodStr && ["paid", "PAID"].includes(r.status)
            )

            if (receiptMois) {
                const paidAmt = Number(receiptMois.totalAmount || loyerMensuel)
                loyersRecus += paidAmt
                quittancesMoisCount++
                if (activeLease.typeBail !== "DECLARATIF_BDQ") {
                    quittancesPayantesCount++
                }
                const paidDate = receiptMois.paidAt ? new Date(receiptMois.paidAt) : new Date(receiptMois.createdAt)
                detailParLogement.push({
                    property_id: prop.id,
                    lease_id: activeLease.id,
                    label: unitLabel,
                    locataire: tenantName,
                    telephone_locataire: activeLease.tenant?.phone || null,
                    montant: paidAmt,
                    statut: "PAYE",
                    quittance_ref: receiptMois.receiptRef,
                    date_paiement: paidDate.toISOString(),
                    date_paiement_court: `${String(paidDate.getDate()).padStart(2, "0")}/${String(paidDate.getMonth() + 1).padStart(2, "0")}`
                })
            } else {
                detailParLogement.push({
                    property_id: prop.id,
                    lease_id: activeLease.id,
                    label: unitLabel,
                    locataire: tenantName,
                    telephone_locataire: activeLease.tenant?.phone || null,
                    montant: loyerMensuel,
                    statut: "EN_ATTENTE",
                    date_paiement: null
                })
                actionsRequises.push({
                    lease_id: activeLease.id,
                    label: unitLabel,
                    locataire: tenantName,
                    telephone_locataire: activeLease.tenant?.phone || null,
                    montant_attendu: loyerMensuel,
                    message: `Loyer ${moisLabel.toLowerCase()} non reçu. Relances envoyées. Contactez-le si nécessaire.`
                })
            }

            // Calcul annuel (mois 1..month de l'année `year`)
            const yearPrefix = `${year}-`
            const yearReceipts = activeLease.receipts.filter(
                (r) => r.periodMonth?.startsWith(yearPrefix) && ["paid", "PAID"].includes(r.status)
            )
            const paidYearSum = yearReceipts.reduce((s, r) => s + Number(r.totalAmount || 0), 0)
            totalEncaisseAnnuel += paidYearSum
            totalAttenduAnnuel += loyerMensuel * Math.max(1, month)

            const tKey = activeLease.tenantId || tenantName
            if (!tenantPaymentStats[tKey]) {
                tenantPaymentStats[tKey] = { nom: tenantName, paid: 0, total: 0 }
            }
            tenantPaymentStats[tKey].paid += yearReceipts.length
            tenantPaymentStats[tKey].total += Math.max(1, month)
        }

        const loyersEnAttente = Math.max(0, loyersAttendus - loyersRecus)
        const tauxEncaissementPct = loyersAttendus > 0 ? Math.round((loyersRecus / loyersAttendus) * 100) : 100
        const tauxMoyenAnnuelPct =
            totalAttenduAnnuel > 0 ? Math.round((totalEncaisseAnnuel / totalAttenduAnnuel) * 100) : tauxEncaissementPct

        let meilleurPayeur = "—"
        let bestRate = -1
        for (const st of Object.values(tenantPaymentStats)) {
            const rate = st.total > 0 ? Math.round((st.paid / st.total) * 100) : 0
            if (rate > bestRate && st.paid > 0) {
                bestRate = rate
                meilleurPayeur = `${st.nom} (${ Math.min(100, rate)}%)`
            }
        }

        const proprietaireNom =
            [owner.firstName, owner.lastName].filter(Boolean).join(" ").trim() || owner.phone || "Propriétaire QAPRIL"
        const codeCourt = `${moisLabel.slice(0, 3).toUpperCase()}${year}`

        // Profil de diffusion selon ADD-15 Section 2.2
        const nbLogements = owner.propertiesOwned.length
        const isAgence = owner.role === Role.AGENCY
        const isDiaspora = Boolean(owner.diasporaProfile?.diasporaAbonnement)
        const varianteProfil = isAgence
            ? "AGENCE_PRO"
            : isDiaspora
            ? "DIASPORA"
            : nbLogements > 5
            ? "PROPRIETAIRE_PLUS_5_LOGEMENTS"
            : "PROPRIETAIRE_PARTICULIER"

        const reportPayload: any = {
            proprietaire_id: owner.id,
            proprietaire_nom: proprietaireNom,
            variante_profil: varianteProfil,
            periode: periodStr,
            periode_mois: month,
            periode_annee: year,
            mois_label: moisLabel,
            code_court: codeCourt,
            resume_financier: {
                loyers_attendus: loyersAttendus,
                loyers_recus: loyersRecus,
                taux_encaissement_pct: tauxEncaissementPct,
                loyers_en_attente: loyersEnAttente,
                nb_logements_total: nbLogements,
                nb_impayes: actionsRequises.length
            },
            detail_par_logement: detailParLogement,
            actions_requises: actionsRequises,
            recap_annuel: {
                total_encaisse_annuel: totalEncaisseAnnuel,
                taux_moyen_annuel_pct: tauxMoyenAnnuelPct,
                meilleur_payeur: meilleurPayeur
            },
            wallet: {
                solde_actuel: owner.walletConfig?.walletBalance || 0,
                quittances_ce_mois: quittancesMoisCount,
                frais_quittances_fcfa: quittancesPayantesCount * 75
            },
            // Compatibilité descendante avec l'ancien format
            period: periodStr,
            metrics: {
                totalPotentiel: loyersAttendus,
                totalEncaisse: loyersRecus,
                tauxRecouvrement: tauxEncaissementPct,
                nbLeases: propLeasesCount(owner.propertiesOwned),
                nbImpayes: actionsRequises.length
            },
            details: detailParLogement.map((d) => ({
                address: d.label,
                tenant: d.locataire,
                status: d.statut === "PAYE" ? "paid" : d.statut === "VACANT" ? "vacant" : "pending",
                amount: d.montant
            })),
            generatedAt: new Date().toISOString()
        }

        reportPayload.whatsapp_text = formatRapportWhatsAppText(reportPayload)

        const sendEmail = nbLogements > 5 || isAgence || isDiaspora

        const report = await prisma.rapportMensuel.upsert({
            where: {
                userId_periodeMois_periodeAnnee_typeRapport: {
                    userId: ownerId,
                    periodeMois: month,
                    periodeAnnee: year,
                    typeRapport
                }
            },
            update: {
                dataRapport: reportPayload,
                envoyeWhatsapp: true,
                envoyeEmail: sendEmail,
                envoyeAt: new Date()
            },
            create: {
                userId: ownerId,
                periodeMois: month,
                periodeAnnee: year,
                typeRapport,
                dataRapport: reportPayload,
                envoyeWhatsapp: true,
                envoyeEmail: sendEmail,
                envoyeAt: new Date()
            }
        })

        const pdfUrl = `/api/v1/rapports/${month}/${year}`
        await prisma.rapportMensuel.update({
            where: { id: report.id },
            data: { pdfUrl }
        })

        // Génération PDF & Notification multi-canal
        try {
            const pdfBuffer = await generateMonthlyReportPDF({
                ownerName: proprietaireNom,
                period: periodStr,
                metrics: reportPayload.metrics,
                details: reportPayload.details
            })

            await NotificationService.envoyerNotification(ownerId, "RAPPORT_MENSUEL", {
                referenceId: report.id,
                receiptBuffer: pdfBuffer,
                payload: {
                    parameters: [periodStr, `${loyersRecus.toLocaleString("fr-FR")} FCFA`, `${tauxEncaissementPct}%`],
                    smsText: reportPayload.whatsapp_text
                }
            })
        } catch (notifErr) {
            console.warn("[M-RAPPORT] Notification warning:", notifErr)
        }

        revalidatePath("/dashboard/reports")
        return {
            success: true,
            reportId: report.id,
            pdfUrl,
            metrics: reportPayload.metrics,
            rapport: reportPayload
        }
    } catch (error: any) {
        console.error("[M-RAPPORT] Generation Error:", error)
        return { success: false, error: error.message || "Erreur lors de la génération du rapport" }
    }
}

function propLeasesCount(properties: any[]): number {
    return properties.reduce((acc, p) => acc + (p.leases?.length || 0), 0)
}

/**
 * M-RAPPORT-02 : Récupérer les rapports d'un utilisateur
 */
export async function getMonthlyReports(userId: string) {
    try {
        const reports = await prisma.rapportMensuel.findMany({
            where: { userId },
            orderBy: [{ periodeAnnee: "desc" }, { periodeMois: "desc" }]
        })
        return serializeObject(reports)
    } catch (error) {
        console.error("[M-RAPPORT] Fetch Error:", error)
        return []
    }
}

/**
 * M-RAPPORT-CRON : Lancer pour tous les bailleurs le 1er du mois à 7h00
 */
export async function triggerAllMonthlyReports() {
    const session = await auth()
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
        return { success: false, error: "Non autorisé" }
    }

    try {
        const prevMonth = new Date()
        prevMonth.setMonth(prevMonth.getMonth() - 1)
        const m = prevMonth.getMonth() + 1
        const y = prevMonth.getFullYear()

        const owners = await prisma.user.findMany({
            where: {
                role: { in: [Role.LANDLORD, Role.LANDLORD_PRO, Role.AGENCY] }
            },
            select: { id: true }
        })

        let count = 0
        for (const owner of owners) {
            const res = await generateOwnerMonthlyReport(owner.id, m, y)
            if (res.success) count++
        }

        return { success: true, processed: owners.length, generated: count }
    } catch (error) {
        console.error("[M-RAPPORT] Batch Error:", error)
        return { success: false, error: "Erreur lors du batch" }
    }
}
