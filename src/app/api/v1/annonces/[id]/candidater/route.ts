import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateMobileRequest } from "@/lib/mobile-auth";
import { auth } from "@/auth";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

async function resolveUser(req: Request) {
  const mobileUser = await authenticateMobileRequest(req);
  if (mobileUser?.userId) return mobileUser.userId;
  try {
    const session = await auth();
    if (session?.user?.id) return session.user.id;
  } catch {}
  return null;
}

function getDejaEnvoyeeMessage(date: Date): string {
  try {
    const lexPath = path.join(process.cwd(), "config", "lexique.json");
    if (fs.existsSync(lexPath)) {
      const lex = JSON.parse(fs.readFileSync(lexPath, "utf-8"));
      const template = lex.recherche?.deja_envoyee || "Vous avez déjà candidaté le {date}.";
      const dateFormatted = new Date(date).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      return template.replace("{date}", dateFormatted);
    }
  } catch {}
  return `Vous avez déjà candidaté le ${new Date(date).toLocaleDateString("fr-FR")}.`;
}

/**
 * [S-03] POST /v1/annonces/{id}/candidater
 * Contrainte d'unicité (locataire, annonce) tant que l'état ∉ {RETIREE, NON_RETENUE, EXPIREE}
 * Machine à états : ENVOYEE → VUE → VISITE_PROPOSEE → RETENUE / NON_RETENUE ; RETIREE ; EXPIREE
 * Renvoie 409 + message du lexique en cas de doublon.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: annonceId } = await params;
    const userId = await resolveUser(req);

    if (!userId) {
      return NextResponse.json(
        { error: "Authentification requise pour postuler." },
        { status: 401 }
      );
    }

    const annonce = await prisma.annonce.findUnique({
      where: { id: annonceId },
      include: { logement: true },
    });

    if (!annonce) {
      return NextResponse.json({ error: "Annonce introuvable." }, { status: 404 });
    }

    if (annonce.statut !== "ACTIVE") {
      return NextResponse.json(
        { error: "Cette annonce n'est plus disponible." },
        { status: 400 }
      );
    }

    // 1. Contrainte d'unicité : vérifier si une candidature active existe déjà
    const existing = await prisma.candidature.findFirst({
      where: {
        annonceId: annonce.id,
        candidatId: userId,
        statut: {
          notIn: ["RETIREE", "NON_RETENUE", "EXPIREE"],
        },
      },
    });

    if (existing) {
      const message = getDejaEnvoyeeMessage(existing.envoyeeAt || existing.createdAt);
      return NextResponse.json(
        {
          error: message,
          code: "CANDIDATURE_DEJA_ENVOYEE",
          candidatureId: existing.id,
          dateCandidature: existing.envoyeeAt || existing.createdAt,
        },
        { status: 409 }
      );
    }

    // 2. Récupération des informations du candidat
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    const nom = (user?.lastName || body.nom || "Candidat").trim();
    const prenom = (user?.firstName || body.prenom || "").trim();
    const telephone = (user?.phone || body.telephone || "").trim();

    // 3. Création de la candidature avec statut initial ENVOYEE et horodatage
    const candidature = await prisma.candidature.create({
      data: {
        annonceId: annonce.id,
        logementId: annonce.logementId,
        candidatId: userId,
        nom,
        prenom,
        telephone,
        statut: "ENVOYEE",
        envoyeeAt: new Date(),
        scoreQapril: (user as any)?.scoreIcl || (user as any)?.reliabilityScore || body.scoreQapril || 750,
        revenuMensuel: body.revenuMensuel ? Number(body.revenuMensuel) : null,
        employeur: body.employeur || null,
        docsJsonb: body.docsJsonb || null,
      },
    });

    // 4. Incrémentation du compteur de candidatures sur l'annonce
    await prisma.annonce.update({
      where: { id: annonce.id },
      data: {
        nbCandidatures: { increment: 1 },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Candidature transmise avec succès.",
        candidature: {
          id: candidature.id,
          annonceId: candidature.annonceId,
          statut: candidature.statut,
          envoyeeAt: candidature.envoyeeAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Candidater Error]", error);
    return NextResponse.json({ error: error?.message || "Erreur serveur" }, { status: 500 });
  }
}

