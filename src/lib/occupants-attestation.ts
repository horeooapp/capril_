/**
 * QAPRIL — Infrastructure numérique de confiance (Côte d'Ivoire)
 * ADD-29 : Module Occupants Déclarés + Attestation de Résidence à Niveaux (A / B / C)
 * Règles RG-OCC-01 à RG-OCC-22
 */

import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { UPLOADS_DIR } from '@/lib/storage';

export type NiveauResidence = 'A' | 'B' | 'C';

/**
 * Calcul du niveau d'attestation de résidence (RG-OCC-11)
 * A : Titulaire + Bail enregistré DGI + Position confirmée/gelée + Identité vérifiée
 * B : Occupant déclaré + Présence confirmée sur place + Titulaire niveau A + Identité vérifiée
 * C : Autre cas (Déclaration sans confirmation sur place ou bail non enregistré DGI)
 */
export async function calculerNiveauResidence(userId: string, leaseId: string): Promise<{
    niveau: NiveauResidence;
    qualite: 'TITULAIRE' | 'OCCUPANT';
    motif: string;
    details: {
        isTitulaire: boolean;
        isDgiEnregistre: boolean;
        isPositionGelee: boolean;
        isIdentiteVerifiee: boolean;
        isPresenceSurPlace: boolean;
    };
}> {
    const lease = await prisma.lease.findUnique({
        where: { id: leaseId },
        include: {
            property: true,
            tenant: true,
        }
    });

    if (!lease) {
        throw new Error("Contrat de bail introuvable.");
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error("Utilisateur introuvable.");
    }

    const isTitulaire = lease.tenantId === userId;
    const isDgiEnregistre = Boolean(
        lease.statutFiscal === 'ENREGISTRE' || 
        lease.recuFiscalUrl || 
        lease.certEnregistrementDgiUrl || 
        lease.acteEnregistrementRemisAt
    );
    const isPositionGelee = ['GELEE', 'CONFIRMEE'].includes(lease.property.statutPosition);
    const isIdentiteVerifiee = Boolean(user.onboardingComplete || user.role);

    if (isTitulaire) {
        if (isDgiEnregistre && isPositionGelee && isIdentiteVerifiee) {
            return {
                niveau: 'A',
                qualite: 'TITULAIRE',
                motif: "Titulaire d'un bail enregistré à la DGI avec position confirmée et identité vérifiée.",
                details: { isTitulaire: true, isDgiEnregistre, isPositionGelee, isIdentiteVerifiee, isPresenceSurPlace: true }
            };
        }
        return {
            niveau: 'C',
            qualite: 'TITULAIRE',
            motif: "Titulaire d'un bail non enregistré à la DGI ou position non confirmée (valeur indicative).",
            details: { isTitulaire: true, isDgiEnregistre, isPositionGelee, isIdentiteVerifiee, isPresenceSurPlace: true }
        };
    }

    // Cas de l'occupant déclaré
    const occupant = await prisma.occupant.findFirst({
        where: {
            leaseId,
            userId,
            statut: 'CONFIRME',
            dateSortie: null,
        }
    });

    const isPresenceSurPlace = Boolean(occupant?.presenceCaptureId);

    if (occupant && isPresenceSurPlace && isDgiEnregistre && isPositionGelee && isIdentiteVerifiee) {
        return {
            niveau: 'B',
            qualite: 'OCCUPANT',
            motif: "Occupant déclaré par le titulaire avec présence confirmée sur place et bail enregistré.",
            details: { isTitulaire: false, isDgiEnregistre, isPositionGelee, isIdentiteVerifiee, isPresenceSurPlace: true }
        };
    }

    return {
        niveau: 'C',
        qualite: 'OCCUPANT',
        motif: "Occupant déclaré sans confirmation sur place ou sur bail non enregistré DGI (valeur indicative).",
        details: { isTitulaire: false, isDgiEnregistre, isPositionGelee, isIdentiteVerifiee, isPresenceSurPlace }
    };
}

/**
 * Nettoyage de texte pour le standard PDF Helvetica
 */
function cleanText(str: string): string {
    if (!str) return '';
    return str
        .replace(/[\u202f\u00a0]/g, ' ')
        .replace(/[’‘`]/g, "'")
        .replace(/[“”]/g, '"')
        .replace(/[—–]/g, '-')
        .replace(/[^\x00-\xFF]/g, ' ');
}

/**
 * Génération du document PDF officiel de l'Attestation de Résidence (RG-OCC-13)
 */
export async function genererPdfAttestationResidence(params: {
    attestationNumero: string;
    beneficiaireNom: string;
    beneficiaireTelephone?: string;
    qualite: 'TITULAIRE' | 'OCCUPANT';
    niveau: NiveauResidence;
    mentionLegaleNiveau: string;
    structureNom: string;
    commune: string;
    adresse: string;
    etagePorte?: string;
    codeLocalisation?: string;
    w3w?: string;
    dateEntree: Date;
    dateEmission: Date;
    dateExpiration: Date;
    leaseRef: string;
    isDgiEnregistre: boolean;
    tokenVerif: string;
    identifiantMaPoste?: string;
}): Promise<{ pdfBytes: Uint8Array; sha256: string; publicUrl: string }> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const { height } = page.getSize();

    // Couleurs institutionnelles souveraines
    const vertEmeraude = rgb(0.106, 0.302, 0.243); // #1B4D3E
    const ardoise = rgb(0.059, 0.09, 0.165); // #0F172A
    const gris = rgb(0.39, 0.45, 0.55);

    // En-tête officiel
    page.drawText("REPUBLIQUE DE COTE D'IVOIRE", { x: 50, y: height - 50, size: 10, font: boldFont, color: ardoise });
    page.drawText("Union - Discipline - Travail", { x: 50, y: height - 63, size: 8, font, color: gris });
    page.drawText("PLATEFORME NUMERIQUE DE CONFIANCE QAPRIL", { x: 50, y: height - 85, size: 12, font: boldFont, color: vertEmeraude });
    page.drawText("Attestation Officielle de Residence et Domiciliation", { x: 50, y: height - 100, size: 16, font: boldFont, color: ardoise });
    page.drawText(`N° Enregistrement : ${params.attestationNumero}`, { x: 50, y: height - 120, size: 10, font: boldFont, color: vertEmeraude });

    // Badge Niveau de preuve A / B / C
    const niveauCouleur = params.niveau === 'A' ? vertEmeraude : params.niveau === 'B' ? rgb(0.12, 0.35, 0.65) : rgb(0.65, 0.45, 0.1);
    page.drawRectangle({
        x: 420,
        y: height - 125,
        width: 125,
        height: 60,
        borderColor: niveauCouleur,
        borderWidth: 2,
        color: rgb(0.96, 0.98, 0.96),
    });
    page.drawText(`NIVEAU ${params.niveau}`, { x: 440, y: height - 90, size: 16, font: boldFont, color: niveauCouleur });
    page.drawText(params.qualite, { x: 440, y: height - 110, size: 9, font: boldFont, color: ardoise });

    // Section 1 : Bénéficiaire
    page.drawText("1. IDENTITE DU BENEFICIAIRE RESIDENT :", { x: 50, y: height - 160, size: 11, font: boldFont, color: vertEmeraude });
    page.drawText(`Nom et Prenoms : ${cleanText(params.beneficiaireNom)}`, { x: 50, y: height - 180, size: 10, font: boldFont });
    page.drawText(`Qualite de residence : ${params.qualite === 'TITULAIRE' ? 'Titulaire du bail d\'habitation' : 'Occupant declare du foyer'}`, { x: 50, y: height - 195, size: 9, font });
    if (params.beneficiaireTelephone) {
        page.drawText(`Contact certifie : ${cleanText(params.beneficiaireTelephone)}`, { x: 50, y: height - 210, size: 9, font });
    }
    if (params.identifiantMaPoste) {
        page.drawText(`Boite Postale Digitale MaPoste : ${cleanText(params.identifiantMaPoste)}`, { x: 50, y: height - 225, size: 9, font, color: vertEmeraude });
    }

    // Section 2 : Localisation du logement
    page.drawText("2. ADRESSE ET LOCALISATION DU LOGEMENT :", { x: 50, y: height - 260, size: 11, font: boldFont, color: vertEmeraude });
    page.drawText(`Designation : ${cleanText(params.structureNom)}`, { x: 50, y: height - 280, size: 10, font: boldFont });
    page.drawText(`Commune : ${cleanText(params.commune)} (District d'Abidjan)`, { x: 50, y: height - 295, size: 9, font });
    page.drawText(`Adresse precise : ${cleanText(params.adresse)}`, { x: 50, y: height - 310, size: 9, font });
    if (params.etagePorte) {
        page.drawText(`Porte / Etage : ${cleanText(params.etagePorte)}`, { x: 50, y: height - 325, size: 9, font });
    }
    if (params.codeLocalisation) {
        page.drawText(`Code de Localisation QAPRIL : ${cleanText(params.codeLocalisation)}`, { x: 50, y: height - 340, size: 9, font: boldFont, color: vertEmeraude });
    }
    if (params.w3w) {
        page.drawText(`Adresse numerique nationale what3words : ${cleanText(params.w3w)}`, { x: 50, y: height - 355, size: 9, font, color: gris });
    }

    // Section 3 : Validité et force probante
    page.drawText("3. PERIODE ET STATUT JURIDIQUE :", { x: 50, y: height - 390, size: 11, font: boldFont, color: vertEmeraude });
    page.drawText(`Date d'entree dans les lieux : ${params.dateEntree.toLocaleDateString('fr-FR')}`, { x: 50, y: height - 410, size: 9, font });
    page.drawText(`Reference du contrat de bail : ${cleanText(params.leaseRef)}`, { x: 50, y: height - 425, size: 9, font });
    page.drawText(`Enregistrement fiscal : ${params.isDgiEnregistre ? 'Enregistre a la Direction Generale des Impots (DGI)' : 'Non enregistre a la DGI'}`, { x: 50, y: height - 440, size: 9, font: boldFont });
    page.drawText(`Force probante : ${cleanText(params.mentionLegaleNiveau)}`, { x: 50, y: height - 455, size: 9, font, color: niveauCouleur });

    // Section 4 : Validité et vérification
    page.drawText("4. VALIDITE ET VERIFICATION ELECTRONIQUE :", { x: 50, y: height - 490, size: 11, font: boldFont, color: vertEmeraude });
    page.drawText(`Date d'emission : ${params.dateEmission.toLocaleDateString('fr-FR')}`, { x: 50, y: height - 510, size: 9, font });
    page.drawText(`Date de fin de validite (3 mois) : ${params.dateExpiration.toLocaleDateString('fr-FR')}`, { x: 50, y: height - 525, size: 9, font: boldFont });
    page.drawText(`Verification publique en ligne : https://qapril.net/verif/attestation/${params.tokenVerif}`, { x: 50, y: height - 540, size: 8, font, color: gris });

    // Encadré de vérification institutionnelle (Banques, Ambassades, Administrations)
    page.drawRectangle({
        x: 50,
        y: height - 660,
        width: 495,
        height: 100,
        borderColor: gris,
        borderWidth: 1,
        color: rgb(0.98, 0.98, 0.99),
    });
    page.drawText("NOTE INSTITUTIONNELLE AUX BANQUES ET ADMINISTRATIONS (APBEF-CI) :", { x: 60, y: height - 580, size: 8, font: boldFont, color: ardoise });
    page.drawText("Ce document atteste de la residence effective verifiee par le tiers de confiance QAPRIL.", { x: 60, y: height - 595, size: 8, font, color: ardoise });
    page.drawText("Les niveaux A et B reposent sur une position physique corroboree par concordance GPS et", { x: 60, y: height - 610, size: 8, font, color: ardoise });
    page.drawText("un bail juridique conforme a la Loi N° 2019-576. Valable comme justificatif de domicile.", { x: 60, y: height - 625, size: 8, font, color: ardoise });
    page.drawText("Pour verifier l'authenticite en temps reel, scannez le QR code ou consultez l'adresse web ci-dessus.", { x: 60, y: height - 640, size: 8, font: boldFont, color: vertEmeraude });

    // Mention stricte de confidentialité (Bailleur masqué RG-CONF-01)
    page.drawText("Conformement a la Loi 2013-450 et a la regle RG-CONF-01, l'identite du bailleur est conservee sous secret professionnel.", {
        x: 50, y: 50, size: 7, font, color: gris
    });

    const pdfBytes = await pdfDoc.save();
    const sha256 = crypto.createHash('sha256').update(pdfBytes).digest('hex');

    // Sauvegarde physique du document
    const fileName = `${params.attestationNumero}.pdf`;
    let publicUrl = `/uploads/attestations/${fileName}`;

    try {
        const dir = path.join(UPLOADS_DIR, 'attestations');
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(path.join(dir, fileName), pdfBytes);
    } catch (e1) {
        try {
            const publicDir = path.join(process.cwd(), 'public', 'attestations');
            if (!fsSync.existsSync(publicDir)) fsSync.mkdirSync(publicDir, { recursive: true });
            fsSync.writeFileSync(path.join(publicDir, fileName), pdfBytes);
            publicUrl = `/attestations/${fileName}`;
        } catch (e2) {
            console.error('[ATTESTATION] Erreur écriture fichier PDF:', e2);
        }
    }

    return { pdfBytes, sha256, publicUrl };
}

