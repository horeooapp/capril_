// ══════════════════════════════════════════════════════════════════════════════
// QAPRIL — Contrat d'API POR-09 : Recherche par Zone Géographique (Polygone)
// Référence : SPEC/026-C/2026 (ADD-26 §2.2)
// POST /api/v1/portail/recherche-zone
// ══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Algorithme de Ray-Casting pour vérifier si un point (lat, lng) est dans un polygone
 */
function isPointInPolygon(point: [number, number], polygon: Array<[number, number]>): boolean {
  const [lat, lng] = point;
  let isInside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [latI, lngI] = polygon[i];
    const [latJ, lngJ] = polygon[j];

    const intersect = ((lngI > lng) !== (lngJ > lng)) &&
      (lat < ((latJ - latI) * (lng - lngI)) / ((lngJ - lngI) || 1e-10) + latI);

    if (intersect) isInside = !isInside;
  }

  return isInside;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { polygone, filtres = {} } = body;

    // Validation du polygone : doit être un tableau d'au moins 3 points [lat, lng]
    if (!Array.isArray(polygone) || polygone.length < 3) {
      return NextResponse.json(
        { error: "Polygone invalide : un minimum de 3 coordonnées géographiques [lat, lng] est requis." },
        { status: 400 }
      );
    }

    // Calcul de la bounding box (boîte englobante) pour filtrer rapidement en BDD via SQL/Prisma
    const lats = polygone.map((p) => Number(p[0])).filter((n) => !isNaN(n));
    const lngs = polygone.map((p) => Number(p[1])).filter((n) => !isNaN(n));

    if (lats.length < 3 || lngs.length < 3) {
      return NextResponse.json(
        { error: "Coordonnées du polygone mal formatées. Format attendu : [[lat1, lng1], [lat2, lng2], ...]" },
        { status: 400 }
      );
    }

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // Construction de la clause where
    const whereClause: any = {
      statut: { in: ["ACTIVE", "PUBLIEE", "active"] },
      logement: {
        deletedAt: null,
        gpsLatitude: { gte: minLat, lte: maxLat },
        gpsLongitude: { gte: minLng, lte: maxLng }
      }
    };

    if (filtres.type_bien) {
      whereClause.logement.propertyType = {
        contains: String(filtres.type_bien),
        mode: "insensitive"
      };
    }

    if (filtres.loyer_max) {
      whereClause.loyerDemande = { lte: Number(filtres.loyer_max) };
    }

    if (filtres.loyer_min) {
      whereClause.loyerDemande = { ...whereClause.loyerDemande, gte: Number(filtres.loyer_min) };
    }

    if (filtres.nb_pieces) {
      whereClause.logement.rooms = Number(filtres.nb_pieces);
    }

    // Requête Prisma sur la Bounding Box
    const candidates = await prisma.annonce.findMany({
      where: whereClause,
      include: {
        logement: true,
        agence: {
          select: { id: true, firstName: true, lastName: true, companyRegNumber: true }
        }
      },
      take: 200 // Limite de sécurité pour la mémoire et les perfs du filtrage fin
    });

    // Filtrage fin par l'algorithme Ray-Casting (Point-in-Polygon)
    const resultatsFiltres = candidates.filter((a: any) => {
      if (a.logement?.gpsLatitude == null || a.logement?.gpsLongitude == null) return false;
      return isPointInPolygon([Number(a.logement.gpsLatitude), Number(a.logement.gpsLongitude)], polygone);
    });

    const resultatsFormates = resultatsFiltres.map((a: any) => ({
      annonce_id: a.id,
      titre: a.titre,
      description: a.description,
      loyer: Number(a.loyerDemande),
      charges: Number(a.charges || 0),
      commune: a.logement?.commune || "Abidjan",
      quartier: a.logement?.address || undefined,
      type_bien: a.logement?.propertyType || "Logement",
      nb_pieces: a.logement?.rooms || null,
      coordonnees: [Number(a.logement.gpsLatitude), Number(a.logement.gpsLongitude)],
      photos_urls: a.photosUrls || [],
      publiee_at: a.publieeAt || null
    }));

    return NextResponse.json(
      {
        resultats: resultatsFormates,
        total: resultatsFormates.length
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[API POR-09 RECHERCHE ZONE ERROR]", error);
    return NextResponse.json(
      { error: "Une erreur interne est survenue lors de la recherche géospatiale." },
      { status: 500 }
    );
  }
}
