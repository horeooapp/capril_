import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

/**
 * REC-02 — GET /api/v1/locataire/paiements
 * Locataire : statut de ses paiements des 6 derniers mois
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const leases = await prisma.lease.findMany({
      where: { tenantId: user.id },
      include: {
        property: {
          select: { id: true, name: true, unitLabel: true, address: true, commune: true },
        },
        receipts: {
          orderBy: { periodMonth: "desc" },
          take: 6,
        },
        smsDeclarations: {
          orderBy: { createdAt: "desc" },
          take: 6,
        },
      },
    });

    const now = new Date();
    const last6Months: string[] = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }

    const activeLease = leases[0];
    const paiements = last6Months.map((period) => {
      const receipt = activeLease?.receipts?.find((r) => r.periodMonth === period);
      const pendingDecl = activeLease?.smsDeclarations?.find(
        (d) =>
          d.statut === "EN_ATTENTE" &&
          new Date(d.createdAt).toISOString().slice(0, 7) === period
      );

      let statut = "NON_ENREGISTRE";
      if (receipt && ["paid", "PAID"].includes(receipt.status)) {
        statut = "ENREGISTRE";
      } else if (pendingDecl) {
        statut = "EN_ATTENTE_CONFIRMATION";
      }

      return {
        periode: period,
        statut,
        montant: receipt?.totalAmount || activeLease?.rentAmount || 0,
        quittance_ref: receipt?.receiptRef || null,
        quittance_id: receipt?.id || null,
        declaration_id: pendingDecl?.id || null,
      };
    });

    return NextResponse.json({
      success: true,
      bail_id: activeLease?.id || null,
      bail_ref: activeLease?.leaseReference || null,
      loyer_mensuel: activeLease?.rentAmount || 0,
      logement: activeLease?.property || null,
      paiements,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

