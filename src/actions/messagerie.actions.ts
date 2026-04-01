"use server";
// QAPRIL - Messagerie bail · Preavis · Annonces voisinage

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Envoyer un message dans la messagerie bail
export async function envoyerMessage(data: {
  leaseId:       string;
  expediteurId:  string;
  roleExpediteur: "PROPRIO" | "LOCATAIRE" | "SYSTEME";
  contenu:       string;
  pjUrl?:        string;
}) {
  return prisma.messagerieBail.create({
    data: { ...data, statut: "ENVOYE", dateEnvoi: new Date() }
  });
}

// Messages d'un bail (conversation)
export async function getMessagesBail(leaseId: string) {
  return prisma.messagerieBail.findMany({
    where:   { leaseId },
    include: { expediteur: { select: { fullName: true, role: true } } },
    orderBy: { dateEnvoi: "asc" }
  });
}

// Emettre un preavis de depart (locataire)
export async function emettrePreavais(data: {
  bailId:          string;
  locataireId:     string;
  dateDepartPrevue: Date;
  motif?:          string;
}) {
  const ref = "PRE-" + Date.now().toString(36).toUpperCase();
  return prisma.preavisBail.create({
    data: { ...data, statut: "EMIS", refPreavis: ref }
  });
}

// Preavis d'un bail
export async function getPreavisBail(bailId: string) {
  return prisma.preavisBail.findMany({
    where:   { bailId },
    orderBy: { createdAt: "desc" }
  });
}

// Creer une annonce voisinage
export async function creerAnnonceVoisinage(data: {
  proprioId:   string;
  propertyId:  string;
  typeAnnonce: string; // ANNONCE|PLANNING|ALERTE_COUPURE|REGLEMENT
  titre:       string;
  contenu:     string;
  dateExpiration?: Date;
  epingle?:    boolean;
}) {
  return prisma.annonceVoisinage.create({ data });
}

// Annonces d'une propriete
export async function getAnnoncesVoisinage(propertyId: string) {
  return prisma.annonceVoisinage.findMany({
    where:   { propertyId, OR: [{ dateExpiration: null }, { dateExpiration: { gte: new Date() } }] },
    orderBy: [{ epingle: "desc" }, { datePublication: "desc" }]
  });
}
