import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/jwt";
import { resolveSmsDeclaration } from "@/app/api/webhooks/sms/confirmation/route";

/**
 * DCL-04 — POST /api/v1/declarations/[id]/confirmer
 * Confirmer manuellement une déclaration depuis l'application (alternative au SMS OUI)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { id } = await params;
    const result = await resolveSmsDeclaration({
      declarationId: id,
      actorUserId: user.id,
      decision: "OUI",
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur lors de la confirmation" }, { status: 400 });
  }
}

