import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';
import { 
    validateCaptureCoherence, 
    confirmerPositionParConcordance, 
    generateLocalisationCode, 
    deriveSimulatedW3W 
} from '@/lib/geo-maposte';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: "Non autorisé. Jeton invalide ou expiré." }, { status: 401 });
        }

        const { id: propertyId } = await params;
        const body = await request.json().catch(() => ({}));
        const { lat, lng, precisionM, appareilId, canal = 'APP', isSimulated = false } = body;

        const property = await prisma.property.findUnique({
            where: { id: propertyId }
        });

        if (!property) {
            return NextResponse.json({ error: "Bien immobilier ou structure introuvable." }, { status: 404 });
        }

        // Vérification des droits (Bailleur, Locataire ou Agence)
        const isOwner = property.ownerUserId === user.userId;
        const isManager = property.managedByUserId === user.userId;
        const activeLease = await prisma.lease.findFirst({
            where: { propertyId, tenantId: user.userId, status: { in: ['ACTIVE', 'PENDING_SIGNATURE'] } }
        });

        if (!isOwner && !isManager && !activeLease) {
            return NextResponse.json({ error: "Accès refusé. Vous n'êtes ni le bailleur ni le locataire de ce bien." }, { status: 403 });
        }

        const role = isOwner ? 'BAILLEUR' : isManager ? 'AGENCE' : 'LOCATAIRE';

        // Contrôle de cohérence (RG-GEO-04)
        const check = validateCaptureCoherence({
            lat: Number(lat),
            lng: Number(lng),
            precisionM: Number(precisionM),
            commune: property.commune,
            isSimulated: Boolean(isSimulated)
        });

        if (!check.valid) {
            await prisma.capturePosition.create({
                data: {
                    propertyId,
                    userId: user.userId,
                    role,
                    lat: Number(lat) || 0,
                    lng: Number(lng) || 0,
                    precisionM: Number(precisionM) || 999,
                    appareilId: appareilId ? String(appareilId) : null,
                    canal: String(canal).toUpperCase(),
                    resultat: 'REFUSEE',
                    motifRefus: check.motifRefus || 'PRECISION'
                }
            });

            return NextResponse.json({
                success: false,
                resultat: 'REFUSEE',
                motifRefus: check.motifRefus,
                error: check.message
            }, { status: 400 });
        }

        // Enregistrement de la capture acceptée
        const capture = await prisma.capturePosition.create({
            data: {
                propertyId,
                userId: user.userId,
                role,
                lat: Number(lat),
                lng: Number(lng),
                precisionM: Number(precisionM),
                appareilId: appareilId ? String(appareilId) : null,
                canal: String(canal).toUpperCase(),
                resultat: 'ACCEPTEE'
            }
        });

        // Mise à jour de la position provisoire si le bien n'en avait pas encore
        if (property.statutPosition === 'MANQUANTE') {
            const w3w = deriveSimulatedW3W(property.commune, Number(lat), Number(lng));
            const codeLocalisation = generateLocalisationCode(property.commune, Number(lat), Number(lng));

            await prisma.property.update({
                where: { id: propertyId },
                data: {
                    statutPosition: 'PROVISOIRE',
                    gpsLatitude: Number(lat),
                    gpsLongitude: Number(lng),
                    precisionM: Number(precisionM),
                    w3w,
                    codeLocalisation
                }
            });
        }

        // Tentative de confirmation par concordance bailleur/locataire (RG-GEO-05)
        const concordanceResult = await confirmerPositionParConcordance(propertyId);

        return NextResponse.json({
            success: true,
            resultat: 'ACCEPTEE',
            captureId: capture.id,
            statutPosition: concordanceResult.statut,
            confirmee: concordanceResult.confirmee,
            distanceConcordance: concordanceResult.distance,
            message: concordanceResult.message
        }, { status: 201 });

    } catch (error: any) {
        console.error("[GEO CAPTURE API] Error:", error);
        return NextResponse.json({ error: "Erreur lors de l'enregistrement de la capture GPS." }, { status: 500 });
    }
}

