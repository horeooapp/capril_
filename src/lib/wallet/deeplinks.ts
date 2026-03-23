import { prisma } from "@/lib/prisma";

export type Operator = "WAVE" | "ORANGE" | "MTN" | "MOOV";

/**
 * Génère un deep link de rechargement pour un opérateur et un montant donnés.
 */
export async function generateDeepLink(
  operator: Operator,
  amount: number,
  reference: string
): Promise<string> {
  // 1. Chercher la base d'URL dans config_tarifs
  const configKey = `wallet_deeplink_${operator.toLowerCase()}_base`;
  const config = await prisma.configTarif.findUnique({
    where: { cle: configKey }
  });

  // 3. Substitution des variables
  const baseUrlTemplate = config?.metadata || config?.valeur.toString() || "https://qapril.ci/recharger?montant={amt}&op={op}&ref={ref}";

  const result = baseUrlTemplate
    .replace(/{amt}/g, amount.toString())
    .replace(/{ref}/g, reference)
    .replace(/{op}/g, operator);

  return result;
}
