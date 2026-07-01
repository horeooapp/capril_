// ══════════════════════════════════════════════════════════════════════════════
// QAPRIL — Contrat d'API : Signalement Citoyen d'Annonce Suspecte
// Référence : SPEC/026-C/2026 (ADD-26 §4 — RG-MOD-01)
// POST /api/v1/portail/moderation/signalements
// ══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { signalerAnnonce } from "@/lib/portail/moderation-service";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json().catch(() => ({}));
    const { annonceId, motif, description } = body;

    if (!annonceId || !motif) {
      return NextResponse.json(
        { error: "Les paramètres 'annonceId' et 'motif' (FAUSSE_ANNONCE, PRIX_TROMPEUR, DEJA_LOUE, PHOTOS_VOLEES, AUTRE) sont obligatoires." },
        { status: 400 }
      );
    }

    const motifsValides = ["FAUSSE_ANNONCE", "PRIX_TROMPEUR", "DEJA_LOUE", "PHOTOS_VOLEES", "AUTRE"];
    if (!motifsValides.includes(motif)) {
      return NextResponse.json(
        { error: `Motif invalide. Valeurs permises : ${motifsValides.join(", ")}` },
        { status: 400 }
      );
    }

    const resultat = await signalerAnnonce({
      annonceId,
      motif,
      description,
      signaleParUserId: session?.user?.id
    });

    return NextResponse.json(
      {
        message: resultat.suspendue_automatiquement
          ? "Signalement enregistré. L'annonce a été suspendue automatiquement par mesure de sécurité (RG-MOD-01)."
          : "Signalement enregistré. Notre équipe de modération procède aux vérifications.",
        ...resultat
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[API MODERATION SIGNALEMENTS ERROR]", error);
    return NextResponse.json({ error: error.message || "Erreur lors du traitement du signalement." }, { status: 400 });
  }
}
