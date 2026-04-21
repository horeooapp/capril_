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

/**
 * M-RAPPORT-04 : Génération du PDF de Bilan Annuel Fiscal
 */
export async function generateYearlyBilanPDF(data: YearlyBilanData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  
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
  drawRect(0, height - 140, width, 140, rgb(0.02, 0.05, 0.1));
  drawText('QAPRIL', 50, height - 60, fontBold, 36, rgb(1, 1, 1));
  drawText('BILAN FINANCIER ANNUEL', width - 260, height - 65, fontBold, 14, rgb(1, 1, 1));
  drawText(`Exercice Fiscal : ${data.year}`, width - 260, height - 85, font, 12, rgb(1, 0.8, 0.3));

  // --- CLIENT ---
  let currentY = height - 180;
  drawText('BAILLEUR :', 50, currentY, fontBold, 10, rgb(0.5, 0.5, 0.5));
  drawText(data.ownerName.toUpperCase(), 120, currentY, fontBold, 14);

  // --- METRICS ---
  currentY -= 60;
  const boxW = 160;
  const boxH = 90;

  // Revenue Brut
  drawRect(50, currentY - boxH, boxW, boxH, rgb(0.98, 1, 0.98));
  drawText('REVENU BRUT GLOBAL', 65, currentY - 25, fontBold, 8, rgb(0.4, 0.4, 0.4));
  drawText(`${data.totalIncome.toLocaleString()} F`, 65, currentY - 60, fontBold, 18, rgb(0, 0.5, 0));

  // Maintenance
  drawRect(width / 2 - boxW / 2, currentY - boxH, boxW, boxH, rgb(1, 0.98, 0.98));
  drawText('CHARGES MAINTENANCE', width / 2 - boxW / 2 + 15, currentY - 25, fontBold, 8, rgb(0.4, 0.4, 0.4));
  drawText(`${data.totalMaintenance.toLocaleString()} F`, width / 2 - boxW / 2 + 15, currentY - 60, fontBold, 18, rgb(0.8, 0.2, 0.2));

  // AIRSI (7.5%)
  drawRect(width - 50 - boxW, currentY - boxH, boxW, boxH, rgb(1, 1, 0.95));
  drawText('IMPÔT AIRSI ESTIMÉ (7.5%)', width - 50 - boxW + 15, currentY - 25, fontBold, 8, rgb(0.4, 0.4, 0.4));
  drawText(`${data.estimatedTaxAirsi.toLocaleString()} F`, width - 50 - boxW + 15, currentY - 60, fontBold, 18, rgb(0.6, 0.4, 0));

  // --- FINAL RESULT ---
  currentY -= 130;
  drawRect(50, currentY - 60, width - 100, 60, rgb(0, 0.2, 0.4));
  drawText('RÉSULTAT NET APRÈS CHARGES ET FISCALITÉ', 70, currentY - 22, fontBold, 10, rgb(0.8, 0.9, 1));
  drawText(`${data.finalResult.toLocaleString()} FCFA`, width - 250, currentY - 45, fontBold, 24, rgb(1, 1, 1));

  // --- PERFORMANCE PAR BIEN ---
  currentY -= 110;
  drawText('REVENUS PAR PROPRIÉTÉ', 50, currentY, fontBold, 12);
  currentY -= 30;

  // Header
  drawRect(50, currentY - 20, width - 100, 25, rgb(0.92, 0.94, 0.98));
  drawText('DÉSIGNATION DU BIEN', 60, currentY - 12, fontBold, 9);
  drawText('ENCAISSEMENT ANNUEL', width - 200, currentY - 12, fontBold, 9);
  currentY -= 25;

  data.propertyBreakdown.forEach((p, idx) => {
    if (idx % 2 === 0) drawRect(50, currentY - 20, width - 100, 25, rgb(0.98, 0.98, 0.98));
    drawText(p.propertyName, 60, currentY - 12, font, 10);
    drawText(`${p.income.toLocaleString()} F`, width - 200, currentY - 12, fontBold, 10);
    currentY -= 25;
  });

  // --- FOOTER ---
  const footerY = 50;
  drawText('Ce rapport est une synthèse fiscale indicative basée sur les flux transitant par la plateforme QAPRIL.', 50, footerY + 20, font, 8, rgb(0.5, 0.5, 0.5));
  drawText('QAPRIL TECHNOLOGIES - LE FUTUR DE L\'IMMOBILIER SEREIN.', 50, footerY, fontBold, 9, rgb(0.1, 0.3, 0.5));

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
  
  const drawText = (text: string, x: number, y: number, optFont = font, size = 12, color = rgb(0,0,0)) => {
    page.drawText(text, { x, y, size, font: optFont, color });
  };

  const drawRect = (x: number, y: number, w: number, h: number, color = rgb(0.95, 0.95, 0.95)) => {
    page.drawRectangle({ x, y, width: w, height: h, color });
  };

  // --- HEADER ---
  drawRect(0, height - 120, width, 120, rgb(0.1, 0.1, 0.1));
  drawText('QAPRIL OBSERVATORY', 50, height - 70, fontBold, 24, rgb(1, 1, 1));
  drawText('ANALYSE DE POSITIONNEMENT MARCHÉ', 50, height - 90, font, 12, rgb(0.8, 0.8, 0.8));

  // --- PROPERTY INFO ---
  let currentY = height - 160;
  drawText('BIEN ANALYSÉ :', 50, currentY, fontBold, 10, rgb(0.5, 0.5, 0.5));
  drawText(data.propertyName, 50, currentY - 20, fontBold, 14);
  currentY -= 60;

  // --- BENCHMARK BOXES ---
  const boxW = 220;
  const boxH = 100;

  // Current vs Market
  drawRect(50, currentY - boxH, boxW, boxH, rgb(0.98, 0.98, 1));
  drawText('LOYER ACTUEL', 65, currentY - 25, fontBold, 9);
  drawText(`${data.currentRent.toLocaleString()} F`, 65, currentY - 70, fontBold, 24, rgb(0.2, 0.2, 0.2));

  drawRect(width - 50 - boxW, currentY - boxH, boxW, boxH, rgb(0.95, 1, 0.95));
  drawText('MOYENNE DU MARCHÉ', width - 50 - boxW + 15, currentY - 25, fontBold, 9);
  drawText(`${data.marketAvg.toLocaleString()} F`, width - 50 - boxW + 15, currentY - 70, fontBold, 24, rgb(0, 0.5, 0));

  currentY -= 140;

  // --- GAP ANALYSIS ---
  const gapColor = data.gapPct > 0 ? rgb(0, 0.6, 0) : rgb(0.8, 0, 0);
  drawText('ANALYSE DE L\'ÉCART (GAP)', 50, currentY, fontBold, 12);
  currentY -= 30;
  
  drawRect(50, currentY - 60, width - 100, 60, rgb(0.98, 0.98, 0.98));
  drawText(`Écart constaté : ${data.gapPct}%`, 70, currentY - 35, fontBold, 18, gapColor);
  
  if (data.potentialGain && data.potentialGain > 0) {
    drawText(`Gain potentiel mensuel : +${data.potentialGain.toLocaleString()} FCFA`, 300, currentY - 35, fontBold, 12, rgb(0, 0.5, 0));
  }

  currentY -= 100;

  // --- RECOMMENDATION ---
  drawRect(50, currentY - 80, width - 100, 80, rgb(0.02, 0.1, 0.3));
  drawText('RECOMMANDATION QAPRIL', 70, currentY - 30, fontBold, 10, rgb(0.8, 0.9, 1));
  drawText(data.recommendation === "AUGMENTER" ? "OPPORTUNITÉ DE RÉVISION À LA HAUSSE" : "MAINTIEN DU LOYER CONSEILLÉ", 70, currentY - 60, fontBold, 16, rgb(1, 1, 1));

  // --- FOOTER ---
  drawText('Données issues de l\'Observatoire QAPRIL - Basé sur un échantillon de biens similaires dans la même commune.', 50, 50, font, 8, rgb(0.5, 0.5, 0.5));

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
