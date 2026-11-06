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
        if (!user) {
            return NextResponse.json({ error: "Non autorisé. Jeton invalide ou expiré." }, { status: 401 });
        }

        const allowedRoles = ['PROPRIETAIRE', 'LANDLORD', 'LANDLORD_PRO', 'AGENCY', 'AGENCE_AGREE', 'NON_CERTIFIED_AGENT', 'ADMIN', 'SUPER_ADMIN'];
        if (user.role && !allowedRoles.includes(user.role)) {
            return NextResponse.json({ error: "Accès réservé aux bailleurs et agences gestionnaires." }, { status: 403 });
        }

        const body = await request.json();
        const {
            propertyId,
            tenantEmail,
            tenantPhone,
            tenantName,
            rentAmount,
            durationMonths,
            depositAmount,
            avanceLoyer,
            chargesAmount
        } = body;

        if (!propertyId || (!tenantEmail && !tenantPhone) || !rentAmount) {
            return NextResponse.json({ error: "Le bien, l'email ou téléphone du locataire et le montant du loyer sont requis." }, { status: 400 });
        }

        const rentNum = parseFloat(rentAmount);
        if (isNaN(rentNum) || rentNum <= 0) {
            return NextResponse.json({ error: "Montant du loyer invalide." }, { status: 400 });
        }

        // Capping caution (deposit) and advance to 2 months maximum (Arts. 415 & 416 CCH)
        const maxLimit = rentNum * 2;
        const requestedDeposit = depositAmount ? parseFloat(depositAmount) : maxLimit;
        const requestedAdvance = avanceLoyer ? parseFloat(avanceLoyer) : maxLimit;

        const finalDeposit = Math.min(requestedDeposit, maxLimit);
        const finalAdvance = Math.min(requestedAdvance, maxLimit);

        // Récupérer le propriétaire pour le PDF
        const owner = await prisma.user.findUnique({
            where: { id: user.userId },
            select: { firstName: true, lastName: true, email: true, phone: true }
        });
        const ownerFullName = owner
            ? `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || owner.email || 'Propriétaire'
            : 'Propriétaire QAPRIL';

        // Trouver ou créer le locataire
        const cleanEmail = tenantEmail ? tenantEmail.trim().toLowerCase() : null;
        const cleanPhone = tenantPhone ? tenantPhone.trim() : null;

        let tenant = await prisma.user.findFirst({
            where: {
                OR: [
                    ...(cleanEmail ? [{ email: cleanEmail }] : []),
                    ...(cleanPhone ? [{ phone: cleanPhone }] : []),
                ],
            },
        });

        if (!tenant) {
            const nameParts = (tenantName || "Locataire").trim().split(' ');
            tenant = await prisma.user.create({
                data: {
                    email: cleanEmail || `tenant_${Date.now()}@qapril.net`,
                    phone: cleanPhone,
                    firstName: nameParts[0] || 'Locataire',
                    lastName: nameParts.slice(1).join(' ') || '',
                    role: 'LOCATAIRE',
                    status: 'PENDING'
                }
            });
        } else if (tenantName && (!tenant.firstName || tenant.firstName === 'Locataire')) {
            const nameParts = tenantName.trim().split(' ');
            await prisma.user.update({
                where: { id: tenant.id },
                data: {
                    firstName: nameParts[0] || tenant.firstName,
                    lastName: nameParts.slice(1).join(' ') || tenant.lastName,
                }
            }).catch(() => null);
        }

        // Trouver la propriété
        const property = await prisma.property.findUnique({
            where: { id: propertyId }
        });

        if (!property) {
            return NextResponse.json({ error: "Propriété non trouvée" }, { status: 404 });
        }

        const tenantFullName = `${tenant.firstName || ''} ${tenant.lastName || ''}`.trim() || tenant.email || 'Locataire';

        // 1. Générer le VRAI PDF officiel
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const { height } = page.getSize();
        
        page.drawText('CONTRAT DE BAIL D\'HABITATION - QAPRIL', { x: 50, y: height - 80, size: 20, font: boldFont, color: rgb(0.1, 0.3, 0.24) });
        page.drawText('Conforme à la Loi N° 2019-576 du Code de la Construction et de l\'Habitat', { x: 50, y: height - 102, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
        page.drawText(`Fait à Abidjan, le ${new Date().toLocaleDateString('fr-FR')}`, { x: 50, y: height - 130, size: 11, font });
        
        page.drawText('1. PARTIES SOUSSIGNÉES :', { x: 50, y: height - 170, size: 13, font: boldFont });
        page.drawText(`Le Bailleur (Propriétaire) : ${ownerFullName}`, { x: 50, y: height - 190, size: 11, font });
        if (owner?.phone) page.drawText(`Contact Bailleur : ${owner.phone}`, { x: 50, y: height - 205, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
        page.drawText(`Le Preneur (Locataire) : ${tenantFullName}`, { x: 50, y: height - 225, size: 11, font });
        page.drawText(`Contact Locataire : ${tenant.phone || tenant.email || 'Non renseigné'}`, { x: 50, y: height - 240, size: 10, font, color: rgb(0.3, 0.3, 0.3) });

        page.drawText('2. DÉSIGNATION DU BIEN LOUÉ :', { x: 50, y: height - 275, size: 13, font: boldFont });
        page.drawText(`Nom / Désignation : ${property.name || 'Logement'}`, { x: 50, y: height - 295, size: 11, font });
        page.drawText(`Commune / Quartier : ${property.commune || 'Abidjan'}`, { x: 50, y: height - 310, size: 11, font });
        page.drawText(`Adresse : ${property.address || 'Adresse déclarée'}`, { x: 50, y: height - 325, size: 11, font });
        page.drawText(`Code Propriété : ${property.propertyCode || 'Enregistré'}`, { x: 50, y: height - 340, size: 10, font, color: rgb(0.3, 0.3, 0.3) });

        page.drawText('3. CONDITIONS FINANCIÈRES & SÛRETÉS (LOI 2019-576) :', { x: 50, y: height - 375, size: 13, font: boldFont });
        page.drawText(`Loyer mensuel principal : ${rentNum.toLocaleString('fr-FR')} XOF`, { x: 50, y: height - 395, size: 11, font: boldFont });
        page.drawText(`Dépôt de garantie (Caution) : ${finalDeposit.toLocaleString('fr-FR')} XOF (Consigné CDC-CI · Max légal 2 mois)`, { x: 50, y: height - 415, size: 11, font });
        page.drawText(`Avance sur loyer : ${finalAdvance.toLocaleString('fr-FR')} XOF (Max légal 2 mois)`, { x: 50, y: height - 430, size: 11, font });
        if (chargesAmount) {
            page.drawText(`Provisions pour charges : ${parseFloat(chargesAmount).toLocaleString('fr-FR')} XOF / mois`, { x: 50, y: height - 445, size: 10, font });
        }

        page.drawText('4. DURÉE DU BAIL & ENREGISTREMENT :', { x: 50, y: height - 475, size: 13, font: boldFont });
        page.drawText(`Durée : ${durationMonths ? parseInt(durationMonths) : 12} mois à compter de la date de prise d'effet`, { x: 50, y: height - 495, size: 11, font });
        page.drawText('Enregistrement fiscal : Requis auprès de la DGI dans les 30 jours (art. 414 CCH)', { x: 50, y: height - 510, size: 10, font, color: rgb(0.3, 0.3, 0.3) });

        page.drawText('5. SIGNATURES PAR CODE SMS (OTP CERTIFIÉ) :', { x: 50, y: height - 560, size: 13, font: boldFont });
        page.drawText('Pour le Propriétaire', { x: 50, y: height - 590, size: 11, font: boldFont });
        page.drawText('Signé électroniquement via QAPRIL', { x: 50, y: height - 610, size: 9, font, color: rgb(0, 0.5, 0.3) });

        page.drawText('Pour le Locataire', { x: 380, y: height - 590, size: 11, font: boldFont });
        page.drawText('En attente de signature par code OTP SMS', { x: 380, y: height - 610, size: 9, font, color: rgb(0.7, 0.4, 0) });

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
                qrCodeUrl: fileUrl
            }
        });

        // 3. Mettre à jour le statut du bien
        await prisma.property.update({
            where: { id: propertyId },
            data: { status: 'rented' }
        }).catch(() => null);

        // 4. Envoyer le SMS d'invitation au locataire
        if (tenant.phone) {
            await sendSMS(
                tenant.phone, 
                `QAPRIL : Votre contrat de bail pour "${property.name || 'votre nouveau logement'}" a été créé par votre propriétaire. Connectez-vous sur QAPRIL pour le signer.`
            ).catch((smsErr) => console.warn('[SMS] Erreur envoi SMS locataire:', smsErr));
        }

        return NextResponse.json({ 
            success: true, 
            message: "Bail généré avec succès",
            lease: newLease,
            pdfUrl: fileUrl
        });

    } catch (error) {
        console.error("[MOBILE API] proprietaire/leases/create error:", error);
        return NextResponse.json({ error: "Erreur interne lors de la création du bail" }, { status: 500 });
    }
}
