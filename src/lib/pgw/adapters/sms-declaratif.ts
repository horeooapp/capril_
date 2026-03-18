import { prisma } from "@/lib/prisma";
import { PgwAdapter, PaymentInitiateRequest, PaymentInitiateResponse } from "./base";
import { PaymentPgwStatus } from "@prisma/client";

/**
 * SMS Declaratif Adapter (Sprint 1 Pilot)
 * Fonctionne sans API opérateur : confirmation manuelle par le propriétaire.
 */
export class SMSDeclaratifAdapter extends PgwAdapter {
  async initiate(req: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 2); // Expiration J+2

    // Récupérer le bailleur et son téléphone
    const lease = await prisma.lease.findUnique({
      where: { id: req.leaseId },
      include: { landlord: { select: { phone: true } } }
    });

    if (!lease?.landlord?.phone) {
      throw new Error("Numéro de téléphone du bailleur introuvable.");
    }

    // Créer l'enregistrement de paiement
    const payment = await prisma.paymentPgw.create({
      data: {
        leaseId: req.leaseId,
        payeurId: req.payeurId,
        beneficiaireId: req.beneficiaireId || lease.landlordId,
        montant: req.montant,
        moisConcerne: req.mois,
        canal: "SMS_DECLARATIF",
        msisdnPayeur: req.msisdnPayeur,
        msisdnBeneficiaire: lease.landlord.phone,
        statut: "EN_ATTENTE_PAIEMENT",
        refInterne: `QAPRIL-SMS-${req.leaseId}-${req.mois.getTime()}`,
        expiresAt: expiresAt,
      },
    });

    // TODO: Intégration SMS Gateway (Infobip) pour envoyer le SMS au propriétaire :
    // "QAPRIL : [PRENOM_LOCATAIRE] a-t-il payé son loyer de [MONTANT] FCFA ce mois ? Répondez OUI ou NON"
    console.log(`[PGW] SMS de demande envoyé au bailleur (${lease.landlord.phone}) pour le paiement ${payment.id}`);

    return {
      paymentId: payment.id,
      status: payment.statut as PaymentPgwStatus,
      smsSent: true,
      expiresAt: expiresAt,
    };
  }

  /**
   * Appelé quand le propriétaire répond OUI par SMS
   */
  async confirm(paymentId: string) {
    return await prisma.paymentPgw.update({
      where: { id: paymentId },
      data: {
        statut: "CONFIRMEE", // Ou DECLAREE selon l'enum
        updatedAt: new Date(),
      },
    });
  }
}
