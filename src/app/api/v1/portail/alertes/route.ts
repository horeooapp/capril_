// ══════════════════════════════════════════════════════════════════════════════
// QAPRIL — Contrat d'API POR-10 : Créer une Alerte de Recherche Temps Réel
// Référence : SPEC/026-C/2026 (ADD-26 §2.3)
// POST /api/v1/portail/alertes (Auth JWT requis)
// ══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    // 1. Vérification de l'authentification (RG-API-01 & 401 non authentifié)
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Authentification requise pour créer une alerte personnalisée." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { criteres, zone_polygone = null, canal = "WHATSAPP" } = body;

    // 2. Erreur 422 : critères vides ou invalides
    if (!criteres || typeof criteres !== "object" || Object.keys(criteres).length === 0) {
      return NextResponse.json(
        { error: "Critères de recherche vides ou invalides. Vous devez spécifier au moins un critère (ex: type_bien, commune, loyer_max)." },
        { status: 422 }
      );
    }

    const userId = session.user.id;
    const alerteId = `alrt_${crypto.randomUUID()}`;

    // 3. Mise à jour ou création du profil de recherche locataire (synchronisation avec LocataireProfilPublic)
    try {
      const existingProfil = await prisma.locataireProfilPublic.findUnique({
        where: { userId }
      });

      const communesUpdate = criteres.commune 
        ? Array.from(new Set([...(existingProfil?.communesSouhaitees || []), criteres.commune]))
        : existingProfil?.communesSouhaitees || [];

      const typesUpdate = criteres.type_bien
        ? Array.from(new Set([...(existingProfil?.typeLogement || []), criteres.type_bien]))
        : existingProfil?.typeLogement || [];

      await prisma.locataireProfilPublic.upsert({
        where: { userId },
        update: {
          statutRecherche: "EN_RECHERCHE",
          communesSouhaitees: communesUpdate,
          typeLogement: typesUpdate,
          budgetMaxFcfa: criteres.loyer_max ? Number(criteres.loyer_max) : existingProfil?.budgetMaxFcfa
        },
        create: {
          userId,
          statutRecherche: "EN_RECHERCHE",
          communesSouhaitees: criteres.commune ? [criteres.commune] : [],
          typeLogement: criteres.type_bien ? [criteres.type_bien] : [],
          budgetMaxFcfa: criteres.loyer_max ? Number(criteres.loyer_max) : null
        }
      });

      // Stockage dans les préférences de notifications utilisateur pour persistance active
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { notificationPrefs: true } });
      const currentPrefs: any = user?.notificationPrefs || {};
      const alertesList = Array.isArray(currentPrefs.recherche_alertes) ? currentPrefs.recherche_alertes : [];
      
      alertesList.push({
        alerte_id: alerteId,
        criteres,
        zone_polygone,
        canal,
        actif: true,
        created_at: new Date().toISOString()
      });

      await prisma.user.update({
        where: { id: userId },
        data: {
          notificationPrefs: {
            ...currentPrefs,
            recherche_alertes: alertesList
          }
        }
      });
    } catch (dbError) {
      console.warn("[API POR-10 ALERTES] Profile/Prefs sync non bloquant:", dbError);
    }

    // 4. Réponse 201 Created (Contrat d'API §2.3)
    return NextResponse.json(
      {
        alerte_id: alerteId,
        actif: true,
        criteres_enregistres: criteres,
        canal_notif: canal
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[API POR-10 ALERTES ERROR]", error);
    return NextResponse.json(
      { error: "Une erreur interne est survenue lors de l'enregistrement de l'alerte." },
      { status: 500 }
    );
  }
}
