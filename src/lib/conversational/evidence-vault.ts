/**
 * QAPRIL — Plateforme de gestion immobilière numérique — Côte d'Ivoire
 * ADDENDUM ADD-26 — Règle RG-CNV-19 : Coffre-fort de preuves et scellement SHA-256
 * Conforme à la Loi n° 2013-546 sur les transactions électroniques et l'article 1315 du Code civil
 */

import * as crypto from 'crypto';

export interface EvidenceRecordPayload {
  numero: string;
  transport: string;
  sens: 'IN' | 'OUT';
  texteBrut: string;
  texteInterprete?: string;
  referenceMessage?: string;
  horodatageServeur: Date;
  bailId?: string;
}

/**
 * Calcule l'empreinte cryptographique SHA-256 inaltérable d'un échange conversationnel
 */
export function computeEvidenceHash(payload: EvidenceRecordPayload): string {
  const canonicalString = [
    payload.numero,
    payload.transport.toUpperCase(),
    payload.sens,
    payload.texteBrut.trim(),
    payload.texteInterprete?.trim() || '',
    payload.referenceMessage || '',
    payload.horodatageServeur.toISOString(),
    payload.bailId || '',
  ].join('|');

  return crypto.createHash('sha256').update(canonicalString, 'utf8').digest('hex');
}

/**
 * Génère le bloc de certification probante pour la quittance ou l'export de litige
 */
export function generateProofMetadata(params: {
  numero: string;
  transport: string;
  hash: string;
  horodatage: Date;
  bailId: string;
  montant: number;
  terme: string;
}) {
  return {
    loiApplicable: "Loi n° 2013-546 de la République de Côte d'Ivoire",
    natureActe: "Reconnaissance de paiement électronique (Art. 1315 Code civil)",
    canal: params.transport,
    signataire: params.numero,
    horodatageUTC: params.horodatage.toISOString(),
    empreinteSHA256: params.hash,
    bailReference: params.bailId,
    montantValideFCFA: params.montant,
    terme: params.terme,
    plateforme: "QAPRIL — Infrastructure Numérique Immobilière CI",
  };
}

