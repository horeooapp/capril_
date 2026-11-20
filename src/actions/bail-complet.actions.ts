"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ensureAuthenticated } from "@/actions/auth-helpers";
import { apercuBail } from "@/lib/bail/figer";
import { mentionsDuBail, type MentionsBail } from "@/lib/bail/donnees";

const c = (v: unknown, n = 160) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, n) || undefined;

async function bailDuGestionnaire(leaseId: string) {
  const session = await ensureAuthenticated();
  const bail = await (prisma as any).lease.findUnique({ where: { id: leaseId }, include: { property: true } });
  const u = session.user as any;
  const ok = bail && ([bail.landlordId, bail.agentId, bail.property?.ownerUserId, bail.property?.managedByUserId].includes(u.id) || ["ADMIN", "SUPER_ADMIN"].includes(u.role));
  return ok ? bail : null;
}

/** État du bail complet : modèle utilisé, mentions saisies, mentions manquantes, nombre de pages. */
export async function etatBailComplet(leaseId: string) {
  const bail = await bailDuGestionnaire(leaseId);
  if (!bail) return null;
  const a = await apercuBail(leaseId);
  const fige = (bail.signatureContext as any)?.bail || null;
  return {
    leaseId, reference: bail.leaseReference as string, signe: !!bail.isSignedElectronically,
    modele: { code: a.modele.code, version: a.modele.version, intitule: a.modele.intitule, statut: a.modele.statut },
    mentions: mentionsDuBail(bail), manquants: a.manquants, pages: a.pages, timbre: a.pages * 500,
    agenceAgreee: a.agenceAgreee, nbClauses: a.nbClauses,
    enAttenteDeSignature: !bail.isSignedElectronically && !!bail.signingOtpHash && bail.status !== "CANCELLED",
    telephoneLocataire: (a.bail.tenant?.phone as string) || null,
    annule: bail.status === "CANCELLED",
    fige: fige ? { pages: fige.pages, figeLe: fige.figeLe, sha256: fige.sha256 } : null,
  };
}

export async function enregistrerMentionsBail(leaseId: string, m: MentionsBail) {
  try {
    const bail = await bailDuGestionnaire(leaseId);
    if (!bail) return { success: false as const, error: "Bail introuvable." };
    if (bail.isSignedElectronically) return { success: false as const, error: "Ce bail est signé : ses mentions ne peuvent plus être modifiées." };
    const ex = Math.round(Number(m.exemplaires));
    const propre: MentionsBail = {
      bailleur: { piece: c(m.bailleur?.piece, 60), domicile: c(m.bailleur?.domicile), bp: c(m.bailleur?.bp, 60), compteContribuable: c(m.bailleur?.compteContribuable, 40), forme: c(m.bailleur?.forme) },
      preneur: { piece: c(m.preneur?.piece, 60), domicile: c(m.preneur?.domicile), bp: c(m.preneur?.bp, 60), compteContribuable: c(m.preneur?.compteContribuable, 40), forme: c(m.preneur?.forme), profession: c(m.preneur?.profession, 80), qualite: c(m.preneur?.qualite, 80) },
      locaux: { references: c(m.locaux?.references), consistance: c(m.locaux?.consistance, 240), superficie: c(m.locaux?.superficie, 40) },
      activite: c(m.activite, 240), dureeIndeterminee: !!m.dureeIndeterminee, periodicite: c(m.periodicite, 40), revision: c(m.revision, 300),
      modePaiement: c(m.modePaiement, 160), chargesCopropriete: m.chargesCopropriete === "BAILLEUR" ? "BAILLEUR" : "PRENEUR",
      chargesCommunes: c(m.chargesCommunes, 80), fraisEnregistrement: c(m.fraisEnregistrement, 80),
      sousLocationAutorisee: !!m.sousLocationAutorisee, entreprenantDerogation: !!m.entreprenantDerogation,
      lieuSignature: c(m.lieuSignature, 60), exemplaires: ex >= 1 && ex <= 9 ? ex : undefined,
    };
    await (prisma as any).lease.update({ where: { id: leaseId }, data: { draftData: { ...((bail.draftData as any) || {}), bail: propre } } });
    revalidatePath(`/dashboard/leases/${leaseId}/bail`);
    return { success: true as const, etat: await etatBailComplet(leaseId) };
  } catch (e: any) {
    console.error("[BAIL_MENTIONS]", e);
    return { success: false as const, error: "Les mentions n’ont pas pu être enregistrées." };
  }
}
