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
  const user = await prisma.user.findUnique({
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
  });

  if (!user) throw new Error("Utilisateur non trouvé");

  const soldeActuel = user.walletBalance;
  const nbBails = user._count.leasesAsLandlord;
  
  // Constantes (idéalement depuis ConfigTarif, mais ici en dur selon le CDC)
  const PRIX_QUITTANCE = 75; // FCFA
  const MOIS_COUVERTURE = 2; // Recommandé

  const besoinBrut = (nbBails * PRIX_QUITTANCE * MOIS_COUVERTURE) - soldeActuel;
  
  // Arrondi au 500 FCFA supérieur
  const vMinimum = Math.max(500, Math.ceil(besoinBrut / 500) * 500);
  
  const options: RechargeOptions = {
    minimum: vMinimum,
    recommande: Math.max(500, Math.ceil((vMinimum * 1.5) / 500) * 500),
    confort: nbBails > 50 ? 20000 : 5000,
  };

  return options;
}
