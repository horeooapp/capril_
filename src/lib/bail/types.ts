/**
 * QAPRIL — Bail complet (ADD-32). Un modèle de bail est une suite de blocs.
 * Le texte fixe ne se modifie qu'ici ; les écrans ne fournissent que les variables {{...}}.
 */
export type Bloc =
  | { t: "titre"; x: string }                 // grand titre centré
  | { t: "sous"; x: string }                  // sous-titre centré (titre, section)
  | { t: "article"; x: string }               // intitulé d'article
  | { t: "p"; x: string; si?: string; sauf?: string; gras?: boolean; italique?: boolean }
  | { t: "li"; x: string; si?: string; sauf?: string }
  | { t: "champ"; l: string; x: string }      // libellé : valeur
  | { t: "droite"; x: string }
  | { t: "cadre"; lignes: string[] }          // encadré chiffré
  | { t: "signatures"; gauche: string; droite: string }
  | { t: "espace" };

export interface ModeleBail {
  code: "HABITATION" | "PROFESSIONNEL";
  version: string;
  intitule: string;
  /** Statut du texte : VALIDE (relu par un juriste) ou PROJET. */
  statut: "VALIDE" | "PROJET";
  blocs: Bloc[];
}

export type VariablesBail = Record<string, string | number | boolean | null | undefined>;
