import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export async function generateReceiptPDF(receiptData: {
  receiptRef: string;
  leaseRef: string;
  periodMonth: string;
  rentAmount: number;
  chargesAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paidAt: Date | null;
  tenantName: string;
  propertyAddress: string;
  landlordName: string;
  declarative?: boolean;
}): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // Format A4
  
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const { width, height } = page.getSize();
  
  const drawText = (text: string, x: number, y: number, optFont = font, size = 12, color = rgb(0,0,0)) => {
    page.drawText(text, { x, y, size, font: optFont, color });
  };

  // Header QAPRIL
  drawText('QAPRIL', 50, height - 70, fontBold, 28, rgb(0.1, 0.1, 0.1));
  drawText('Quittancement Autonome & Plateforme des Ressources Immobilières', 50, height - 90, font, 10, rgb(0.4, 0.4, 0.4));
  
  // Title
  const title = receiptData.declarative ? 'QUITTANCE DÉCLARATIVE' : 'QUITTANCE DE LOYER';
  drawText(title, 50, height - 140, fontBold, 20);
  
  // Details references
  let currentY = height - 190;
  drawText(`Référence : ${receiptData.receiptRef}`, 50, currentY, fontBold, 12);
  currentY -= 20;
  drawText(`Période : ${receiptData.periodMonth}`, 50, currentY, font, 12);
  currentY -= 30;
  
  drawText('Propriétaire :', 50, currentY, fontBold, 12);
  drawText(receiptData.landlordName, 150, currentY, font, 12);
  currentY -= 20;
  
  drawText('Locataire :', 50, currentY, fontBold, 12);
  drawText(receiptData.tenantName, 150, currentY, font, 12);
  currentY -= 20;
  
  drawText('Biens loué :', 50, currentY, fontBold, 12);
  drawText(receiptData.propertyAddress, 150, currentY, font, 12);
  currentY -= 40;
  
  // Financials
  drawText('DÉTAILS DU PAIEMENT', 50, currentY, fontBold, 14);
  currentY -= 20;
  drawText(`Loyer de base : ${receiptData.rentAmount} FCFA`, 50, currentY, font, 12);
  currentY -= 20;
  drawText(`Charges : ${receiptData.chargesAmount} FCFA`, 50, currentY, font, 12);
  currentY -= 20;
  drawText(`TOTAL PAYÉ : ${receiptData.totalAmount} FCFA`, 50, currentY, fontBold, 14, rgb(0, 0.5, 0));
  currentY -= 30;
  
  const formattedDate = receiptData.paidAt ? format(receiptData.paidAt, 'dd MMMM yyyy HH:mm', { locale: fr }) : 'Non payé';
  drawText(`Méthode de paiement : ${receiptData.paymentMethod}`, 50, currentY, font, 12);
  currentY -= 20;
  drawText(`Reçu le : ${formattedDate}`, 50, currentY, font, 12);
  
  // Footer
  drawText('Document sécurisé et émis par la plateforme QAPRIL (www.qapril.ci)', 50, 50, font, 10, rgb(0.5, 0.5, 0.5));
  
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
