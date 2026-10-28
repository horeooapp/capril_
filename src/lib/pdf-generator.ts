import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import QRCode from 'qrcode';
import { drawStandardHeader, drawStandardFooter, COLORS, drawSectionTitle, drawInfoBox } from './pdf-branding';

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
  receiptHash?: string;
  qrToken?: string;
  declarative?: boolean;
}): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // Format A4
  
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);
  
  const { width, height } = page.getSize();
  
  // 1. Header
  const title = receiptData.declarative ? 'QUITTANCE DÉCLARATIVE' : 'QUITTANCE DE LOYER';
  await drawStandardHeader(page, pdfDoc, title, `Réf: ${receiptData.receiptRef}`);

  // 2. Info Sections
  let currentY = height - 150;
  
  // Parties
  drawSectionTitle(page, fontBold, 'Informations des Parties', currentY);
  currentY -= 30;

  // Landlord Box
  drawInfoBox(page, 50, currentY - 50, 240, 50, 'Bailleur', receiptData.landlordName, fontBold, font);
  // Tenant Box
  drawInfoBox(page, 305, currentY - 50, 240, 50, 'Locataire', receiptData.tenantName, fontBold, font);
  currentY -= 80;

  // Property
  drawSectionTitle(page, fontBold, 'Désignation du bien', currentY);
  currentY -= 20;
  page.drawText(receiptData.propertyAddress, { x: 50, y: currentY, size: 12, font, color: COLORS.NAVY });
  currentY -= 50;

  // 3. Financial Table
  drawSectionTitle(page, fontBold, 'Détails financiers & Règlement', currentY);
  currentY -= 25;

  // Table Header
  page.drawRectangle({ x: 50, y: currentY - 20, width: width - 100, height: 20, color: COLORS.NAVY });
  page.drawText('DESCRIPTION', { x: 60, y: currentY - 14, size: 9, font: fontBold, color: COLORS.WHITE });
  page.drawText('MONTANT (XOF)', { x: width - 180, y: currentY - 14, size: 9, font: fontBold, color: COLORS.WHITE });
  currentY -= 45;

  // Loyer
  page.drawText('Loyer Net', { x: 60, y: currentY, size: 11, font });
  page.drawText(receiptData.rentAmount.toLocaleString(), { x: width - 180, y: currentY, size: 11, font });
  currentY -= 25;

  // Charges
  page.drawText('Provisions pour charges', { x: 60, y: currentY, size: 11, font });
  page.drawText(receiptData.chargesAmount.toLocaleString(), { x: width - 180, y: currentY, size: 11, font });
  currentY -= 15;

  // Total Line
  page.drawLine({ start: { x: 50, y: currentY }, end: { x: width - 50, y: currentY }, thickness: 1, color: COLORS.LIGHT_GRAY });
  currentY -= 25;
  page.drawText('TOTAL PAYÉ', { x: 60, y: currentY, size: 14, font: fontBold, color: COLORS.NAVY });
  page.drawText(`${receiptData.totalAmount.toLocaleString()} XOF`, { x: width - 180, y: currentY, size: 14, font: fontBold, color: COLORS.NAVY });
  currentY -= 50;

  // 4. Verification & Metadata
  const formattedDate = receiptData.paidAt ? format(receiptData.paidAt, 'dd MMMM yyyy HH:mm', { locale: fr }) : 'Non payé';
  
  page.drawText(`Période : ${receiptData.periodMonth}`, { x: 50, y: currentY, size: 11, font: fontBold });
  currentY -= 20;
  page.drawText(`Mode de règlement : ${receiptData.paymentMethod}`, { x: 50, y: currentY, size: 10, font });
  currentY -= 15;
  page.drawText(`Date de certification : ${formattedDate}`, { x: 50, y: currentY, size: 10, font });

  // QR CODE
  if (receiptData.qrToken) {
    const validationUrl = `https://www.qapril.net/v/${receiptData.qrToken}`;
    const qrCodeDataUrl = await QRCode.toDataURL(validationUrl, { margin: 1, width: 200 });
    const qrImage = await pdfDoc.embedPng(qrCodeDataUrl);
    
    page.drawImage(qrImage, {
        x: width - 150,
        y: currentY - 50,
        width: 100,
        height: 100
    });
    page.drawText('SCANNEZ POUR VÉRIFIER', {
        x: width - 155,
        y: currentY - 60,
        size: 7,
        font: fontBold,
        color: COLORS.SLATE
    });
  }

  // Hash Security
  if (receiptData.receiptHash) {
    page.drawText(`CERTIFICATION DIGITALE (SHA-256) :`, { x: 50, y: 105, size: 7, font: fontBold, color: COLORS.SLATE });
    page.drawText(receiptData.receiptHash, { x: 50, y: 95, size: 7, font: fontMono, color: COLORS.SLATE });
  }

  // 5. Footer
  drawStandardFooter(page, pdfDoc);
  
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * PHASE 2 : PASSEPORT LOCATIF CERTIFIÉ
 */
export async function generatePassportPDF(data: {
    refPasseport: string;
    tenantName: string;
    score: number;
    badge: string;
    tauxPaiement: number;
    nbBails: number;
    hashSha256: string;
    dateEmission: Date;
}): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]);
    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);
    const { width, height } = page.getSize();
    
    // 1. Header
    await drawStandardHeader(page, pdfDoc, 'Passeport Locatif Certifié', `Réf: ${data.refPasseport}`);

    // 2. Score Section (Hero)
    let currentY = height - 160;
    page.drawRectangle({ x: 50, y: currentY - 140, width: width - 100, height: 140, color: COLORS.NAVY });
    
    page.drawText('SCORE DE FIABILITÉ LOCATIVE', { x: 70, y: currentY - 30, size: 10, font: fontBold, color: COLORS.MANGO });
    page.drawText(`${data.score}`, { x: 70, y: currentY - 100, size: 72, font: fontBold, color: COLORS.WHITE });
    page.drawText('/ 1000', { x: 220, y: currentY - 100, size: 24, font: fontBold, color: rgb(0.5, 0.6, 0.8) });

    // Badge Circle
    const badgeColors: any = { 'A+': COLORS.MANGO, 'A': COLORS.SUCCESS, 'B': rgb(0.2, 0.4, 0.8) };
    const badgeColor = badgeColors[data.badge] || COLORS.SLATE;
    
    page.drawCircle({ x: width - 130, y: currentY - 70, size: 50, color: badgeColor });
    page.drawText(data.badge, { 
        x: width - 130 - (data.badge.length > 1 ? 25 : 15), 
        y: currentY - 85, 
        size: 40, 
        font: fontBold, 
        color: COLORS.WHITE 
    });
    page.drawText('GRADE', { x: width - 150, y: currentY - 110, size: 8, font: fontBold, color: COLORS.WHITE });
    currentY -= 180;

    // 3. Holder Info
    drawSectionTitle(page, fontBold, 'Titulaire du passeport', currentY);
    currentY -= 30;
    page.drawText(data.tenantName.toUpperCase(), { x: 50, y: currentY, size: 20, font: fontBold, color: COLORS.NAVY });
    currentY -= 60;

    // 4. Metrics Grid
    drawSectionTitle(page, fontBold, 'Indicateurs de performance', currentY);
    currentY -= 40;

    const colW = (width - 120) / 2;
    drawInfoBox(page, 50, currentY, colW, 60, 'Taux de paiement', `${data.tauxPaiement}%`, fontBold, font, COLORS.SUCCESS);
    drawInfoBox(page, 70 + colW, currentY, colW, 60, 'Historique contrats', `${data.nbBails} baux`, fontBold, font);
    currentY -= 100;

    // 5. Verification
    const qrUrl = `https://www.qapril.net/p/${data.refPasseport}`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl, { width: 150 });
    const qrImage = await pdfDoc.embedPng(qrDataUrl);
    page.drawImage(qrImage, { x: width - 170, y: currentY - 50, width: 120, height: 120 });
    page.drawText('SCANNEZ POUR VÉRIFICATION', { x: width - 170, y: currentY - 60, size: 7, font: fontBold, color: COLORS.SLATE });

    // 6. Security Footer
    if (data.hashSha256) {
        page.drawText(`EMPREINTE NUMÉRIQUE (SHA-256) :`, { x: 50, y: 105, size: 7, font: fontBold, color: COLORS.SLATE });
        page.drawText(data.hashSha256, { x: 50, y: 95, size: 7, font: fontMono, color: COLORS.SLATE });
    }
    page.drawText(`Certificat émis le ${format(data.dateEmission, 'dd/MM/yyyy')} - Valable 30 jours.`, { x: 50, y: 80, size: 8, font, color: COLORS.SLATE });

    drawStandardFooter(page, pdfDoc);

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
}


/**
 * PHASE 3 : CONTRAT DE BAIL CERTIFIÉ
 */
export async function generateLeasePDF(data: {
    leaseRef: string;
    landlord: any;
    tenant: any;
    property: any;
    rentAmount: number;
    depositAmount: number;
    avanceAmount: number;
    startDate: Date;
    durationMonths: number;
    paymentDay: number;
    signedAt?: Date;
    qrToken?: string;
    sha256Hash?: string;
}): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]);
    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);
    const { width, height } = page.getSize();
    
    // 1. Header
    await drawStandardHeader(page, pdfDoc, "CONTRAT DE BAIL À USAGE D'HABITATION", `Réf: ${data.leaseRef}`);

    let currentY = height - 150;

    // Introduction text
    page.drawText("Loi N°2019-576 du 26 juin 2019 instituant le Code de la Construction et de l'Habitat", {
        x: 50, y: currentY, size: 8, font: fontBold, color: COLORS.SLATE
    });
    currentY -= 30;

    // Parties
    drawSectionTitle(page, fontBold, 'ENTRE LES SOUSSIGNÉS', currentY);
    currentY -= 30;

    // Landlord
    const landlordName = data.landlord?.fullName || 
        ((data.landlord?.firstName ? data.landlord.firstName + ' ' : '') + (data.landlord?.lastName || '')).trim() || 
        data.landlord?.name || 
        'Bailleur / Propriétaire';
    page.drawText(`BAILLEUR : ${landlordName}`, { x: 50, y: currentY, size: 12, font: fontBold, color: COLORS.NAVY });
    currentY -= 15;
    page.drawText(`Tél: ${data.landlord?.phone || 'Non renseigné'} | Email: ${data.landlord?.email || 'Non renseigné'}`, { x: 50, y: currentY, size: 9, font });
    currentY -= 25;

    // Tenant
    const tenantName = data.tenant?.fullName || 
        ((data.tenant?.firstName ? data.tenant.firstName + ' ' : '') + (data.tenant?.lastName || '')).trim() || 
        data.tenant?.name || 
        'Locataire (Preneur)';
    page.drawText(`LOCATAIRE : ${tenantName}`, { x: 50, y: currentY, size: 12, font: fontBold, color: COLORS.NAVY });
    currentY -= 15;
    page.drawText(`Tél: ${data.tenant?.phone || 'Non renseigné'} | Email: ${data.tenant?.email || 'Non renseigné'}`, { x: 50, y: currentY, size: 9, font });
    currentY -= 35;

    // Property
    drawSectionTitle(page, fontBold, 'DÉSIGNATION DU BIEN', currentY);
    currentY -= 20;
    page.drawText(data.property?.name || data.property?.address || 'Logement QAPRIL', { x: 50, y: currentY, size: 11, font: fontBold });
    currentY -= 15;
    page.drawText(data.property?.address || data.property?.commune || 'Adresse non spécifiée', { x: 50, y: currentY, size: 10, font });
    currentY -= 40;

    // Financials
    drawSectionTitle(page, fontBold, 'CONDITIONS FINANCIÈRES', currentY);
    currentY -= 25;
    page.drawText(`LOYER MENSUEL : ${data.rentAmount.toLocaleString()} XOF`, { x: 50, y: currentY, size: 11, font: fontBold });
    currentY -= 15;
    page.drawText(`CHARGES : 0 XOF (Incluses)`, { x: 50, y: currentY, size: 10, font });
    currentY -= 15;
    page.drawText(`DÉPÔT DE GARANTIE : ${data.depositAmount.toLocaleString()} XOF`, { x: 50, y: currentY, size: 10, font });
    currentY -= 40;

    // Signature Status
    if (data.signedAt) {
        page.drawRectangle({ x: 50, y: currentY - 50, width: width - 250, height: 60, color: rgb(0.9, 0.95, 0.9) });
        page.drawText('CONTRAT SIGNÉ ÉLECTRONIQUEMENT', { x: 60, y: currentY - 20, size: 10, font: fontBold, color: COLORS.SUCCESS });
        page.drawText(`Le ${format(data.signedAt, 'dd/MM/yyyy HH:mm', { locale: fr })} via QAPRIL M-SIGN`, { x: 60, y: currentY - 35, size: 9, font });
    } else {
        page.drawText('EN ATTENTE DE SIGNATURE', { x: 50, y: currentY, size: 12, font: fontBold, color: rgb(0.8, 0.4, 0) });
    }

    // QR Code for verification
    const valUrl = `https://www.qapril.net/v/${data.qrToken || data.leaseRef}`;
    const qrData = await QRCode.toDataURL(valUrl, { width: 150 });
    const qrImg = await pdfDoc.embedPng(qrData);
    page.drawImage(qrImg, { x: width - 150, y: currentY - 140, width: 100, height: 100 });
    page.drawText('SCANNEZ POUR VÉRIFIER', { x: width - 155, y: currentY - 150, size: 7, font: fontBold, color: COLORS.SLATE });

    // Hash Security
    if (data.sha256Hash) {
        page.drawText(`CERTIFICATION DIGITALE (SHA-256) :`, { x: 50, y: 105, size: 7, font: fontBold, color: COLORS.SLATE });
        page.drawText(data.sha256Hash, { x: 50, y: 95, size: 7, font: fontMono, color: COLORS.SLATE });
    }

    drawStandardFooter(page, pdfDoc);
    const bytes = await pdfDoc.save();
    return Buffer.from(bytes);
}
