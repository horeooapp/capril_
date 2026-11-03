import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/jwt";
import { resolveSmsDeclaration } from "@/lib/sms-declarations";

/**
 * DCL-05 — POST /api/v1/declarations/[id]/contester
 * Contester une déclaration avec motif depuis l'application (alternative au SMS NON)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const motif = body.motif || body.reason || "Montant ou paiement non reçu";

    const result = await resolveSmsDeclaration({
      declarationId: id,
      actorUserId: user.id,
      decision: "NON",
      motif,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur lors de la contestation" }, { status: 400 });
  }
}

