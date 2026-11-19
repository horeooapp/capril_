/**
 * QAPRIL — Bail complet : aperçu, puis document figé à l'envoi en signature.
 *
 * Le fichier figé est celui que le locataire signe, que l'on télécharge et que l'on dépose
 * à l'enregistrement. Son empreinte couvre tout le texte ; son nombre de pages fixe le timbre.
 */
import { createHash } from "crypto";
import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { UPLOADS_DIR } from "@/lib/storage";
import { fraisTimbre } from "@/lib/timbre";
import { chargerMarqueAgenceAgreee } from "@/lib/quittance-personnalisation";
import { donneesBail } from "./donnees";
import { rendreBailStable, type ClauseParticuliere, type OptionsRendu } from "./pdf";
import { empreinteModele } from "./modeles";

export class BailIncompletError extends Error {
  constructor(public manquants: string[]) {
    super(`Le bail ne peut pas partir à la signature. Il manque : ${manquants.join(" ; ")}.`);
  }
}

const INCLURE = {
  property: true, bdq: true,
  landlord: { include: { identityDocuments: true } },
  tenant: { include: { identityDocuments: true } },
};

export async function chargerBailComplet(leaseId: string) {
  const bail = await (prisma as any).lease.findUnique({ where: { id: leaseId }, include: INCLURE });
  if (!bail || bail.deletedAt) throw new Error("Contrat de bail introuvable.");
  return bail;
}

/** Personnalisation réservée à l'agence agréée qui gère le bail (gestionnaire, ou bailleur s'il est l'agence). */
async function optionsAgence(bail: any): Promise<Pick<OptionsRendu, "marque" | "clauses"> & { agreee: boolean }> {
  const marque = (await chargerMarqueAgenceAgreee(bail.agentId)) || (await chargerMarqueAgenceAgreee(bail.landlordId));
  if (!marque) return { marque: null, clauses: [], agreee: false };
  const brutes = (typeof bail.commercialData === "string" ? JSON.parse(bail.commercialData || "{}") : bail.commercialData)?.clauses;
  const clauses: ClauseParticuliere[] = (Array.isArray(brutes) ? brutes : []).slice(0, 10).map((c: any) => ({
    titre: String(c?.title ?? c?.titre ?? "").replace(/\s+/g, " ").trim().slice(0, 80),
    texte: String(c?.content ?? c?.texte ?? "").trim().slice(0, 1500),
  })).filter((c: ClauseParticuliere) => c.texte);
  return { marque, clauses, agreee: true };
}

export async function apercuBail(leaseId: string) {
  const bail = await chargerBailComplet(leaseId);
  const ag = await optionsAgence(bail);
  const rendu = await rendreBailStable((pages) => donneesBail(bail, { pages }), { apercu: true, marque: ag.marque, clauses: ag.clauses });
  const d = donneesBail(bail, { pages: rendu.pages });
  return { ...rendu, manquants: d.manquants, modele: d.modele, agenceAgreee: ag.agreee, nbClauses: ag.clauses.length, bail };
}

export interface BailFige { url: string; sha256: string; pages: number; modele: string; version: string; empreinteModele: string; figeLe: string }

/** Produit le bail définitif, l'enregistre et note son empreinte et son nombre de pages sur le bail. */
export async function figerBail(leaseId: string): Promise<BailFige> {
  const bail = await chargerBailComplet(leaseId);
  if (bail.isSignedElectronically) throw new Error("Ce bail est déjà signé : son texte ne peut plus changer.");
  const dateActe = new Date();
  const d0 = donneesBail(bail, { dateActe });
  if (d0.manquants.length) throw new BailIncompletError(d0.manquants);
  const ag = await optionsAgence(bail);
  const rendu = await rendreBailStable((pages) => donneesBail(bail, { pages, dateActe }), { marque: ag.marque, clauses: ag.clauses });
  const sha256 = createHash("sha256").update(rendu.pdf).digest("hex");

  const dossier = path.join(path.resolve(UPLOADS_DIR), "baux", bail.id);
  await fs.mkdir(dossier, { recursive: true });
  await fs.writeFile(path.join(dossier, `${sha256.slice(0, 20)}.pdf`), rendu.pdf);

  const fige: BailFige = {
    url: `/uploads/baux/${bail.id}/${sha256.slice(0, 20)}.pdf`, sha256, pages: rendu.pages,
    modele: d0.modele.code, version: d0.modele.version, empreinteModele: empreinteModele(d0.modele), figeLe: dateActe.toISOString(),
  };
  const timbre = fraisTimbre(rendu.pages);
  await (prisma as any).lease.update({
    where: { id: bail.id },
    data: {
      nbPagesBail: rendu.pages,
      fraisTimbre: timbre,
      sha256Hash: sha256,
      sha256CalculeLe: dateActe,
      signatureContext: { ...((bail.signatureContext as any) || {}), bail: fige },
    },
  });
  return fige;
}

/** Relit le fichier figé et vérifie qu'il n'a pas été altéré. */
export async function lireBailFige(bail: any): Promise<{ pdf: Buffer; fige: BailFige } | null> {
  const fige = (bail?.signatureContext as any)?.bail as BailFige | undefined;
  if (!fige?.url || !fige.sha256) return null;
  const base = path.resolve(UPLOADS_DIR);
  const fichier = path.resolve(base, fige.url.replace(/^\/uploads\//, ""));
  if (!fichier.startsWith(base + path.sep)) return null;
  try {
    const pdf = await fs.readFile(fichier);
    if (createHash("sha256").update(pdf).digest("hex") !== fige.sha256) {
      console.error(`[BAIL] Fichier figé altéré pour le bail ${bail.id}`);
      return null;
    }
    return { pdf, fige };
  } catch {
    return null;
  }
}

/** Avant signature : si un bail a été figé, le fichier doit être présent et intact. */
export async function verifierBailAvantSignature(leaseId: string): Promise<void> {
  const bail = await (prisma as any).lease.findUnique({ where: { id: leaseId }, select: { id: true, signatureContext: true } });
  if (!(bail?.signatureContext as any)?.bail) return; // bail antérieur à ADD-32 : pas de document figé
  if (!(await lireBailFige(bail))) {
    throw new Error("Le document du bail est indisponible ou a été modifié. Demandez un nouveau code pour signer un document à jour.");
  }
}
