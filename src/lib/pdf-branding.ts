import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont, RGB } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export const COLORS = {
    NAVY: rgb(0.02, 0.1, 0.3) as RGB,
    MANGO: rgb(1, 0.54, 0) as RGB, // #FF8B00
    SLATE: rgb(0.3, 0.3, 0.3) as RGB,
    LIGHT_GRAY: rgb(0.95, 0.95, 0.95) as RGB,
    SUCCESS: rgb(0, 0.5, 0) as RGB,
    DANGER: rgb(0.8, 0.2, 0.2) as RGB,
    WHITE: rgb(1, 1, 1) as RGB
};

export async function drawStandardHeader(
    page: PDFPage, 
    pdfDoc: PDFDocument, 
    title: string, 
    subtitle?: string
) {
    const { width, height } = page.getSize();
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Decorative Top Bar
    page.drawRectangle({
        x: 0,
        y: height - 5,
        width: width,
        height: 5,
        color: COLORS.MANGO
    });

    // Embed Logo
    try {
        const logoPath = path.join(process.cwd(), 'public', 'logo.png');
        if (fs.existsSync(logoPath)) {
            const logoBytes = fs.readFileSync(logoPath);
            const logoImage = await pdfDoc.embedPng(logoBytes);
            const logoDims = logoImage.scale(0.25);
            page.drawImage(logoImage, {
                x: 50,
                y: height - 85,
                width: logoDims.width,
                height: logoDims.height,
            });
        }
    } catch (e) {
        console.error("Failed to embed logo in PDF", e);
    }

    // Title & Info
    page.drawText('QAPRIL', {
        x: 130,
        y: height - 55,
        size: 24,
        font: fontBold,
        color: COLORS.NAVY
    });

    page.drawText('Digital Property Management Platform', {
        x: 130,
        y: height - 70,
        size: 9,
        font: fontRegular,
        color: COLORS.SLATE
    });

    // Document Title
    page.drawText(title.toUpperCase(), {
        x: width - 50 - fontBold.widthOfTextAtSize(title.toUpperCase(), 16),
        y: height - 55,
        size: 16,
        font: fontBold,
        color: COLORS.NAVY
    });

    if (subtitle) {
        page.drawText(subtitle, {
            x: width - 50 - fontRegular.widthOfTextAtSize(subtitle, 10),
            y: height - 70,
            size: 10,
            font: fontRegular,
            color: COLORS.MANGO
        });
    }

    // Horizontal Separator
    page.drawLine({
        start: { x: 50, y: height - 110 },
        end: { x: width - 50, y: height - 110 },
        thickness: 1,
        color: COLORS.LIGHT_GRAY
    });
}

export function drawStandardFooter(page: PDFPage, pdfDoc: PDFDocument) {
    const { width } = page.getSize();
    const fontRegular = pdfDoc.embedStandardFont(StandardFonts.Helvetica);

    page.drawLine({
        start: { x: 50, y: 60 },
        end: { x: width - 50, y: 60 },
        thickness: 0.5,
        color: COLORS.LIGHT_GRAY
    });

    const footerText = "Document certifié par QAPRIL - www.qapril.ci - Support: contact@qapril.ci";
    page.drawText(footerText, {
        x: 50,
        y: 45,
        size: 8,
        font: fontRegular,
        color: COLORS.SLATE
    });

    const legalText = "QAPRIL TECHNOLOGIES SA - Abidjan, Côte d'Ivoire";
    page.drawText(legalText, {
        x: width - 50 - fontRegular.widthOfTextAtSize(legalText, 8),
        y: 45,
        size: 8,
        font: fontRegular,
        color: COLORS.SLATE
    });
}

export function drawSectionTitle(page: PDFPage, font: PDFFont, text: string, y: number) {
    page.drawText(text.toUpperCase(), {
        x: 50,
        y: y,
        size: 10,
        font: font,
        color: COLORS.SLATE
    });
}

export function drawInfoBox(
    page: PDFPage, 
    x: number, 
    y: number, 
    w: number, 
    h: number, 
    label: string, 
    value: string, 
    fontBold: PDFFont, 
    fontReg: PDFFont,
    accentColor = COLORS.NAVY
) {
    page.drawRectangle({
        x, y, width: w, height: h,
        color: COLORS.LIGHT_GRAY
    });
    page.drawRectangle({
        x, y: y + h - 2, width: w, height: 2,
        color: accentColor
    });
    
    page.drawText(label.toUpperCase(), {
        x: x + 10,
        y: y + h - 15,
        size: 7,
        font: fontBold,
        color: COLORS.SLATE
    });

    page.drawText(value, {
        x: x + 10,
        y: y + 15,
        size: 12,
        font: fontBold,
        color: COLORS.NAVY
    });
}
