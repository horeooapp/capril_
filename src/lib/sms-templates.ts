/**
 * QAPRIL — Modèles SMS et WhatsApp Standardisés (Ticket D-03 / CDC IC-01-R1)
 *
 * Tous les modèles respectent strictement le lexique officiel (config/lexique.json) :
 * - Sujet « vous » ou « je », pas d'exclamation, pas de référence technique ni légale prohibée.
 * - Conformes aux règles de validation check_lexique.
 */

export interface InvitationBailleurParams {
  bailleur: string;
  locataire: string;
  logement: string;
  loyer: number | string;
  jour: number | string;
}

export interface ConfirmationPaiementParams {
  bailleur: string;
  locataire: string;
  mois: string;
  montant: number | string;
  moyen: string;
}

export interface RelanceLoyerJ3Params {
  locataire: string;
  mois: string;
  montant: number | string;
  logement: string;
  jour: number | string;
}

export interface RelanceLoyerJ7Params {
  locataire: string;
  mois: string;
  montant: number | string;
}

export interface RelanceLoyerJ15Params {
  locataire: string;
  mois: string;
  montant: number | string;
}

export interface QuittanceEmiseParams {
  locataire: string;
  mois: string;
  ref: string;
}

/**
 * Invitation du bailleur par le locataire (Section 3.1 & Ticket S-19 / D-03)
 * Choix 1/2/3 interactif par SMS ou WhatsApp
 */
export function formatInvitationBailleurSMS(params: InvitationBailleurParams): string {
  const montantStr = typeof params.loyer === "number" ? params.loyer.toLocaleString("fr-FR") : params.loyer;
  return `Bonjour ${params.bailleur}, ${params.locataire} vous déclare comme bailleur de : ${params.logement}, loyer ${montantStr} F avant le ${params.jour} de chaque mois. Répondez 1 si c'est votre locataire, 2 pour corriger le loyer, 3 si vous ne connaissez pas cette personne.`;
}

/**
 * Demande de confirmation d'un paiement déclaré (Ticket S-14 / D-03)
 * Choix 1/2 interactif
 */
export function formatConfirmationPaiementSMS(params: ConfirmationPaiementParams): string {
  const montantStr = typeof params.montant === "number" ? params.montant.toLocaleString("fr-FR") : params.montant;
  return `Bonjour ${params.bailleur}, ${params.locataire} déclare vous avoir payé son loyer de ${params.mois} (${montantStr} F via ${params.moyen}). Répondez 1 pour confirmer et émettre sa quittance, 2 si vous n'avez rien reçu.`;
}

/**
 * Relance loyer J+3 (Rappel amiable d'échéance)
 */
export function formatRelanceJ3SMS(params: RelanceLoyerJ3Params): string {
  const montantStr = typeof params.montant === "number" ? params.montant.toLocaleString("fr-FR") : params.montant;
  return `Bonjour ${params.locataire}, votre loyer de ${params.mois} (${montantStr} F pour ${params.logement}) était attendu le ${params.jour}. Vous pouvez le régler en ligne sur QAPRIL ou déclarer votre paiement s'il est déjà effectué.`;
}

/**
 * Relance loyer J+7 (Deuxième rappel)
 */
export function formatRelanceJ7SMS(params: RelanceLoyerJ7Params): string {
  const montantStr = typeof params.montant === "number" ? params.montant.toLocaleString("fr-FR") : params.montant;
  return `Bonjour ${params.locataire}, sauf erreur de notre part, votre loyer de ${params.mois} (${montantStr} F) n'est pas encore confirmé. Merci de procéder au règlement ou de déclarer votre paiement sur l'application QAPRIL.`;
}

/**
 * Relance loyer J+15 (Mise en demeure amiable de régularisation)
 */
export function formatRelanceJ15SMS(params: RelanceLoyerJ15Params): string {
  const montantStr = typeof params.montant === "number" ? params.montant.toLocaleString("fr-FR") : params.montant;
  return `Bonjour ${params.locataire}, le loyer de ${params.mois} (${montantStr} F) accuse un retard de 15 jours. Merci de régulariser votre situation sans délai sur QAPRIL ou de contacter votre bailleur.`;
}

/**
 * Notification de mise à disposition de quittance
 */
export function formatQuittanceEmiseSMS(params: QuittanceEmiseParams): string {
  return `Bonjour ${params.locataire}, votre quittance de ${params.mois} est disponible. Référence : ${params.ref}. Vérifiable sur qapril.ci/verifier.`;
}
