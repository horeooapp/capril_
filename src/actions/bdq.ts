"use server"

import { prisma as db } from "@/lib/prisma"
import { TypeBail } from "@prisma/client"
import { revalidatePath } from "next/cache"

/**
 * QAPRIL - Bail Déclaratif QAPRIL (BDQ)
 * Permet de formaliser une location verbale via consentement SMS bipartite.
 */

export async function createBailDeclaratif(data: {
    propertyId: string
    landlordId: string
    tenantName: string
    tenantPhone: string
    rentAmount: number
    startDate: Date
}) {
    try {
        // 1. Création du bail en mode DECLARATIF_BDQ
        const bail = await db.lease.create({
            data: {
                propertyId: data.propertyId,
                landlordId: data.landlordId,
                rentAmount: data.rentAmount,
                startDate: data.startDate,
                durationMonths: 12, // Par défaut selon loi ivoirienne
                typeBail: TypeBail.DECLARATIF_BDQ,
                status: "DRAFT",
                leaseReference: `BDQ-${Date.now()}`,
                commercialData: {
                    tenantName: data.tenantName,
                    tenantPhone: data.tenantPhone,
                    isDeclarative: true
                }
            }
        })

        // 2. Simulation d'envoi SMS (Logiciel SMS à brancher)
        console.log(`[SMS-BDQ] Envoi à ${data.tenantPhone} : "Confirmez-vous occuper le logement à ${data.rentAmount} FCFA ? Répondez OUI au 8080."`)

        revalidatePath("/dashboard/properties")
        return { success: true, bailId: bail.id }
    } catch (error) {
        console.error("BDQ_ERROR:", error)
        return { success: false, error: "Échec de l'initialisation du bail déclaratif." }
    }
}

export async function confirmBailDeclaratif(phone: string) {
    try {
        // Recherche du dernier bail BDQ en attente pour ce numéro
        const bail = await db.lease.findFirst({
            where: {
                commercialData: {
                    path: ["tenantPhone"],
                    equals: phone
                },
                typeBail: TypeBail.DECLARATIF_BDQ,
                confirmationLocataireSms: false
            }
        })

        if (!bail) return { success: false, error: "Aucun bail en attente de confirmation." }

        await db.lease.update({
            where: { id: bail.id },
            data: {
                confirmationLocataireSms: true,
                confirmationLocataireAt: new Date(),
                status: "PENDING_DEPOSIT" // Étape suivante : caution CDC
            }
        })

        return { success: true }
    } catch (error) {
        return { success: false, error: "Erreur lors de la confirmation." }
    }
}
