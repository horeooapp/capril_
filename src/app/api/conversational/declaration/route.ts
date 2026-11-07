import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { declarePaymentByTenant } from "@/lib/conversational/conversation-engine";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST: Déclaration d'un paiement hors plateforme par un locataire (RG-CNV-06)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();

    const {
      leaseId,
      montant,
      mois,
      moyen = "Mobile Money (Wave / Orange)",
      preuveUrl
    } = body;

    if (!leaseId || !montant || !mois) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants : leaseId, montant, mois." },
        { status: 400 }
      );
    }

    // Récupérer le bail
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        property: {
          include: {
            landlord: true
          }
        },
        tenant: true
      }
    });

    if (!lease) {
      return NextResponse.json({ error: "Bail introuvable" }, { status: 404 });
    }

    // Déterminer le locataire ID
    const locataireId = session?.user?.id || lease.tenantId;
    if (!locataireId) {
      return NextResponse.json({ error: "Locataire non identifié pour ce bail" }, { status: 400 });
    }

    // Appel du moteur conversationnel
    const result = await declarePaymentByTenant({
      bailId: leaseId,
      locataireId,
      montant: Number(montant),
      mois,
      moyen,
      preuveUrl
    });

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error("[CONVERSATIONAL_DECLARATION_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la déclaration du paiement" },
      { status: 500 }
    );
  }
}

/**
 * GET: Liste des déclarations récentes pour un bail ou un utilisateur
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const searchParams = request.nextUrl.searchParams;
    const leaseId = searchParams.get("leaseId");

    const declarations = await prisma.declarationPaiement.findMany({
      where: {
        ...(leaseId ? { bailId: leaseId } : {})
      },
      include: {
        bail: {
          include: {
            property: true,
            tenant: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    return NextResponse.json({ declarations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
