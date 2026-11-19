/**
 * QAPRIL — Bail complet : variables d'un bail et contrôle des mentions obligatoires.
 * Les mentions propres au bail (pièces d'identité, domiciles, activité, options) sont
 * rangées dans Lease.draftData.bail ; aucune colonne nouvelle.
 */
import { numberToFrenchWords } from "@/lib/number-to-letters";
import { calculerDroitsEnregistrement } from "@/lib/lease-validation";
import { fraisTimbre, libelleTimbre } from "@/lib/timbre";
import type { ModeleBail, VariablesBail } from "./types";
import { modelePourBail } from "./modeles";

export interface MentionsBail {
  bailleur?: { piece?: string; domicile?: string; bp?: string; compteContribuable?: string; forme?: string };
  preneur?: { piece?: string; domicile?: string; bp?: string; compteContribuable?: string; forme?: string; profession?: string; qualite?: string };
  locaux?: { references?: string; consistance?: string; superficie?: string };
  activite?: string;
  dureeIndeterminee?: boolean;
  periodicite?: string;
  revision?: string;
  modePaiement?: string;
  chargesCopropriete?: "PRENEUR" | "BAILLEUR";
  chargesCommunes?: string;
  fraisEnregistrement?: string;
  sousLocationAutorisee?: boolean;
  entreprenantDerogation?: boolean;
  lieuSignature?: string;
  exemplaires?: number;
}

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
export function dateFr(d: Date | string | null | undefined): string {
  if (!d) return "";
  const x = new Date(d);
  if (isNaN(x.getTime())) return "";
  const j = x.getUTCDate();
  return `${j === 1 ? "1er" : j} ${MOIS[x.getUTCMonth()]} ${x.getUTCFullYear()}`;
}
const milliers = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
const nom = (u: any) => (u?.fullName || [u?.firstName, u?.lastName].filter(Boolean).join(" ") || "").trim();
const propre = (v: unknown) => String(v ?? "").replace(/\s+/g, " ").trim();
const pieceDe = (u: any) => propre(u?.identityDocuments?.find?.((d: any) => d.docNumber)?.docNumber);

export function mentionsDuBail(bail: any): MentionsBail {
  return (((bail?.draftData as any) || {}).bail || {}) as MentionsBail;
}

export interface DonneesBail {
  modele: ModeleBail;
  variables: VariablesBail;
  /** Mentions obligatoires manquantes, en clair. Vide = le bail peut partir à la signature. */
  manquants: string[];
}

/** `pages` : nombre de pages du document (connu après un premier rendu), pour le timbre. */
export function donneesBail(bail: any, opts: { pages?: number; dateActe?: Date } = {}): DonneesBail {
  const modele = modelePourBail(bail);
  const m = mentionsDuBail(bail);
  const B = bail.landlord || {}, T = bail.tenant || {}, bien = bail.property || {};
  const loyer = Math.round(Number(bail.rentAmount) || 0);
  const depot = Math.round(Number(bail.depositAmount) || 0);
  const avance = Math.round(Number(bail.avanceLoyer) || 0);
  const duree = Math.round(Number(bail.durationMonths) || 0);
  const debut = bail.startDate ? new Date(bail.startDate) : null;
  const fin = debut && duree > 0 ? new Date(Date.UTC(debut.getUTCFullYear(), debut.getUTCMonth() + duree, debut.getUTCDate() - 1)) : null;
  const provisoire = bien.propertyType === "A_PRECISER" || /^Logement — /.test(bien.address || "");
  const adresse = provisoire ? "" : propre([bien.address, bien.commune && !String(bien.address || "").includes(bien.commune) ? bien.commune : ""].filter(Boolean).join(", "));
  const typeBien = provisoire ? "" : propre(bien.propertyType);
  const nbMoisAvance = loyer > 0 ? Math.floor(avance / loyer) : 0;
  const moisAvance = debut ? Array.from({ length: nbMoisAvance }, (_, i) => {
    const d = new Date(Date.UTC(debut.getUTCFullYear(), debut.getUTCMonth() + i, 1));
    return `${MOIS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  }).join(" et ") : "";
  const fiscal = calculerDroitsEnregistrement(loyer, duree || 12, opts.pages);
  const neant = (v: unknown) => propre(v) || "Néant";

  const v: VariablesBail = {
    reference: bail.leaseReference,
    "bailleur.nom": nom(B), "bailleur.forme": neant(m.bailleur?.forme), "bailleur.piece": propre(m.bailleur?.piece) || pieceDe(B),
    "bailleur.domicile": propre(m.bailleur?.domicile), "bailleur.tel": propre(B.phone), "bailleur.bp": neant(m.bailleur?.bp),
    "bailleur.email": neant(B.email), "bailleur.compteContribuable": neant(m.bailleur?.compteContribuable),
    "preneur.nom": propre(bail.bdq?.nomLocataireDeclare) || nom(T), "preneur.forme": neant(m.preneur?.forme), "preneur.piece": propre(m.preneur?.piece) || pieceDe(T),
    "preneur.domicile": propre(m.preneur?.domicile), "preneur.profession": neant(m.preneur?.profession || T.profession), "preneur.tel": propre(T.phone),
    "preneur.bp": neant(m.preneur?.bp), "preneur.email": neant(T.email), "preneur.compteContribuable": neant(m.preneur?.compteContribuable),
    "preneur.qualite": propre(m.preneur?.qualite),
    "bien.designation": [typeBien, adresse].filter(Boolean).join(" — "),
    "locaux.adresse": adresse, "locaux.references": neant(m.locaux?.references), "locaux.consistance": propre(m.locaux?.consistance) || typeBien || "Néant",
    "locaux.superficie": neant(m.locaux?.superficie),
    activite: propre(m.activite),
    duree: duree > 0 ? `${numberToFrenchWords(duree)} (${duree}) mois` : "",
    "duree.determinee": !m.dureeIndeterminee,
    dateEffet: dateFr(debut), dateFin: dateFr(fin),
    "loyer.lettres": loyer > 0 ? numberToFrenchWords(loyer) : "", "loyer.chiffres": loyer > 0 ? milliers(loyer) : "",
    "loyer.periodicite": propre(m.periodicite) || "par mois",
    jourPaiement: bail.paymentDay ? `${bail.paymentDay}` : "5",
    modePaiement: propre(m.modePaiement) || "en espèce ou par chèque à l’ordre du BAILLEUR",
    revision: propre(m.revision), "revision.present": !!propre(m.revision),
    "depot.present": depot > 0, "depot.lettres": numberToFrenchWords(depot), "depot.chiffres": milliers(depot),
    "depot.mois": loyer > 0 && depot > 0 ? String(Math.round((depot / loyer) * 10) / 10).replace(".", ",") : "",
    "depot.delaiRestitution": "un (1) mois",
    "avance.present": avance > 0, "avance.lettres": numberToFrenchWords(avance), "avance.chiffres": milliers(avance), "avance.mois": moisAvance || "à venir",
    "fiscal.assiette": milliers(fiscal.baseCalcul), "fiscal.droits": milliers(fiscal.droitsEnregistrement),
    "fiscal.pages": libelleTimbre(opts.pages).split(" × ")[0], "fiscal.timbre": milliers(fraisTimbre(opts.pages)),
    "fiscal.total": milliers(fiscal.droitsEnregistrement + fraisTimbre(opts.pages)),
    chargesCopropriete: m.chargesCopropriete === "BAILLEUR" ? "BAILLEUR (PROPRIETAIRE)" : "PRENEUR (LOCATAIRE)",
    chargesCommunes: propre(m.chargesCommunes) || "le PRENEUR",
    fraisEnregistrement: propre(m.fraisEnregistrement) || "le PRENEUR",
    sousLocation: m.sousLocationAutorisee ? "autorisée" : "interdite",
    "entreprenant.regle": m.entreprenantDerogation ? "d’y déroger : le PRENEUR entreprenant bénéficie de ces deux droits" : "d’appliquer cette règle",
    lieuSignature: propre(m.lieuSignature) || propre(bien.city || bien.ville || bien.commune),
    exemplaires: `${numberToFrenchWords(m.exemplaires && m.exemplaires > 0 ? m.exemplaires : 2)} (${m.exemplaires && m.exemplaires > 0 ? m.exemplaires : 2})`,
    dateActe: dateFr(opts.dateActe || new Date()),
  };

  const exige: [string, string][] = [
    ["bailleur.nom", "nom du bailleur"], ["bailleur.piece", "numéro de pièce d’identité (ou RCCM) du bailleur"], ["bailleur.domicile", "domicile ou siège du bailleur"],
    ["bailleur.tel", "téléphone du bailleur"], ["preneur.nom", "nom du locataire"], ["preneur.piece", "numéro de pièce d’identité (ou RCCM) du locataire"],
    ["preneur.tel", "téléphone du locataire"], ["loyer.chiffres", "montant du loyer"], ["dateEffet", "date d’effet du bail"], ["lieuSignature", "lieu de signature"],
  ];
  if (modele.code === "HABITATION") exige.push(["bien.designation", "type et adresse du logement"], ["duree", "durée du bail"]);
  else {
    exige.push(["locaux.adresse", "adresse des locaux"], ["activite", "activité exercée dans les locaux"], ["preneur.qualite", "qualité du preneur (commerçant, artisan, société…)"], ["preneur.domicile", "domicile ou siège du preneur"]);
    if (!m.dureeIndeterminee) exige.push(["duree", "durée du bail"]);
  }
  const manquants = exige.filter(([k]) => !propre(v[k])).map(([, l]) => l);
  return { modele, variables: v, manquants };
}
