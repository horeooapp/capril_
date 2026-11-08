import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';
import { calculerNiveauResidence, genererPdfAttestationResidence } from '@/lib/occupants-attestation';
import crypto from 'crypto';

/**
 * POST /api/v1/users/[id]/attestations
 * Émettre une Attestation de Résidence officielle certifiée (RG-OCC-13 à 15)
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: "Non autorisé. Jeton invalide ou expiré." }, { status: 401 });
        }

        const { id: targetUserId } = await params;
        if (user.userId !== targetUserId) {
            return NextResponse.json({ error: "Accès refusé. Vous ne pouvez demander que votre propre attestation." }, { status: 403 });
        }

        const body = await request.json().catch(() => ({}));
        const { leaseId } = body;

        if (!leaseId) {
            return NextResponse.json({ error: "Le contrat de bail de référence est obligatoire." }, { status: 400 });
        }

        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            include: { property: true, tenant: true }
        });

        if (!lease) {
            return NextResponse.json({ error: "Bail introuvable." }, { status: 404 });
        }

        const dbUser = await prisma.user.findUnique({
            where: { id: targetUserId },
            include: { adresseMaPoste: true }
        });

        if (!dbUser) {
            return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
        }

        // 1. Calcul du niveau de preuve légal (A, B ou C)
        const evaluation = await calculerNiveauResidence(targetUserId, leaseId);

        // 2. Numérotation officielle unique (ATT-AAAA-MM-NNNNNN)
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const count = await prisma.attestationResidence.count();
        const numero = `ATT-${year}-${month}-${String(count + 1).padStart(6, '0')}`;

        // 3. Dates de validité (3 mois selon RG-OCC-13)
        const emiseAt = new Date();
        const valideJusque = new Date();
        valideJusque.setMonth(valideJusque.getMonth() + 3);

        const tokenVerif = crypto.randomBytes(16).toString('hex');
        const beneficiaireNom = `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim() || dbUser.email || 'Résident';

        // 4. Génération du document PDF certifié
        const pdfResult = await genererPdfAttestationResidence({
            attestationNumero: numero,
            beneficiaireNom,
            beneficiaireTelephone: dbUser.phone || undefined,
            qualite: evaluation.qualite,
            niveau: evaluation.niveau,
            mentionLegaleNiveau: evaluation.motif,
            structureNom: lease.property.name || 'Logement',
            commune: lease.property.commune,
            adresse: lease.property.address,
            etagePorte: lease.property.unitLabel || undefined,
            codeLocalisation: lease.property.codeLocalisation || undefined,
            w3w: lease.property.w3w || undefined,
            dateEntree: lease.startDate,
            dateEmission: emiseAt,
            dateExpiration: valideJusque,
            leaseRef: lease.leaseReference,
            isDgiEnregistre: evaluation.details.isDgiEnregistre,
            tokenVerif,
            identifiantMaPoste: dbUser.adresseMaPoste?.identifiantBoite || undefined
        });

        // 5. Enregistrement en base de données
        const attestation = await prisma.attestationResidence.create({
            data: {
                beneficiaireId: targetUserId,
                qualite: evaluation.qualite,
                leaseId,
                niveau: evaluation.niveau,
                numero,
                emiseAt,
                valideJusque,
                statut: 'VALIDE',
                sha256: pdfResult.sha256,
                tokenVerif,
                pdfUrl: pdfResult.publicUrl
            }
        });

        const host = request.headers.get('host') || 'qapril.net';
        const protocol = request.url.startsWith('https') ? 'https' : 'https';
        const fullPdfUrl = `${protocol}://${host}${pdfResult.publicUrl}`;

        return NextResponse.json({
            success: true,
            message: `Attestation de Niveau ${evaluation.niveau} générée avec succès (valable 3 mois).`,
            attestation: {
                id: attestation.id,
                numero: attestation.numero,
                niveau: attestation.niveau,
                qualite: attestation.qualite,
                valideJusque: attestation.valideJusque,
                pdfUrl: fullPdfUrl,
                tokenVerif: attestation.tokenVerif,
                verificationUrl: `${protocol}://${host}/verif/attestation/${tokenVerif}`
            }
        }, { status: 201 });

    } catch (error: any) {
        console.error("[GENERATE ATTESTATION API] Error:", error);
        return NextResponse.json({ error: "Erreur lors de la génération de l'attestation de résidence." }, { status: 500 });
    }
}
