import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

/**
 * DCL-03 — GET /api/v1/declarations
 * Propriétaire ou gestionnaire : liste toutes les déclarations en attente ou traitées sur ses biens
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const declarations = await prisma.smsDeclaration.findMany({
      where: {
        lease: {
          OR: [
            { landlordId: user.id },
            { property: { ownerUserId: user.id } },
            {
              property: {
                accessRoles: {
                  some: {
                    userId: user.id,
                    statut: "ACTIF",
                    role: { in: ["MANAGER", "INTERMEDIAIRE", "OWNER"] as any },
                  },
                },
              },
            },
          ],
        },
      },
      include: {
        tenant: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
        confirmePar: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
        lease: {
          select: {
            id: true,
            leaseReference: true,
            rentAmount: true,
            property: { select: { id: true, name: true, unitLabel: true, address: true, commune: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: declarations.length,
      declarations,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

