#!/usr/bin/env node
/**
 * Vérification des modèles de bail (ADD-32). À lancer avant chaque livraison : npm run verifier:baux
 *  1. le texte de chaque modèle correspond à l'empreinte approuvée pour sa version ;
 *  2. le bail d'habitation reste fidèle, article par article, au modèle de référence
 *     (src/lib/bail/reference/habitation.modele.txt) ;
 *  3. chaque modèle se rend en PDF sans champ non résolu.
 */
const path = require("path"), fs = require("fs"), os = require("os");
const racine = path.resolve(__dirname, "..");
const sortie = path.join(os.tmpdir(), `verif-baux-${process.pid}.cjs`);
require("esbuild").buildSync({
  stdin: { contents: `export * from "@/lib/bail/modeles"; export { rendreBail, remplir } from "@/lib/bail/pdf";`, resolveDir: path.join(racine, "src"), loader: "ts" },
  bundle: true, platform: "node", format: "cjs", outfile: sortie, logLevel: "error", alias: { "@": path.join(racine, "src") },
});
const { MODELES, EMPREINTES_APPROUVEES, empreinteModele, rendreBail } = require(sortie);
let echecs = 0;
const ok = (c, m) => { console.log((c ? "OK    " : "ECHEC ") + m); if (!c) echecs++; };

// 1. Empreintes
for (const m of Object.values(MODELES)) {
  const cle = `${m.code}@${m.version}`, e = empreinteModele(m);
  ok(EMPREINTES_APPROUVEES[cle] === e, `${cle} : texte conforme à l'empreinte approuvée` + (EMPREINTES_APPROUVEES[cle] === e ? "" : `\n        texte modifié. Si c'est voulu : changer la version du modèle et enregistrer l'empreinte ${e}`));
}

// 2. Fidélité du bail d'habitation au modèle de référence
const norm = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[’‘]/g, "'").replace(/\{\{[\w.]+\}\}/g, " ").replace(/[.…_]{3,}/g, " ").replace(/[^A-Z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
const articles = (T) => { const p = T.split(/(ARTICLE ?\d+)/), d = {}; for (let i = 1; i < p.length - 1; i += 2) { const n = +p[i].match(/\d+/)[0]; if (!(n in d)) d[n] = p[i + 1].trim().split(" "); } return d; };
const lcs = (a, b) => { const n = b.length; let prev = new Uint16Array(n + 1), cur = new Uint16Array(n + 1); for (let i = 1; i <= a.length; i++) { for (let j = 1; j <= n; j++) cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]); [prev, cur] = [cur, prev]; } return prev[n]; };
const ref = articles(norm(fs.readFileSync(path.join(racine, "src/lib/bail/reference/habitation.modele.txt"), "utf8")));
const app = articles(norm(MODELES.HABITATION.blocs.filter((b) => b.t !== "cadre").map((b) => b.x || "").join(" ")));
// Seuil : part des mots du modèle retrouvés dans l'ordre. Articles à champs variables ou adaptés : seuil propre.
const SEUILS = { 2: 0.9, 5: 0.8, 20: 0.85 };
ok(Object.keys(app).length === 21 && Object.keys(ref).length === 21, `habitation : 21 articles dans le modèle (${Object.keys(ref).length}) et dans QAPRIL (${Object.keys(app).length})`);
for (let n = 1; n <= 21; n++) {
  const r = ref[n] || [], a = app[n] || [];
  const part = r.length ? lcs(r, a) / r.length : 0, seuil = SEUILS[n] || 0.93;
  ok(part >= seuil, `habitation art. ${String(n).padStart(2)} : ${(part * 100).toFixed(0)} % du texte du modèle retrouvé (seuil ${seuil * 100} %)`);
}

// 3. Rendu
(async () => {
  for (const m of Object.values(MODELES)) {
    const v = new Proxy({}, { get: (_, k) => (String(k).endsWith(".present") || String(k) === "duree.determinee" ? true : "X") });
    const r = await rendreBail(m, v);
    ok(r.pages >= 3 && r.pdf.length > 5000, `${m.code} : rendu PDF de ${r.pages} pages`);
  }
  fs.rmSync(sortie, { force: true });
  console.log(echecs ? `\n${echecs} échec(s)` : "\nModèles de bail conformes.");
  process.exit(echecs ? 1 : 0);
})();
