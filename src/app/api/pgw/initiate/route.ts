import { NextResponse } from "next/server";
import { PaymentGateway } from "@/lib/pgw/gateway";
import { auth } from "@/auth";

/**
 * PGW-01 : Initier un paiement via PaymentGateway
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { leaseId, mois, montant, msisdnPayeur, forceCanal } = body;

    // Validation basique
    if (!leaseId || !mois || !montant || !msisdnPayeur) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const result = await PaymentGateway.initiate({
      leaseId,
      mois: new Date(mois),
      montant: Number(montant),
      msisdnPayeur,
      payeurId: session.user.id!,
      beneficiaireId: body.beneficiaireId || "", // Optionnel si l'adaptateur peut le trouver
      forceCanal
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("[PGW API] Erreur initiation :", error);
    return NextResponse.json({ 
      error: "Erreur lors de l'initiation du paiement",
      details: error.message 
    }, { status: 500 });
  }
}
