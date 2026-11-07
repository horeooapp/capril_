/**
 * QAPRIL — Plateforme de gestion immobilière numérique — Côte d'Ivoire
 * ADDENDUM ADD-26 — Règle RG-CNV-04 & RG-CNV-13 : Parseur d'intentions universel
 * Tolérant aux majuscules/minuscules, accents, espaces et abréviations
 */

import { ParsedIntent, CnvIntentionType, CnvTransportType } from './types';

/**
 * Normalise une chaîne de caractères en supprimant les accents et espaces multiples
 */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();
}

/**
 * Analyse le message brut d'un utilisateur et extrait l'intention et les paramètres
 */
export function parseIntent(rawText: string): ParsedIntent {
  if (!rawText || !rawText.trim()) {
    return { intention: 'INCONNU', rawText: '' };
  }

  const clean = normalizeText(rawText);
  const tokens = clean.split(/\s+/);
  const firstWord = tokens[0] || '';
  const secondWord = tokens[1] || '';

  // 1. Détection Code PIN (4 chiffres purs, RG-CNV-21)
  if (/^\d{4}$/.test(clean)) {
    return {
      intention: 'PIN_INPUT',
      pin: clean,
      rawText,
    };
  }

  // 2. Commande STOP et STOP SAUF BAIL (RG-CNV-26)
  if (clean === 'STOP SAUF BAIL') {
    return { intention: 'STOP_SAUF_BAIL', rawText };
  }
  if (firstWord === 'STOP') {
    return { intention: 'STOP', rawText };
  }

  // 3. Commande CANAL (RG-CNV-03)
  if (firstWord === 'CANAL') {
    let targetCanal: CnvTransportType | undefined;
    if (secondWord.includes('WHATSAPP') || secondWord === 'WA') targetCanal = 'WHATSAPP';
    else if (secondWord.includes('SMS')) targetCanal = 'SMS';
    else if (secondWord.includes('USSD')) targetCanal = 'USSD';

    return {
      intention: 'CANAL',
      nouveauCanal: targetCanal,
      rawText,
    };
  }

  // 4. Commande AIDE
  if (['AIDE', 'HELP', 'INFOS', 'INFO', '?'].includes(firstWord)) {
    return { intention: 'AIDE', rawText };
  }

  // 5. Scénario Fondateur : OUI [code] (RG-CNV-07, 08)
  if (firstWord === 'OUI' || firstWord === 'YES' || firstWord === 'OK' || clean === 'ACCEPTER') {
    return {
      intention: 'CONFIRM_YES',
      codeBail: secondWord || undefined,
      rawText,
    };
  }

  // 6. Scénario Fondateur : NON [code] (RG-CNV-07, 11)
  if (firstWord === 'NON' || firstWord === 'NO' || clean === 'REFUSER' || clean === 'CONTESTER') {
    return {
      intention: 'CONFIRM_NO',
      codeBail: secondWord || undefined,
      rawText,
    };
  }

  // 7. Relance et Plan d'apurement (RG-QUI-05 / ADD-24)
  if (firstWord === 'RELANCE') {
    return {
      intention: 'RELANCE',
      codeBail: secondWord || undefined,
      rawText,
    };
  }

  if (firstWord === 'PLAN') {
    return {
      intention: 'PLAN',
      codeBail: secondWord || undefined,
      rawText,
    };
  }

  // 8. Demande de quittance : QUIT [mois]
  if (firstWord === 'QUIT' || firstWord === 'QUITTANCE') {
    const mois = tokens.slice(1).join(' ') || undefined;
    return {
      intention: 'ASK_QUIT',
      mois,
      rawText,
    };
  }

  // 9. Attestation de résidence : ATTEST
  if (firstWord === 'ATTEST' || firstWord === 'ATTESTATION') {
    return { intention: 'ASK_ATTEST', rawText };
  }

  // 10. Signalement d'incident : SIGNAL
  if (firstWord === 'SIGNAL' || firstWord === 'INCIDENT') {
    return { intention: 'SIGNAL', rawText };
  }

  // 11. Préavis de congé : CONGE
  if (firstWord === 'CONGE' || firstWord === 'PREAVIS') {
    return { intention: 'CONGE', rawText };
  }

  // 12. Identification par photo : ID
  if (firstWord === 'ID' || firstWord === 'CNI' || firstWord === 'IDENTITE') {
    return { intention: 'ID_PHOTO', rawText };
  }

  // 13. Bail
  if (firstWord === 'BAIL' || firstWord === 'CONTRAT') {
    return { intention: 'BAIL_CREATE', rawText };
  }

  // 14. Enregistrement DGI (ADD-23)
  if (firstWord === 'DGI' || firstWord === 'FISCAL') {
    return { intention: 'DGI_REGISTER', rawText };
  }

  return {
    intention: 'INCONNU',
    rawText,
  };
}

