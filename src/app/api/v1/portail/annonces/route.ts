// ══════════════════════════════════════════════════════════════════════════════
// QAPRIL — Contrat d'API POR-01 : Rechercher / Filtrer les annonces (Filtres classiques)
// Référence : SPEC/026-B & SPEC/026-C/2026 (ADD-26 §8 Table 26)
// GET /api/v1/portail/annonces
// ══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Calcul des tags dynamiques temps réel sur une annonce (RG-PORT-17 / Table 17)
 */
export function calculerTagsDynamiques(a: any): string[] {
  const tags: string[] = [];
  const now = new Date().getTime();
  const pubTime = a.publieeAt ? new Date(a.publieeAt).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : now);

  // 1. "Ajouté aujourd'hui" (publiee_at dans les dernières 24h à 72h)
  if (now - pubTime < 86400000 * 3) {
    tags.push("NOUVEAU");
  }

  // 2. "Prix baissé" (si coutVacance ou diffusions indique un prix précédent plus élevé)
  let prixPrecedent = null;
  if (a.criteres && typeof a.criteres === "object" && (a.criteres as any).prix_precedent) {
    prixPrecedent = Number((a.criteres as any).prix_precedent);
  } else if (a.diffusions && typeof a.diffusions === "object" && (a.diffusions as any).prix_precedent) {
    prixPrecedent = Number((a.diffusions as any).prix_precedent);
  }
  if (prixPrecedent && prixPrecedent > Number(a.loyerDemande)) {
    tags.push("PRIX_BAISSE");
  }

  // 3. "Agence agréée CPRAIMA-CI" (RG-PORT-03 / RG-PORT-04)
  if (a.agence && (a.agence.companyRegNumber || a.agence.isCertified)) {
    tags.push("AGENCE_AGREEE");
  }

  // 4. "Rare / très demandé" (nb_visites ou nb_contacts élevé)
  if ((a.nbVisites && a.nbVisites >= 15) || (a.nbContacts && a.nbContacts >= 5)) {
    tags.push("TRES_DEMANDE");
  }

  return tags;
}

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
    const tri = searchParams.get("tri") || "date_desc"; // loyer_asc | loyer_desc | date_desc

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
      whereClause.logement.commune = {
        contains: commune,
        mode: "insensitive"
      };
    }

    if (quartier) {
      whereClause.logement.address = {
        contains: quartier,
        mode: "insensitive"
      };
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

    // Option de tri
    let orderByClause: any = { publieeAt: "desc" };
    if (tri === "loyer_asc") {
      orderByClause = { loyerDemande: "asc" };
    } else if (tri === "loyer_desc") {
      orderByClause = { loyerDemande: "desc" };
    } else if (tri === "date_desc") {
      orderByClause = { publieeAt: "desc" };
    }

    // Exécution de la requête avec comptage total et pagination
    const [total, annonces] = await Promise.all([
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

    // Formatage des résultats avec tags temps réel (RG-PORT-17)
    const resultatsFormates = annonces.map((a: any) => {
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
        quartier: a.logement?.address || undefined,
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
          total_pages: Math.ceil(total / limit)
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
