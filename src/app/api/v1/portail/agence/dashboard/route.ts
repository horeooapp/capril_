// ══════════════════════════════════════════════════════════════════════════════
// QAPRIL — Contrat d'API : Tableau de Bord Agence (Annonces, Contacts, Stats)
// Référence : SPEC/026-C/2026 (ADD-26 §3.2)
// GET /api/v1/portail/agence/dashboard (Auth JWT requis)
// ══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDashboardAgence } from "@/lib/portail/agence-service";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Non authentifié. Accès réservé aux agences agréées." }, { status: 401 });
    }

    const stats = await getDashboardAgence(session.user.id);
    return NextResponse.json(stats, { status: 200 });
  } catch (error: any) {
    console.error("[API AGENCE DASHBOARD ERROR]", error);
    return NextResponse.json({ error: "Erreur lors du chargement des statistiques du portail." }, { status: 500 });
  }
}
