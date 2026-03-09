"use server"

import { auth } from "@/auth"
import { getCommuneMarketReport, computeCommunalStats } from "@/lib/observatory"
import { Role } from "@prisma/client"

/**
 * Part 17.3: Get Public Market Data for a Commune
 * Accessible publicly for prospective tenants and landlords.
 */
export async function getMarketReport(commune: string) {
    try {
        const report = await getCommuneMarketReport(commune);
        return { success: true, report };
    } catch (error) {
        return { error: "Impossible de récupérer les données de marché." };
    }
}

/**
 * Part 17.4: Refresh Communal Stats (Admin / After Lease Signing)
 */
export async function refreshObservatory(commune: string, propertyType: string) {
    const session = await auth();
    const authorizedRoles: Role[] = [Role.ADMIN, Role.ANAH_AGENT];

    if (!session?.user || !authorizedRoles.includes(session.user.role as Role)) {
        throw new Error("Action réservée aux administrateurs ANAH.");
    }

    try {
        const snapshot = await computeCommunalStats(commune, propertyType);
        if (!snapshot) return { error: "Données insuffisantes (3 baux actifs minimum requis)." };
        return { success: true, snapshot };
    } catch (error: any) {
        return { error: error.message || "Échec du calcul des statistiques." };
    }
}
