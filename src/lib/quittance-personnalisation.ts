/**
 * QAPRIL — Personnalisation des quittances (logo et identifiants de l'émetteur).
 *
 * Rangée dans User.whiteLabelConfig.quittance : aucune table ni colonne nouvelle.
 * Le logo est un fichier du dossier de stockage ; seul son chemin est en base.
 * Le numéro d'agrément n'est pas saisissable ici : il vient du profil d'agence.
 * Le pied de page « Document certifié par QAPRIL », l'empreinte et le QR ne sont
 * jamais remplacés : c'est ce qui rend la quittance vérifiable.
 */
import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { UPLOADS_DIR } from "@/lib/storage";
import type { MarqueDocument } from "@/lib/pdf-branding";

export interface PersonnalisationQuittance {
  actif: boolean;
  nomAffiche: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  rccm?: string;
  compteContribuable?: string;
  logoUrl?: string;
}

export const LOGO_TAILLE_MAX = 500 * 1024;

const court = (v: unknown, n: number) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, n);

export function nettoyerPersonnalisation(brut: any): PersonnalisationQuittance {
  return {
    actif: brut?.actif !== false,
    nomAffiche: court(brut?.nomAffiche, 60),
    telephone: court(brut?.telephone, 30) || undefined,
    email: court(brut?.email, 60) || undefined,
    adresse: court(brut?.adresse, 80) || undefined,
    rccm: court(brut?.rccm, 40) || undefined,
    compteContribuable: court(brut?.compteContribuable, 30) || undefined,
    logoUrl: typeof brut?.logoUrl === "string" && brut.logoUrl.startsWith("/uploads/logos-quittance/") ? brut.logoUrl : undefined,
  };
}

/** Reconnaît un PNG ou un JPEG à ses premiers octets (l'extension ne prouve rien). */
export function typeImage(b: Uint8Array): "image/png" | "image/jpeg" | null {
  if (b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  return null;
}

async function lireLogo(logoUrl?: string): Promise<MarqueDocument["logo"] | undefined> {
  if (!logoUrl) return undefined;
  try {
    const base = path.resolve(UPLOADS_DIR);
    const fichier = path.resolve(base, logoUrl.replace(/^\/uploads\//, ""));
    if (!fichier.startsWith(base + path.sep)) return undefined;
    const bytes = await fs.readFile(fichier);
    const mime = typeImage(bytes);
    return mime ? { bytes, mime } : undefined;
  } catch {
    return undefined; // logo absent : la quittance sort sans logo plutôt que d'échouer
  }
}

export function lignesMarque(p: PersonnalisationQuittance, agrement?: string | null): string[] {
  const l1 = [p.rccm && `RCCM ${p.rccm}`, p.compteContribuable && `CC ${p.compteContribuable}`, agrement && `Agrément N° ${agrement}`].filter(Boolean).join(" · ");
  const l2 = [p.telephone && `Tél. ${p.telephone}`, p.email].filter(Boolean).join(" · ");
  return [l1, l2, p.adresse || ""].filter(Boolean);
}

export async function lirePersonnalisation(userId: string) {
  const u = await (prisma as any).user.findUnique({
    where: { id: userId },
    select: { whiteLabelConfig: true, agenceProfile: { select: { nomAgence: true, numeroAgrement: true, rccm: true, adresseLocal: true } } },
  });
  const enregistree = (u?.whiteLabelConfig as any)?.quittance;
  return { personnalisation: enregistree ? nettoyerPersonnalisation(enregistree) : null, profilAgence: u?.agenceProfile || null };
}

/** Identité à porter en en-tête des quittances de cet émetteur, ou null s'il n'a rien réglé. */
export async function chargerMarque(userId?: string | null): Promise<MarqueDocument | null> {
  if (!userId) return null;
  const { personnalisation: p, profilAgence } = await lirePersonnalisation(userId);
  if (!p || !p.actif || !p.nomAffiche) return null;
  return { nom: p.nomAffiche, lignes: lignesMarque(p, profilAgence?.numeroAgrement), logo: await lireLogo(p.logoUrl) };
}
