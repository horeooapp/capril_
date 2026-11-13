import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import QRCode from 'qrcode';
import { drawStandardHeader, drawStandardFooter, COLORS, drawSectionTitle, drawInfoBox } from './pdf-branding';

export interface ReceiptPDFParams {
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
  bailleurMasque?: boolean;
  agencyName?: string;
  agencyLicense?: string;
  mandateRef?: string;
}

export async function generateReceiptPDF(receiptData: ReceiptPDFParams): Promise<Buffer> {
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
  let currentY = height - 145;
  
  // Parties
  drawSectionTitle(page, fontBold, 'Informations des Parties', currentY);
  currentY -= 25;

  // Calcul du libellé Bailleur (RG-CONF D-01)
  const isMasque = Boolean(receiptData.bailleurMasque);
  const landlordDisplayName = isMasque ? 'Bailleur (identité protégée)' : (receiptData.landlordName || 'Bailleur');
  const landlordSubtitle = isMasque ? 'Identité protégée' : 'Propriétaire';

  // Landlord Box
  drawInfoBox(page, 50, currentY - 55, 240, 55, landlordSubtitle, landlordDisplayName, fontBold, font);
  // Tenant Box
  drawInfoBox(page, 305, currentY - 55, 240, 55, 'Locataire', receiptData.tenantName, fontBold, font);
  currentY -= 75;

  // Si gestion sous mandat (D-01)
  if (receiptData.agencyName) {
    page.drawRectangle({
      x: 50,
      y: currentY - 26,
      width: width - 100,
      height: 26,
      color: COLORS.LIGHT_GRAY,
    });
    const agenceText = `Bien sous mandat de gestion : ${receiptData.agencyName}` +
      (receiptData.agencyLicense ? ` · Agrément N° ${receiptData.agencyLicense}` : '') +
      (receiptData.mandateRef ? ` · Mandat : ${receiptData.mandateRef}` : '');
    page.drawText(agenceText, {
      x: 60,
      y: currentY - 17,
      size: 9,
      font: fontBold,
      color: COLORS.NAVY,
    });
    currentY -= 40;
  }

  // Property
  drawSectionTitle(page, fontBold, 'Désignation du bien', currentY);
  currentY -= 18;
  page.drawText(receiptData.propertyAddress, { x: 50, y: currentY, size: 11, font, color: COLORS.NAVY });
  currentY -= 40;

  // 3. Financial Table
  drawSectionTitle(page, fontBold, 'Détails financiers & Règlement', currentY);
  currentY -= 22;

  // Table Header
  page.drawRectangle({ x: 50, y: currentY - 18, width: width - 100, height: 18, color: COLORS.NAVY });
  page.drawText('DESCRIPTION', { x: 60, y: currentY - 13, size: 8, font: fontBold, color: COLORS.WHITE });
  page.drawText('MONTANT (F CFA)', { x: width - 180, y: currentY - 13, size: 8, font: fontBold, color: COLORS.WHITE });
  currentY -= 38;

  // Loyer
  page.drawText('Loyer net', { x: 60, y: currentY, size: 10, font });
  page.drawText(`${receiptData.rentAmount.toLocaleString('fr-FR')} F`, { x: width - 180, y: currentY, size: 10, font });
  currentY -= 20;

  // Charges
  page.drawText('Provisions pour charges', { x: 60, y: currentY, size: 10, font });
  page.drawText(`${receiptData.chargesAmount.toLocaleString('fr-FR')} F`, { x: width - 180, y: currentY, size: 10, font });
  currentY -= 15;

  // Total Line
  page.drawLine({ start: { x: 50, y: currentY }, end: { x: width - 50, y: currentY }, thickness: 1, color: COLORS.LIGHT_GRAY });
  currentY -= 25;
  page.drawText('TOTAL PAYÉ', { x: 60, y: currentY, size: 13, font: fontBold, color: COLORS.NAVY });
  page.drawText(`${receiptData.totalAmount.toLocaleString('fr-FR')} F CFA`, { x: width - 180, y: currentY, size: 13, font: fontBold, color: COLORS.NAVY });
  currentY -= 45;

  // 4. Verification & Metadata
  const formattedDate = receiptData.paidAt ? format(receiptData.paidAt, 'dd MMMM yyyy à HH:mm', { locale: fr }) : 'Non payé';
  
  page.drawText(`Période : ${receiptData.periodMonth}`, { x: 50, y: currentY, size: 10, font: fontBold });
  currentY -= 16;
  page.drawText(`Mode de règlement : ${receiptData.paymentMethod}`, { x: 50, y: currentY, size: 9, font });
  currentY -= 14;
  page.drawText(`Date de règlement : ${formattedDate}`, { x: 50, y: currentY, size: 9, font });
  currentY -= 14;
  page.drawText(`Bail de référence : ${receiptData.leaseRef}`, { x: 50, y: currentY, size: 9, font });

  // QR CODE
  const token = receiptData.qrToken || receiptData.receiptRef;
  const validationUrl = `https://qapril.net/verifier?ref=${encodeURIComponent(token)}`;
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(validationUrl, { margin: 1, width: 200 });
    const qrImage = await pdfDoc.embedPng(qrCodeDataUrl);
    
    page.drawImage(qrImage, {
      x: width - 150,
      y: currentY - 30,
      width: 95,
      height: 95
    });
    page.drawText('SCANNEZ POUR VÉRIFIER', {
      x: width - 155,
      y: currentY - 40,
      size: 7,
      font: fontBold,
      color: COLORS.SLATE
    });
  } catch (e) {
    console.error('Failed to embed QR code', e);
  }

  // 5. Empreinte numérique & formule conforme au lexique (D-01 / quittances.pied_pdf)
  const hash = receiptData.receiptHash || 'CERTIFIE-QAPRIL';
  page.drawRectangle({
    x: 50,
    y: 85,
    width: width - 100,
    height: 40,
    color: COLORS.LIGHT_GRAY,
  });
  page.drawText(`Empreinte numérique : ${hash}`, {
    x: 60,
    y: 110,
    size: 7.5,
    font: fontMono,
    color: COLORS.NAVY,
  });
  page.drawText(`Toute modification du document l'invalide. Vérifiable sur qapril.ci/verifier.`, {
    x: 60,
    y: 95,
    size: 8,
    font,
    color: COLORS.SLATE,
  });

  // Footer Standard
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
  const badgeColors: Record<string, typeof COLORS.MANGO> = { 'A+': COLORS.MANGO, 'A': COLORS.SUCCESS, 'B': rgb(0.2, 0.4, 0.8) };
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
  page.drawText(data.tenantName.toUpperCase(), { x: 50, y: currentY, size: 18, font: fontBold, color: COLORS.NAVY });
  currentY -= 50;

  // 4. Metrics Grid
  drawSectionTitle(page, fontBold, 'Indicateurs de performance', currentY);
  currentY -= 35;

  const colW = (width - 120) / 2;
  drawInfoBox(page, 50, currentY, colW, 55, 'Taux de paiement', `${data.tauxPaiement}%`, fontBold, font, COLORS.SUCCESS);
  drawInfoBox(page, 70 + colW, currentY, colW, 55, 'Historique contrats', `${data.nbBails} baux`, fontBold, font);
  currentY -= 90;

  // 5. Verification
  const qrUrl = `https://qapril.net/p/${data.refPasseport}`;
  const qrDataUrl = await QRCode.toDataURL(qrUrl, { width: 150 });
  const qrImage = await pdfDoc.embedPng(qrDataUrl);
  page.drawImage(qrImage, { x: width - 160, y: currentY - 30, width: 100, height: 100 });
  page.drawText('SCANNEZ POUR VÉRIFIER', { x: width - 165, y: currentY - 40, size: 7, font: fontBold, color: COLORS.SLATE });

  // 6. Security Footer
  if (data.hashSha256) {
    page.drawText(`Empreinte numérique : ${data.hashSha256}`, { x: 50, y: 105, size: 7, font: fontMono, color: COLORS.SLATE });
    page.drawText(`Toute modification du document l'invalide. Vérifiable sur qapril.ci/verifier.`, { x: 50, y: 95, size: 7.5, font, color: COLORS.SLATE });
  }
  page.drawText(`Certificat émis le ${format(data.dateEmission, 'dd/MM/yyyy')} — Valable 30 jours.`, { x: 50, y: 80, size: 8, font, color: COLORS.SLATE });

  drawStandardFooter(page, pdfDoc);

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export interface LeasePDFParams {
  leaseRef: string;
  landlord: any;
  tenant: any;
  property: any;
  rentAmount: number;
  depositAmount: number;
  avanceAmount?: number;
  startDate: Date;
  durationMonths: number;
  paymentDay: number;
  signedAt?: Date;
  qrToken?: string;
  sha256Hash?: string;
  bailleurMasque?: boolean;
  agencyName?: string;
  agencyLicense?: string;
  mandateRef?: string;
  dgiEnregistre?: boolean;
  dgiDate?: Date;
  dgiRef?: string;
}

/**
 * CONTRAT DE BAIL CERTIFIÉ (Ticket D-02 / CDC IC-01-R1)
 * Conforme à la loi 2019-576, règles RG-CONF, calcul DGI
 */
export async function generateLeasePDF(data: LeasePDFParams): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);
  const { width, height } = page.getSize();
  
  // 1. Header
  await drawStandardHeader(page, pdfDoc, "CONTRAT DE BAIL À USAGE D'HABITATION", `Réf: ${data.leaseRef}`);

  let currentY = height - 135;

  // Introduction text conforme lexique.bail.mention_loi_pdf
  page.drawText("Bail soumis à la loi n° 2019-576 relative au bail à usage d'habitation.", {
    x: 50, y: currentY, size: 8.5, font: fontBold, color: COLORS.NAVY
  });
  currentY -= 24;

  // Parties
  drawSectionTitle(page, fontBold, 'ENTRE LES SOUSSIGNÉS', currentY);
  currentY -= 20;

  // Landlord (RG-CONF D-02)
  const isMasque = Boolean(data.bailleurMasque || data.landlord?.bailleurMasque);
  const rawLandlordName = data.landlord?.fullName || 
    ((data.landlord?.firstName ? data.landlord.firstName + ' ' : '') + (data.landlord?.lastName || '')).trim() || 
    data.landlord?.name || 
    'Bailleur';
  const landlordDisplayName = isMasque ? 'Bailleur (identité protégée)' : rawLandlordName;
  
  page.drawText(`BAILLEUR : ${landlordDisplayName}`, { x: 50, y: currentY, size: 10.5, font: fontBold, color: COLORS.NAVY });
  currentY -= 13;
  if (isMasque) {
    page.drawText(`Contact : Géré via la plateforme QAPRIL (Identité protégée conformément aux règles de confidentialité)`, {
      x: 50, y: currentY, size: 8, font, color: COLORS.SLATE
    });
  } else {
    page.drawText(`Tél : ${data.landlord?.phone || 'Non renseigné'} · Email : ${data.landlord?.email || 'Non renseigné'}`, {
      x: 50, y: currentY, size: 8, font, color: COLORS.SLATE
    });
  }
  currentY -= 18;

  // Mandat éventuel
  if (data.agencyName) {
    page.drawText(`GESTIONNAIRE DÉLÉGUÉ : ${data.agencyName}` +
      (data.agencyLicense ? ` (Agrément N° ${data.agencyLicense})` : '') +
      (data.mandateRef ? ` · Mandat : ${data.mandateRef}` : ''), {
      x: 50, y: currentY, size: 8.5, font: fontBold, color: COLORS.NAVY
    });
    currentY -= 18;
  }

  // Tenant
  const tenantName = data.tenant?.fullName || 
    ((data.tenant?.firstName ? data.tenant.firstName + ' ' : '') + (data.tenant?.lastName || '')).trim() || 
    data.tenant?.name || 
    'Locataire (Preneur)';
  page.drawText(`LOCATAIRE : ${tenantName}`, { x: 50, y: currentY, size: 10.5, font: fontBold, color: COLORS.NAVY });
  currentY -= 13;
  page.drawText(`Tél : ${data.tenant?.phone || 'Non renseigné'} · Email : ${data.tenant?.email || 'Non renseigné'}`, {
    x: 50, y: currentY, size: 8, font, color: COLORS.SLATE
  });
  currentY -= 24;

  // Property
  drawSectionTitle(page, fontBold, 'DÉSIGNATION DU BIEN LOUÉ', currentY);
  currentY -= 16;
  page.drawText(data.property?.name || data.property?.unitLabel || 'Logement conventionné', { x: 50, y: currentY, size: 10, font: fontBold });
  currentY -= 13;
  page.drawText(data.property?.address || data.property?.commune || 'Adresse enregistrée dans le système', { x: 50, y: currentY, size: 9, font });
  currentY -= 24;

  // Financials & Clauses légales Loi 2019-576
  drawSectionTitle(page, fontBold, 'CONDITIONS FINANCIÈRES & DURÉE LÉGALE', currentY);
  currentY -= 18;

  const duration = data.durationMonths || 12;
  page.drawText(`DURÉE DU BAIL : ${duration} mois (Échéance de paiement : le ${data.paymentDay || 5} de chaque mois)`, {
    x: 50, y: currentY, size: 9.5, font: fontBold
  });
  currentY -= 14;

  page.drawText(`LOYER MENSUEL NET : ${data.rentAmount.toLocaleString('fr-FR')} F CFA`, {
    x: 50, y: currentY, size: 9.5, font: fontBold
  });
  currentY -= 14;

  const maxDepot = data.rentAmount * 2;
  const depot = Math.min(data.depositAmount || 0, maxDepot);
  page.drawText(`DÉPÔT DE GARANTIE : ${depot.toLocaleString('fr-FR')} F CFA (Plafond légal : maximum 2 mois de loyer)`, {
    x: 50, y: currentY, size: 8.5, font
  });
  currentY -= 14;

  const avance = Math.min(data.avanceAmount || 0, maxDepot);
  page.drawText(`AVANCE SUR LOYER : ${avance.toLocaleString('fr-FR')} F CFA (Plafond légal : maximum 2 mois de loyer)`, {
    x: 50, y: currentY, size: 8.5, font
  });
  currentY -= 14;

  page.drawText(`RESTITUTION DE LA CAUTION : Sous 30 jours maximum après remise des clés (Préavis légal : 3 mois)`, {
    x: 50, y: currentY, size: 8, font, color: COLORS.SLATE
  });
  currentY -= 26;

  // Tableau fiscal DGI (Ticket D-02)
  drawSectionTitle(page, fontBold, 'ENREGISTREMENT FISCAL (DIRECTION GÉNÉRALE DES IMPÔTS)', currentY);
  currentY -= 18;

  const assietteAnnuelle = data.rentAmount * Math.min(duration, 12);
  const droitsEnregistrement = Math.round(assietteAnnuelle * 0.025);
  const fraisTimbre = 1000;
  const totalFiscalDgi = droitsEnregistrement + fraisTimbre;

  // Box fiscal
  page.drawRectangle({
    x: 50,
    y: currentY - 55,
    width: width - 100,
    height: 55,
    color: COLORS.LIGHT_GRAY,
  });

  page.drawText(`Assiette fiscale (12 mois max) : ${assietteAnnuelle.toLocaleString('fr-FR')} F CFA · Taux légal : 2,5 %`, {
    x: 60, y: currentY - 14, size: 8, font
  });
  page.drawText(`Droits d'enregistrement : ${droitsEnregistrement.toLocaleString('fr-FR')} F CFA  |  Frais de timbre fiscal : ${fraisTimbre.toLocaleString('fr-FR')} F CFA  |  Total DGI : ${totalFiscalDgi.toLocaleString('fr-FR')} F CFA`, {
    x: 60, y: currentY - 28, size: 8.5, font: fontBold, color: COLORS.NAVY
  });

  // Mention Enregistré le ... STRICTEMENT conditionnée au paiement effectif
  if (data.dgiEnregistre) {
    const dateEnreg = data.dgiDate ? format(data.dgiDate, 'dd/MM/yyyy', { locale: fr }) : format(new Date(), 'dd/MM/yyyy', { locale: fr });
    const mentionEnreg = `Enregistré le ${dateEnreg} auprès des services fiscaux DGI` + (data.dgiRef ? ` · Référence : ${data.dgiRef}` : '');
    page.drawText(mentionEnreg, {
      x: 60, y: currentY - 44, size: 8.5, font: fontBold, color: COLORS.SUCCESS
    });
  } else {
    page.drawText(`Signé, en attente d'enregistrement fiscal (Droits calculés : ${totalFiscalDgi.toLocaleString('fr-FR')} F CFA)`, {
      x: 60, y: currentY - 44, size: 8.5, font: fontBold, color: rgb(0.7, 0.35, 0)
    });
  }
  currentY -= 75;

  // Signature Status
  if (data.signedAt) {
    page.drawRectangle({ x: 50, y: currentY - 38, width: width - 240, height: 38, color: rgb(0.92, 0.97, 0.92) });
    page.drawText('CONTRAT SIGNÉ ÉLECTRONIQUEMENT', { x: 60, y: currentY - 16, size: 9, font: fontBold, color: COLORS.SUCCESS });
    page.drawText(`Le ${format(data.signedAt, 'dd/MM/yyyy à HH:mm', { locale: fr })} par code SMS de sécurité`, { x: 60, y: currentY - 30, size: 8, font });
  } else {
    page.drawText('EN ATTENTE DE SIGNATURE', { x: 50, y: currentY - 15, size: 10, font: fontBold, color: rgb(0.8, 0.4, 0) });
  }

  // QR Code for verification
  const refCode = data.qrToken || data.leaseRef;
  const valUrl = `https://qapril.net/verifier?ref=${encodeURIComponent(refCode)}`;
  try {
    const qrData = await QRCode.toDataURL(valUrl, { width: 150 });
    const qrImg = await pdfDoc.embedPng(qrData);
    page.drawImage(qrImg, { x: width - 150, y: currentY - 70, width: 85, height: 85 });
    page.drawText('SCANNEZ POUR VÉRIFIER', { x: width - 155, y: currentY - 80, size: 7, font: fontBold, color: COLORS.SLATE });
  } catch (e) {
    console.error('Failed to embed lease QR code', e);
  }

  // Empreinte numérique scellée (D-02 / lexique)
  const hash = data.sha256Hash || 'CERTIFIE-QAPRIL';
  page.drawRectangle({
    x: 50,
    y: 85,
    width: width - 100,
    height: 40,
    color: COLORS.LIGHT_GRAY,
  });
  page.drawText(`Empreinte numérique : ${hash}`, {
    x: 60,
    y: 110,
    size: 7.5,
    font: fontMono,
    color: COLORS.NAVY,
  });
  page.drawText(`Toute modification du document l'invalide. Vérifiable sur qapril.ci/verifier.`, {
    x: 60,
    y: 95,
    size: 8,
    font,
    color: COLORS.SLATE,
  });

  drawStandardFooter(page, pdfDoc);
  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
