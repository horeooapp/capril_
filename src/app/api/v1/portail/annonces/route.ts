// ══════════════════════════════════════════════════════════════════════════════
// QAPRIL — Contrat d'API POR-01 : Rechercher / Filtrer les annonces (Filtres classiques)
// Référence : SPEC/026-B & SPEC/026-C/2026 (ADD-26 §8 Table 26)
// GET /api/v1/portail/annonces
// ══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculerTagsDynamiques } from "@/lib/portail/tags";
import {
  trouverCommune,
  trouverPointInteret,
  distanceKm,
  positionReferenceBien,
  LatLng
} from "@/lib/lieux";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Paramètres de filtrage classiques
    const commune = searchParams.get("commune")?.trim();
    const quartier = searchParams.get("quartier")?.trim();
    const typeBien = searchParams.get("type_bien")?.trim();
    const loyerMin = searchParams.get("loyer_min") ? Number(searchParams.get("loyer_min")) : null;
    const loyerMax = searchParams.get("loyer_max") ? Number(searchParams.get("loyer_max")) : null;
    const nbPieces = searchParams.get("nb_pieces") ? Number(searchParams.get("nb_pieces")) : null;
    const tri = searchParams.get("tri") || "date_desc"; // loyer_asc | loyer_desc | date_desc | distance

    // Recherche par Point d'Intérêt (POI) ou coordonnées géographiques + rayon
    const pointInteretParam = searchParams.get("point_interet")?.trim() || searchParams.get("poi")?.trim();
    const rayonKmParam = searchParams.get("rayon_km")?.trim() || searchParams.get("rayon")?.trim();
    const latParam = searchParams.get("lat")?.trim();
    const lngParam = searchParams.get("lng")?.trim();

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    // Construction de la clause WHERE (statut PUBLIEE ou ACTIVE)
    const whereClause: any = {
      statut: { in: ["ACTIVE", "PUBLIEE", "active", "publiee"] },
      logement: {
        deletedAt: null
      }
    };

    if (commune) {
      const entry = trouverCommune(commune);
      const nomCommune = entry ? entry.commune.nom : commune;
      whereClause.logement.commune = {
        equals: nomCommune,
        mode: "insensitive"
      };
    }

    if (quartier) {
      whereClause.logement.OR = [
        { quartier: { contains: quartier, mode: "insensitive" } },
        { address: { contains: quartier, mode: "insensitive" } }
      ];
    }

    if (typeBien) {
      whereClause.logement.propertyType = {
        contains: typeBien,
        mode: "insensitive"
      };
    }

    if (nbPieces && !isNaN(nbPieces)) {
      whereClause.logement.rooms = nbPieces;
    }

    if (loyerMax && !isNaN(loyerMax)) {
      whereClause.loyerDemande = { lte: loyerMax };
    }

    if (loyerMin && !isNaN(loyerMin)) {
      whereClause.loyerDemande = { ...whereClause.loyerDemande, gte: loyerMin };
    }

    // Détermination de la recherche géographique (POI ou coordonnées)
    let centreRecherche: LatLng | null = null;
    let poiTrouve: { nom: string; commune: string; centre: LatLng } | null = null;

    if (pointInteretParam) {
      poiTrouve = trouverPointInteret(pointInteretParam);
      if (poiTrouve) {
        centreRecherche = poiTrouve.centre;
      }
    } else if (latParam && lngParam && !isNaN(parseFloat(latParam)) && !isNaN(parseFloat(lngParam))) {
      centreRecherche = [parseFloat(latParam), parseFloat(lngParam)];
    }

    const rayonKm = rayonKmParam && !isNaN(parseFloat(rayonKmParam))
      ? Math.max(0.1, parseFloat(rayonKmParam))
      : 5.0;

    // Option de tri
    let orderByClause: any = { publieeAt: "desc" };
    if (tri === "loyer_asc") {
      orderByClause = { loyerDemande: "asc" };
    } else if (tri === "loyer_desc") {
      orderByClause = { loyerDemande: "desc" };
    } else if (tri === "date_desc") {
      orderByClause = { publieeAt: "desc" };
    }

    let total = 0;
    let annoncesAFormater: Array<{ a: any; distance_km: number | null }> = [];

    if (centreRecherche) {
      // Récupération de tous les biens candidats pour filtrage géographique par rayon
      const annonces = await prisma.annonce.findMany({
        where: whereClause,
        include: {
          logement: true,
          agence: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              companyRegNumber: true,
              isCertified: true
            }
          }
        },
        orderBy: orderByClause
      });

      // Calcul des distances et filtrage dans le rayon
      const avecDistances = annonces
        .map((a: any) => {
          const pos = positionReferenceBien(a.logement);
          const dist = pos ? distanceKm(centreRecherche!, pos) : null;
          return { a, distance_km: dist };
        })
        .filter((item) => item.distance_km !== null && item.distance_km <= rayonKm);

      // Tri spécifique à la distance si demandé ou par défaut lors d'une recherche POI
      if (tri === "distance") {
        avecDistances.sort((x, y) => (x.distance_km ?? 9999) - (y.distance_km ?? 9999));
      }

      total = avecDistances.length;
      annoncesAFormater = avecDistances.slice(skip, skip + limit);
    } else {
      // Exécution classique avec pagination DB
      const [count, annonces] = await Promise.all([
        prisma.annonce.count({ where: whereClause }),
        prisma.annonce.findMany({
          where: whereClause,
          include: {
            logement: true,
            agence: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                companyRegNumber: true,
                isCertified: true
              }
            }
          },
          orderBy: orderByClause,
          skip,
          take: limit
        })
      ]);

      total = count;
      annoncesAFormater = annonces.map((a: any) => ({ a, distance_km: null }));
    }

    // Formatage des résultats avec tags temps réel (RG-PORT-17)
    const resultatsFormates = annoncesAFormater.map(({ a, distance_km }) => {
      const tags = calculerTagsDynamiques(a);
      let prixPrecedent = null;
      if (a.criteres && (a.criteres as any).prix_precedent) {
        prixPrecedent = Number((a.criteres as any).prix_precedent);
      }

      return {
        annonce_id: a.id,
        titre: a.titre,
        description: a.description,
        loyer: Number(a.loyerDemande),
        prix_precedent: prixPrecedent,
        charges: Number(a.charges || 0),
        commune: a.logement?.commune || "Abidjan",
        quartier: a.logement?.quartier || a.logement?.address || undefined,
        distance_km: distance_km !== null ? Math.round(distance_km * 10) / 10 : undefined,
        type_bien: a.logement?.propertyType || "Logement",
        nb_pieces: a.logement?.rooms || null,
        surface_m2: a.logement?.areaSurface || null,
        photos_urls: a.photosUrls || [],
        tags,
        label_confiance: a.agence?.companyRegNumber ? "AGENCE_AGREEE_CPRAIMA_CI" : "BIEN_VERIFIE",
        agence: {
          id: a.agence?.id,
          nom: `${a.agence?.firstName || ""} ${a.agence?.lastName || ""}`.trim() || "Agence QAPRIL",
          agreee: Boolean(a.agence?.companyRegNumber || a.agence?.isCertified)
        },
        publiee_at: a.publieeAt || null,
        vues: a.nbVisites || 0
      };
    });

    return NextResponse.json(
      {
        data: resultatsFormates,
        meta: {
          total,
          page,
          limit,
          total_pages: Math.ceil(total / limit),
          ...(poiTrouve ? { point_interet: poiTrouve.nom, rayon_km: rayonKm } : {}),
          ...(centreRecherche && !poiTrouve ? { centre: centreRecherche, rayon_km: rayonKm } : {})
        },
        succes: true
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[API POR-01 ANNONCES ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des annonces." },
      { status: 500 }
    );
  }
}
