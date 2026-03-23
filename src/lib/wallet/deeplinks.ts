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

  let baseUrl = config?.valeur.toString();

  // 2. Fallback si non trouvé
  if (!baseUrl) {
    const fallbackConfig = await prisma.configTarif.findUnique({
      where: { cle: "wallet_deeplink_fallback" }
    });
    baseUrl = fallbackConfig?.valeur.toString() || "https://qapril.ci/recharger?montant={amt}&op={op}&ref={ref}";
  }

  // 3. Substitution des variables
  // Note: On utilise des Regex pour remplacer toutes les occurrences
  const result = baseUrl
    .replace(/{amt}/g, amount.toString())
    .replace(/{ref}/g, reference)
    .replace(/{op}/g, operator);

  return result;
}
