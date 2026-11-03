import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/jwt";
import { getOwnerConversations } from "@/actions/bdq-ai";

/**
 * AGT-04 — GET /api/v1/agent/conversations
 * Liste des conversations actives, en pause ou terminées du propriétaire
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const conversations = await getOwnerConversations(user.id);
    return NextResponse.json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error: any) {
    console.error("[AGT-04 /api/v1/agent/conversations] Error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la récupération des conversations" },
      { status: 500 }
    );
  }
}

