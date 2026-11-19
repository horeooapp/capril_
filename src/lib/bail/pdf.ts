/**
 * QAPRIL — Bail complet : production du PDF à partir d'un modèle et de ses variables.
 * Le même fichier sert à l'aperçu, à la signature, au téléchargement et au dépôt fiscal.
 */
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { Bloc, ModeleBail, VariablesBail } from "./types";
import type { MarqueDocument } from "@/lib/pdf-branding";

export interface ClauseParticuliere { titre: string; texte: string }
export interface OptionsRendu {
  apercu?: boolean;
  /** En-tête de l'agence immobilière agréée qui établit le bail. */
  marque?: MarqueDocument | null;
  /** Conditions particulières ajoutées par l'agence agréée, après les articles du modèle. */
  clauses?: ClauseParticuliere[];
}

const A4: [number, number] = [595.28, 841.89];
const MG = 52, MD = 52, MH = 50, MB = 58;
const LARGEUR = A4[0] - MG - MD;
const CORPS = 10, INTERLIGNE = 12.3;
const NOIR = rgb(0, 0, 0), GRIS = rgb(0.35, 0.35, 0.35), FOND = rgb(0.95, 0.95, 0.95);
export const A_COMPLETER = "[à compléter]";

/** Ce que les polices standard du PDF savent écrire (WinAnsi). */
function ecrivable(t: string): string {
  return String(t ?? "")
    .replace(/[   ]/g, " ").replace(/‑/g, "-").replace(/[☐□]/g, "[ ]")
    .replace(/[^\x20-\x7e¡-ÿ–—‘’“”…€Œœ•]/g, "");
}

export function remplir(x: string, v: VariablesBail): string {
  return x.replace(/\{\{([\w.]+)\}\}/g, (_, k) => {
    const val = v[k];
    return val === undefined || val === null || val === "" || val === false ? A_COMPLETER : String(val);
  });
}

function visible(b: Bloc, v: VariablesBail): boolean {
  const si = (b as any).si as string | undefined, sauf = (b as any).sauf as string | undefined;
  if (si && !v[si]) return false;
  if (sauf && v[sauf]) return false;
  return true;
}

/**
 * Largeur réelle d'un texte. La mesure de pdf-lib retranche le crénage entre lettres, que les
 * lecteurs PDF n'appliquent pas : les mots en capitales étaient mesurés trop courts et le mot
 * suivant venait s'y coller. On additionne donc la largeur de chaque caractère.
 */
const CACHE_LARGEUR = new WeakMap<PDFFont, Map<string, number>>();
function largeurTexte(font: PDFFont, texte: string, taille: number): number {
  let c = CACHE_LARGEUR.get(font);
  if (!c) { c = new Map(); CACHE_LARGEUR.set(font, c); }
  let w = 0;
  for (const ch of texte) {
    let l = c.get(ch);
    if (l === undefined) { l = font.widthOfTextAtSize(ch, 1000); c.set(ch, l); }
    w += l;
  }
  return (w * taille) / 1000;
}

function couper(texte: string, font: PDFFont, taille: number, largeur: number): string[] {
  const lignes: string[] = [];
  let ligne = "";
  for (const mot of ecrivable(texte).split(/\s+/).filter(Boolean)) {
    const essai = ligne ? `${ligne} ${mot}` : mot;
    if (ligne && largeurTexte(font, essai, taille) > largeur) { lignes.push(ligne); ligne = mot; }
    else ligne = essai;
  }
  if (ligne) lignes.push(ligne);
  return lignes;
}

export interface RenduBail { pdf: Buffer; pages: number }

export async function rendreBail(modele: ModeleBail, v: VariablesBail, opts: OptionsRendu = {}): Promise<RenduBail> {
  const doc = await PDFDocument.create();
  doc.setTitle(`${modele.intitule} ${v.reference ?? ""}`.trim());
  doc.setProducer("QAPRIL");
  doc.setCreator(`QAPRIL - modele ${modele.code} v${modele.version}`);
  const R = await doc.embedFont(StandardFonts.TimesRoman);
  const G = await doc.embedFont(StandardFonts.TimesRomanBold);
  const I = await doc.embedFont(StandardFonts.TimesRomanItalic);

  let page: PDFPage = doc.addPage(A4);
  let y = A4[1] - MH;
  const saut = () => { page = doc.addPage(A4); y = A4[1] - MH; };
  const place = (h: number) => { if (y - h < MB) saut(); };

  /** Paragraphe justifié (dernière ligne alignée à gauche). */
  const paragraphe = (texte: string, o: { font?: PDFFont; taille?: number; retrait?: number; apres?: number; centre?: boolean; droite?: boolean; puce?: boolean; couleur?: any } = {}) => {
    const font = o.font || R, taille = o.taille || CORPS, x0 = MG + (o.retrait || 0), larg = LARGEUR - (o.retrait || 0);
    const lignes = couper(texte, font, taille, larg);
    lignes.forEach((l, i) => {
      place(INTERLIGNE);
      if (o.puce && i === 0) page.drawText("-", { x: x0 - 12, y, size: taille, font: R, color: NOIR });
      const w = largeurTexte(font, l, taille);
      if (o.centre) page.drawText(l, { x: MG + (LARGEUR - w) / 2, y, size: taille, font, color: o.couleur || NOIR });
      else if (o.droite) page.drawText(l, { x: MG + LARGEUR - w, y, size: taille, font, color: o.couleur || NOIR });
      else {
        const mots = l.split(" ");
        const derniere = i === lignes.length - 1;
        if (derniere || mots.length < 4 || w < larg * 0.75) page.drawText(l, { x: x0, y, size: taille, font, color: o.couleur || NOIR });
        else {
          const libre = (larg - mots.reduce((s, m) => s + largeurTexte(font, m, taille), 0)) / (mots.length - 1);
          let x = x0;
          for (const m of mots) { page.drawText(m, { x, y, size: taille, font, color: o.couleur || NOIR }); x += largeurTexte(font, m, taille) + libre; }
        }
      }
      y -= INTERLIGNE;
    });
    y -= o.apres ?? 4;
  };

  // En-tête de l'agence agréée : logo et identifiants, au-dessus du titre du bail.
  if (opts.marque) {
    const m = opts.marque;
    let x = MG, haut = 0;
    if (m.logo) {
      try {
        const img = m.logo.mime === "image/png" ? await doc.embedPng(m.logo.bytes) : await doc.embedJpg(m.logo.bytes);
        const k = Math.min(64 / img.width, 54 / img.height);
        page.drawImage(img, { x: MG, y: y - img.height * k + 8, width: img.width * k, height: img.height * k });
        x = MG + img.width * k + 12; haut = img.height * k;
      } catch { /* logo illisible : en-tête sans logo */ }
    }
    let yy = y;
    page.drawText(ecrivable(m.nom).slice(0, 70), { x, y: yy, size: 12, font: G, color: NOIR }); yy -= 13;
    for (const l of m.lignes.slice(0, 3)) {
      for (const t of couper(l, R, 8, MG + LARGEUR - x).slice(0, 2)) { page.drawText(t, { x, y: yy, size: 8, font: R, color: GRIS }); yy -= 10; }
    }
    y = Math.min(yy, y - haut + 8) - 6;
    page.drawLine({ start: { x: MG, y }, end: { x: MG + LARGEUR, y }, thickness: 0.5, color: GRIS });
    y -= 22;
  }

  const clauses = (opts.clauses || []).filter((c) => c.texte.trim());
  const blocs: Bloc[] = [];
  for (const b of modele.blocs) {
    if (clauses.length && b.t === "p" && b.x === "DONT ACTE") {
      blocs.push({ t: "sous", x: "CONDITIONS PARTICULIÈRES" });
      blocs.push({ t: "p", x: "Les parties conviennent en outre des conditions particulières suivantes. Elles complètent les articles qui précèdent ; elles ne peuvent déroger aux dispositions d’ordre public de la loi, qui prévalent en cas de contradiction.", italique: true });
      clauses.forEach((c, i) => {
        blocs.push({ t: "article", x: `CONDITION PARTICULIÈRE ${i + 1}${c.titre.trim() ? " - " + c.titre.trim().toUpperCase() : ""}` });
        for (const par of c.texte.split(/\n+/).map((t) => t.trim()).filter(Boolean)) blocs.push({ t: "p", x: par.replace(/\{\{/g, "{ {") });
      });
    }
    blocs.push(b);
  }

  for (const b of blocs) {
    if (!visible(b, v)) continue;
    switch (b.t) {
      case "titre": place(40); paragraphe(remplir(b.x, v), { font: G, taille: 15, centre: true, apres: 4 }); break;
      case "sous": y -= 8; place(INTERLIGNE * 4); paragraphe(remplir(b.x, v), { font: G, taille: 11, centre: true, apres: 6 }); break;
      case "article": {
        y -= 5; place(INTERLIGNE * 3.5);
        const t = ecrivable(remplir(b.x, v));
        const lignes = couper(t, G, CORPS, LARGEUR);
        for (const l of lignes) {
          place(INTERLIGNE);
          page.drawText(l, { x: MG, y, size: CORPS, font: G, color: NOIR });
          page.drawLine({ start: { x: MG, y: y - 1.5 }, end: { x: MG + largeurTexte(G, l, CORPS), y: y - 1.5 }, thickness: 0.6, color: NOIR });
          y -= INTERLIGNE;
        }
        y -= 3; break;
      }
      case "p": paragraphe(remplir(b.x, v), { font: b.gras ? G : b.italique ? I : R }); break;
      case "li": paragraphe(remplir(b.x, v), { retrait: 22, puce: true, apres: 2 }); break;
      case "droite": paragraphe(remplir(b.x, v), { font: G, droite: true }); break;
      case "champ": {
        place(INTERLIGNE);
        const l = ecrivable(`${b.l} : `);
        page.drawText(l, { x: MG, y, size: CORPS, font: G, color: NOIR });
        const dx = largeurTexte(G, l, CORPS);
        const lignes = couper(remplir(b.x, v), R, CORPS, LARGEUR - dx);
        lignes.forEach((t, i) => { if (i) { y -= INTERLIGNE; place(INTERLIGNE); } page.drawText(t, { x: MG + dx, y, size: CORPS, font: R, color: NOIR }); });
        y -= INTERLIGNE + 3; break;
      }
      case "cadre": {
        const h = b.lignes.length * 13 + 12;
        place(h + 6);
        page.drawRectangle({ x: MG, y: y - h + 10, width: LARGEUR, height: h, color: FOND, borderColor: GRIS, borderWidth: 0.5 });
        let yy = y - 2;
        b.lignes.forEach((l, i) => { page.drawText(ecrivable(remplir(l, v)), { x: MG + 8, y: yy, size: 9, font: i === 0 ? G : R, color: NOIR }); yy -= 13; });
        y -= h + 6; break;
      }
      case "signatures": {
        place(58); y -= 10;
        const col = LARGEUR / 2;
        [b.gauche, b.droite].forEach((t, i) => {
          const w = largeurTexte(G, t, 11);
          page.drawText(t, { x: MG + i * col + (col - w) / 2, y, size: 11, font: G, color: NOIR });
          const m = "Signature électronique sur QAPRIL";
          page.drawText(m, { x: MG + i * col + (col - largeurTexte(I, m, 8.5)) / 2, y: y - 14, size: 8.5, font: I, color: GRIS });
          const m2 = `voir l'attestation de signature du bail ${ecrivable(String(v.reference ?? ""))}`;
          page.drawText(m2, { x: MG + i * col + (col - largeurTexte(I, m2, 8.5)) / 2, y: y - 25, size: 8.5, font: I, color: GRIS });
        });
        y -= 44; break;
      }
      case "espace": y -= 10; break;
    }
  }

  const pages = doc.getPages();
  const pied = ecrivable(`Bail N° ${v.reference ?? ""} - ${modele.intitule} - modèle ${modele.code} v${modele.version}`);
  pages.forEach((p, i) => {
    p.drawLine({ start: { x: MG, y: 44 }, end: { x: MG + LARGEUR, y: 44 }, thickness: 0.4, color: GRIS });
    p.drawText(pied, { x: MG, y: 32, size: 8, font: R, color: GRIS });
    const n = `Page ${i + 1} / ${pages.length}`;
    p.drawText(n, { x: MG + LARGEUR - largeurTexte(R, n, 8), y: 32, size: 8, font: R, color: GRIS });
    if (opts.apercu) {
      const a = "APERÇU - document non signé, sans valeur";
      p.drawText(ecrivable(a), { x: MG + (LARGEUR - largeurTexte(G, ecrivable(a), 8)) / 2, y: A4[1] - 30, size: 8, font: G, color: GRIS });
    }
  });
  return { pdf: Buffer.from(await doc.save()), pages: pages.length };
}

/** Rend le bail en tenant compte de son propre nombre de pages (timbre de l'article sur l'enregistrement). */
export async function rendreBailStable(
  construire: (pages?: number) => { modele: ModeleBail; variables: VariablesBail },
  opts: OptionsRendu = {}
): Promise<RenduBail> {
  let pages: number | undefined, rendu: RenduBail | null = null;
  for (let i = 0; i < 4; i++) {
    const d = construire(pages);
    rendu = await rendreBail(d.modele, d.variables, opts);
    if (rendu.pages === pages) break;
    pages = rendu.pages;
  }
  return rendu as RenduBail;
}
