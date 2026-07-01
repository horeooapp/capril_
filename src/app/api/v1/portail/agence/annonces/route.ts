// ══════════════════════════════════════════════════════════════════════════════
// QAPRIL — Contrat d'API : Publication d'Annonce par Agence Agréée
// Référence : SPEC/026-C/2026 (ADD-26 §3.1 — RG-AGE-01)
// POST /api/v1/portail/agence/annonces (Auth JWT requis)
// ══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { publierAnnonceAgence } from "@/lib/portail/agence-service";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Non authentifié. Accès réservé aux agences agréées." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { logementId, titre, description, loyerDemande, charges = 0, photosUrls = [], criteres = {} } = body;

    if (!logementId || !titre || !description || !loyerDemande) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants : logementId, titre, description, loyerDemande." },
        { status: 400 }
      );
    }

    // Publication avec contrôle strict RG-AGE-01 (vérification du mandat actif)
    const annonce = await publierAnnonceAgence(session.user.id, {
      logementId,
      titre,
      description,
      loyerDemande: Number(loyerDemande),
      charges: Number(charges),
      photosUrls,
      criteres
    });

    return NextResponse.json(
      {
        message: "Annonce publiée avec succès sous label de confiance QAPRIL.",
        annonce_id: annonce.id,
        statut: annonce.statut,
        publiee_at: annonce.publieeAt
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[API AGENCE ANNONCES ERROR]", error);
    // Si l'erreur provient de RG-AGE-01 (violation de mandat) -> 403 Forbidden
    if (error.message && error.message.includes("RG-AGE-01")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || "Erreur interne lors de la publication." }, { status: 500 });
  }
}
