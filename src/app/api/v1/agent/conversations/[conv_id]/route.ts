import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/jwt";
import { getConversationDetail, abandonConversation } from "@/actions/bdq-ai";

/**
 * AGT-05 — GET /api/v1/agent/conversations/[conv_id]
 * Détail d'une conversation · historique complet
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conv_id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { conv_id } = await params;
    const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(user.role as string);
    const detail = await getConversationDetail(conv_id, user.id, isAdmin);

    if (!detail) {
      return NextResponse.json({ error: "Conversation introuvable" }, { status: 404 });
    }

    return NextResponse.json({ success: true, conversation: detail });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erreur lors de la récupération de la conversation" },
      { status: 403 }
    );
  }
}

/**
 * AGT-06 — DELETE /api/v1/agent/conversations/[conv_id]
 * Abandonner une conversation en cours
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ conv_id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { conv_id } = await params;
    const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(user.role as string);
    const result = await abandonConversation(conv_id, user.id, isAdmin);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erreur lors de l'abandon de la conversation" },
      { status: 400 }
    );
  }
}

