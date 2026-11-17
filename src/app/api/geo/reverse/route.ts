import { NextResponse } from "next/server";
import { z } from "zod";
import { reverseGeocode } from "@/lib/geo/reverseGeocode";

// Schéma de validation Zod strict
const ReverseGeocodeSchema = z.object({
  lat: z.number().min(-90, "Latitude invalide").max(90, "Latitude invalide"),
  lng: z.number().min(-180, "Longitude invalide").max(180, "Longitude invalide"),
});

// Rate limiting mémoire simple par IP (30 requêtes par minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  // Nettoyage régulier si trop grand
  if (rateLimitMap.size > 10000) {
    rateLimitMap.clear();
  }

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + 60000 });
    return true;
  }

  if (entry.count >= 30) {
    return false;
  }

  entry.count += 1;
  return true;
}

/**
 * POST /api/geo/reverse
 * Corps JSON : { lat: number, lng: number }
 * Sortie : { quartier, commune, ville, source, precision }
 */
export async function POST(request: Request) {
  try {
    // 1. Détection IP pour limitation de débit
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "anonymous";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          error: "Limite de requêtes atteinte. Veuillez patienter une minute avant de réessayer.",
          code: "RATE_LIMITED",
        },
        { status: 429 }
      );
    }

    // 2. Lecture et validation Zod du body
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Corps de requête JSON manquant.", code: "INVALID_BODY" },
        { status: 400 }
      );
    }

    const validation = ReverseGeocodeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Coordonnées géographiques invalides.",
          details: validation.error.format(),
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const { lat, lng } = validation.data;

    // 3. Appel du service de géocodage inverse
    const result = await reverseGeocode(lat, lng);

    return NextResponse.json({
      success: true,
      quartier: result.quartier,
      commune: result.commune,
      ville: result.ville,
      source: result.source,
      precision: result.precision,
      // Compatibilité ascendante
      data: {
        quartier: result.quartier,
        commune: result.commune,
        ville: result.ville,
        source: result.source,
        precision: result.precision,
      },
    });
  } catch (error: any) {
    console.error("[GEO API POST Error]:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la résolution géographique.", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/geo/reverse?lat=...&lng=... (Compatibilité avec les clients existants)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get("lat");
    const lngStr = searchParams.get("lng");

    if (!latStr || !lngStr) {
      return NextResponse.json(
        { error: "Paramètres 'lat' et 'lng' requis.", code: "MISSING_PARAMS" },
        { status: 400 }
      );
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    const validation = ReverseGeocodeSchema.safeParse({ lat, lng });
    if (!validation.success) {
      return NextResponse.json(
        { error: "Coordonnées géographiques invalides.", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const result = await reverseGeocode(lat, lng);

    return NextResponse.json({
      success: true,
      quartier: result.quartier,
      commune: result.commune,
      ville: result.ville,
      source: result.source,
      precision: result.precision,
      data: {
        quartier: result.quartier,
        commune: result.commune,
        ville: result.ville,
        source: result.source,
        precision: result.precision,
      },
    });
  } catch (error: any) {
    console.error("[GEO API GET Error]:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la résolution géographique." },
      { status: 500 }
    );
  }
}
