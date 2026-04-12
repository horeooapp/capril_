"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { logAction } from "./audit"

export async function getSyndicates() {
    const session = await auth()
    if (!session?.user?.id) return []

    try {
        const data = await prisma.syndicate.findMany({
            include: { properties: true },
            orderBy: { createdAt: 'desc' }
        })
        return data
    } catch {
        return []
    }
}

export async function createSyndicate(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non autorisé" }

    const residenceName = formData.get("residenceName") as string
    const totalLots = parseInt(formData.get("totalLots") as string || "0")
    const treasuryBalance = parseInt(formData.get("treasuryBalance") as string || "0")
    const agState = formData.get("agState") as string

    if (!residenceName || totalLots <= 0) {
        return { error: "Nom ou nombre de lots invalides." }
    }

    try {
        await prisma.syndicate.create({
            data: {
                residenceName,
                totalLots,
                treasuryBalance,
                agState: agState || "Prévue"
            }
        })

        await logAction({
            action: "CREATE_SYNDICATE",
            module: "SYNDIC",
            entityId: session.user.id
        })

        revalidatePath("/dashboard/syndic")
        return { success: true }
    } catch (e) {
        return { error: "Erreur lors de l'enregistrement de la copropriété." }
    }
}

export async function dispatchMilliemes() {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non autorisé" }

    try {
        // Véritable moteur de tantièmes:
        // Pour chaque Syndicat en déficit (Trésorerie < 0), on ventile la dette sur les biens liés.
        const syndicates = await prisma.syndicate.findMany({
            where: { treasuryBalance: { lt: 0 } },
            include: { properties: { include: { leases: true } } }
        });

        if (syndicates.length === 0) {
            return { success: true, message: "Aucun appel de fonds nécessaire. Les trésoreries sont positives." }
        }

        let totalDispatched = 0;

        for (const syndic of syndicates) {
            if (syndic.properties.length === 0) continue;
            
            // Calculer la dette par lot au tantième égalitaire
            const detteParLot = Math.abs(syndic.treasuryBalance) / syndic.properties.length;
            
            for (const prop of syndic.properties) {
                // Créer une charge ou une notification d'appel de fonds
                if (prop.leases.length > 0) {
                    await prisma.chargeParametrage.create({
                        data: {
                            logementId: prop.id,
                            typeCharge: `Appel de fonds Exceptionnel - ${syndic.residenceName}`,
                            mode: "FORFAIT",
                            montantMensuel: detteParLot,
                            actif: true
                        }
                    });
                    totalDispatched++;
                }
            }

            // Remise à zéro virtuelle ou statut d'attente (simulation de l'émission des appels de charge)
            await prisma.syndicate.update({
                where: { id: syndic.id },
                data: { agState: "Appels émis" }
            });
        }

        await logAction({
            action: "DISPATCH_MILLIEMES",
            module: "SYNDIC",
            entityId: session.user.id
        })

        revalidatePath("/dashboard/syndic")
        return { success: true, message: `${totalDispatched} appels de fonds (tantièmes) générés avec succès.` }
    } catch (e) {
        console.error("Dispatch Error:", e);
        return { error: "Erreur technique de ventilation des tantièmes." }
    }
}

export async function linkPropertyToSyndicate(syndicateId: string, propertyId: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non autorisé" }

    try {
        await prisma.property.update({
            where: { id: propertyId },
            data: { syndicateId: syndicateId }
        });
        
        revalidatePath("/dashboard/syndic");
        return { success: true };
    } catch(e) {
        return { error: "Erreur lors de la liaison du lot." };
    }
}
