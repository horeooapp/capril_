import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { drawStandardHeader, drawStandardFooter, COLORS, drawSectionTitle, drawInfoBox } from './pdf-branding';

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

import { YearlyBilanData } from './bilan-service';

/**
 * M-RAPPORT-03 : Génération du PDF de Rapport Mensuel
 */
export async function generateMonthlyReportPDF(data: ReportData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const { width, height } = page.getSize();
  
  // 1. Header
  await drawStandardHeader(page, pdfDoc, 'Rapport Mensuel de Gestion', `Période : ${data.period}`);

  // 2. Metrics Summary
  let currentY = height - 150;
  drawSectionTitle(page, fontBold, 'Indicateurs clés du mois', currentY);
  currentY -= 40;

  const colW = (width - 130) / 3;
  drawInfoBox(page, 50, currentY, colW, 60, 'Recouvrement', `${data.metrics.tauxRecouvrement}%`, fontBold, font, COLORS.SUCCESS);
  drawInfoBox(page, 65 + colW, currentY, colW, 60, 'Total Encaissé', `${data.metrics.totalEncaisse.toLocaleString()} F`, fontBold, font);
  drawInfoBox(page, 80 + (colW * 2), currentY, colW, 60, 'Impayés', `${data.metrics.nbImpayes} Cas`, fontBold, font, COLORS.DANGER);
  currentY -= 100;

  // 3. Details Table
  drawSectionTitle(page, fontBold, 'Détail des encaissements par bien', currentY);
  currentY -= 25;

  // Table Headers
  page.drawRectangle({ x: 50, y: currentY - 20, width: width - 100, height: 20, color: COLORS.NAVY });
  page.drawText('ADRESSE DU BIEN', { x: 60, y: currentY - 14, size: 8, font: fontBold, color: COLORS.WHITE });
  page.drawText('STATUT', { x: 350, y: currentY - 14, size: 8, font: fontBold, color: COLORS.WHITE });
  page.drawText('MONTANT (XOF)', { x: width - 150, y: currentY - 14, size: 8, font: fontBold, color: COLORS.WHITE });
  currentY -= 40;

  data.details.forEach((item, idx) => {
    if (currentY < 120) return; // Simple pagination guard
    
    // Stripe
    if (idx % 2 === 0) {
        page.drawRectangle({ x: 50, y: currentY - 10, width: width - 100, height: 20, color: COLORS.LIGHT_GRAY });
    }
    
    page.drawText(item.address.substring(0, 45), { x: 60, y: currentY, size: 9, font });
    
    const statusColor = item.status === "paid" ? COLORS.SUCCESS : COLORS.DANGER;
    page.drawText(item.status.toUpperCase(), { x: 350, y: currentY, size: 8, font: fontBold, color: statusColor });
    
    page.drawText(`${item.amount.toLocaleString()}`, { x: width - 150, y: currentY, size: 10, font });
    
    currentY -= 20;
  });

  // 4. Footer
  drawStandardFooter(page, pdfDoc);

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * M-RAPPORT-04 : Génération du PDF de Bilan Annuel Fiscal
 */
export async function generateYearlyBilanPDF(data: YearlyBilanData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();
  
  // 1. Header
  await drawStandardHeader(page, pdfDoc, 'Bilan Financier Annuel', `Exercice Fiscal : ${data.year}`);

  // 2. Client & Summary
  let currentY = height - 150;
  page.drawText('DÉTENTEUR DU COMPTE :', { x: 50, y: currentY, size: 8, font: fontBold, color: COLORS.SLATE });
  page.drawText(data.ownerName.toUpperCase(), { x: 170, y: currentY, size: 12, font: fontBold, color: COLORS.NAVY });
  currentY -= 60;

  const colW = (width - 130) / 3;
  drawInfoBox(page, 50, currentY, colW, 70, 'Revenu Brut', `${data.totalIncome.toLocaleString()} XOF`, fontBold, font, COLORS.SUCCESS);
  drawInfoBox(page, 65 + colW, currentY, colW, 70, 'Charges', `${data.totalMaintenance.toLocaleString()} XOF`, fontBold, font, COLORS.DANGER);
  drawInfoBox(page, 80 + (colW * 2), currentY, colW, 70, 'AIRSI Estimé', `${data.estimatedTaxAirsi.toLocaleString()} XOF`, fontBold, font, COLORS.MANGO);
  currentY -= 110;

  // 3. Final Result Banner
  page.drawRectangle({ x: 50, y: currentY - 50, width: width - 100, height: 50, color: COLORS.NAVY });
  page.drawText('RÉSULTAT NET APRÈS CHARGES ET FISCALITÉ', { x: 70, y: currentY - 20, size: 9, font: fontBold, color: rgb(0.8, 0.9, 1) });
  page.drawText(`${data.finalResult.toLocaleString()} XOF`, { x: width - 250, y: currentY - 40, size: 22, font: fontBold, color: COLORS.WHITE });
  currentY -= 100;

  // 4. Performance per Property
  drawSectionTitle(page, fontBold, 'Performance détaillée par propriété', currentY);
  currentY -= 30;

  // Header
  page.drawRectangle({ x: 50, y: currentY - 15, width: width - 100, height: 20, color: COLORS.LIGHT_GRAY });
  page.drawText('DÉSIGNATION DU BIEN', { x: 60, y: currentY - 9, size: 8, font: fontBold });
  page.drawText('ENCAISSEMENT ANNUEL (XOF)', { x: width - 200, y: currentY - 9, size: 8, font: fontBold });
  currentY -= 30;

  data.propertyBreakdown.forEach((p, idx) => {
    if (idx % 2 === 0) page.drawRectangle({ x: 50, y: currentY - 10, width: width - 100, height: 20, color: rgb(0.98, 0.98, 0.98) });
    page.drawText(p.propertyName, { x: 60, y: currentY, size: 10, font });
    page.drawText(`${p.income.toLocaleString()}`, { x: width - 200, y: currentY, size: 10, font: fontBold });
    currentY -= 20;
  });

  // 5. Footer
  drawStandardFooter(page, pdfDoc);

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

import { BenchmarkResult } from './market-service';

/**
 * P-MARKET-01 : Rapport de Positionnement Marché
 */
export async function generateMarketBenchmarkPDF(data: BenchmarkResult): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();
  
  // 1. Header
  await drawStandardHeader(page, pdfDoc, 'Analyse de Positionnement Marché', 'QAPRIL OBSERVATORY');

  // 2. Property Info
  let currentY = height - 150;
  page.drawText('BIEN ANALYSÉ :', { x: 50, y: currentY, size: 8, font: fontBold, color: COLORS.SLATE });
  page.drawText(data.propertyName, { x: 50, y: currentY - 20, size: 14, font: fontBold, color: COLORS.NAVY });
  currentY -= 60;

  // 3. Comparison Boxes
  const boxW = (width - 120) / 2;
  drawInfoBox(page, 50, currentY - 80, boxW, 80, 'Loyer Actuel', `${data.currentRent.toLocaleString()} F`, fontBold, font);
  drawInfoBox(page, 70 + boxW, currentY - 80, boxW, 80, 'Moyenne Marché', `${data.marketAvg.toLocaleString()} F`, fontBold, font, COLORS.SUCCESS);
  currentY -= 120;

  // 4. Gap Analysis
  const gapColor = data.gapPct > 0 ? COLORS.SUCCESS : COLORS.DANGER;
  drawSectionTitle(page, fontBold, 'Analyse de l\'écart (GAP)', currentY);
  currentY -= 30;
  
  page.drawRectangle({ x: 50, y: currentY - 60, width: width - 100, height: 60, color: COLORS.LIGHT_GRAY });
  page.drawText(`Écart constaté : ${data.gapPct}%`, { x: 70, y: currentY - 35, size: 18, font: fontBold, color: gapColor });
  
  if (data.potentialGain && data.potentialGain > 0) {
    page.drawText(`Gain mensuel potentiel : +${data.potentialGain.toLocaleString()} F`, { x: width - 280, y: currentY - 35, size: 11, font: fontBold, color: COLORS.SUCCESS });
  }
  currentY -= 100;

  // 5. Recommendation
  page.drawRectangle({ x: 50, y: currentY - 80, width: width - 100, height: 80, color: COLORS.NAVY });
  page.drawText('RECOMMANDATION STRATÉGIQUE QAPRIL', { x: 70, y: currentY - 30, size: 9, font: fontBold, color: rgb(0.8, 0.9, 1) });
  page.drawText(data.recommendation === "AUGMENTER" ? "OPPORTUNITÉ DE RÉVISION À LA HAUSSE" : "MAINTIEN DU LOYER CONSEILLÉ", { x: 70, y: currentY - 60, size: 16, font: fontBold, color: COLORS.WHITE });

  // 6. Footer
  drawStandardFooter(page, pdfDoc);

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
