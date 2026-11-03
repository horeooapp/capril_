import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { EdlStatut } from "@prisma/client";

/**
 * Sections par défaut selon le type de logement (ADD-15 Section 1.2)
 * - Cour commune / BDQ : 3 sections (Pièce principale, Sanitaires communs, Clés remises)
 * - Logement standard : 6 sections (Espaces communs, Pièce principale, Cuisine, Sanitaires, Compteurs, Clés)
 */
function buildDefaultEdlSections(isCourCommune: boolean) {
  if (isCourCommune) {
    return [
      {
        section: "Pièce principale",
        elements: [
          { nom: "Murs & peinture", etat: "BON", commentaire: "", photos: [] },
          { nom: "Plafond", etat: "BON", commentaire: "", photos: [] },
          { nom: "Sol", etat: "BON", commentaire: "", photos: [] },
          { nom: "Porte & serrure", etat: "BON", commentaire: "", photos: [] },
          { nom: "Fenêtres & prises", etat: "BON", commentaire: "", photos: [] },
        ],
      },
      {
        section: "Sanitaires communs",
        elements: [
          { nom: "Douche / WC", etat: "BON", commentaire: "", photos: [] },
          { nom: "Robinetterie & évacuation", etat: "BON", commentaire: "", photos: [] },
        ],
      },
      {
        section: "Clés remises",
        elements: [{ nom: "Trousseau de clés", etat: "BON", commentaire: "", photos: [] }],
      },
    ];
  }

  return [
    {
      section: "Espaces communs",
      elements: [
        { nom: "Entrée / Couloir / Cour", etat: "BON", commentaire: "", photos: [] },
        { nom: "Éclairage & accès", etat: "BON", commentaire: "", photos: [] },
      ],
    },
    {
      section: "Pièce principale",
      elements: [
        { nom: "Murs & peinture", etat: "BON", commentaire: "", photos: [] },
        { nom: "Plafond", etat: "BON", commentaire: "", photos: [] },
        { nom: "Sol / Carrelage", etat: "BON", commentaire: "", photos: [] },
        { nom: "Fenêtres & volets", etat: "BON", commentaire: "", photos: [] },
        { nom: "Porte d'entrée & serrure", etat: "BON", commentaire: "", photos: [] },
        { nom: "Prises & interrupteurs", etat: "BON", commentaire: "", photos: [] },
      ],
    },
    {
      section: "Cuisine",
      elements: [
        { nom: "Évier & robinetterie", etat: "BON", commentaire: "", photos: [] },
        { nom: "Paillasse & placards", etat: "BON", commentaire: "", photos: [] },
      ],
    },
    {
      section: "Sanitaires",
      elements: [
        { nom: "WC & chasse d'eau", etat: "BON", commentaire: "", photos: [] },
        { nom: "Douche / Lavabo", etat: "BON", commentaire: "", photos: [] },
        { nom: "Carrelage & joints", etat: "BON", commentaire: "", photos: [] },
      ],
    },
    {
      section: "Compteurs et équipements",
      elements: [
        { nom: "Compteur électricité (CIE)", etat: "BON", commentaire: "", photos: [] },
        { nom: "Compteur eau (SODECI)", etat: "BON", commentaire: "", photos: [] },
      ],
    },
    {
      section: "Clés remises",
      elements: [{ nom: "Inventaire des clés", etat: "BON", commentaire: "", photos: [] }],
    },
  ];
}

/**
 * EDL-01 — POST /api/v1/bails/[id]/edl
 * Initier un état des lieux (ENTREE ou SORTIE)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { id: leaseId } = await params;
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: { property: true },
    });

    if (!lease) {
      return NextResponse.json({ error: "Bail introuvable" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const typeEdl = String(body.type_edl || body.typeEdl || "ENTREE").toUpperCase() === "SORTIE" ? "SORTIE" : "ENTREE";

    // Si SORTIE, retrouver automatiquement l'EDL d'entrée s'il existe
    let edlEntreeId = body.edl_entree_id || body.edlEntreeId || null;
    if (typeEdl === "SORTIE" && !edlEntreeId) {
      const existingEntree = await prisma.etatsDesLieux.findFirst({
        where: { leaseId, typeEdl: "ENTREE" },
        orderBy: { createdAt: "desc" },
      });
      edlEntreeId = existingEntree?.id || null;
    }

    const isCourCommune =
      lease.typeBail === "DECLARATIF_BDQ" ||
      lease.property?.typeStructure === "COUR_COMMUNE" ||
      lease.property?.propertyType?.toLowerCase().includes("chambre");

    const sections =
      Array.isArray(body.sections) && body.sections.length > 0
        ? body.sections
        : buildDefaultEdlSections(Boolean(isCourCommune));

    const year = new Date().getFullYear();
    const count = await prisma.etatsDesLieux.count();
    const refEdl = `EDL-${year}-${String(count + 1).padStart(5, "0")}`;

    const edl = await prisma.etatsDesLieux.create({
      data: {
        leaseId,
        typeEdl,
        statut: EdlStatut.EN_COURS,
        redigeParId: user.id,
        locataireId: lease.tenantId,
        dateEdl: body.date_edl ? new Date(body.date_edl) : new Date(),
        sections,
        indexEau: body.index_eau ?? body.indexEau ?? null,
        indexElec: body.index_elec ?? body.indexElec ?? null,
        clesRemises: Number(body.cles_remises ?? body.clesRemises ?? 1),
        clesDetail: body.cles_detail ?? body.clesDetail ?? null,
        refEdl,
        edlEntreeId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        edl_id: edl.id,
        ref_edl: edl.refEdl,
        type_edl: edl.typeEdl,
        statut: edl.statut,
        edl,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur création EDL" }, { status: 500 });
  }
}

/**
 * GET /api/v1/bails/[id]/edl
 * Lister les états des lieux d'un bail
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { id: leaseId } = await params;
    const edls = await prisma.etatsDesLieux.findMany({
      where: { leaseId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, count: edls.length, edls });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

