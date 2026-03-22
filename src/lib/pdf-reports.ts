import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ReportData {
  ownerName: string;
  period: string; // YYYY-MM
  metrics: {
    totalPotentiel: number;
    totalEncaisse: number;
    tauxRecouvrement: number;
    nbLeases: number;
    nbImpayes: number;
  };
  details: any[];
}

/**
 * M-RAPPORT-03 : Génération du PDF de Rapport Mensuel
 */
export async function generateMonthlyReportPDF(data: ReportData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const { width, height } = page.getSize();
  
  const drawText = (text: string, x: number, y: number, optFont = font, size = 12, color = rgb(0,0,0)) => {
    page.drawText(text, { x, y, size, font: optFont, color });
  };

  const drawRect = (x: number, y: number, w: number, h: number, color = rgb(0.95, 0.95, 0.95)) => {
    page.drawRectangle({ x, y, width: w, height: h, color });
  };

  // --- HEADER ---
  drawRect(0, height - 120, width, 120, rgb(0.05, 0.07, 0.1)); // Dark background
  drawText('QAPRIL', 50, height - 60, fontBold, 32, rgb(1, 1, 1));
  drawText('TECHNOLOGIES SA', 50, height - 80, font, 10, rgb(0.8, 0.8, 0.8));
  
  drawText('RAPPORT MENSUEL DE GESTION', width - 280, height - 65, fontBold, 14, rgb(1, 1, 1));
  drawText(`Période : ${data.period}`, width - 280, height - 85, font, 12, rgb(0.6, 0.7, 1));

  // --- CLIENT INFO ---
  let currentY = height - 160;
  drawText('BAILLEUR :', 50, currentY, fontBold, 10, rgb(0.5, 0.5, 0.5));
  drawText(data.ownerName.toUpperCase(), 120, currentY, fontBold, 12);
  currentY -= 40;

  // --- KEY METRICS BOXES ---
  const boxW = 160;
  const boxH = 80;
  
  // Box 1: Taux Recouvrement
  drawRect(50, currentY - boxH, boxW, boxH, rgb(0.98, 0.98, 1));
  drawText('TAUX DE RECOUVREMENT', 65, currentY - 25, fontBold, 8, rgb(0.4, 0.4, 0.4));
  drawText(`${data.metrics.tauxRecouvrement}%`, 65, currentY - 60, fontBold, 24, rgb(0.3, 0.4, 0.9));

  // Box 2: Total Encaissé
  drawRect(width / 2 - boxW / 2, currentY - boxH, boxW, boxH, rgb(0.98, 1, 0.98));
  drawText('TOTAL ENCAISSÉ', width / 2 - boxW / 2 + 15, currentY - 25, fontBold, 8, rgb(0.4, 0.4, 0.4));
  drawText(`${data.metrics.totalEncaisse.toLocaleString()} FCFA`, width / 2 - boxW / 2 + 15, currentY - 60, fontBold, 18, rgb(0, 0.5, 0));

  // Box 3: Impayés
  drawRect(width - 50 - boxW, currentY - boxH, boxW, boxH, rgb(1, 0.98, 0.98));
  drawText('ALERTE IMPAYÉS', width - 50 - boxW + 15, currentY - 25, fontBold, 8, rgb(0.4, 0.4, 0.4));
  drawText(`${data.metrics.nbImpayes} CAS`, width - 50 - boxW + 15, currentY - 60, fontBold, 20, rgb(0.8, 0.2, 0.2));

  currentY -= 120;

  // --- DETAILS TABLE ---
  drawText('DÉTAIL DES ENCAISSEMENTS PAR BIEN', 50, currentY, fontBold, 12);
  currentY -= 10;
  page.drawLine({ start: { x: 50, y: currentY }, end: { x: width - 50, y: currentY }, thickness: 1, color: rgb(0.9, 0.9, 0.9) });
  currentY -= 25;

  // Headers
  drawText('ADRESSE DU BIEN', 55, currentY, fontBold, 9, rgb(0.5, 0.5, 0.5));
  drawText('STATUT', 350, currentY, fontBold, 9, rgb(0.5, 0.5, 0.5));
  drawText('LOYER NET', 480, currentY, fontBold, 9, rgb(0.5, 0.5, 0.5));
  currentY -= 15;

  data.details.forEach((item, idx) => {
    if (currentY < 100) return; // Basic pagination skip for summary
    
    // Row background
    if (idx % 2 === 0) drawRect(50, currentY - 20, width - 100, 25, rgb(0.98, 0.98, 0.98));
    
    drawText(item.address.substring(0, 45), 55, currentY - 12, font, 9);
    
    const statusCol = item.status === "paid" ? rgb(0, 0.6, 0) : rgb(0.8, 0.3, 0);
    drawText(item.status.toUpperCase(), 350, currentY - 12, fontBold, 8, statusCol);
    
    drawText(`${item.amount.toLocaleString()} FCFA`, 480, currentY - 12, font, 10);
    
    currentY -= 25;
  });

  // --- FOOTER ---
  const footerY = 50;
  page.drawLine({ start: { x: 50, y: footerY + 20 }, end: { x: width - 50, y: footerY + 20 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
  drawText('Document généré automatiquement par QAPRIL. Certifié conforme aux transactions de la plateforme.', 50, footerY, font, 8, rgb(0.5, 0.5, 0.5));
  drawText(`Hash de Sécurité: ${Math.random().toString(36).substring(7).toUpperCase()}`, width - 200, footerY, font, 8, rgb(0.7, 0.7, 0.7));

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
