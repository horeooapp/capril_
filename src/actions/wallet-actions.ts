"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { logAction } from "./audit"
import { calculateSuggestedRecharge } from "@/lib/wallet/calculator"

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
            balance: user.walletBalance,
            operateur: user.walletOperateurPrefere || "WAVE",
            canal: user.walletCanalAlertePref || "WHATSAPP",
            seuil: user.walletSeuilAlerte || 500,
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
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                walletOperateurPrefere: data.operateur,
                walletCanalAlertePref: data.canal,
                walletSeuilAlerte: data.seuil
            }
        });

        if (data.rappelActif !== undefined || data.rappelJour !== undefined) {
            await prisma.walletRechargeConfig.upsert({
                where: { userId: session.user.id },
                update: {
                    rappelActif: data.rappelActif,
                    jourDuMois: data.rappelJour
                },
                create: {
                    userId: session.user.id,
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
