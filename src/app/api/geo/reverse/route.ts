import { NextResponse } from 'next/server';
import { reverseGeocodeCoordinates } from '@/lib/reverse-geocoding';

/**
 * GET /api/geo/reverse?lat=5.3599&lng=-3.9850
 * Résout des coordonnées GPS en Ville, Commune et Quartier officiels ivoiriens.
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const latStr = searchParams.get('lat');
        const lngStr = searchParams.get('lng');

        if (!latStr || !lngStr) {
            return NextResponse.json({ error: "Paramètres 'lat' et 'lng' requis." }, { status: 400 });
        }

        const lat = parseFloat(latStr);
        const lng = parseFloat(lngStr);

        if (isNaN(lat) || isNaN(lng)) {
            return NextResponse.json({ error: "Coordonnées géographiques invalides." }, { status: 400 });
        }

        const result = await reverseGeocodeCoordinates(lat, lng);

        return NextResponse.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        console.error("[GEO] Erreur reverse geocoding:", error);
        return NextResponse.json({ error: "Erreur lors de la résolution géographique." }, { status: 500 });
    }
}
