import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/jwt";
import { processAiBdqMessage } from "@/actions/bdq-ai";
import { prisma } from "@/lib/prisma";

/**
 * AGT-03 — POST /api/v1/agent/chat
 * Chat intégré app · même logique que WhatsApp · canal APP_CHAT
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const message = (body.message || body.content || "").trim();
    if (!message) {
      return NextResponse.json({ error: "Message requis" }, { status: 400 });
    }

    // Si un conv_id est fourni, retrouver son canalRef
    let canalRef = body.canal_ref || body.canalRef;
    if (!canalRef && body.conv_id) {
      const existing = await prisma.bdqConversationState.findUnique({
        where: { id: body.conv_id },
      });
      if (existing && existing.bailleurId === user.id) {
        canalRef = existing.canalRef;
      }
    }

    if (!canalRef) {
      // Chercher une conversation active ou en pause pour ce bailleur sur APP_CHAT
      const activeConv = await prisma.bdqConversationState.findFirst({
        where: {
          bailleurId: user.id,
          statut: { in: ["EN_COURS", "EN_PAUSE"] },
          canalRef: { startsWith: "app_" },
        },
        orderBy: { updatedAt: "desc" },
      });
      canalRef = activeConv?.canalRef || `app_${user.id}_${Date.now()}`;
    }

    const res = await processAiBdqMessage(canalRef, message, user.id, "APP_CHAT");

    return NextResponse.json({
      success: true,
      conv_id: res.convId,
      canal_ref: canalRef,
      message: res.message,
      status: res.status,
      bdq_id: res.bdqId || null,
      extracted: (res as any).extracted || null,
      nb_echanges: res.nbEchanges,
    });
  } catch (error: any) {
    console.error("[AGT-03 /api/v1/agent/chat] Error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors du traitement par l'agent IA" },
      { status: 500 }
    );
  }
}

