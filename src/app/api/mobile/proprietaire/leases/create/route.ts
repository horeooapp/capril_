import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { UPLOADS_DIR } from '@/lib/storage';
import { sendSMS } from '@/lib/sms';

// Fonction de nettoyage strict pour PDF (compatible Helvetica / WinAnsi)
function cleanPdfText(str: string): string {
    if (!str) return '';
    return str
        .replace(/[\u202f\u00a0]/g, ' ')
        .replace(/[’‘`]/g, "'")
        .replace(/[“”]/g, '"')
        .replace(/[—–]/g, '-')
        .replace(/[•·]/g, '-')
        .replace(/[^\x00-\xFF]/g, ' ');
}

const formatNumber = (val: number) => String(Math.round(val)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export async function POST(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: "Non autorisé. Jeton invalide ou expiré." }, { status: 401 });
        }

        const dbUser = await prisma.user.findUnique({
            where: { id: user.userId },
            include: {
                propertiesOwned: { select: { id: true }, take: 1 },
                propertiesManaged: { select: { id: true }, take: 1 }
            }
        });
        if (!dbUser) {
            return NextResponse.json({ error: "Compte utilisateur introuvable." }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
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
            return NextResponse.json({ 
                error: "Le bien immobilier, les coordonnées du locataire et le montant du loyer sont requis." 
            }, { status: 400 });
        }

        // 1. Récupération de la propriété
        const property = await prisma.property.findUnique({
            where: { id: propertyId }
        });
        if (!property) {
            return NextResponse.json({ error: "Propriété non trouvée." }, { status: 404 });
        }

        // 2. Contrôle des autorisations (Bailleur, Propriétaire ou Agence gestionnaire)
        const isOwnerOrManager = property.ownerUserId === dbUser.id || property.managedByUserId === dbUser.id;
        const effectiveRole = String(dbUser.role || user.role || '').toUpperCase();
        const allowedRoles = ['PROPRIETAIRE', 'BAILLEUR', 'LANDLORD', 'LANDLORD_PRO', 'AGENCY', 'AGENCE', 'AGENCE_AGREE', 'NON_CERTIFIED_AGENT', 'ADMIN', 'SUPER_ADMIN'];

        const hasOwnedOrManaged = (dbUser.propertiesOwned?.length || 0) > 0 || (dbUser.propertiesManaged?.length || 0) > 0;
        const hasAccess = isOwnerOrManager || allowedRoles.includes(effectiveRole) || hasOwnedOrManaged;
        if (!hasAccess) {
            return NextResponse.json({ error: "Accès réservé aux bailleurs et agences gestionnaires." }, { status: 403 });
        }

        // Mise à niveau du rôle bailleur si le compte était encore sous le rôle par défaut 'TENANT'
        if (dbUser.role === 'TENANT') {
            await prisma.user.update({
                where: { id: dbUser.id },
                data: { role: 'LANDLORD', capaciteActive: 'LANDLORD' }
            }).catch(() => null);
        }

        // 3. Traitement financier & plafonnements légaux (Loi 2019-576 Arts. 415 & 416 CCH)
        const rentNum = Math.round(parseFloat(String(rentAmount).replace(/\s/g, '')));
        if (isNaN(rentNum) || rentNum <= 0) {
            return NextResponse.json({ error: "Montant du loyer mensuel invalide." }, { status: 400 });
        }

        const maxLegalLimit = rentNum * 2;
        const requestedDeposit = depositAmount ? Math.round(parseFloat(String(depositAmount).replace(/\s/g, ''))) : maxLegalLimit;
        const requestedAdvance = avanceLoyer ? Math.round(parseFloat(String(avanceLoyer).replace(/\s/g, ''))) : maxLegalLimit;

        const finalDeposit = Math.min(requestedDeposit, maxLegalLimit);
        const finalAdvance = Math.min(requestedAdvance, maxLegalLimit);
        const finalCharges = chargesAmount ? Math.round(parseFloat(String(chargesAmount).replace(/\s/g, ''))) : 0;
        const parsedDuration = durationMonths ? parseInt(String(durationMonths), 10) : 12;

        const ownerFullName = cleanPdfText(
            `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim() || dbUser.email || dbUser.phone || 'Propriétaire QAPRIL'
        );

        // 4. Recherche ou création du locataire
        const cleanEmail = tenantEmail ? String(tenantEmail).trim().toLowerCase() : null;
        const cleanPhone = tenantPhone ? String(tenantPhone).trim() : null;

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
                    email: cleanEmail || `tenant_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@qapril.net`,
                    phone: cleanPhone,
                    firstName: nameParts[0] || 'Locataire',
                    lastName: nameParts.slice(1).join(' ') || '',
                    role: 'TENANT', // Enum Prisma strict (pas 'LOCATAIRE')
                    capaciteActive: 'LOCATAIRE',
                    onboardingComplete: true
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

        const tenantFullName = cleanPdfText(
            `${tenant.firstName || ''} ${tenant.lastName || ''}`.trim() || tenant.email || tenant.phone || 'Locataire'
        );

        // 5. Génération du PDF officiel conforme et scellé
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595.28, 841.89]); // A4
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const { height } = page.getSize();

        // Référence unique du bail
        const year = new Date().getFullYear();
        const randCode = Math.floor(100000 + Math.random() * 900000);
        const leaseRef = `BAIL-${year}-${randCode}`;

        page.drawText('CONTRAT DE BAIL D\'HABITATION - QAPRIL', {
            x: 50, y: height - 70, size: 18, font: boldFont, color: rgb(0.1, 0.3, 0.24)
        });
        page.drawText('Conforme a la Loi N 2019-576 du Code de la Construction et de l\'Habitat', {
            x: 50, y: height - 90, size: 9, font, color: rgb(0.4, 0.4, 0.4)
        });
        page.drawText(`Reference officielle : ${leaseRef} - Fait a Abidjan le ${new Date().toLocaleDateString('fr-FR')}`, {
            x: 50, y: height - 110, size: 10, font: boldFont, color: rgb(0.2, 0.2, 0.2)
        });

        // 1. Parties
        page.drawText('1. PARTIES SOUSSIGNEES :', { x: 50, y: height - 145, size: 12, font: boldFont });
        page.drawText(`Bailleur (Proprietaire) : ${ownerFullName}`, { x: 50, y: height - 165, size: 10, font });
        if (dbUser.phone) page.drawText(`Contact Bailleur : ${cleanPdfText(dbUser.phone)}`, { x: 50, y: height - 180, size: 9, font, color: rgb(0.3, 0.3, 0.3) });

        page.drawText(`Preneur (Locataire) : ${tenantFullName}`, { x: 50, y: height - 200, size: 10, font });
        page.drawText(`Contact Locataire : ${cleanPdfText(tenant.phone || tenant.email || 'Non renseigne')}`, { x: 50, y: height - 215, size: 9, font, color: rgb(0.3, 0.3, 0.3) });

        // 2. Bien loué
        page.drawText('2. DESIGNATION DU BIEN LOUE :', { x: 50, y: height - 245, size: 12, font: boldFont });
        page.drawText(`Designation : ${cleanPdfText(property.name || 'Logement')}`, { x: 50, y: height - 265, size: 10, font });
        page.drawText(`Commune : ${cleanPdfText(property.commune || 'Abidjan')}`, { x: 50, y: height - 280, size: 10, font });
        page.drawText(`Adresse precise : ${cleanPdfText(property.address || 'Adresse declaree')}`, { x: 50, y: height - 295, size: 10, font });
        page.drawText(`Immatriculation bien : ${cleanPdfText(property.propertyCode || 'Enregistre')}`, { x: 50, y: height - 310, size: 9, font, color: rgb(0.3, 0.3, 0.3) });

        // 3. Conditions financières
        page.drawText('3. CONDITIONS FINANCIERES & SURETES (LOI 2019-576) :', { x: 50, y: height - 340, size: 12, font: boldFont });
        page.drawText(`Loyer mensuel principal : ${formatNumber(rentNum)} FCFA`, { x: 50, y: height - 360, size: 10, font: boldFont });
        page.drawText(`Depot de garantie (Caution) : ${formatNumber(finalDeposit)} FCFA (Max legal 2 mois)`, { x: 50, y: height - 378, size: 10, font });
        page.drawText(`Avance sur loyer : ${formatNumber(finalAdvance)} FCFA (Max legal 2 mois)`, { x: 50, y: height - 395, size: 10, font });
        if (finalCharges > 0) {
            page.drawText(`Charges mensuelles : ${formatNumber(finalCharges)} FCFA / mois`, { x: 50, y: height - 412, size: 9, font });
        }

        // 4. Durée & DGI
        page.drawText('4. DUREE DU CONTRAT & ENREGISTREMENT FISCAL :', { x: 50, y: height - 440, size: 12, font: boldFont });
        page.drawText(`Duree initiale : ${parsedDuration} mois renouvelables par tacite reconduction`, { x: 50, y: height - 460, size: 10, font });
        page.drawText('Formalite fiscale : Enregistrement DGI obligatoire sous 30 jours (art. 414 CCH)', { x: 50, y: height - 475, size: 9, font, color: rgb(0.3, 0.3, 0.3) });

        // 5. Signatures électroniques
        page.drawText('5. SIGNATURES NUMERIQUES (LOI 2013-546 PREUVE ELECTRONIQUE) :', { x: 50, y: height - 510, size: 11, font: boldFont });
        page.drawText('Pour le Proprietaire / Bailleur :', { x: 50, y: height - 535, size: 10, font: boldFont });
        page.drawText('Signe et valide electroniquement via QAPRIL', { x: 50, y: height - 550, size: 9, font, color: rgb(0.1, 0.5, 0.3) });

        page.drawText('Pour le Preneur / Locataire :', { x: 340, y: height - 535, size: 10, font: boldFont });
        page.drawText('En attente de signature par code OTP SMS', { x: 340, y: height - 550, size: 9, font, color: rgb(0.7, 0.4, 0) });

        page.drawText('Certifie conforme et horodate par le tiers de confiance numerique QAPRIL.', {
            x: 50, y: 50, size: 8, font, color: rgb(0.5, 0.5, 0.5)
        });

        const pdfBytes = await pdfDoc.save();

        // 6. Sauvegarde sécurisée du PDF (Dossier uploads persistant)
        const fileName = `${leaseRef}.pdf`;
        let publicRelativeUrl = `/uploads/leases/${fileName}`;

        try {
            const leasesUploadDir = path.join(UPLOADS_DIR, 'leases');
            await fs.mkdir(leasesUploadDir, { recursive: true });
            await fs.writeFile(path.join(leasesUploadDir, fileName), pdfBytes);
        } catch (e1) {
            console.warn('[STORAGE] uploads_data indisponible, repli vers public/leases:', e1);
            try {
                const publicDir = path.join(process.cwd(), 'public', 'leases');
                if (!fsSync.existsSync(publicDir)) fsSync.mkdirSync(publicDir, { recursive: true });
                fsSync.writeFileSync(path.join(publicDir, fileName), pdfBytes);
                publicRelativeUrl = `/leases/${fileName}`;
            } catch (e2) {
                console.error('[STORAGE] Echec sauvegarde fichier PDF bail:', e2);
            }
        }

        const host = request.headers.get('host') || 'qapril.net';
        const protocol = request.url.startsWith('https') ? 'https' : 'https';
        const fullPublicPdfUrl = `${protocol}://${host}${publicRelativeUrl}`;

        // 7. Enregistrement du Bail dans la base de données
        const newLease = await prisma.lease.create({
            data: {
                leaseReference: leaseRef,
                propertyId: property.id,
                landlordId: dbUser.id,
                tenantId: tenant.id,
                rentAmount: rentNum,
                chargesAmount: finalCharges,
                depositAmount: finalDeposit,
                avanceLoyer: finalAdvance,
                startDate: new Date(),
                durationMonths: parsedDuration,
                leaseType: property.leaseType || 'residential',
                status: 'ACTIVE',
                qrCodeUrl: fullPublicPdfUrl,
                modeCreation: 'NUMERIQUE'
            }
        });

        // 8. Mise à jour de l'état de la propriété
        await prisma.property.update({
            where: { id: property.id },
            data: { status: 'rented' }
        }).catch(() => null);

        // 9. Notification par SMS du locataire
        if (tenant.phone) {
            await sendSMS(
                tenant.phone, 
                `QAPRIL : Votre contrat de bail pour "${property.name || 'votre logement'}" a ete cree par votre proprietaire. Ref: ${leaseRef}. Connectez-vous sur QAPRIL pour le signer.`
            ).catch((smsErr) => console.warn('[SMS] Erreur envoi SMS locataire:', smsErr));
        }

        return NextResponse.json({ 
            success: true, 
            message: "Bail généré avec succès",
            lease: newLease,
            pdfUrl: fullPublicPdfUrl
        }, { status: 201 });

    } catch (error: any) {
        console.error("[MOBILE API] proprietaire/leases/create error:", error);
        return NextResponse.json({ 
            error: "Erreur lors de la création du bail: " + (error?.message || "Erreur base de données") 
        }, { status: 500 });
    }
}
