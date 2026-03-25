import { prisma } from "@/lib/prisma";
import { differenceInMonths, addDays } from "date-fns";
import { PDFDocument } from "pdf-lib";

export class FiscalService {
  /**
   * Calcule les droits d'enregistrement et frais de timbre pour un bail.
   * Règle : 2.5% du loyer total contractuel + 500 FCFA par page.
   */
  static async calculerDroits(leaseId: string, pdfBuffer?: Buffer) {
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: { 
        property: true,
        tenant: true 
      }
    });

    if (!lease) throw new Error("Bail non trouvé");

    // 1. Calcul de la durée en mois (P1)
    let dureeMois = 12; // Défaut pour BDQ verbal sans fin
    if (lease.startDate && lease.endDate) {
      dureeMois = Math.ceil(differenceInMonths(lease.endDate, lease.startDate));
      if (dureeMois <= 0) dureeMois = 1; // Minimum 1 mois
    } else if (lease.durationMonths) {
        dureeMois = lease.durationMonths;
    }

    // 2. Calcul du nombre de pages (P2)
    let nbPages = 3; // Défaut estimé
    if (pdfBuffer) {
      try {
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        nbPages = pdfDoc.getPageCount();
      } catch (error) {
        console.error("Erreur lors du comptage des pages PDF:", error);
      }
    }

    // 3. Formules de calcul (M-FISCAL)
    const loyerMensuel = lease.rentAmount;
    const loyerTotal = loyerMensuel * dureeMois;
    const droitsEnregistrement = Math.round(loyerTotal * 0.025);
    const fraisTimbre = nbPages * 500;
    const totalFiscal = droitsEnregistrement + fraisTimbre;

    // 4. Deadline (Signature + 30 jours)
    const deadline = addDays(lease.signedAt || new Date(), 30);

    // 5. Mise à jour du bail
    const updatedLease = await prisma.lease.update({
      where: { id: leaseId },
      data: {
        nbPagesBail: nbPages,
        dureeMoisBail: dureeMois,
        loyerTotalFcfa: loyerTotal,
        droitsEnregistrement: droitsEnregistrement,
        fraisTimbre: fraisTimbre,
        totalFiscalBail: totalFiscal,
        statutFiscal: "FISCAL_PENDING",
        deadlineEnregistrement: deadline
      }
    });

    return updatedLease;
  }

  /**
   * Simule ou initie le split CinetPay.
   * QAPRIL -> DGI (100% du montant fiscal)
   */
  static async initierSplitCinetPay(leaseId: string) {
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId }
    });

    if (!lease || !lease.totalFiscalBail) {
      throw new Error("Calcul fiscal non effectué ou montant invalide");
    }

    // Ici on appellerait l'API CinetPay pour le split
    // Pour l'instant on simule le lien de paiement
    const transactionId = `QAPRIL-FISCAL-${leaseId}-${Date.now()}`;
    
    // Simulation du statut
    await prisma.lease.update({
      where: { id: leaseId },
      data: {
        statutFiscal: "FISCAL_PENDING"
      }
    });

    return {
      transactionId,
      montant: lease.totalFiscalBail,
      paymentUrl: `https://checkout.cinetpay.com/pay/${transactionId}` // URL de simulation
    };
  }

  /**
   * Confirmation du paiement fiscal (via Webhook)
   */
  static async confirmerPaiementFiscal(leaseId: string, transactionId: string, hash?: string) {
    return await prisma.lease.update({
      where: { id: leaseId },
      data: {
        statutFiscal: "FISCAL_PAYÉ",
        recuFiscalHash: hash || `HASH-${transactionId}`,
        // activation du bail si nécessaire
        status: "ACTIVE" 
      }
    });
  }
}
