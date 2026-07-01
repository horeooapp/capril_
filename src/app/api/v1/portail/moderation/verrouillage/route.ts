// ══════════════════════════════════════════════════════════════════════════════
// QAPRIL — Contrat d'API : Verrouillage Automatique d'Annonce (Concurrence Location)
// Référence : SPEC/026-C/2026 (ADD-26 §4 — RG-MOD-02)
// POST /api/v1/portail/moderation/verrouillage (Auth JWT ou Webhook interne)
// ══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { verrouillerAnnonceApresLocation } from "@/lib/portail/moderation-service";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    // Peut être appelé par un agent/admin connecté ou par un service interne lors de la signature d'un bail
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Non autorisé. Accès requis." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { logementId, motif = "BAIL_SIGNE" } = body;

    if (!logementId) {
      return NextResponse.json({ error: "Le paramètre 'logementId' est obligatoire." }, { status: 400 });
    }

    if (motif !== "BAIL_SIGNE" && motif !== "SOUS_OPTION") {
      return NextResponse.json({ error: "Motif invalide. Valeurs permises : BAIL_SIGNE, SOUS_OPTION." }, { status: 400 });
    }

    const resultat = await verrouillerAnnonceApresLocation(logementId, motif);

    return NextResponse.json(resultat, { status: 200 });
  } catch (error: any) {
    console.error("[API MODERATION VERROUILLAGE ERROR]", error);
    return NextResponse.json({ error: error.message || "Erreur lors du verrouillage de l'annonce." }, { status: 500 });
  }
}
