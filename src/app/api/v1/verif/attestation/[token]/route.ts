import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

/**
 * GET /api/v1/verif/attestation/[token]
 * Consultation et vérification publique d'une Attestation de Résidence par scan QR (RG-OCC-14)
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;

        const attestation = await prisma.attestationResidence.findUnique({
            where: { tokenVerif: token },
            include: {
                beneficiaire: { select: { firstName: true, lastName: true } },
                lease: {
                    select: {
                        leaseReference: true,
                        property: { select: { commune: true, codeLocalisation: true } }
                    }
                }
            }
        });

        if (!attestation) {
            return NextResponse.json({
                success: false,
                statut: 'INTROUVABLE',
                message: "Cette attestation de résidence n'existe pas ou le QR code est invalide."
            }, { status: 404 });
        }

        // Vérification de la date d'expiration
        let statutActuel = attestation.statut;
        if (statutActuel === 'VALIDE' && new Date() > new Date(attestation.valideJusque)) {
            statutActuel = 'EXPIREE';
            await prisma.attestationResidence.update({
                where: { id: attestation.id },
                data: { statut: 'EXPIREE' }
            }).catch(() => null);
        }

        // Journalisation de la vérification et incrément compteur (RG-OCC-14)
        const forwardedFor = request.headers.get('x-forwarded-for') || '';
        const ipHash = forwardedFor ? crypto.createHash('sha256').update(forwardedFor).digest('hex') : null;

        await prisma.verificationAttestation.create({
            data: {
                attestationId: attestation.id,
                canal: 'QR',
                ipHash
            }
        }).catch(() => null);

        await prisma.attestationResidence.update({
            where: { id: attestation.id },
            data: { nbVerifications: { increment: 1 } }
        }).catch(() => null);

        const nomMasque = attestation.beneficiaire
            ? `${attestation.beneficiaire.firstName || ''} ${attestation.beneficiaire.lastName || ''}`.trim()
            : 'Résident certifié';

        return NextResponse.json({
            success: true,
            attestation: {
                numero: attestation.numero,
                statut: statutActuel,
                niveau: attestation.niveau,
                qualite: attestation.qualite,
                beneficiaire: nomMasque,
                commune: attestation.lease.property.commune,
                codeLocalisation: attestation.lease.property.codeLocalisation,
                emiseLe: attestation.emiseAt,
                valideJusque: attestation.valideJusque,
                nbVerifications: attestation.nbVerifications + 1,
                sha256: attestation.sha256,
            }
        });

    } catch (error: any) {
        console.error("[VERIF ATTESTATION API] Error:", error);
        return NextResponse.json({ error: "Erreur lors de la vérification du document." }, { status: 500 });
    }
}
