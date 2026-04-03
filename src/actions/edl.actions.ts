"use server";
// QAPRIL - EDL Etats des Lieux - modele EtatsDesLieux

import { prisma } from "@/lib/prisma";
import { createHash, randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

// Creer un EDL entree
export async function creerEdlEntree(data: {
  leaseId:     string;
  redigeParId: string;
  agentId?:    string;
  locataireId?: string;
  sections:    any; // { pieces: [{nom, etat, photos, notes}] }
  indexEau?:   number;
  indexElec?:  number;
  clesRemises?: number;
}) {
  const ref = "EDL-ENT-" + Date.now().toString(36).toUpperCase();
  const sha256 = createHash("sha256").update(JSON.stringify({
    ref, leaseId: data.leaseId, sections: data.sections, type: "ENTREE"
  })).digest("hex");
  const edl = await prisma.etatsDesLieux.create({
    data: {
      leaseId:      data.leaseId,
      typeEdl:      "ENTREE",
      redigeParId:  data.redigeParId,
      agentId:      data.agentId,
      locataireId:  data.locataireId,
      sections:     data.sections,
      indexEau:     data.indexEau,
      indexElec:    data.indexElec,
      clesRemises:  data.clesRemises ?? 1,
      statut:       "EN_COURS",
      refEdl:       ref,
      hashSha256:   sha256,
    }
  });
  revalidatePath("/dashboard");
  return { success: true, edl, sha256 };
}

// Creer un EDL sortie (lie a l'EDL entree)
export async function creerEdlSortie(data: {
  leaseId:      string;
  edlEntreeId:  string; // ID de l'EDL entree pour comparatif
  redigeParId:  string;
  sections:     any;
  indexEau?:    number;
  indexElec?:   number;
  reservesLocataire?: string;
}) {
  const ref = "EDL-SOR-" + Date.now().toString(36).toUpperCase();
  const sha256 = createHash("sha256").update(JSON.stringify({
    ref, leaseId: data.leaseId, sections: data.sections, type: "SORTIE"
  })).digest("hex");
  return prisma.etatsDesLieux.create({
    data: {
      leaseId:          data.leaseId,
      typeEdl:          "SORTIE",
      redigeParId:      data.redigeParId,
      sections:         data.sections,
      indexEau:         data.indexEau,
      indexElec:        data.indexElec,
      reservesLocataire: data.reservesLocataire,
      edlEntreeId:      data.edlEntreeId,
      statut:           "EN_COURS",
      refEdl:           ref,
      hashSha256:       sha256,
    }
  });
}

// Confirmer EDL (proprio ou locataire)
export async function confirmerEdl(edlId: string, par: "PROPRIO" | "LOCATAIRE") {
  const data = par === "PROPRIO"
    ? { confirmeProprio: true, confirmeProprioAt: new Date() }
    : { confirmeLocataire: true, confirmeLocataireAt: new Date() };
  const edl = await prisma.etatsDesLieux.update({ where:{id:edlId}, data });
  // Si les deux ont confirme -> CONFIRME
  if (edl.confirmeProprio && edl.confirmeLocataire) {
    await prisma.etatsDesLieux.update({ where:{id:edlId}, data:{statut:"CONFIRME"} });
  }
  return edl;
}

// Recuperer EDL d'un bail
export async function getEdlForLease(leaseId: string) {
  return prisma.etatsDesLieux.findMany({
    where:   { leaseId },
    include: { redigePar:{select:{firstName: true, lastName: true}}, locataire:{select:{firstName: true, lastName: true}} },
    orderBy: { dateEdl: "desc" }
  });
}

// Comparatif entree/sortie
export async function getComparatifEdl(edlSortieId: string) {
  const sortie = await prisma.etatsDesLieux.findUnique({
    where: { id: edlSortieId },
    include: { edlEntree: true }
  });
  return { entree: sortie?.edlEntree ?? null, sortie };
}
