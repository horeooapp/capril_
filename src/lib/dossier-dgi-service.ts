import { prisma } from "@/lib/prisma";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export class DossierDgiService {
  /**
   * Génère le Pack DGI complet (3 pièces)
   */
  static async genererPackComplet(leaseId: string) {
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        property: true,
        landlord: true,
        tenant: true
      }
    });

    if (!lease) throw new Error("Bail non trouvé");

    // 1. Formulaire DGI pré-rempli
    const formulaireDgi = await this.genererFormulaireDgi(lease);

    // 2. Fiche de calcul détaillée
    const ficheCalcul = await this.genererFicheCalcul(lease);

    // 3. (Optionnel) Le bail lui-même avec tampon fiscal
    const bailFiscale = await this.genererBailFiscale(lease);

    return {
      formulaireDgi,
      ficheCalcul,
      bailFiscale,
      filename: `PACK_DGI_${lease.leaseReference}.zip`
    };
  }

  private static async genererFormulaireDgi(lease: any): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const { width, height } = page.getSize();
    
    page.drawText("DIRECTION GÉNÉRALE DES IMPOTS (DGI)", { x: 50, y: height - 50, size: 14, font: fontBold });
    page.drawText("RÉPUBLIQUE DE CÔTE D'IVOIRE", { x: 50, y: height - 70, size: 10, font });
    
    page.drawText("FORMULAIRE DE DÉCLARATION - DROITS D'ENREGISTREMENT", { x: 50, y: height - 120, size: 16, font: fontBold });
    
    let y = height - 170;
    const drawLine = (label: string, value: string) => {
        page.drawText(`${label} :`, { x: 50, y, size: 12, font: fontBold });
        page.drawText(value || "N/A", { x: 200, y, size: 12, font });
        y -= 25;
    }

    drawLine("Référence Bail", lease.leaseReference);
    drawLine("Bailleur", lease.landlord?.name);
    drawLine("Locataire", lease.tenant?.name);
    drawLine("Objet du contrat", lease.property?.title);
    drawLine("Localisation", lease.property?.address);
    drawLine("Durée Contractuelle", `${lease.dureeMoisBail || 0} mois`);
    drawLine("Loyer Mensuel", `${lease.rentAmount?.toLocaleString()} FCFA`);
    
    y -= 20;
    page.drawText("DÉCOMPTE FISCAL (ARTICLE 550 CGI)", { x: 50, y, size: 14, font: fontBold });
    y -= 30;
    
    drawLine("Base de calcul", `${lease.loyerTotalFcfa?.toLocaleString()} FCFA`);
    drawLine("Droits (2,5%)", `${lease.droitsEnregistrement?.toLocaleString()} FCFA`);
    drawLine("Timbre (500/page)", `${lease.fraisTimbre?.toLocaleString()} FCFA (${lease.nbPagesBail} pages)`);
    
    y -= 10;
    page.drawRectangle({ x: 45, y: y - 10, width: width - 90, height: 40, color: rgb(0.95, 0.95, 0.95) });
    page.drawText("TOTAL À PAYER :", { x: 50, y, size: 14, font: fontBold });
    page.drawText(`${lease.totalFiscalBail?.toLocaleString()} FCFA`, { x: 200, y, size: 16, font: fontBold, color: rgb(0.8, 0, 0) });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  private static async genererFicheCalcul(lease: any): Promise<Buffer> {
      // Structure similaire mais plus détaillée (audit log)
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      page.drawText("QAPRIL FISCAL - FICHE DE CALCUL", { x: 50, y: 800, size: 16, font: fontBold });
      page.drawText(`Date de génération : ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, { x: 50, y: 780, size: 10, font });
      
      // ... détails techniques de calcul
      
      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
  }

  private static async genererBailFiscale(lease: any): Promise<Buffer> {
      // Placeholder: Redécoration du bail original avec un tampon DGI/QAPRIL
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      page.drawText("COPIE CERTIFIÉE POUR ENREGISTREMENT", { x: 150, y: 400, size: 20, font, color: rgb(0.8, 0.8, 0.8), opacity: 0.5, rotate: { type: "degrees", angle: 45 } as any });
      
      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
  }
}
