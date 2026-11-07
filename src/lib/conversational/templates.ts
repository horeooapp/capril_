/**
 * QAPRIL — Plateforme de gestion immobilière numérique — Côte d'Ivoire
 * ADDENDUM ADD-26 — Section 10 : Textes et modèles normatifs de référence
 * Strictement conformes à la spécification (SMS max 160 car./segment, sans abréviations opaques)
 */

export const CNV_TEMPLATES = {
  // 1. Scénario Fondateur : Confirmation de paiement (RG-CNV-07)
  CONFIRMATION_PAIEMENT: (p: {
    locataireNom: string;
    montant: string | number;
    mois: string;
    bien: string;
    code: string;
  }) =>
    `QAPRIL : ${p.locataireNom} déclare vous avoir payé ${Number(p.montant).toLocaleString('fr-FR')} F pour le loyer de ${p.mois}, ${p.bien}. Répondez OUI ${p.code} pour émettre sa quittance, NON ${p.code} pour contester.`,

  // 2. Premier contact (RG-CNV-10, RG-CNV-25)
  PREMIER_CONTACT: (p: { cguUrl?: string }) =>
    `Votre locataire vous a inscrit sur QAPRIL pour recevoir ses quittances. QAPRIL ne demande jamais de code ni d'argent par message. Répondez STOP pour ne plus recevoir de messages.`,

  // 3. Quittance émise — Notification Bailleur (RG-CNV-08)
  QUITTANCE_EMISE_BAILLEUR: (p: {
    mois: string;
    locataireNom: string;
    montant: string | number;
    numeroQuittance: string;
    lienPdf: string;
  }) =>
    `QAPRIL : quittance de ${p.mois} émise pour ${p.locataireNom}, ${Number(p.montant).toLocaleString('fr-FR')} F, n° ${p.numeroQuittance}. Elle lui a été envoyée. Voir : ${p.lienPdf}`,

  // 4. Quittance émise — Notification Locataire (RG-CNV-08)
  QUITTANCE_EMISE_LOCATAIRE: (p: {
    mois: string;
    montant: string | number;
    lienPdf: string;
  }) =>
    `QAPRIL : votre quittance de ${p.mois} (${Number(p.montant).toLocaleString('fr-FR')} F) est disponible : ${p.lienPdf}. Conservez ce SMS, la quittance porte une empreinte numérique.`,

  // 5. Paiement partiel (ADD-24 / RG-CNV-08)
  PAIEMENT_PARTIEL: (p: {
    locataireNom: string;
    montantDeclare: string | number;
    montantDu: string | number;
    termes: string;
    bien: string;
    code: string;
    solde: string | number;
  }) =>
    `QAPRIL : ${p.locataireNom} déclare ${Number(p.montantDeclare).toLocaleString('fr-FR')} F sur ${Number(p.montantDu).toLocaleString('fr-FR')} F dus (${p.termes}), ${p.bien}. Répondez OUI ${p.code} pour accepter (quittance + reçu d'acompte, solde ${Number(p.solde).toLocaleString('fr-FR')} F), PLAN ${p.code} pour un échéancier, NON ${p.code} pour refuser.`,

  // 6. Relance proposée (RG-QUI-05 / RG-CNV-12)
  RELANCE_PROPOSEE: (p: {
    locataireNom: string;
    mois: string;
    montant: string | number;
    bien: string;
    code: string;
  }) =>
    `QAPRIL : ${p.locataireNom} n'a pas payé ${p.mois} (${Number(p.montant).toLocaleString('fr-FR')} F), ${p.bien}, J+7. Un rappel automatique lui a été envoyé. Répondez PLAN ${p.code} pour proposer un échéancier.`,

  // 7. Rappel sans réponse (RG-CNV-12)
  RAPPEL_SANS_REPONSE: (p: {
    locataireNom: string;
    mois: string;
    montant: string | number;
    code: string;
  }) =>
    `QAPRIL : rappel — ${p.locataireNom} attend la confirmation de son paiement de ${p.mois} (${Number(p.montant).toLocaleString('fr-FR')} F). Répondez OUI ${p.code} ou NON ${p.code}.`,

  // 8. Demande d'identification (RG-CNV-16 Niveau 1)
  DEMANDE_ID: (p: { lienWeb: string; whatsappNum: string }) =>
    `QAPRIL : pour activer les relances automatiques et le récapitulatif mensuel, envoyez la photo de votre pièce d'identité sur WhatsApp au ${p.whatsappNum} ou ouvrez ${p.lienWeb}. Facultatif.`,

  // 9. Exigence Code PIN (RG-CNV-21)
  DEMANDE_PIN: () =>
    `QAPRIL : cette opération engage plus de 500 000 F. Répondez avec votre code à 4 chiffres. Jamais de code demandé par appel ou par un autre numéro.`,

  // 10. Contestation prise en compte (RG-CNV-11)
  CONTESTATION_PRISE_EN_COMPTE: (p: { code: string }) =>
    `QAPRIL : votre contestation est enregistrée. Le locataire en est informé et peut fournir un justificatif (Mobile Money, reçu). Vous serez notifié dès réception.`,

  // 11. Confirmation STOP (RG-CNV-26)
  CONFIRMATION_STOP: () =>
    `QAPRIL : vous ne recevrez plus de messages. Pour continuer à recevoir uniquement les confirmations de vos baux en cours, répondez STOP SAUF BAIL.`,

  // 12. Message d'aide
  MESSAGE_AIDE: () =>
    `QAPRIL Aide : Répondez OUI [code] pour valider un paiement, NON [code] pour contester, QUIT [mois] pour recevoir une quittance, CANAL pour changer de support, STOP pour vous désabonner. QAPRIL ne demande jamais d'argent par message.`,
};

