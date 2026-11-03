import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

/**
 * REC-04 — GET /api/v1/locataire/quittances/[mois]/[annee]
 * Locataire : récupérer une quittance spécifique d'un mois donné (R11-UAT-08)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ mois: string; annee: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { mois, annee } = await params;
    const periodMonth = `${annee}-${String(mois).padStart(2, "0")}`;

    const receipt = await prisma.receipt.findFirst({
      where: {
        periodMonth,
        lease: { tenantId: user.id },
      },
      include: {
        lease: {
          include: {
            property: true,
            landlord: { select: { firstName: true, lastName: true, phone: true } },
            tenant: { select: { firstName: true, lastName: true, phone: true } },
          },
        },
      },
    });

    if (!receipt) {
      return NextResponse.json(
        {
          success: false,
          statut: "NON_ENREGISTRE",
          periode: periodMonth,
          message: `Aucune quittance n'est encore enregistrée pour la période ${periodMonth}. Vous pouvez initier une déclaration de paiement si vous avez déjà réglé ce mois.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      statut: "ENREGISTRE",
      quittance: {
        quittance_id: receipt.id,
        reference: receipt.receiptRef,
        periode_mois: receipt.periodMonth,
        montant_loyer: receipt.rentAmount,
        montant_charges: receipt.chargesAmount,
        montant_total: receipt.totalAmount,
        date_paiement: receipt.paidAt,
        mode_paiement: receipt.paymentMethod,
        hash_sha256: receipt.receiptHash,
        pdf_url: receipt.pdfUrl || `/dashboard/receipts/${receipt.id}`,
        verify_url: `/v/${receipt.receiptRef}`,
        bailleur: receipt.lease.landlord,
        locataire: receipt.lease.tenant,
        logement: receipt.lease.property,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

