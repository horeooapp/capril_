import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

const ETAT_SCORE: Record<string, number> = {
  EXCELLENT: 4,
  BON: 3,
  MOYEN: 2,
  MAUVAIS: 1,
};

/**
 * EDL-05 — GET /api/v1/edl/[edl_id]/comparaison
 * Comparaison entrée/sortie · tableau des écarts élément par élément + compteurs (ADD-15 Section 1.4 / A15-UAT-04)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ edl_id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { edl_id } = await params;
    const currentEdl = await prisma.etatsDesLieux.findUnique({
      where: { id: edl_id },
      include: { edlEntree: true },
    });

    if (!currentEdl) {
      return NextResponse.json({ error: "État des lieux introuvable" }, { status: 404 });
    }

    let entree = currentEdl.typeEdl === "ENTREE" ? currentEdl : currentEdl.edlEntree;
    let sortie = currentEdl.typeEdl === "SORTIE" ? currentEdl : null;

    if (!entree) {
      entree = await prisma.etatsDesLieux.findFirst({
        where: { leaseId: currentEdl.leaseId, typeEdl: "ENTREE" },
        orderBy: { createdAt: "asc" },
      });
    }
    if (!sortie) {
      sortie = await prisma.etatsDesLieux.findFirst({
        where: { leaseId: currentEdl.leaseId, typeEdl: "SORTIE" },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!entree || !sortie) {
      return NextResponse.json(
        {
          success: false,
          error: "Un état des lieux d'entrée et un état des lieux de sortie sont requis pour la comparaison.",
          entree: entree || null,
          sortie: sortie || null,
        },
        { status: 400 }
      );
    }

    const sectionsEntree = (Array.isArray(entree.sections) ? entree.sections : []) as any[];
    const sectionsSortie = (Array.isArray(sortie.sections) ? sortie.sections : []) as any[];

    const comparatifElements: any[] = [];
    let nbDegradations = 0;
    let nbUsuresPartielles = 0;

    for (const secSortie of sectionsSortie) {
      const secName = secSortie.section || secSortie.nom || "Section";
      const secEntree = sectionsEntree.find((s) => (s.section || s.nom) === secName);
      const elemsSortie = Array.isArray(secSortie.elements) ? secSortie.elements : [];
      const elemsEntree = Array.isArray(secEntree?.elements) ? secEntree.elements : [];

      for (const elSortie of elemsSortie) {
        const elName = elSortie.nom || "Élément";
        const elEntree = elemsEntree.find((e: any) => e.nom === elName);

        const etatEntree = String(elEntree?.etat || "BON").toUpperCase();
        const etatSortie = String(elSortie?.etat || "BON").toUpperCase();

        const scoreE = ETAT_SCORE[etatEntree] ?? 3;
        const scoreS = ETAT_SCORE[etatSortie] ?? 3;
        const diff = scoreE - scoreS;

        let signalement = "✅ AUCUN CHANGEMENT";
        let niveau: "OK" | "USURE_PARTIELLE" | "DEGRADATION_PROBABLE" = "OK";

        if (diff >= 2 || (etatEntree === "BON" && etatSortie === "MAUVAIS")) {
          signalement = "⚠️ DÉGRADATION PROBABLE — retenue caution possible";
          niveau = "DEGRADATION_PROBABLE";
          nbDegradations++;
        } else if (diff === 1) {
          signalement = "⚠️ USURE PARTIELLE — à documenter";
          niveau = "USURE_PARTIELLE";
          nbUsuresPartielles++;
        }

        comparatifElements.push({
          section: secName,
          element: elName,
          etat_entree: etatEntree,
          commentaire_entree: elEntree?.commentaire || "",
          photos_entree: elEntree?.photos || [],
          etat_sortie: etatSortie,
          commentaire_sortie: elSortie?.commentaire || "",
          photos_sortie: elSortie?.photos || [],
          signalement,
          niveau,
        });
      }
    }

    const consoEau =
      entree.indexEau != null && sortie.indexEau != null
        ? Math.max(0, Number(sortie.indexEau) - Number(entree.indexEau))
        : null;
    const consoElec =
      entree.indexElec != null && sortie.indexElec != null
        ? Math.max(0, Number(sortie.indexElec) - Number(entree.indexElec))
        : null;

    return NextResponse.json({
      success: true,
      edl_entree_ref: entree.refEdl,
      edl_sortie_ref: sortie.refEdl,
      nb_ecarts_total: nbDegradations + nbUsuresPartielles,
      nb_degradations_probables: nbDegradations,
      nb_usures_partielles: nbUsuresPartielles,
      compteurs: {
        eau: {
          index_entree: entree.indexEau,
          index_sortie: sortie.indexEau,
          consommation_m3: consoEau,
        },
        electricite: {
          index_entree: entree.indexElec,
          index_sortie: sortie.indexElec,
          consommation_kwh: consoElec,
        },
      },
      cles: {
        remises_entree: entree.clesRemises,
        restituees_sortie: sortie.clesRemises,
        ecart_cles: (entree.clesRemises || 0) - (sortie.clesRemises || 0),
      },
      elements: comparatifElements,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur comparaison EDL" }, { status: 500 });
  }
}

