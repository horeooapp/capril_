import { NextResponse } from "next/server";
import { LIEUX, listerCommunes } from "@/lib/lieux";

export const dynamic = "force-static";
export const revalidate = 3600;

/**
 * GET /api/v1/config/lieux — Référentiel des lieux (S-08)
 * Renvoie le référentiel complet (villes, communes, quartiers, points d'intérêt)
 * et une liste aplatie des communes pour les sélecteurs des applications.
 */
export async function GET() {
  return NextResponse.json(
    {
      version: LIEUX.version,
      villes: LIEUX.villes,
      points_interet: LIEUX.points_interet,
      communes: listerCommunes(),
    },
    {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      },
    }
  );
}

