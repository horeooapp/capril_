import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';
import { formatUserFriendlyError } from '@/lib/friendly-error';
import { 
    generateLocalisationCode, 
    deriveSimulatedW3W, 
    validateCaptureCoherence,
    confirmerPositionParConcordance 
} from '@/lib/geo-maposte';
import { reverseGeocodeCoordinates } from '@/lib/reverse-geocoding';

/**
 * POST /api/mobile/proprietaire/properties/[id]/geolocalisation
 * Permet au propriétaire ou gestionnaire de capturer ou d'actualiser
 * la géolocalisation certifiée du bien depuis l'application mobile.
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
        }

        const { id: propertyId } = await params;
        if (!propertyId) {
            return NextResponse.json({ error: 'Identifiant du bien manquant.' }, { status: 400 });
        }

        const property = await prisma.property.findUnique({
            where: { id: propertyId }
        });

        if (!property) {
            return NextResponse.json({ error: 'Bien introuvable.' }, { status: 404 });
        }

        const isOwner = property.ownerUserId === user.userId;
        const isManager = property.managedByUserId === user.userId;
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(user.role);

        if (!isOwner && !isManager && !isAdmin) {
            return NextResponse.json({ error: 'Action non autorisée sur ce bien.' }, { status: 403 });
        }

        const body = await request.json();
        const { lat, lng, precisionM } = body;

        if (typeof lat !== 'number' || typeof lng !== 'number') {
            return NextResponse.json({ error: 'Coordonnées GPS (latitude et longitude) requises.' }, { status: 400 });
        }

        const effectivePrecision = typeof precisionM === 'number' ? Math.round(precisionM) : 15;

        // Validation cohérence RG-GEO-04
        const coherence = validateCaptureCoherence({
            lat,
            lng,
            precisionM: effectivePrecision,
            commune: property.commune
        });

        if (!coherence.valid) {
            return NextResponse.json({ error: coherence.message || 'Position GPS non conforme aux normes nationales.' }, { status: 400 });
        }

        const effectiveCommune = property.commune || 'Abidjan';
        const codeLocalisation = generateLocalisationCode(effectiveCommune, lat, lng);
        const w3w = deriveSimulatedW3W(effectiveCommune, lat, lng);
        const isAgencyUser = ['AGENCY', 'AGENCE_AGREE', 'NON_CERTIFIED_AGENT'].includes(user.role);

        // 1. Enregistrer la capture contradictoire
        await prisma.capturePosition.create({
            data: {
                propertyId,
                userId: user.userId,
                role: isAgencyUser ? 'AGENCE' : 'BAILLEUR',
                lat,
                lng,
                precisionM: effectivePrecision,
                canal: 'APP',
                resultat: 'ACCEPTEE'
            }
        });

        // 2. Mettre à jour la propriété
        const nextStatut = property.statutPosition === 'CONFIRMEE' ? 'CONFIRMEE' : 'DECLAREE';
        await prisma.property.update({
            where: { id: propertyId },
            data: {
                gpsLatitude: lat,
                gpsLongitude: lng,
                precisionM: effectivePrecision,
                statutPosition: nextStatut,
                codeLocalisation,
                w3w,
            }
        });

        // 3. Tenter confirmation par concordance si locataire a déjà capturé
        const concordance = await confirmerPositionParConcordance(propertyId).catch(() => null);

        // 4. Résolution administrative inverse (Ville, Commune, Quartier)
        const geoInfo = await reverseGeocodeCoordinates(lat, lng).catch(() => null);

        const villeNom = geoInfo?.ville || 'Abidjan';
        const communeNom = geoInfo?.commune || effectiveCommune;
        const quartierNom = geoInfo?.quartier || property.address || '';

        return NextResponse.json({
            success: true,
            propertyId,
            lat,
            lng,
            precisionM: effectivePrecision,
            codeLocalisation,
            w3w,
            statutPosition: concordance?.confirmee ? 'CONFIRMEE' : nextStatut,
            ville: villeNom,
            commune: communeNom,
            quartier: quartierNom,
            adresseComplete: geoInfo?.adresseComplete,
            message: concordance?.confirmee
                ? concordance.message
                : `Position GPS (${lat.toFixed(5)}°, ${lng.toFixed(5)}°) enregistrée avec succès.\nVille : ${villeNom}\nCommune : ${communeNom}${quartierNom ? `\nQuartier : ${quartierNom}` : ''}\nCode La Poste CI : ${codeLocalisation}`
        });
    } catch (error: any) {
        console.error('[MOBILE] properties/[id]/geolocalisation error:', error);
        return NextResponse.json({ error: formatUserFriendlyError(error, "Erreur lors de la capture de la géolocalisation.") }, { status: 500 });
    }
}

