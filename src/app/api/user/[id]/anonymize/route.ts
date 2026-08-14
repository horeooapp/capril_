import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { anonymizeUser } from "@/lib/data-retention";

/**
 * Endpoint d'anonymisation du compte (Droit à l'oubli - Art. 17 RGPD)
 * L'anonymisation est irréversible. Les PII sont supprimés, les données 
 * transactionnelles (factures, baux) sont conservées anonymement.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const targetUserId = (await params).id;
    const isSelf = session.user.id === targetUserId;
    const isAdmin = session.user.role === "SUPER_ADMIN";

    if (!isSelf && !isAdmin) {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    }

    const body = await req.json();
    if (body.confirmation !== "SUPPRIMER MON COMPTE") {
        return NextResponse.json({ error: "Confirmation requise" }, { status: 400 });
    }

    const result = await anonymizeUser(targetUserId, session.user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.reason || "L'anonymisation a échoué." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Compte anonymisé avec succès.",
      proofHash: result.proofHash,
    });
  } catch (error) {
    console.error("[Anonymize] Error anonymizing account:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'anonymisation." },
      { status: 500 }
    );
  }
}
