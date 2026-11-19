/** Fichier sans dépendance serveur : il est aussi importé par l'écran. */

/**
 * Modes de paiement. Les codes sont ceux déjà utilisés par la saisie manuelle de quittance.
 * Dans tous les cas l'argent a été reçu directement par le bailleur, hors plateforme QAPRIL.
 */
export const MODES_PAIEMENT: { code: string; libelle: string; reference: boolean }[] = [
  { code: "WAVE", libelle: "Wave", reference: true },
  { code: "ORANGE_MONEY", libelle: "Orange Money", reference: true },
  { code: "MTN_MOMO", libelle: "MTN MoMo", reference: true },
  { code: "MOOV_MONEY", libelle: "Moov Money", reference: true },
  { code: "CASH", libelle: "Espèces", reference: false },
  { code: "BANK_TRANSFER", libelle: "Virement", reference: true },
  { code: "CHEQUE", libelle: "Chèque", reference: true },
];
export const ALIAS_MODES: Record<string, string> = { ESPECES: "CASH", VIREMENT: "BANK_TRANSFER", ORANGE: "ORANGE_MONEY", MTN: "MTN_MOMO", MOOV: "MOOV_MONEY" };

export function libelleModePaiement(code: string | null | undefined): string {
  const c = ALIAS_MODES[String(code || "").toUpperCase()] || String(code || "").toUpperCase();
  return MODES_PAIEMENT.find((m) => m.code === c)?.libelle || String(code || "");
}
