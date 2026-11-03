import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

/**
 * REC-03 — GET /api/v1/locataire/quittances
 * Locataire : liste de toutes ses quittances avec liens PDF
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const receipts = await prisma.receipt.findMany({
      where: {
        lease: { tenantId: user.id },
      },
      include: {
        lease: {
          select: {
            id: true,
            leaseReference: true,
            property: { select: { name: true, unitLabel: true, address: true, commune: true } },
          },
        },
      },
      orderBy: { periodMonth: "desc" },
    });

    const formatted = receipts.map((r) => {
      const [annee, mois] = (r.periodMonth || "").split("-");
      return {
        quittance_id: r.id,
        reference: r.receiptRef,
        periode_mois: r.periodMonth,
        montant_total: r.totalAmount,
        statut: r.status,
        paid_at: r.paidAt,
        hash_sha256: r.receiptHash,
        pdf_url: r.pdfUrl || (mois && annee ? `/api/v1/locataire/quittances/${Number(mois)}/${annee}` : null),
        verify_url: `/v/${r.receiptRef}`,
        logement: r.lease?.property,
      };
    });

    return NextResponse.json({
      success: true,
      count: formatted.length,
      quittances: formatted,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

