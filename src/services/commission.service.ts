import { prisma } from "@/lib/prisma";
import { PaymentCanal, ProfileType } from "@prisma/client";

/**
 * Service gérant le Moteur de Commission (M1)
 */
export class CommissionService {
  /**
   * Calcule et déduit la commission de la plateforme pour un paiement donné.
   * Cette méthode doit être appelée juste après la confirmation du paiement et
   * AVANT le déclenchement des reversements vers le bailleur ou l'agence.
   * 
   * @param paymentId L'ID du PaymentPgw confirmé
   * @returns L'ID de la CommissionTransaction créée et le montant net à reverser
   */
  static async deductCommission(paymentId: string) {
    // 1. Récupérer le paiement et les informations associées
    const payment = await prisma.paymentPgw.findUnique({
      where: { id: paymentId },
      include: {
        lease: {
          include: {
            landlord: true,
          }
        }
      }
    });

    if (!payment) {
      throw new Error(`Paiement ${paymentId} introuvable.`);
    }

    if (payment.statut !== "CONFIRMEE") {
      throw new Error(`Le paiement ${paymentId} n'est pas confirmé. Impossible de déduire une commission.`);
    }

    // Vérifier si une commission a déjà été déduite
    const existingCommission = await prisma.commissionTransaction.findUnique({
      where: { paymentPgwId: paymentId }
    });

    if (existingCommission) {
      return {
        commissionTransactionId: existingCommission.id,
        montantNet: existingCommission.montantNet,
        tauxApplique: existingCommission.tauxApplique,
        montantComm: existingCommission.montantComm
      };
    }

    // 2. Déterminer le type de profil du bailleur (propriétaire ou agence)
    // Pour simplifier l'exemple, nous supposons que le landlord a un profil. S'il n'en a pas, LANDLORD par défaut.
    const profileType = ProfileType.LANDLORD; // Valeur par défaut

    // 3. Calculer le taux de commission
    const commissionConfig = await this.getCommissionConfig(profileType, payment.canal);
    
    const montantBrut = payment.montant;
    let montantComm = montantBrut * (commissionConfig.tauxPourcent / 100);

    // Appliquer les plafonds et planchers
    if (commissionConfig.montantMin && montantComm < commissionConfig.montantMin) {
      montantComm = commissionConfig.montantMin;
    }
    if (commissionConfig.montantMax && montantComm > commissionConfig.montantMax) {
      montantComm = commissionConfig.montantMax;
    }

    // S'assurer de ne pas prendre plus que le montant total
    if (montantComm > montantBrut) {
        montantComm = montantBrut;
    }

    const montantNet = montantBrut - montantComm;

    // 4. Enregistrer la transaction de commission
    const commissionTransaction = await prisma.commissionTransaction.create({
      data: {
        paymentPgwId: paymentId,
        leaseId: payment.leaseId,
        montantBrut: montantBrut,
        tauxApplique: commissionConfig.tauxPourcent,
        montantComm: montantComm,
        montantNet: montantNet,
        canal: payment.canal,
        statut: "DEDUITE"
      }
    });

    console.log(`[COMMISSION] Prélevé ${montantComm} FCFA sur le paiement ${payment.refInterne} (Net à reverser: ${montantNet} FCFA)`);

    return {
      commissionTransactionId: commissionTransaction.id,
      montantNet,
      tauxApplique: commissionConfig.tauxPourcent,
      montantComm
    };
  }

  /**
   * Récupère la configuration de commission applicable
   */
  static async getCommissionConfig(profileType: ProfileType, canal: PaymentCanal) {
    // Chercher une configuration spécifique au canal
    let config = await prisma.commissionConfig.findFirst({
      where: {
        profileType: profileType,
        paymentCanal: canal,
        actif: true
      }
    });

    // Fallback: chercher une configuration globale (canal null) pour ce profil
    if (!config) {
      config = await prisma.commissionConfig.findFirst({
        where: {
          profileType: profileType,
          paymentCanal: null,
          actif: true
        }
      });
    }

    // Si aucune configuration en base, utiliser un taux par défaut très bas (ou zéro selon la stratégie)
    if (!config) {
      return {
        tauxPourcent: 0.5, // 0.5% par défaut
        montantMin: 0,
        montantMax: null
      };
    }

    return config;
  }
}
