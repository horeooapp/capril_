import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { sendSMS } from '@/lib/sms';

export async function POST(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user || user.role !== 'PROPRIETAIRE') {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await request.json();
        const { propertyId, tenantEmail, rentAmount, durationMonths, depositAmount, avanceLoyer } = body;

        if (!propertyId || !tenantEmail || !rentAmount) {
            return NextResponse.json({ error: "Tous les champs obligatoires sont requis" }, { status: 400 });
        }

        const rentNum = parseFloat(rentAmount);
        // Capping caution (deposit) and advance to 2 months maximum
        const maxLimit = rentNum * 2;
        const requestedDeposit = depositAmount ? parseFloat(depositAmount) : maxLimit;
        const requestedAdvance = avanceLoyer ? parseFloat(avanceLoyer) : maxLimit;

        const finalDeposit = Math.min(requestedDeposit, maxLimit);
        const finalAdvance = Math.min(requestedAdvance, maxLimit);

        // Trouver le locataire par email
        const tenant = await prisma.user.findUnique({
            where: { email: tenantEmail }
        });

        if (!tenant || tenant.role !== 'LOCATAIRE') {
            return NextResponse.json({ error: "Aucun locataire trouvé avec cet email" }, { status: 404 });
        }

        // Trouver la propriété
        const property = await prisma.property.findUnique({
            where: { id: propertyId }
        });

        if (!property) {
            return NextResponse.json({ error: "Propriété non trouvée" }, { status: 404 });
        }

        // 1. Générer le VRAI PDF
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const { height } = page.getSize();
        
        page.drawText('CONTRAT DE BAIL - QAPRIL', { x: 50, y: height - 80, size: 24, font: boldFont, color: rgb(0, 0.5, 0.3) });
        page.drawText(`Fait le ${new Date().toLocaleDateString()}`, { x: 50, y: height - 120, size: 12, font });
        
        page.drawText('ENTRE LES SOUSSIGNÉS :', { x: 50, y: height - 160, size: 14, font: boldFont });
        page.drawText(`Le Propriétaire : ${user.userId}`, { x: 50, y: height - 180, size: 12, font }); // Idéalement le nom du proprio
        page.drawText(`Et le Locataire : ${tenant.email}`, { x: 50, y: height - 200, size: 12, font });

        page.drawText('DÉSIGNATION DU BIEN :', { x: 50, y: height - 240, size: 14, font: boldFont });
        page.drawText(`Nom : ${property.name || 'Logement'}`, { x: 50, y: height - 260, size: 12, font });
        page.drawText(`Adresse : ${property.address || 'Adresse inconnue'}`, { x: 50, y: height - 280, size: 12, font });

        page.drawText('CONDITIONS FINANCIÈRES :', { x: 50, y: height - 320, size: 14, font: boldFont });
        page.drawText(`Loyer mensuel : ${rentAmount} FCFA`, { x: 50, y: height - 340, size: 12, font });
        page.drawText(`Dépôt de garantie (Caution) : ${finalDeposit} FCFA (Max 2 mois)`, { x: 50, y: height - 360, size: 12, font });
        page.drawText(`Avance sur loyer : ${finalAdvance} FCFA (Max 2 mois)`, { x: 50, y: height - 380, size: 12, font });

        page.drawText('SIGNATURES', { x: 50, y: height - 440, size: 14, font: boldFont });
        page.drawText('Le Propriétaire', { x: 50, y: height - 480, size: 12, font });
        page.drawText('Le Locataire', { x: 400, y: height - 480, size: 12, font });

        const pdfBytes = await pdfDoc.save();
        
        // Sauvegarder sur le disque (public/leases/)
        const fileName = `bail_${Date.now()}.pdf`;
        const leasesDir = path.join(process.cwd(), 'public', 'leases');
        if (!fs.existsSync(leasesDir)) fs.mkdirSync(leasesDir, { recursive: true });
        const filePath = path.join(leasesDir, fileName);
        fs.writeFileSync(filePath, pdfBytes);

        // URL publique du PDF
        const host = request.headers.get('host') || 'localhost:3000';
        const protocol = request.url.startsWith('https') ? 'https' : 'http';
        const fileUrl = `${protocol}://${host}/leases/${fileName}`;

        // 2. Créer le bail dans la DB
        const newLease = await prisma.lease.create({
            data: {
                leaseReference: `BAIL-${Date.now().toString().slice(-6)}`,
                propertyId,
                landlordId: user.userId,
                tenantId: tenant.id,
                rentAmount: rentNum,
                depositAmount: finalDeposit,
                avanceLoyer: finalAdvance,
                startDate: new Date(),
                durationMonths: durationMonths ? parseInt(durationMonths) : 12,
                status: 'ACTIVE',
                qrCodeUrl: fileUrl // On sauvegarde l'URL du PDF généré ici
            }
        });

        // 3. Envoyer le SMS d'invitation au locataire
        if (tenant.phone) {
            await sendSMS(
                tenant.phone, 
                `QAPRIL : Votre bail pour ${property.name || 'votre nouveau logement'} a été créé. Connectez-vous à l'application locataire pour le consulter.`
            );
        }

        return NextResponse.json({ 
            success: true, 
            message: "Bail généré avec succès",
            lease: newLease,
            pdfUrl: fileUrl
        });

    } catch (error) {
        console.error("[MOBILE API] proprietaire/leases/create error:", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}
