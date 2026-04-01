"use server";
// QAPRIL - Litiges · Successions · Reclamations - ADD-16

import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";

// Creer une reclamation locataire
export async function creerReclamation(data: {
  leaseId:         string;
  tenantId:        string;
  typeReclamation: string; // RCL-01|RCL-02|RCL-03|RCL-04
  description:     string;
  preuveUrl?:      string;
}) {
  const dateEcheance = new Date(Date.now() + 144 * 3600 * 1000); // J+6
  return prisma.reclamationLocataire.create({
    data: { ...data, statut: "OUVERT", dateEcheance }
  });
}

// Creer un dossier litige certifie (CACI)
export async function creerDossierLitige(leaseId: string, reclamationIds: string[]) {
  const sha256 = createHash("sha256").update(JSON.stringify({
    leaseId, reclamationIds, date: new Date().toISOString()
  })).digest("hex");

  const dossier = await prisma.dossierLitigeCertifie.create({
    data: { leaseId, hashSha256: sha256, statut: "GENERE" }
  });
  // Lier les reclamations au dossier
  await prisma.reclamationLocataire.updateMany({
    where: { id: { in: reclamationIds } },
    data:  { dossierLitigeId: dossier.id }
  });
  return dossier;
}

// Reclamations d'un bail
export async function getReclamationsBail(leaseId: string) {
  return prisma.reclamationLocataire.findMany({
    where:   { leaseId },
    orderBy: { createdAt: "desc" }
  });
}

// Declarer une succession proprietaire
export async function declarerSuccessionProprio(data: {
  landlordId:    string;
  declarantNom:  string;
  declarantLien: string;
  declarantPhone: string;
  dateDeces:     Date;
  acteDecesUrl?: string;
}) {
  return prisma.successionProprio.create({
    data: { ...data, statut: "EN_COURS" }
  });
}

// Consentement revision loyer (MRL-01)
export async function soumettrePropositionLoyer(data: {
  leaseId:       string;
  montantActuel: number;
  nouveauMontant: number;
  dateEffet:     Date;
  raison?:       string;
}) {
  return prisma.propositionLoyer.create({
    data: { ...data, statut: "EN_ATTENTE" }
  });
}

// Repondre a une proposition de loyer (locataire)
export async function repondrePropositionLoyer(
  propositionId: string,
  reponse: boolean,
  commentaire?: string
) {
  await prisma.consentementLoyer.create({
    data: { propositionId, reponse, commentaire }
  });
  return prisma.propositionLoyer.update({
    where: { id: propositionId },
    data:  { statut: reponse ? "ACCEPTE" : "REFUSE" }
  });
}
