import { prisma } from "@/lib/prisma";

export type Operator = "WAVE" | "ORANGE" | "MTN" | "MOOV";

/**
 * Génère un deep link de rechargement pour un opérateur et un montant donnés.
 * ADD-07 v3 : Supporte Wave, Orange Money, MTN et Moov via ConfigTarif.
 */
export async function generateDeepLink(
  operator: Operator,
  amount: number,
  reference: string
): Promise<string> {
  // 1. Chercher la base d'URL dans config_tarifs
  const configKey = `wallet_deeplink_${operator.toLowerCase()}_base`;
  const fallbackKey = `wallet_deeplink_fallback`;

  const configs = await prisma.configTarif.findMany({
    where: {
      cle: { in: [configKey, fallbackKey] }
    }
  });

  const operatorConfig = configs.find(c => c.cle === configKey);
  const fallbackConfig = configs.find(c => c.cle === fallbackKey);

  // 2. Sélectionner le template (Priorité : Opérateur > Fallback > Hardcoded)
  const template = operatorConfig?.metadata || fallbackConfig?.metadata || "https://qapril.ci/recharger?montant={amt}&op={op}&ref={ref}";

  // 3. Substitution des variables
  const result = template
    .replace(/{amt}/g, amount.toString())
    .replace(/{ref}/g, encodeURIComponent(reference))
    .replace(/{op}/g, operator);

  return result;
}
