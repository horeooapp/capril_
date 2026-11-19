import { createHash } from "crypto";
import type { ModeleBail } from "../types";
import { BAIL_HABITATION } from "./habitation";
import { BAIL_PROFESSIONNEL } from "./professionnel";

export const MODELES: Record<ModeleBail["code"], ModeleBail> = {
  HABITATION: BAIL_HABITATION,
  PROFESSIONNEL: BAIL_PROFESSIONNEL,
};

/** Empreinte du texte d'un modèle : tout changement d'un mot la modifie. */
export function empreinteModele(m: ModeleBail): string {
  return createHash("sha256").update(JSON.stringify(m.blocs)).digest("hex");
}

/**
 * Registre des textes approuvés. `npm run verifier:baux` échoue si le texte d'un modèle
 * ne correspond plus à l'empreinte enregistrée pour sa version : on ne modifie pas un bail
 * par inadvertance. Pour modifier un texte : changer `version` dans le modèle, puis
 * reporter ici la nouvelle empreinte affichée par la vérification.
 */
export const EMPREINTES_APPROUVEES: Record<string, string> = {
  "HABITATION@1.0": "55221ba3d219ecb945d590fe199cdb06663e111e36481a816ef45d43704f06d2",
  "PROFESSIONNEL@0.1": "189f8bb3bbfbf7cc3e55b48006992878c592fa16ceb1b6ccf44b8019c92df57f",
};

/** Bail commercial ou professionnel : modèle OHADA ; sinon bail d'habitation. */
export function modelePourBail(bail: { leaseType?: string | null }): ModeleBail {
  const t = String(bail.leaseType || "").toLowerCase();
  return t === "commercial" || t === "professionnel" || t === "professional" ? MODELES.PROFESSIONNEL : MODELES.HABITATION;
}
