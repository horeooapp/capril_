import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

/**
 * ROL-06 — GET /api/v1/mes-biens-assignes
 * Gestionnaire : liste uniquement des biens qu'il gère (avec statut ACTIF)
 * R11-UAT-02 : Si le gestionnaire tente de demander les revenus totaux du propriétaire (?include_owner_total_revenues=true),
 * renvoie HTTP 403 Forbidden et journalise la tentative dans AuditLog.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const url = new URL(req.url);
    const wantsOwnerTotalRevenues =
      url.searchParams.get("include_owner_total_revenues") === "true" ||
      url.searchParams.get("scope") === "owner_global_revenues";

    if (wantsOwnerTotalRevenues) {
      await prisma.auditLog
        .create({
          data: {
            userId: user.id,
            action: "FORBIDDEN_OWNER_REVENUE_ACCESS_ATTEMPT",
            module: "M_ROLES",
            newValues: { endpoint: "/api/v1/mes-biens-assignes", query: url.search },
          },
        })
        .catch(() => null);

      return NextResponse.json(
        {
          error: "Forbidden: Un gestionnaire ne peut pas consulter les revenus globaux ni les autres biens du propriétaire.",
        },
        { status: 403 }
      );
    }

    const accesses = await prisma.propertyAccess.findMany({
      where: {
        userId: user.id,
        statut: "ACTIF",
      },
      include: {
        property: {
          include: {
            leases: {
              where: { status: { in: ["ACTIVE", "ACTIVE_DECLARATIF", "LOYER_IMPAYE"] as any } },
              include: {
                tenant: {
                  select: { id: true, firstName: true, lastName: true, phone: true },
                },
                receipts: {
                  orderBy: { createdAt: "desc" },
                  take: 6,
                },
              },
            },
          },
        },
      },
      orderBy: { invitedAt: "desc" },
    });

    const biensAssignes = accesses.map((a) => ({
      acces_id: a.id,
      role: a.role,
      statut: a.statut,
      accepted_at: a.acceptedAt,
      note: a.note,
      bien: a.property,
    }));

    return NextResponse.json({
      success: true,
      count: biensAssignes.length,
      biens_assignes: biensAssignes,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

