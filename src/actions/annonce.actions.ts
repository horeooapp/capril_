"use server";
// QAPRIL - Annonces vacance locative · Candidatures

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Creer une annonce de vacance
export async function creerAnnonce(data: {
  logementId:  string;
  agenceId:    string;
  titre:       string;
  description: string;
  loyerDemande: number;
  charges?:    number;
  photosUrls?: string[];
  diffusions?: { jumia?: boolean; whatsapp?: boolean; expat?: boolean };
}) {
  return prisma.annonce.create({
    data: {
      logementId:   data.logementId,
      agenceId:     data.agenceId,
      titre:        data.titre,
      description:  data.description,
      loyerDemande: data.loyerDemande,
      charges:      data.charges ?? 0,
      photosUrls:   data.photosUrls ?? [],
      diffusions:   data.diffusions ?? {},
      statut:       "ACTIVE",
      publieeAt:    new Date(),
    }
  });
}

// Annonces actives (recherche locataire)
export async function getAnnoncesActives(commune?: string) {
  return prisma.annonce.findMany({
    where: {
      statut: "ACTIVE",
      ...(commune ? { logement: { commune } } : {})
    },
    include: { logement: { select: { commune: true, address: true, propertyType: true, superficieM2: true } } },
    orderBy: { publieeAt: "desc" }
  });
}

// Soumettre une candidature
export async function soumettreCandidat(data: {
  logementId:    string;
  candidatId?:   string;
  nom:           string;
  prenom:        string;
  telephone:     string;
  revenuMensuel?: number;
  employeur?:    string;
}) {
  // Calcul taux d'effort si revenu fourni
  let tauxEffort: number | undefined;
  if (data.revenuMensuel) {
    const annonce = await prisma.annonce.findFirst({
      where: { logementId: data.logementId, statut: "ACTIVE" },
      select: { loyerDemande: true }
    });
    if (annonce) {
      tauxEffort = parseFloat(((annonce.loyerDemande / data.revenuMensuel) * 100).toFixed(1));
    }
  }

  return prisma.candidature.create({
    data: { ...data, tauxEffort, statut: "SOUMISE" }
  });
}

// Candidatures pour un logement
export async function getCandidaturesLogement(logementId: string) {
  return prisma.candidature.findMany({
    where:   { logementId },
    orderBy: [{ scoreQapril: "desc" }, { createdAt: "asc" }]
  });
}

// Parametrer les charges d'un logement
export async function parametrerCharges(logementId: string, charges: Array<{
  typeCharge: string; // EAU|ELECTRICITE_COMMUNE|GARDIENNAGE|TOM
  mode?:      string; // FORFAIT|PROVISION_REELLE
  montantMensuel: number;
}>) {
  const ops = charges.map(c => prisma.chargeParametrage.create({
    data: { logementId, ...c }
  }));
  return Promise.all(ops);
}
