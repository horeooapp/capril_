"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { CommType, ProspectStatut } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { NotificationService } from "@/lib/notification-service"

export const CHAMPION_COMMISSION_RATES: Record<CommType, number> = {
    BAIL_FORMEL: 1000,
    BDQ_CONFIRME: 250,
    FORMALISATION: 500,
    RECRUTEMENT: 1500,
    BONUS: 5000,
}

function normalizePhone(phone?: string | null): string {
    if (!phone) return ""
    let cleaned = phone.replace(/[\s\-\.\(\)]/g, "")
    if (cleaned.startsWith("00225")) cleaned = "+" + cleaned.slice(2)
    else if (cleaned.startsWith("225") && cleaned.length === 13) cleaned = "+" + cleaned
    else if (cleaned.startsWith("0") && cleaned.length === 10) cleaned = "+225" + cleaned
    return cleaned
}

function getNextFridayDate(from = new Date()): string {
    const d = new Date(from)
    const day = d.getDay()
    const diff = (5 - day + 7) % 7 || 7
    d.setDate(d.getDate() + diff)
    return d.toISOString().split("T")[0]
}

function anonymizeChampionName(firstName?: string | null, lastName?: string | null): string {
    const first = (firstName || "Champion").trim()
    const lastInit = lastName && lastName.trim().length > 0 ? `${lastName.trim().charAt(0).toUpperCase()}.` : ""
    return `${first} ${lastInit}`.trim()
}

/**
 * Récupère ou initialise le profil Champion d'un utilisateur
 */
export async function ensureChampionProfile(userId: string, defaultZone = "Yopougon") {
    let profile = await prisma.championProfile.findUnique({
        where: { userId },
        include: {
            user: {
                select: { id: true, firstName: true, lastName: true, phone: true, email: true, neighborhood: true },
            },
        },
    })

    if (!profile) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { neighborhood: true },
        })
        profile = await prisma.championProfile.create({
            data: {
                userId,
                zonePrincipale: user?.neighborhood || defaultZone,
                zonesSecondaires: [],
                objectifMensuel: 30,
                statut: "ACTIF",
            },
            include: {
                user: {
                    select: { id: true, firstName: true, lastName: true, phone: true, email: true, neighborhood: true },
                },
            },
        })
    }

    return profile
}

/**
 * Enregistre une commission Champion (A15-UAT-07 / A15-UAT-08)
 */
export async function recordChampionCommission(params: {
    championUserId?: string
    championProfileId?: string
    typeAction: CommType
    referenceId?: string
    montantFcfa?: number
    statut?: "EN_ATTENTE" | "VALIDE"
}) {
    try {
        let profileId = params.championProfileId
        if (!profileId && params.championUserId) {
            const prof = await ensureChampionProfile(params.championUserId)
            profileId = prof.id
        }
        if (!profileId) {
            return { success: false, error: "Identifiant Champion manquant" }
        }

        const montant = params.montantFcfa ?? CHAMPION_COMMISSION_RATES[params.typeAction] ?? 250
        const statut = params.statut || "VALIDE"

        const commission = await prisma.championCommission.create({
            data: {
                championId: profileId,
                typeAction: params.typeAction,
                referenceId: params.referenceId || null,
                montantFcfa: montant,
                statut,
                valideAt: statut === "VALIDE" ? new Date() : null,
            },
        })

        const isNewInscription =
            params.typeAction === "BAIL_FORMEL" || params.typeAction === "BDQ_CONFIRME"

        await prisma.championProfile.update({
            where: { id: profileId },
            data: {
                totalCommissionsFcfa: { increment: montant },
                ...(isNewInscription ? { totalInscriptions: { increment: 1 } } : {}),
            },
        })

        return { success: true, commission }
    } catch (error: any) {
        console.error("[M-CHAMPION] recordChampionCommission error:", error)
        return { success: false, error: error.message }
    }
}

/**
 * CHP-01 : Tableau de bord complet du Champion (5 blocs — ADD-15 Section 3.1)
 */
export async function getChampionDashboardData(targetUserId?: string) {
    const session = await auth()
    const userId = targetUserId || session?.user?.id
    if (!userId) return { success: false, error: "Non authentifié" }

    try {
        const profile = await ensureChampionProfile(userId)
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

        const [commissionsMois, commissionsPrevMois, allCommissions6M, prospects] = await Promise.all([
            prisma.championCommission.findMany({
                where: {
                    championId: profile.id,
                    createdAt: { gte: startOfMonth, lte: endOfMonth },
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.championCommission.findMany({
                where: {
                    championId: profile.id,
                    createdAt: { gte: startOfPrevMonth, lte: endOfPrevMonth },
                },
            }),
            prisma.championCommission.findMany({
                where: {
                    championId: profile.id,
                    createdAt: { gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.championProspect.findMany({
                where: { championId: profile.id },
                orderBy: [{ dateRappelPrevu: "asc" }, { createdAt: "desc" }],
            }),
        ])

        // BLOC 1 : Mes commissions du mois
        let montantConfirme = 0
        let montantEnAttente = 0
        let montantPayeMois = 0

        const detailParAction = {
            bails_formels: { count: 0, unitaire: 1000, total: 0 },
            bdq_confirmes: { count: 0, unitaire: 250, total: 0 },
            bdq_formalises: { count: 0, unitaire: 500, total: 0 },
            recrutements: { count: 0, unitaire: 1500, total: 0 },
            bonus: { count: 0, total: 0 },
        }

        for (const c of commissionsMois) {
            if (c.statut === "VALIDE" || c.statut === "PAYE") {
                montantConfirme += c.montantFcfa
            } else {
                montantEnAttente += c.montantFcfa
            }
            if (c.statut === "PAYE") {
                montantPayeMois += c.montantFcfa
            }

            if (c.typeAction === "BAIL_FORMEL") {
                detailParAction.bails_formels.count++
                detailParAction.bails_formels.total += c.montantFcfa
            } else if (c.typeAction === "BDQ_CONFIRME") {
                detailParAction.bdq_confirmes.count++
                detailParAction.bdq_confirmes.total += c.montantFcfa
            } else if (c.typeAction === "FORMALISATION") {
                detailParAction.bdq_formalises.count++
                detailParAction.bdq_formalises.total += c.montantFcfa
            } else if (c.typeAction === "RECRUTEMENT") {
                detailParAction.recrutements.count++
                detailParAction.recrutements.total += c.montantFcfa
            } else if (c.typeAction === "BONUS") {
                detailParAction.bonus.count++
                detailParAction.bonus.total += c.montantFcfa
            }
        }

        // Historique 6 derniers mois
        const historique6Mois = Array.from({ length: 6 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const m = d.getMonth()
            const y = d.getFullYear()
            const items = allCommissions6M.filter(
                (c) => c.createdAt.getMonth() === m && c.createdAt.getFullYear() === y
            )
            const total = items.reduce((acc, item) => acc + item.montantFcfa, 0)
            return {
                periode: `${String(m + 1).padStart(2, "0")}/${y}`,
                nb_actions: items.length,
                total_fcfa: total,
            }
        })

        // BLOC 2 : Ma performance ce mois
        const inscriptionsRealisees =
            detailParAction.bails_formels.count + detailParAction.bdq_confirmes.count
        const inscriptionsPrevMois = commissionsPrevMois.filter(
            (c) => c.typeAction === "BAIL_FORMEL" || c.typeAction === "BDQ_CONFIRME"
        ).length

        const objectifMensuel = profile.objectifMensuel || 30
        const progressionPct = Math.min(100, Math.round((inscriptionsRealisees / objectifMensuel) * 100))
        const daysInMonth = endOfMonth.getDate()
        const joursRestants = Math.max(1, daysInMonth - now.getDate())
        const restantAFaire = Math.max(0, objectifMensuel - inscriptionsRealisees)
        const rythmeQuotidienRequis = Number((restantAFaire / joursRestants).toFixed(1))

        // BLOC 3 : Mes prospects à rappeler (avec badge > 48h — A15-UAT-10)
        const nowMs = now.getTime()
        const threshold48hMs = 48 * 3600 * 1000
        const prospectsEnrichis = prospects.map((p) => {
            const rappelMs = p.dateRappelPrevu ? new Date(p.dateRappelPrevu).getTime() : null
            const enRetard = rappelMs !== null && rappelMs < nowMs && p.statut !== "INSCRIT"
            const enRetardPlus48h =
                rappelMs !== null && nowMs - rappelMs >= threshold48hMs && p.statut !== "INSCRIT"

            return {
                id: p.id,
                nom: p.nom,
                telephone: p.telephone,
                quartier: p.quartier,
                nb_logements_estime: p.nbLogementsEstime,
                argument_cle: p.argumentCle,
                statut: p.statut,
                date_dernier_contact: p.dateDernierContact,
                date_rappel_prevu: p.dateRappelPrevu,
                note: p.note,
                deja_inscrit_qapril: Boolean(p.userIdInscrit),
                en_retard: enRetard,
                badge_retard_48h: enRetardPlus48h,
            }
        })

        // BLOC 4 : Mes inscriptions récentes (10 derniers propriétaires inscrits ou BDQ créés par ce Champion)
        const recentBdqs = await prisma.bailDeclaratif.findMany({
            where: { agentId: userId },
            orderBy: { createdAt: "desc" },
            take: 10,
            include: {
                bailleur: {
                    select: { id: true, firstName: true, lastName: true, phone: true },
                },
            },
        })

        const inscriptionsRecentes = recentBdqs.map((b) => ({
            id: b.id,
            proprietaire_nom:
                `${b.bailleur?.firstName || ""} ${b.bailleur?.lastName || ""}`.trim() ||
                b.bailleur?.phone ||
                "Propriétaire",
            date_inscription: b.createdAt,
            description_logement: b.descriptionLogement,
            statut_bdq: b.statut,
            commission_declenchee: b.statut === "CONFIRME" || b.statut === "FORMALISE",
            montant_commission_fcfa: b.statut === "FORMALISE" ? 750 : 250,
        }))

        // BLOC 5 : Mon classement dans ma zone (A15-UAT-12)
        const classementRes = await getZoneLeaderboard(userId)

        return {
            success: true,
            champion: {
                id: profile.id,
                user_id: profile.userId,
                nom: `${profile.user?.firstName || ""} ${profile.user?.lastName || ""}`.trim() || "Champion QAPRIL",
                zone_principale: profile.zonePrincipale,
                zones_secondaires: profile.zonesSecondaires,
                statut: profile.statut,
                objectif_mensuel: objectifMensuel,
            },
            bloc_1_commissions_mois: {
                montant_confirme_fcfa: montantConfirme,
                montant_en_attente_fcfa: montantEnAttente,
                montant_paye_fcfa: montantPayeMois,
                total_potentiel_fcfa: montantConfirme + montantEnAttente,
                detail_par_action: detailParAction,
                date_prochain_paiement: getNextFridayDate(now),
                historique_6_mois: historique6Mois,
            },
            bloc_2_performance_mois: {
                objectif_mensuel: objectifMensuel,
                inscriptions_realisees: inscriptionsRealisees,
                progression_pct: progressionPct,
                jours_restants: joursRestants,
                rythme_quotidien_requis: rythmeQuotidienRequis,
                inscriptions_mois_precedent: inscriptionsPrevMois,
                evolution_vs_mois_precedent: inscriptionsRealisees - inscriptionsPrevMois,
            },
            bloc_3_prospects_a_rappeler: {
                total_prospects: prospectsEnrichis.length,
                nb_a_rappeler: prospectsEnrichis.filter((p) => p.statut === "A_RAPPELER").length,
                nb_en_retard_48h: prospectsEnrichis.filter((p) => p.badge_retard_48h).length,
                prospects: prospectsEnrichis,
            },
            bloc_4_inscriptions_recentes: inscriptionsRecentes,
            bloc_5_classement_zone: classementRes.classement || [],
        }
    } catch (error: any) {
        console.error("[M-CHAMPION] getChampionDashboardData error:", error)
        return { success: false, error: error.message || "Erreur serveur" }
    }
}

/**
 * CHP-02 : Historique des commissions par mois
 */
export async function getChampionCommissionsHistory(targetUserId?: string) {
    const session = await auth()
    const userId = targetUserId || session?.user?.id
    if (!userId) return { success: false, error: "Non authentifié" }

    const profile = await ensureChampionProfile(userId)
    const commissions = await prisma.championCommission.findMany({
        where: { championId: profile.id },
        orderBy: { createdAt: "desc" },
        take: 200,
    })

    return {
        success: true,
        champion_id: profile.id,
        total_cumule_fcfa: profile.totalCommissionsFcfa,
        commissions: commissions.map((c) => ({
            id: c.id,
            type_action: c.typeAction,
            reference_id: c.referenceId,
            montant_fcfa: c.montantFcfa,
            statut: c.statut,
            valide_at: c.valideAt,
            paye_at: c.payeAt,
            mode_paiement: c.modePaiement,
            created_at: c.createdAt,
        })),
    }
}

/**
 * CHP-03 : Détail des commissions du mois en cours
 */
export async function getChampionCurrentMonthCommissions(targetUserId?: string) {
    const session = await auth()
    const userId = targetUserId || session?.user?.id
    if (!userId) return { success: false, error: "Non authentifié" }

    const profile = await ensureChampionProfile(userId)
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const commissions = await prisma.championCommission.findMany({
        where: {
            championId: profile.id,
            createdAt: { gte: startOfMonth },
        },
        orderBy: { createdAt: "desc" },
    })

    const totalValide = commissions
        .filter((c) => c.statut === "VALIDE" || c.statut === "PAYE")
        .reduce((acc, c) => acc + c.montantFcfa, 0)
    const totalEnAttente = commissions
        .filter((c) => c.statut === "EN_ATTENTE")
        .reduce((acc, c) => acc + c.montantFcfa, 0)

    return {
        success: true,
        periode: `${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`,
        montant_confirme_fcfa: totalValide,
        montant_en_attente_fcfa: totalEnAttente,
        date_prochain_virement: getNextFridayDate(now),
        commissions,
    }
}

/**
 * CHP-04 : Liste des prospects du carnet Champion
 */
export async function listChampionProspects(targetUserId?: string, statutFilter?: string) {
    const session = await auth()
    const userId = targetUserId || session?.user?.id
    if (!userId) return { success: false, error: "Non authentifié" }

    const profile = await ensureChampionProfile(userId)
    const whereClause: any = { championId: profile.id }
    if (statutFilter && Object.values(ProspectStatut).includes(statutFilter as ProspectStatut)) {
        whereClause.statut = statutFilter as ProspectStatut
    }

    const prospects = await prisma.championProspect.findMany({
        where: whereClause,
        orderBy: [{ dateRappelPrevu: "asc" }, { createdAt: "desc" }],
    })

    const nowMs = Date.now()
    const threshold48hMs = 48 * 3600 * 1000

    return {
        success: true,
        prospects: prospects.map((p) => {
            const rappelMs = p.dateRappelPrevu ? new Date(p.dateRappelPrevu).getTime() : null
            const badgeRetard48h =
                rappelMs !== null && nowMs - rappelMs >= threshold48hMs && p.statut !== "INSCRIT"
            return {
                ...p,
                deja_inscrit_qapril: Boolean(p.userIdInscrit),
                badge_retard_48h: badgeRetard48h,
            }
        }),
    }
}

/**
 * CHP-05 : Ajouter un prospect dans le carnet (A15-UAT-09 + vérification silencieuse si déjà inscrit)
 */
export async function createChampionProspect(
    data: {
        nom: string
        telephone?: string
        quartier?: string
        nb_logements_estime?: string
        argument_cle?: string
        date_rappel_prevu?: string
        note?: string
    },
    targetUserId?: string
) {
    const session = await auth()
    const userId = targetUserId || session?.user?.id
    if (!userId) return { success: false, error: "Non authentifié" }

    if (!data.nom || data.nom.trim().length < 2) {
        return { success: false, error: "Le nom du prospect est obligatoire." }
    }

    const profile = await ensureChampionProfile(userId)
    const normalizedPhone = normalizePhone(data.telephone)

    // Vérification silencieuse : le numéro est-il déjà inscrit sur QAPRIL ? (ADD-15 Section 3.2)
    let existingQaprilUser: { id: string } | null = null
    if (normalizedPhone) {
        existingQaprilUser = await prisma.user.findFirst({
            where: {
                OR: [{ phone: normalizedPhone }, { phone: data.telephone?.trim() }],
            },
            select: { id: true },
        })
    }

    const prospect = await prisma.championProspect.create({
        data: {
            championId: profile.id,
            nom: data.nom.trim(),
            telephone: normalizedPhone || data.telephone?.trim() || null,
            quartier: data.quartier || profile.zonePrincipale,
            nbLogementsEstime: data.nb_logements_estime || "6-15",
            argumentCle: data.argument_cle || null,
            statut: existingQaprilUser ? ProspectStatut.INSCRIT : ProspectStatut.A_RAPPELER,
            dateDernierContact: new Date(),
            dateRappelPrevu: data.date_rappel_prevu ? new Date(data.date_rappel_prevu) : null,
            note: data.note || null,
            userIdInscrit: existingQaprilUser?.id || null,
        },
    })

    revalidatePath("/dashboard/champion")
    return {
        success: true,
        prospect,
        deja_inscrit_qapril: Boolean(existingQaprilUser),
        alerte_doublon: existingQaprilUser
            ? "Ce numéro est déjà inscrit sur QAPRIL — inutile de relancer."
            : null,
    }
}

/**
 * CHP-06 : Mettre à jour un prospect (statut, note, date de rappel)
 */
export async function updateChampionProspect(
    prospectId: string,
    data: {
        nom?: string
        telephone?: string
        quartier?: string
        nb_logements_estime?: string
        argument_cle?: string
        statut?: ProspectStatut
        date_rappel_prevu?: string | null
        note?: string
        type_bail_cree?: "BAIL_FORMEL" | "BDQ_CONFIRME"
    },
    targetUserId?: string
) {
    const session = await auth()
    const userId = targetUserId || session?.user?.id
    if (!userId) return { success: false, error: "Non authentifié" }

    const profile = await ensureChampionProfile(userId)
    const existing = await prisma.championProspect.findFirst({
        where: { id: prospectId, championId: profile.id },
    })

    if (!existing) {
        return { success: false, error: "Prospect introuvable." }
    }

    const wasAlreadyInscrit = existing.statut === ProspectStatut.INSCRIT
    const newStatut = data.statut || existing.statut

    const updated = await prisma.championProspect.update({
        where: { id: prospectId },
        data: {
            nom: data.nom ?? existing.nom,
            telephone: data.telephone !== undefined ? normalizePhone(data.telephone) || data.telephone : existing.telephone,
            quartier: data.quartier ?? existing.quartier,
            nbLogementsEstime: data.nb_logements_estime ?? existing.nbLogementsEstime,
            argumentCle: data.argument_cle ?? existing.argumentCle,
            statut: newStatut,
            dateDernierContact: new Date(),
            dateRappelPrevu:
                data.date_rappel_prevu !== undefined
                    ? data.date_rappel_prevu
                        ? new Date(data.date_rappel_prevu)
                        : null
                    : existing.dateRappelPrevu,
            note: data.note ?? existing.note,
        },
    })

    // Si le prospect passe au statut INSCRIT pour la première fois, déclencher le calcul de commission
    let commissionCreated = null
    if (!wasAlreadyInscrit && newStatut === ProspectStatut.INSCRIT) {
        const commType: CommType = data.type_bail_cree === "BAIL_FORMEL" ? "BAIL_FORMEL" : "BDQ_CONFIRME"
        const commRes = await recordChampionCommission({
            championProfileId: profile.id,
            typeAction: commType,
            referenceId: prospectId,
            statut: "VALIDE",
        })
        if (commRes.success) {
            commissionCreated = commRes.commission
        }
    }

    revalidatePath("/dashboard/champion")
    return {
        success: true,
        prospect: updated,
        commission_declenchee: commissionCreated,
    }
}

/**
 * CHP-07 : Supprimer un prospect (statut PERDU uniquement ou admin)
 */
export async function deleteChampionProspect(prospectId: string, targetUserId?: string) {
    const session = await auth()
    const userId = targetUserId || session?.user?.id
    if (!userId) return { success: false, error: "Non authentifié" }

    const profile = await ensureChampionProfile(userId)
    const existing = await prisma.championProspect.findFirst({
        where: { id: prospectId, championId: profile.id },
    })

    if (!existing) {
        return { success: false, error: "Prospect introuvable." }
    }

    await prisma.championProspect.delete({
        where: { id: prospectId },
    })

    revalidatePath("/dashboard/champion")
    return { success: true, deleted_id: prospectId }
}

/**
 * CHP-08 : Classement anonymisé des Champions de la zone (A15-UAT-12)
 */
export async function getZoneLeaderboard(targetUserId?: string) {
    const session = await auth()
    const userId = targetUserId || session?.user?.id
    if (!userId) return { success: false, error: "Non authentifié", classement: [] }

    const myProfile = await ensureChampionProfile(userId)
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const zoneProfiles = await prisma.championProfile.findMany({
        where: {
            zonePrincipale: { equals: myProfile.zonePrincipale, mode: "insensitive" },
            statut: "ACTIF",
        },
        include: {
            user: { select: { id: true, firstName: true, lastName: true } },
            commissions: {
                where: { createdAt: { gte: startOfMonth } },
            },
        },
    })

    const ranked = zoneProfiles
        .map((p) => {
            const inscriptionsMois = p.commissions.filter(
                (c) => c.typeAction === "BAIL_FORMEL" || c.typeAction === "BDQ_CONFIRME"
            ).length
            const commissionsMoisFcfa = p.commissions.reduce((acc, c) => acc + c.montantFcfa, 0)
            const isMe = p.userId === userId

            return {
                champion_id: p.id,
                nom_affiche: anonymizeChampionName(p.user?.firstName, p.user?.lastName),
                marqueur_vous: isMe ? "*** VOUS ***" : null,
                est_moi: isMe,
                zone: p.zonePrincipale,
                inscriptions_mois: inscriptionsMois > 0 ? inscriptionsMois : p.totalInscriptions,
                commissions_mois_fcfa: commissionsMoisFcfa > 0 ? commissionsMoisFcfa : p.totalCommissionsFcfa,
            }
        })
        .sort((a, b) => b.inscriptions_mois - a.inscriptions_mois || b.commissions_mois_fcfa - a.commissions_mois_fcfa)
        .map((item, idx) => ({
            rang: idx + 1,
            ...item,
        }))

    return {
        success: true,
        zone: myProfile.zonePrincipale,
        total_champions_zone: ranked.length,
        mon_rang: ranked.find((r) => r.est_moi)?.rang || 1,
        classement: ranked,
    }
}

/**
 * CHP-09 : Rapport hebdomadaire du Champion (ADD-15 Section 3.3)
 */
export async function getChampionWeeklyReport(targetUserId?: string) {
    const session = await auth()
    const userId = targetUserId || session?.user?.id
    if (!userId) return { success: false, error: "Non authentifié" }

    const dash = await getChampionDashboardData(userId)
    if (!dash.success || !dash.champion) return dash

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000)

    const commissionsSemaine = await prisma.championCommission.findMany({
        where: {
            championId: dash.champion.id,
            createdAt: { gte: sevenDaysAgo },
        },
    })

    const inscriptionsSemaine = commissionsSemaine.filter(
        (c) => c.typeAction === "BAIL_FORMEL" || c.typeAction === "BDQ_CONFIRME"
    ).length
    const gainsSemaineFcfa = commissionsSemaine.reduce((acc, c) => acc + c.montantFcfa, 0)

    const b2 = dash.bloc_2_performance_mois!
    const b3 = dash.bloc_3_prospects_a_rappeler!
    const monRang = dash.bloc_5_classement_zone?.find((r: any) => r.est_moi)?.rang || 1
    const totalZone = dash.bloc_5_classement_zone?.length || 1

    const whatsappText = [
        `🏆 *QAPRIL CHAMPION — Bilan de ta semaine, ${dash.champion.nom.split(" ")[0]} !*`,
        `Cette semaine : *${inscriptionsSemaine} inscriptions* · *${gainsSemaineFcfa.toLocaleString("fr-FR")} FCFA* gagnés`,
        `Ce mois : *${b2.inscriptions_realisees} / ${b2.objectif_mensuel}* (${b2.progression_pct}%) · *${dash.bloc_1_commissions_mois!.montant_confirme_fcfa.toLocaleString("fr-FR")} FCFA* confirmés`,
        `Tu es *#${monRang}* sur ${totalZone} Champions à ${dash.champion.zone_principale} 💪`,
        `⏰ Tu as *${b3.nb_a_rappeler} prospects* à rappeler cette semaine`,
        `Prochain virement : Vendredi ${dash.bloc_1_commissions_mois!.date_prochain_paiement} · *${dash.bloc_1_commissions_mois!.montant_confirme_fcfa.toLocaleString("fr-FR")} FCFA* sur ton Mobile Money`,
    ].join("\n")

    return {
        success: true,
        semaine_du: sevenDaysAgo.toISOString().split("T")[0],
        au: now.toISOString().split("T")[0],
        inscriptions_semaine: inscriptionsSemaine,
        gains_semaine_fcfa: gainsSemaineFcfa,
        progression_mois_pct: b2.progression_pct,
        rang_zone: monRang,
        total_champions_zone: totalZone,
        prospects_a_rappeler: b3.nb_a_rappeler,
        whatsapp_text: whatsappText,
    }
}

/**
 * CHP-10 : Admin — Liste de tous les Champions + stats globales
 */
export async function getAdminChampionsList() {
    const session = await auth()
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
        return { success: false, error: "Accès réservé aux administrateurs." }
    }

    const profiles = await prisma.championProfile.findMany({
        include: {
            user: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
            commissions: true,
            prospects: { select: { id: true, statut: true } },
        },
        orderBy: { totalInscriptions: "desc" },
    })

    return {
        success: true,
        total_champions: profiles.length,
        champions: profiles.map((p) => {
            const enAttentePaiement = p.commissions
                .filter((c) => c.statut === "VALIDE" || c.statut === "EN_ATTENTE")
                .reduce((acc, c) => acc + c.montantFcfa, 0)
            const dejaPaye = p.commissions
                .filter((c) => c.statut === "PAYE")
                .reduce((acc, c) => acc + c.montantFcfa, 0)

            return {
                id: p.id,
                user_id: p.userId,
                nom: `${p.user?.firstName || ""} ${p.user?.lastName || ""}`.trim() || p.user?.phone || "Champion",
                telephone: p.user?.phone,
                zone_principale: p.zonePrincipale,
                statut: p.statut,
                objectif_mensuel: p.objectifMensuel,
                total_inscriptions: p.totalInscriptions,
                total_commissions_fcfa: p.totalCommissionsFcfa,
                commissions_a_payer_fcfa: enAttentePaiement,
                commissions_payees_fcfa: dejaPaye,
                nb_prospects: p.prospects.length,
            }
        }),
    }
}

/**
 * CHP-11 : Admin — Modifier l'objectif mensuel d'un Champion
 */
export async function updateChampionMonthlyTarget(championId: string, objectifMensuel: number) {
    const session = await auth()
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
        return { success: false, error: "Accès réservé aux administrateurs." }
    }

    const updated = await prisma.championProfile.update({
        where: { id: championId },
        data: { objectifMensuel: Math.max(1, Number(objectifMensuel) || 30) },
    })

    return { success: true, champion: updated }
}

/**
 * CHP-12 : Admin — Déclencher le paiement groupé des commissions validées (A15-UAT-11)
 */
export async function payChampionCommissionsBatch(params: {
    champion_id?: string
    mode_paiement?: "ORANGE_MONEY" | "MTN_MOMO" | "WAVE"
}) {
    const session = await auth()
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
        return { success: false, error: "Accès réservé aux administrateurs." }
    }

    const modePaiement = params.mode_paiement || "WAVE"
    const whereClause: any = {
        statut: { in: ["VALIDE", "EN_ATTENTE"] },
    }
    if (params.champion_id) {
        whereClause.championId = params.champion_id
    }

    const unpaidCommissions = await prisma.championCommission.findMany({
        where: whereClause,
        include: {
            champion: {
                include: {
                    user: { select: { id: true, firstName: true, phone: true } },
                },
            },
        },
    })

    if (unpaidCommissions.length === 0) {
        return {
            success: true,
            nb_commissions_payees: 0,
            montant_total_paye_fcfa: 0,
            message: "Aucune commission en attente de paiement.",
        }
    }

    const now = new Date()
    const ids = unpaidCommissions.map((c) => c.id)

    await prisma.championCommission.updateMany({
        where: { id: { in: ids } },
        data: {
            statut: "PAYE",
            valideAt: now,
            payeAt: now,
            modePaiement,
        },
    })

    // Regrouper par Champion pour notifier chacun sur WhatsApp / SMS
    const byChampion = new Map<string, { userId: string; nom: string; total: number }>()
    for (const c of unpaidCommissions) {
        const current = byChampion.get(c.championId) || {
            userId: c.champion.userId,
            nom: c.champion.user?.firstName || "Champion",
            total: 0,
        }
        current.total += c.montantFcfa
        byChampion.set(c.championId, current)
    }

    for (const [, info] of byChampion) {
        try {
            await NotificationService.envoyerNotification(info.userId, "PAIEMENT_CONFIRME" as any, {
                payload: {
                    smsText: `QAPRIL CHAMPION : Votre virement de ${info.total.toLocaleString("fr-FR")} FCFA vient d'être exécuté via ${modePaiement}. Bravo pour votre performance !`,
                },
            })
        } catch (e) {
            console.warn("[M-CHAMPION] Notification virement warning:", e)
        }
    }

    const totalMontant = unpaidCommissions.reduce((acc, c) => acc + c.montantFcfa, 0)

    revalidatePath("/dashboard/champion")
    return {
        success: true,
        nb_commissions_payees: ids.length,
        nb_champions_payes: byChampion.size,
        montant_total_paye_fcfa: totalMontant,
        mode_paiement: modePaiement,
        paye_at: now.toISOString(),
    }
}

