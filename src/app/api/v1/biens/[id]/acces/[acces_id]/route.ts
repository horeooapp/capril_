import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { BienRole } from "@prisma/client";

/**
 * ROL-03 — PUT /api/v1/biens/[id]/acces/[acces_id]
 * Modifier le rôle ou suspendre un accès
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; acces_id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { id: propertyId, acces_id: accesId } = await params;
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property || (property.ownerUserId !== user.id && !["ADMIN", "SUPER_ADMIN"].includes(user.role as string))) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await req.json();
    const updateData: any = {};
    if (body.role) {
      updateData.role = body.role as BienRole;
    }
    if (body.statut) {
      updateData.statut = body.statut; // ACTIF | SUSPENDU | REVOQUE
    }
    if (body.note !== undefined) {
      updateData.note = body.note;
    }

    const updated = await prisma.propertyAccess.update({
      where: { id: accesId },
      data: updateData,
    });

    return NextResponse.json({ success: true, acces: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

/**
 * ROL-04 — DELETE /api/v1/biens/[id]/acces/[acces_id]
 * Révoquer l'accès d'un gestionnaire (R11-UAT-09 : statut REVOQUE, historique conservé)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; acces_id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { id: propertyId, acces_id: accesId } = await params;
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property || (property.ownerUserId !== user.id && !["ADMIN", "SUPER_ADMIN"].includes(user.role as string))) {
      return NextResponse.json({ error: "Seul le propriétaire peut révoquer un gestionnaire" }, { status: 403 });
    }

    const existing = await prisma.propertyAccess.findUnique({ where: { id: accesId } });
    if (!existing) {
      return NextResponse.json({ error: "Accès introuvable" }, { status: 404 });
    }
    if (existing.role === BienRole.OWNER) {
      return NextResponse.json(
        { error: "Le propriétaire ne peut pas être retiré de son propre bien" },
        { status: 400 }
      );
    }

    const revoked = await prisma.propertyAccess.update({
      where: { id: accesId },
      data: {
        statut: "REVOQUE",
        revokedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      statut: "REVOQUE",
      acces: revoked,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

