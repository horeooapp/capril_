import { prisma } from "@/lib/prisma";

export interface RechargeOptions {
  minimum: number;
  recommande: number;
  confort: number;
}

/**
 * Calcule le montant suggeré pour recharger le wallet d'un propriétaire.
 * Formule: (nb_bails * prix_quittance * mois_couverture) - solde_actuel
 */
export async function calculateSuggestedRecharge(userId: string): Promise<RechargeOptions> {
  const [user, configs] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        walletBalance: true,
        _count: {
          select: {
            leasesAsLandlord: {
              where: { status: "ACTIVE" }
            }
          }
        }
      }
    }),
    prisma.configTarif.findMany({
      where: {
        cle: { in: ["quittance_ttc", "wallet_mois_couverture"] }
      }
    })
  ]);

  if (!user) throw new Error("Utilisateur non trouvé");

  const soldeActuel = user.walletBalance || 0;
  const nbBails = user._count.leasesAsLandlord;
  
  // Constantes depuis ConfigTarif (ADD-07 v3)
  const PRIX_QUITTANCE = configs.find(c => c.cle === "quittance_ttc")?.valeur || 75;
  const MOIS_COUVERTURE = configs.find(c => c.cle === "wallet_mois_couverture")?.valeur || 2;

  const besoinBrut = (nbBails * PRIX_QUITTANCE * MOIS_COUVERTURE) - soldeActuel;
  
  // Arrondi au 500 FCFA supérieur (Strategie Zéro Friction)
  const vMinimum = Math.max(500, Math.ceil(besoinBrut / 500) * 500);
  
  // Options suggérées selon le profil
  const options: RechargeOptions = {
    minimum: vMinimum,
    recommande: Math.max(vMinimum + 500, Math.ceil((vMinimum * 1.5) / 500) * 500),
    confort: Math.max(vMinimum + 2500, nbBails > 20 ? 10000 : 5000),
  };

  return options;
}
