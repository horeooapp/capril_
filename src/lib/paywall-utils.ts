import { prisma } from "@/lib/prisma";

/**
 * Utilitaires pour le Paywall et la gestion Freemium
 */

/**
 * Vérifie si le paywall est globalement actif.
 * S'il est désactivé via le FeatureFlag 'PAYWALL', on retourne false.
 */
export async function isPaywallActive(): Promise<boolean> {
    try {
        const flag = await prisma.featureFlag.findUnique({
            where: { name: 'paywall_actif' }
        });
        
        // Si le flag existe et est à false, le paywall est désactivé (mode freemium)
        if (flag && flag.enabled === false) {
            return false;
        }

        return true;
    } catch (e) {
        console.error("Erreur de lecture du FeatureFlag paywall:", e);
        return true; // Actif par défaut en cas d'erreur
    }
}
