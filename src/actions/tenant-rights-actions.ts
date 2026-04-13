"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Role, MaintenanceStatus, MaintenanceCategory, SignalCatEnum, SignalStatutEnum, PreavisStatutEnum } from "@prisma/client"
import { serializeObject } from "@/lib/serialize"
import { sendSMS } from "@/lib/sms"
import { revalidatePath } from "next/cache"

/**
 * Récupère l'historique complet des demandes du locataire (Maintenance, Signalements, Préavis, Réclamations)
 */
export async function getTenantRightsHistory() {
    try {
        const session = await auth()
        if (!session?.user?.id) return serializeObject({ success: false, error: "Non authentifié" })

        const userId = session.user.id

        // On récupère tout en parallèle
        const [tickets, signalements, preavis, reclamations] = await Promise.all([
            prisma.ticketMaintenance.findMany({
                where: { locataireId: userId },
                include: { logement: { select: { name: true, address: true } } },
                orderBy: { dateSignalement: "desc" }
            }),
            prisma.signalementLocataire.findMany({
                where: { locataireId: userId },
                orderBy: { createdAt: "desc" }
            }),
            prisma.preavisBail.findMany({
                where: { locataireId: userId },
                orderBy: { createdAt: "desc" }
            }),
            prisma.reclamationLocataire.findMany({
                where: { tenantId: userId },
                orderBy: { createdAt: "desc" }
            })
        ])

        // Normalisation pour l'affichage unifié
        const history = [
            ...tickets.map(t => ({
                id: t.id,
                type: "MAINTENANCE",
                title: `Maintenance : ${t.categorie}`,
                date: t.dateSignalement,
                status: t.statut,
                description: t.description
            })),
            ...signalements.map(s => ({
                id: s.id,
                type: "SIGNALEMENT",
                title: `Signalement : ${s.categorie}`,
                date: s.createdAt,
                status: s.statut,
                description: s.description
            })),
            ...preavis.map(p => ({
                id: p.id,
                type: "PREAVIS",
                title: "Préavis de départ",
                date: p.dateDeclaration,
                status: p.statut,
                description: `Départ prévu le ${p.dateDepartPrevue.toLocaleDateString()}`
            })),
            ...reclamations.map(r => ({
                id: r.id,
                type: "RECLAMATION",
                title: `Réclamation : ${r.typeReclamation}`,
                date: r.createdAt,
                status: r.statut,
                description: r.description
            }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        return serializeObject({ success: true, data: history })
    } catch (error: any) {
        console.error("[GET_TENANT_RIGHTS_HISTORY_ERROR]", error)
        return serializeObject({ success: false, error: "Erreur lors de la récupération de l'historique" })
    }
}

/**
 * Soumet une nouvelle demande locataire
 */
export async function submitTenantRightRequest(payload: {
    type: "MAINTENANCE" | "SIGNALEMENT" | "PREAVIS" | "RECLAMATION",
    leaseId: string,
    data: any
}) {
    try {
        const session = await auth()
        if (!session?.user?.id) return serializeObject({ success: false, error: "Non authentifié" })

        const userId = session.user.id

        // Vérification du bail et de l'accès
        const lease = await prisma.lease.findFirst({
            where: { id: payload.leaseId, tenantId: userId },
            include: { landlord: true }
        })

        if (!lease) return serializeObject({ success: false, error: "Bail introuvable ou accès refusé" })

        let result: any = null

        switch (payload.type) {
            case "MAINTENANCE":
                result = await prisma.ticketMaintenance.create({
                    data: {
                        leaseId: lease.id,
                        locataireId: userId,
                        logementId: lease.propertyId,
                        categorie: payload.data.categorie || MaintenanceCategory.AUTRE,
                        description: payload.data.description,
                        urgence: payload.data.urgence || "NORMALE",
                        ticketRef: `MAI-${Date.now().toString().slice(-4)}`
                    }
                })
                break
            
            case "SIGNALEMENT":
                result = await prisma.signalementLocataire.create({
                    data: {
                        bailId: lease.id,
                        locataireId: userId,
                        categorie: payload.data.categorie || SignalCatEnum.AUTRE,
                        description: payload.data.description,
                        urgence: payload.data.urgence || "NORMAL"
                    }
                })
                break

            case "PREAVIS":
                result = await prisma.preavisBail.create({
                    data: {
                        bailId: lease.id,
                        locataireId: userId,
                        dateDepartPrevue: new Date(payload.data.dateDepart),
                        motif: payload.data.motif,
                        statut: PreavisStatutEnum.EMIS
                    }
                })
                break

            case "RECLAMATION":
                // Choix : Rappel Simple vs Litige Formel
                if (payload.data.isFormal) {
                    result = await prisma.reclamationLocataire.create({
                        data: {
                            leaseId: lease.id,
                            tenantId: userId,
                            typeReclamation: payload.data.subType || "QUITTANCE",
                            description: payload.data.description,
                            dateEcheance: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // J+7 par défaut
                            statut: "OUVERT"
                        }
                    })
                } else {
                    // Rappel Simple : Notification par SMS au bailleur
                    if (lease.landlord.phone) {
                        await sendSMS({
                            to: lease.landlord.phone,
                            message: `[QAPRIL] Rappel de votre locataire : ${payload.data.description}. Veuillez régulariser la situation sur votre espace bailleur.`
                        })
                    }
                    result = { success: true, message: "Rappel envoyé au bailleur" }
                }
                break
        }

        revalidatePath("/mon-espace-locataire/rights")
        return serializeObject({ success: true, data: result })
    } catch (error: any) {
        console.error("[SUBMIT_TENANT_RIGHT_REQUEST_ERROR]", error)
        return serializeObject({ success: false, error: "Erreur lors de la soumission de la demande" })
    }
}
