import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';
import { calculateDistanceMeters, validateCaptureCoherence } from '@/lib/geo-maposte';

/**
 * POST /api/v1/occupants/[id]/confirmer
 * Confirmation de résidence par l'occupant et vérification de présence sur place (RG-OCC-08 et RG-OCC-09)
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
        }

        const { id: occupantId } = await params;
        const body = await request.json().catch(() => ({}));
        const { confirme = true, lat, lng, precisionM } = body;

        const occupant = await prisma.occupant.findUnique({
            where: { id: occupantId },
            include: {
                property: true,
                lease: true,
            }
        });

        if (!occupant) {
            return NextResponse.json({ error: "Déclaration d'occupant introuvable." }, { status: 404 });
        }

        if (occupant.statut !== 'DECLARE') {
            return NextResponse.json({ error: `Cette déclaration a déjà été traitée (statut actuel : ${occupant.statut}).` }, { status: 400 });
        }

        if (!confirme) {
            // L'occupant répond NON (RG-OCC-08)
            await prisma.occupant.update({
                where: { id: occupantId },
                data: {
                    statut: 'REFUSE',
                    dateSortie: new Date()
                }
            });

            return NextResponse.json({
                success: true,
                message: "Vous avez indiqué ne pas résider à cette adresse. La déclaration a été clôturée."
            });
        }

        let presenceCaptureId: string | null = null;
        let niveauAttribution: 'B' | 'C' = 'C';
        let distanceMeters: number | null = null;

        // Si capture de position GPS fournie (RG-OCC-09)
        if (lat !== undefined && lng !== undefined) {
            const check = validateCaptureCoherence({
                lat: Number(lat),
                lng: Number(lng),
                precisionM: Number(precisionM || 20),
                commune: occupant.property.commune
            });

            if (check.valid && occupant.property.gpsLatitude && occupant.property.gpsLongitude) {
                distanceMeters = calculateDistanceMeters(
                    { lat: Number(lat), lng: Number(lng) },
                    { lat: occupant.property.gpsLatitude, lng: occupant.property.gpsLongitude }
                );

                // Enregistrement de la capture
                const capture = await prisma.capturePosition.create({
                    data: {
                        propertyId: occupant.propertyId,
                        userId: user.userId,
                        role: 'LOCATAIRE',
                        lat: Number(lat),
                        lng: Number(lng),
                        precisionM: Number(precisionM || 20),
                        resultat: distanceMeters <= 30 ? 'ACCEPTEE' : 'REFUSEE',
                        motifRefus: distanceMeters <= 30 ? null : 'PRECISION'
                    }
                });

                // Si concordance <= 30 m et titulaire/bail au niveau A -> Niveau B (RG-OCC-11)
                if (distanceMeters <= 30) {
                    presenceCaptureId = capture.id;
                    const isDgi = Boolean(occupant.lease.statutFiscal === 'ENREGISTRE' || occupant.lease.recuFiscalUrl);
                    const isGelee = ['CONFIRMEE', 'GELEE'].includes(occupant.property.statutPosition);
                    if (isDgi && isGelee) {
                        niveauAttribution = 'B';
                    }
                }
            }
        }

        // Mise à jour de l'occupant en statut CONFIRME
        const updated = await prisma.occupant.update({
            where: { id: occupantId },
            data: {
                userId: user.userId,
                statut: 'CONFIRME',
                confirmeAt: new Date(),
                presenceCaptureId,
                niveau: niveauAttribution
            }
        });

        return NextResponse.json({
            success: true,
            message: niveauAttribution === 'B'
                ? "Résidence confirmée sur place avec succès ! Votre attestation de Niveau B est prête."
                : "Résidence confirmée. Vous pouvez télécharger votre attestation de résidence (Niveau C).",
            niveau: niveauAttribution,
            distanceMeters,
            occupant: updated
        });

    } catch (error: any) {
        console.error("[CONFIRMER OCCUPANT API] Error:", error);
        return NextResponse.json({ error: "Erreur lors de la confirmation de résidence." }, { status: 500 });
    }
}
