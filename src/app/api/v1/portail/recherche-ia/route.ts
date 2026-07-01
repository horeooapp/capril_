// ══════════════════════════════════════════════════════════════════════════════
// QAPRIL — Contrat d'API POR-08 : Recherche IA Hybride
// Référence : SPEC/026-C/2026 (ADD-26 §2.1)
// POST /api/v1/portail/recherche-ia
// ══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { executerRechercheHybride } from "@/lib/portail/moteur-hybride";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { texte, canal = "WEB" } = body;

    // Erreur 400 : texte vide
    if (!texte || typeof texte !== "string" || !texte.trim()) {
      return NextResponse.json(
        { error: "Le paramètre 'texte' est obligatoire et ne peut pas être vide." },
        { status: 400 }
      );
    }

    // Validation du canal (WEB, APP, WHATSAPP)
    const canalValide = ["WEB", "APP", "WHATSAPP"].includes(canal) ? canal : "WEB";

    // Exécution du moteur hybride (Règles + IA avec protection timeout pour WhatsApp)
    const resultat = await executerRechercheHybride(texte, canalValide as any);

    return NextResponse.json(resultat, { status: 200 });
  } catch (error: any) {
    console.error("[API POR-08 RECHERCHE IA ERROR]", error);
    // Erreur 503 ou repli gracieux
    return NextResponse.json(
      { error: "Le service de recherche est temporairement dégradé.", details: error.message },
      { status: 503 }
    );
  }
}
