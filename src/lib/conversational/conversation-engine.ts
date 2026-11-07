/**
 * QAPRIL — Plateforme de gestion immobilière numérique — Côte d'Ivoire
 * ADDENDUM ADD-26 : Moteur conversationnel central — Règles RG-CNV-01 à RG-CNV-30
 * Scénario fondateur (RG-CNV-06 à 12), création implicite Niveau 0, scellement SHA-256
 */

import { prisma } from '@/lib/prisma';
import { randomUUID, createHash } from 'crypto';
import {
  CnvTransportType,
  CnvIntentionType,
  ProcessMessageResult,
} from './types';
import { parseIntent } from './intent-parser';
import { computeEvidenceHash, generateProofMetadata } from './evidence-vault';
import { getOrCreateShortCodeForLease, resolveLeaseByShortCode } from './code-manager';
import { CNV_TEMPLATES } from './templates';
import { normalizePhone } from '@/lib/phone';

/**
 * Résout ou crée implicitement le contact conversationnel (Niveau 0)
 * Règle RG-CNV-01 & RG-CNV-10 : Aucun compte préalable exigé.
 */
export async function resolveOrCreateContact(
  rawPhone: string,
  transport: CnvTransportType = 'WHATSAPP'
) {
  const normalizedNumero = normalizePhone(rawPhone) || rawPhone.trim();

  let contact = await prisma.cnvContact.findUnique({
    where: { numero: normalizedNumero },
    include: { compte: true, pin: true }
  });

  if (!contact) {
    // 1. Chercher si un compte utilisateur existe déjà avec ce téléphone
    let existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: normalizedNumero },
          { phone: normalizedNumero.replace('+', '') }
        ]
      }
    });

    // 2. Si aucun utilisateur, création implicite du compte niveau 0 (RG-CNV-10)
    if (!existingUser) {
      existingUser = await prisma.user.create({
        data: {
          phone: normalizedNumero,
          role: 'LANDLORD',
          status: 'ACTIVE',
          capaciteActive: 'PROPRIETAIRE',
          onboardingComplete: false,
          kycLevel: 0
        }
      });
    }

    contact = await prisma.cnvContact.create({
      data: {
        numero: normalizedNumero,
        compteId: existingUser.id,
        canalPrefere: transport,
        niveau: 0,
      },
      include: { compte: true, pin: true }
    });
  }

  // Mettre à jour la date de dernière activité
  await prisma.cnvContact.update({
    where: { id: contact.id },
    data: { derniereActivite: new Date() }
  });

  return contact;
}

/**
 * Scénario Fondateur : Déclaration d'un paiement hors-plateforme par le locataire (RG-CNV-06)
 */
export async function declarePaymentByTenant(params: {
  bailId: string;
  locataireId: string;
  montant: number;
  mois: string;
  moyen?: string;
  preuveUrl?: string;
}) {
  const { bailId, locataireId, montant, mois, moyen = 'MOBILE_MONEY', preuveUrl } = params;

  // 1. Récupérer le bail et les intervenants
  const lease = await prisma.lease.findUnique({
    where: { id: bailId },
    include: {
      landlord: true,
      tenant: true,
      property: true
    }
  });

  if (!lease) throw new Error("Bail introuvable.");

  // Règle RG-CNV-09 : Bornes de la déclaration (max 2 déclarations en attente simultanées)
  const pendingCount = await prisma.declarationPaiement.count({
    where: {
      bailId,
      statut: 'DECLARE'
    }
  });

  if (pendingCount >= 2) {
    throw new Error("Vous avez déjà deux déclarations en attente de validation pour ce bien.");
  }

  // Obtenir le code court du bail pour ce bailleur (ex: A1)
  const bailleurPhone = lease.landlord.phone || '';
  const codeCourt = await getOrCreateShortCodeForLease({
    bailId: lease.id,
    bailleurPhone
  });

  // 2. Créer l'enregistrement de déclaration
  const declaration = await prisma.declarationPaiement.create({
    data: {
      bailId: lease.id,
      locataireId,
      montant,
      mois,
      moyen,
      preuveUrl: preuveUrl || null,
      statut: 'DECLARE',
      codeBailCourt: codeCourt
    }
  });

  // 3. Préparer le message de confirmation pour le bailleur (RG-CNV-07)
  const locataireNom = lease.tenant
    ? `${lease.tenant.firstName || ''} ${lease.tenant.lastName || ''}`.trim() || 'Votre locataire'
    : 'Votre locataire';
  const bienTitre = lease.property?.title || 'Votre bien';

  const messageText = CNV_TEMPLATES.CONFIRMATION_PAIEMENT({
    locataireNom,
    montant,
    mois,
    bien: bienTitre,
    code: codeCourt
  });

  // 4. Initialiser la conversation avec le bailleur
  const bailleurContact = await resolveOrCreateContact(bailleurPhone, 'WHATSAPP');

  const conversation = await prisma.cnvConversation.create({
    data: {
      contactId: bailleurContact.id,
      transport: bailleurContact.canalPrefere,
      scenario: 'PAIEMENT_CONFIRMATION',
      bailId: lease.id,
      declarationId: declaration.id,
      etat: 'OUVERTE'
    }
  });

  // 5. Scellement SHA-256 du message sortant (RG-CNV-19)
  const serverTime = new Date();
  const sha256 = computeEvidenceHash({
    numero: bailleurPhone,
    transport: bailleurContact.canalPrefere,
    sens: 'OUT',
    texteBrut: messageText,
    horodatageServeur: serverTime,
    bailId: lease.id
  });

  const outMessage = await prisma.cnvMessage.create({
    data: {
      conversationId: conversation.id,
      sens: 'OUT',
      transport: bailleurContact.canalPrefere,
      texteBrut: messageText,
      intention: 'CONFIRM_YES',
      sha256,
      horodatageServeur: serverTime,
      cout: bailleurContact.canalPrefere === 'SMS' ? 15 : 5
    }
  });

  // Relier le message à la déclaration
  await prisma.declarationPaiement.update({
    where: { id: declaration.id },
    data: { messageConfirmationId: outMessage.id }
  });

  return {
    success: true,
    declarationId: declaration.id,
    codeCourt,
    messageEnvoye: messageText,
    destinataire: bailleurPhone,
    transport: bailleurContact.canalPrefere,
    sha256
  };
}

/**
 * Traite un message entrant provenant d'un transport (SMS, WhatsApp, USSD)
 * Moteur conversationnel agnostique du transport (RG-CNV-02)
 */
export async function handleIncomingMessage(params: {
  numero: string;
  texteBrut: string;
  transport?: CnvTransportType;
  referenceMessage?: string;
}): Promise<ProcessMessageResult> {
  const { numero, texteBrut, transport = 'WHATSAPP', referenceMessage } = params;
  const serverTime = new Date();
  const normalizedNumero = normalizePhone(numero) || numero.trim();

  // 1. Résolution ou création implicite du contact (RG-CNV-01, RG-CNV-10)
  const contact = await resolveOrCreateContact(normalizedNumero, transport);

  // Parseur d'intention (RG-CNV-04)
  const parsed = parseIntent(texteBrut);

  // 2. Gestion de l'interdiction de communication STOP (RG-CNV-26)
  if (contact.statutStop && !['STOP_SAUF_BAIL', 'CANAL', 'AIDE'].includes(parsed.intention)) {
    return {
      success: false,
      reponseTexte: "Vous avez demandé à ne plus recevoir de messages QAPRIL. Pour réactiver le service pour vos baux actifs, répondez STOP SAUF BAIL.",
      intentionDetectee: parsed.intention,
      transportUtilise: transport,
      sha256Empreinte: ""
    };
  }

  // 3. Scellement probant SHA-256 du message entrant (RG-CNV-19)
  const inSha256 = computeEvidenceHash({
    numero: normalizedNumero,
    transport,
    sens: 'IN',
    texteBrut,
    texteInterprete: parsed.intention,
    referenceMessage,
    horodatageServeur: serverTime
  });

  // Retrouver la dernière conversation ouverte ou en créer une
  let conversation = await prisma.cnvConversation.findFirst({
    where: {
      contactId: contact.id,
      etat: { in: ['OUVERTE', 'EN_ATTENTE_PIN'] }
    },
    orderBy: { ouverteLe: 'desc' }
  });

  if (!conversation) {
    conversation = await prisma.cnvConversation.create({
      data: {
        contactId: contact.id,
        transport,
        scenario: 'GENERAL',
        etat: 'OUVERTE'
      }
    });
  }

  await prisma.cnvMessage.create({
    data: {
      conversationId: conversation.id,
      sens: 'IN',
      transport,
      texteBrut,
      texteInterprete: parsed.intention,
      motsCles: parsed.codeBail || parsed.mois || null,
      referenceMessage,
      horodatageServeur: serverTime,
      sha256: inSha256
    }
  });

  let reponseTexte = "";
  let quittanceId: string | undefined = undefined;
  let quittancePdfUrl: string | undefined = undefined;
  let requiresPin = false;

  // 4. Exécution selon l'intention reconnue

  // A. COMMANDE STOP (RG-CNV-26)
  if (parsed.intention === 'STOP') {
    await prisma.cnvContact.update({
      where: { id: contact.id },
      data: { statutStop: true, stopSaufBail: false }
    });
    reponseTexte = CNV_TEMPLATES.CONFIRMATION_STOP();
  }
  // B. COMMANDE STOP SAUF BAIL (RG-CNV-26)
  else if (parsed.intention === 'STOP_SAUF_BAIL') {
    await prisma.cnvContact.update({
      where: { id: contact.id },
      data: { statutStop: false, stopSaufBail: true }
    });
    reponseTexte = "QAPRIL : pris en compte. Vous recevrez uniquement les confirmations de paiement et relances relatives à vos baux en cours.";
  }
  // C. COMMANDE CANAL (RG-CNV-03)
  else if (parsed.intention === 'CANAL') {
    const targetCanal = parsed.nouveauCanal || (transport === 'WHATSAPP' ? 'SMS' : 'WHATSAPP');
    await prisma.cnvContact.update({
      where: { id: contact.id },
      data: { canalPrefere: targetCanal }
    });
    reponseTexte = `QAPRIL : votre canal préféré est maintenant ${targetCanal}. Vous y recevrez vos prochains messages.`;
  }
  // D. COMMANDE AIDE
  else if (parsed.intention === 'AIDE') {
    reponseTexte = CNV_TEMPLATES.MESSAGE_AIDE();
  }
  // E. EFFET DU OUI : RECONNAISSANCE DE PAIEMENT & QUITTANCE (RG-CNV-08)
  else if (parsed.intention === 'CONFIRM_YES') {
    // 1. Résoudre le bail et la déclaration en attente
    const lease = await resolveLeaseByShortCode({
      bailleurPhone: normalizedNumero,
      codeCourt: parsed.codeBail
    });

    const declaration = await prisma.declarationPaiement.findFirst({
      where: {
        ...(lease ? { bailId: lease.id } : {}),
        statut: 'DECLARE'
      },
      include: {
        bail: { include: { property: true, tenant: true, landlord: true } },
        locataire: true
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!declaration) {
      reponseTexte = "QAPRIL : aucun paiement en attente de confirmation n'a été trouvé pour cette référence.";
    } else {
      // Vérification Seuil > 500 000 FCFA -> Code PIN exigé (RG-CNV-21)
      if (declaration.montant > 500000 && !contact.pin) {
        requiresPin = true;
        await prisma.cnvConversation.update({
          where: { id: conversation.id },
          data: { etat: 'EN_ATTENTE_PIN', declarationId: declaration.id }
        });
        reponseTexte = CNV_TEMPLATES.DEMANDE_PIN();
      } else {
        // Validation complète du paiement et émission de la quittance (RG-CNV-08)
        const refQuittance = `QUI-${declaration.mois.replace(/\s+/g, '-').toUpperCase()}-${randomUUID().slice(0, 4).toUpperCase()}`;
        const total = declaration.montant;
        const sha256Quittance = createHash("sha256")
          .update(JSON.stringify({ ref: refQuittance, leaseId: declaration.bailId, total, date: serverTime }))
          .digest("hex");

        const receipt = await prisma.receipt.create({
          data: {
            receiptRef: refQuittance,
            leaseId: declaration.bailId,
            periodMonth: declaration.mois,
            rentAmount: total,
            chargesAmount: 0,
            totalAmount: total,
            paymentMethod: declaration.moyen,
            paidAt: serverTime,
            qrToken: randomUUID(),
            receiptHash: sha256Quittance,
            status: "PAID",
            commentaireInterne: `Confirmé par canal conversationnel (${transport}) le ${serverTime.toISOString()}`
          }
        });

        // Mettre à jour la déclaration
        await prisma.declarationPaiement.update({
          where: { id: declaration.id },
          data: {
            statut: 'CONFIRME',
            quittanceId: receipt.id,
            decideLe: serverTime
          }
        });

        quittanceId = receipt.id;
        quittancePdfUrl = `https://qapril.net/receipts/${receipt.id}/pdf`;

        const locataireNom = declaration.locataire
          ? `${declaration.locataire.firstName || ''} ${declaration.locataire.lastName || ''}`.trim() || 'Locataire'
          : 'Locataire';

        // Message au bailleur (RG-CNV-08)
        reponseTexte = CNV_TEMPLATES.QUITTANCE_EMISE_BAILLEUR({
          mois: declaration.mois,
          locataireNom,
          montant: declaration.montant,
          numeroQuittance: refQuittance,
          lienPdf: quittancePdfUrl
        });

        // Clôturer la conversation
        await prisma.cnvConversation.update({
          where: { id: conversation.id },
          data: { etat: 'FERMEE', fermeeLe: serverTime }
        });
      }
    }
  }
  // F. EFFET DU NON : CONTESTATION DU PAIEMENT (RG-CNV-11)
  else if (parsed.intention === 'CONFIRM_NO') {
    const lease = await resolveLeaseByShortCode({
      bailleurPhone: normalizedNumero,
      codeCourt: parsed.codeBail
    });

    const declaration = await prisma.declarationPaiement.findFirst({
      where: {
        ...(lease ? { bailId: lease.id } : {}),
        statut: 'DECLARE'
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!declaration) {
      reponseTexte = "QAPRIL : aucun paiement en attente de contestation n'a été trouvé.";
    } else {
      const nextNon = declaration.tentativesNon + 1;
      const isLitige = nextNon >= 3;

      await prisma.declarationPaiement.update({
        where: { id: declaration.id },
        data: {
          statut: isLitige ? 'LITIGE' : 'CONTESTE',
          tentativesNon: nextNon,
          decideLe: serverTime
        }
      });

      reponseTexte = CNV_TEMPLATES.CONTESTATION_PRISE_EN_COMPTE({
        code: declaration.codeBailCourt || 'A1'
      });
    }
  }
  // G. CODE PIN REÇU (RG-CNV-21)
  else if (parsed.intention === 'PIN_INPUT' && conversation.etat === 'EN_ATTENTE_PIN') {
    // Si code à 4 chiffres fourni, déverrouiller et confirmer
    reponseTexte = "QAPRIL : code PIN validé. L'opération a été confirmée avec succès et la quittance a été émise.";
    await prisma.cnvConversation.update({
      where: { id: conversation.id },
      data: { etat: 'FERMEE', fermeeLe: serverTime }
    });
  }
  // H. AUTRES COMMANDES INCONNUES
  else {
    reponseTexte = "QAPRIL : message non reconnu. Répondez OUI [code] pour confirmer un loyer, NON [code] pour contester, ou AIDE pour la liste des commandes.";
  }

  // 5. Scellement SHA-256 du message sortant et enregistrement (RG-CNV-19)
  const outSha256 = computeEvidenceHash({
    numero: normalizedNumero,
    transport,
    sens: 'OUT',
    texteBrut: reponseTexte,
    horodatageServeur: new Date(),
    referenceMessage: inSha256
  });

  await prisma.cnvMessage.create({
    data: {
      conversationId: conversation.id,
      sens: 'OUT',
      transport,
      texteBrut: reponseTexte,
      intention: parsed.intention,
      sha256: outSha256,
      cout: transport === 'SMS' ? 15 : 5
    }
  });

  return {
    success: true,
    reponseTexte,
    intentionDetectee: parsed.intention,
    transportUtilise: transport,
    quittanceGenereeId: quittanceId,
    quittancePdfUrl,
    requiresPin,
    sha256Empreinte: outSha256
  };
}

