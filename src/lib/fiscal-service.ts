import { prisma } from "@/lib/prisma";
import { differenceInMonths, addDays } from "date-fns";
import { PDFDocument } from "pdf-lib";

export class FiscalService {
  /**
   * Récupère ou crée un dossier fiscal pour un bail.
   */
  static async getOrCreateDossier(leaseId: string) {
    let dossier = await prisma.fiscalDossier.findFirst({
      where: { leaseId }
    });

    if (!dossier) {
      const lease = await prisma.lease.findUnique({
        where: { id: leaseId },
        include: { property: true }
      });

      if (!lease) throw new Error("Bail non trouvé");

      // Calcul initial
      const duree = lease.durationMonths || 12;
      const nbPages = lease.nbPagesBail || 3;
      const loyerTotal = lease.rentAmount * duree;
      const droits = Math.round(loyerTotal * 0.025);
      const timbre = nbPages * 500;
      const fraisQapril = 5000; // Frais de service QAPRIL par défaut
      const deadline = addDays(lease.signedAt || new Date(), 30);

      dossier = await prisma.fiscalDossier.create({
        data: {
          leaseId,
          loyerMensuel: lease.rentAmount,
          dureeBailMois: duree,
          dureeRetenueMois: duree,
          baseCalcul: loyerTotal,
          droitsEnregistrement: droits,
          fraisTimbre: timbre,
          fraisQapril: fraisQapril,
          totalDgi: droits + timbre,
          totalBailleur: droits + timbre + fraisQapril,
          statut: "EN_ATTENTE_DECLARATION",
          dateLimiteLegale: deadline
        }
      });

      // Sync Lease
      await prisma.lease.update({
        where: { id: leaseId },
        data: {
          totalFiscalBail: dossier.totalBailleur,
          statutFiscal: "EN_ATTENTE_DECLARATION",
          deadlineEnregistrement: deadline
        }
      });
    }

    return dossier;
  }

  /**
   * Calcule les droits d'enregistrement et frais de timbre pour un bail.
   */
  static async calculerDroits(leaseId: string, pdfBuffer?: Buffer) {
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId }
    });

    if (!lease) throw new Error("Bail non trouvé");

    let nbPages = lease.nbPagesBail || 3;
    if (pdfBuffer) {
      try {
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        nbPages = pdfDoc.getPageCount();
      } catch (error) {
        console.error("Erreur PDF:", error);
      }
    }

    const dossier = await this.getOrCreateDossier(leaseId);
    
    // Recalcul si nécessaire
    const timbre = nbPages * 500;
    const totalDgi = dossier.droitsEnregistrement + timbre;
    const totalBailleur = totalDgi + dossier.fraisQapril;

    const updatedDossier = await prisma.fiscalDossier.update({
      where: { id: dossier.id },
      data: {
        fraisTimbre: timbre,
        totalDgi,
        totalBailleur
      }
    });

    await prisma.lease.update({
      where: { id: leaseId },
      data: {
        nbPagesBail: nbPages,
        totalFiscalBail: totalBailleur
      }
    });

    return updatedDossier;
  }

  /**
   * Initie le paiement CinetPay pour le dossier fiscal.
   */
  static async initierSplitCinetPay(fiscalId: string) {
    const dossier = await prisma.fiscalDossier.findUnique({
      where: { id: fiscalId },
      include: { lease: { include: { tenant: true } } }
    });

    if (!dossier) throw new Error("Dossier fiscal non trouvé");

    const transactionId = `FISCAL-${fiscalId}-${Date.now()}`;
    const paymentUrl = `https://checkout.cinetpay.com/pay/${transactionId}`;

    await prisma.fiscalDossier.update({
      where: { id: fiscalId },
      data: {
        cinetpayTransId: transactionId,
        cinetpayPaymentUrl: paymentUrl,
        statut: "EN_COURS_PAIEMENT"
      }
    });

    // Optionnel: Créer un PaymentIntent global
    await prisma.paymentIntent.create({
      data: {
        id: transactionId,
        idempotencyKey: transactionId,
        leaseId: dossier.leaseId,
        amount: dossier.totalBailleur,
        operator: "CINETPAY",
        payerPhone: dossier.lease.tenant?.phone || "00000000",
        status: "PENDING",
        metadata: { type: "FISCAL_REGISTRATION", fiscalId }
      }
    });

    return { success: true, paymentUrl };
  }

  /**
   * Confirmation du paiement fiscal (via Webhook)
   */
  static async confirmerPaiementFiscal(fiscalId: string, transactionId: string, hash?: string) {
    const dossier = await prisma.fiscalDossier.update({
      where: { id: fiscalId },
      data: {
        statut: "PAYE_CONFIRME",
        paidAt: new Date()
      }
    });

    await prisma.lease.update({
      where: { id: dossier.leaseId },
      data: { statutFiscal: "PAYE_CONFIRME" }
    });

    return dossier;
  }

  /**
   * Statistiques fiscales pour l'admin
   */
  static async getStats() {
    const totalDossiers = await prisma.fiscalDossier.count();
    const payes = await prisma.fiscalDossier.count({ where: { statut: "PAYE_CONFIRME" } });
    const collected = await prisma.fiscalDossier.aggregate({
      _sum: { totalDgi: true },
      where: { statut: "PAYE_CONFIRME" }
    });

    const recentRegistrations = await prisma.fiscalDossier.findMany({
      take: 10,
      orderBy: { updatedAt: 'desc' },
      include: { lease: { include: { property: true, tenant: true } } }
    });

    return {
      stats: {
        totalDossiers,
        complianceRate: totalDossiers > 0 ? (payes / totalDossiers) * 100 : 0,
        totalCollected: Number(collected._sum.totalDgi || 0),
        totalPenalties: 0 // A implémenter plus tard si nécessaire
      },
      recentRegistrations
    };
  }

  /**
   * Génère un certificat fiscal
   */
  static async generateCertificate(fiscalId: string) {
    const dossier = await prisma.fiscalDossier.findUnique({
      where: { id: fiscalId },
      include: { certificat: true }
    });

    if (!dossier) throw new Error("Dossier non trouvé");
    if (dossier.certificat) return dossier.certificat;

    // Simulation de génération
    const certNumber = `DGI-${fiscalId.slice(0, 8).toUpperCase()}`;
    return await prisma.certificatFiscal.create({
      data: {
        fiscalId,
        numeroCertificat: certNumber,
        qrToken: `QR-${certNumber}`,
        pdfPath: `/certs/${certNumber}.pdf`,
        hashSha256: `HASH-${certNumber}`
      }
    });
  }
}

