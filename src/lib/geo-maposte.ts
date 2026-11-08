/**
 * QAPRIL — Infrastructure numérique de confiance (Côte d'Ivoire)
 * ADD-28 : Géolocalisation du bien & Adresse Numérique MaPoste (La Poste CI)
 * Règles RG-GEO-01 à RG-GEO-16 et RG-APN-01 à RG-APN-16
 */

import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export interface GeoPoint {
    lat: number;
    lng: number;
}

/**
 * Calcul de distance orthodromique (Haversine) en mètres entre deux coordonnées GPS
 */
export function calculateDistanceMeters(p1: GeoPoint, p2: GeoPoint): number {
    const R = 6371000; // Rayon de la Terre en mètres
    const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
    const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((p1.lat * Math.PI) / 180) *
        Math.cos((p2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}

/**
 * Génère un code de localisation lisible et dictable (RG-GEO-11)
 * Format : QAP-COMMUNE-XXXX (ex: QAP-COC-4829)
 */
export function generateLocalisationCode(commune: string, lat: number, lng: number): string {
    const cleanCommune = (commune || 'ABJ').substring(0, 3).toUpperCase();
    const hash = crypto.createHash('sha256').update(`${lat.toFixed(5)}_${lng.toFixed(5)}`).digest('hex');
    const shortCode = parseInt(hash.substring(0, 4), 16) % 10000;
    return `QAP-${cleanCommune}-${String(shortCode).padStart(4, '0')}`;
}

/**
 * Dérive une adresse de localisation simplifiée 3 mots pour le référentiel La Poste CI (RG-GEO-11)
 */
export function deriveSimulatedW3W(commune: string, lat: number, lng: number): string {
    const motsIvoirien = [
        'akwaba', 'lagune', 'ebrie', 'iroko', 'palmier', 'banco', 'assinie', 'baoule', 
        'sanwi', 'savane', 'cafe', 'cacao', 'hevea', 'anacarde', 'djole', 'zaouli',
        'plateau', 'cocody', 'yopougon', 'marcory', 'koumassi', 'treichville', 'adjame'
    ];
    const hash = crypto.createHash('md5').update(`${lat.toFixed(4)}:${lng.toFixed(4)}`).digest('hex');
    const idx1 = parseInt(hash.substring(0, 2), 16) % motsIvoirien.length;
    const idx2 = parseInt(hash.substring(2, 4), 16) % motsIvoirien.length;
    const idx3 = parseInt(hash.substring(4, 6), 16) % motsIvoirien.length;
    return `///${motsIvoirien[idx1]}.${motsIvoirien[idx2]}.${motsIvoirien[idx3]}`;
}

/**
 * Contrôles de cohérence d'une capture de position (RG-GEO-04)
 */
export function validateCaptureCoherence(params: {
    lat: number;
    lng: number;
    precisionM: number;
    commune?: string;
    isSimulated?: boolean;
}): { valid: boolean; motifRefus?: 'PRECISION' | 'HORS_COMMUNE' | 'ZONE' | 'SIMULEE'; message?: string } {
    const { lat, lng, precisionM, isSimulated } = params;

    if (isSimulated) {
        return {
            valid: false,
            motifRefus: 'SIMULEE',
            message: "Position GPS simulée détectée. La capture doit être effectuée directement depuis les capteurs de l'appareil."
        };
    }

    // RG-GEO-04: précision maximale acceptée 50 m
    if (!precisionM || precisionM > 50) {
        return {
            valid: false,
            motifRefus: 'PRECISION',
            message: `Précision GPS insuffisante (${precisionM || 'inconnue'} m). La précision doit être inférieure ou égale à 50 m. Veuillez vous rapprocher d'une fenêtre ou sortir à l'extérieur.`
        };
    }

    // Coordonnées approximatives Côte d'Ivoire (Lat: 4°N à 11°N, Lng: -9°W à -2°W)
    if (lat < 4.0 || lat > 11.0 || lng < -9.0 || lng > -2.0) {
        return {
            valid: false,
            motifRefus: 'ZONE',
            message: "Coordonnées géographiques en dehors du territoire national ivoirien."
        };
    }

    return { valid: true };
}

/**
 * Fonction métier de confirmation de position par concordance des parties (RG-GEO-05)
 * Conforme à la fonction SQL confirmer_position(p_structure)
 */
export async function confirmerPositionParConcordance(propertyId: string): Promise<{
    confirmee: boolean;
    distance?: number;
    statut: string;
    message: string;
}> {
    const property = await prisma.property.findUnique({
        where: { id: propertyId }
    });
    if (!property) {
        return { confirmee: false, statut: 'INTROUVABLE', message: 'Bien introuvable.' };
    }

    // Récupérer la dernière capture acceptée bailleur ou agence
    const captureBailleur = await prisma.capturePosition.findFirst({
        where: {
            propertyId,
            role: { in: ['BAILLEUR', 'AGENCE'] },
            resultat: 'ACCEPTEE'
        },
        orderBy: { createdAt: 'desc' }
    });

    // Récupérer la dernière capture acceptée locataire
    const captureLocataire = await prisma.capturePosition.findFirst({
        where: {
            propertyId,
            role: 'LOCATAIRE',
            resultat: 'ACCEPTEE'
        },
        orderBy: { createdAt: 'desc' }
    });

    if (!captureBailleur || !captureLocataire) {
        return {
            confirmee: false,
            statut: property.statutPosition,
            message: "En attente de la capture contradictoire de l'autre partie."
        };
    }

    const distance = calculateDistanceMeters(
        { lat: captureBailleur.lat, lng: captureBailleur.lng },
        { lat: captureLocataire.lat, lng: captureLocataire.lng }
    );

    // Tolérance de concordance : <= 30 mètres (RG-GEO-05)
    if (distance <= 30) {
        const meanLat = (captureBailleur.lat + captureLocataire.lat) / 2;
        const meanLng = (captureBailleur.lng + captureLocataire.lng) / 2;
        const w3w = deriveSimulatedW3W(property.commune, meanLat, meanLng);
        const codeLocalisation = generateLocalisationCode(property.commune, meanLat, meanLng);

        await prisma.property.update({
            where: { id: propertyId },
            data: {
                statutPosition: 'CONFIRMEE',
                gpsLatitude: meanLat,
                gpsLongitude: meanLng,
                precisionM: Math.round((captureBailleur.precisionM + captureLocataire.precisionM) / 2),
                w3w,
                codeLocalisation,
                isBienVerifie: true
            }
        });

        return {
            confirmee: true,
            distance,
            statut: 'CONFIRMEE',
            message: `Position confirmée avec succès par concordance des parties (écart : ${distance} m). Bien certifié niveau 2.`
        };
    } else if (distance > 100) {
        // Alerte écart > 100 m (RG-GEO-05)
        return {
            confirmee: false,
            distance,
            statut: 'VERIFICATION_REQUISE',
            message: `Écart anormal de localisation détecté (${distance} m entre bailleur et locataire). Une vérification par un contrôleur est requise.`
        };
    }

    return {
        confirmee: false,
        distance,
        statut: property.statutPosition,
        message: `Écart de ${distance} m supérieur au seuil de 30 m. Veuillez refaire une capture sur place.`
    };
}
