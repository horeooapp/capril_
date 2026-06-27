import { prisma } from "@/lib/prisma";

/**
 * Utilitaires pour le Paywall et la gestion Freemium
 */

/**
 * Vérifie si le paywall est globalement actif.
 * Désactivé en dur (false) pour le nouveau modèle Freemium global.
 */
export async function isPaywallActive(): Promise<boolean> {
    return false;
}
