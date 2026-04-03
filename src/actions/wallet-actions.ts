"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { logAction } from "./audit"
import { calculateSuggestedRecharge } from "@/lib/wallet/calculator"
import { genererDeepLink } from "./wallet.actions"

/**
 * [WDL-05] Récupère le profil complet du wallet pour l'UI (ADD-07 v3).
 */
export async function getWalletProfile() {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.id) return null;

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                walletConfig: true,
                walletRechargeConfig: true,
                walletRechargeLinks: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                },
                _count: {
                    select: { leasesAsLandlord: { where: { status: 'ACTIVE' } } }
                }
            }
        });

        if (!user) return null;

        // Calculer les suggestions de recharge (ADD-07 v3)
        const suggestions = await calculateSuggestedRecharge(user.id);

        return {
            balance: user?.walletConfig?.walletBalance || 0,
            operateur: user?.walletRechargeConfig?.operateurPrefere || "WAVE",
            canal: user?.walletRechargeConfig?.canalPrefere || "WHATSAPP",
            seuil: user?.walletRechargeConfig?.montantFixe || 500,
            rappel: user.walletRechargeConfig,
            recentLinks: user.walletRechargeLinks,
            suggestions,
            nbBails: user._count.leasesAsLandlord
        };
    } catch (error) {
        console.error("[GET_WALLET_PROFILE_ERROR]", error);
        return null;
    }
}

/**
 * [WDL-06] Met à jour les préférences de recharge auto (ADD-07 v3).
 */
export async function updateWalletPreferences(data: {
    operateur?: string,
    canal?: string,
    seuil?: number,
    rappelActif?: boolean,
    rappelJour?: number
}) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) return { error: "Non autorisé" };

    try {
        if (data.operateur !== undefined || data.canal !== undefined || data.seuil !== undefined || data.rappelActif !== undefined || data.rappelJour !== undefined) {
            await prisma.walletRechargeConfig.upsert({
                where: { userId: session.user.id },
                update: {
                    operateurPrefere: data.operateur,
                    canalPrefere: data.canal,
                    montantFixe: data.seuil,
                    rappelActif: data.rappelActif,
                    jourDuMois: data.rappelJour
                },
                create: {
                    userId: session.user.id,
                    operateurPrefere: data.operateur || "WAVE",
                    canalPrefere: data.canal || "WHATSAPP",
                    montantFixe: data.seuil,
                    rappelActif: data.rappelActif || false,
                    jourDuMois: data.rappelJour || 1
                }
            });
        }

        revalidatePath("/dashboard/wallet");
        return { success: true };
    } catch (e) {
        console.error("[WALLET PREFS] Erreur:", e);
        return { error: "Erreur lors de la mise à jour des préférences" };
    }
}

/**
 * [WDL-07] Appelé par le tiroir de recharge (RechargeDrawer) pour instancier le lien de paiement.
 */
export async function processRechargeLink(amount: number, operator: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non autorisé");
    
    // Génère le deep link à partir du dictionnaire des opérateurs
    const { url, ref } = await genererDeepLink(session.user.id, operator as any, amount);
    
    return { url, ref };
}

