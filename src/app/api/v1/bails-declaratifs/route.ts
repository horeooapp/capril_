import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/jwt";
import { createBDQ } from "@/actions/lease.actions";
import { prisma } from "@/lib/prisma";

/**
 * BDQ-01 — POST /api/v1/bails-declaratifs
 * Crée un Bail Déclaratif QAPRIL (ADD-06 / ADD-08)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const user = await getAuthUser(req);

    const bailleurId = body.bailleur_id || body.bailleurId || user?.id;
    if (!bailleurId) {
      return NextResponse.json({ error: "Non autorisé (bailleur_id manquant)" }, { status: 401 });
    }

    const res = await createBDQ({
      ...body,
      bailleurId,
    });

    if (!res.success) {
      return NextResponse.json({ error: res.error || "Erreur création BDQ" }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        bdq_id: res.bdqId,
        qr_token: res.qrToken,
        statut: "PENDING_LOCATAIRE",
        bdq: res.bdq,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

/**
 * GET /api/v1/bails-declaratifs
 * Liste les Baux Déclaratifs du bailleur connecté
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const bdqs = await prisma.bailDeclaratif.findMany({
      where: { bailleurId: user.id, deletedAt: null },
      include: { property: true, historiqueLoyer: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, count: bdqs.length, bails_declaratifs: bdqs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

