// ══════════════════════════════════════════════════════════════════════════════
// QAPRIL — Lexique et Référentiel Toponymique d'Abidjan & Français Ivoirien
// Référence : SPEC/026-C/2026 (ADD-26 §1.2 — RG-IA-02)
// ══════════════════════════════════════════════════════════════════════════════

export interface CommuneInfo {
  nom: string;
  aliases: string[];
  quartiers: string[];
}

export const REFERENTIEL_COMMUNES_ABIDJAN: Record<string, CommuneInfo> = {
  COCODY: {
    nom: "Cocody",
    aliases: ["cocody", "cody", "ccy"],
    quartiers: [
      "riviera", "riviera 2", "riviera 3", "riviera palmeraie", "riviera golf", "riviera bonoumin", "riviera faya", "riviera m'badon",
      "2 plateaux", "deux plateaux", "vallon", "angre", "angré", "djibi", "mahnu",
      "palmeraie", "danga", "ambassades", "blockhauss", "saint jean", "lycee technique", "corniche"
    ]
  },
  YOPOUGON: {
    nom: "Yopougon",
    aliases: ["yopougon", "yop", "yop city", "yop la joie", "poy"],
    quartiers: [
      "niangon", "maroc", "port-bouet 2", "port bouet 2", "selmer", "keneya", "toits rouges",
      "siporex", "wassakara", "gesco", "millionnaire", "andokoi", "kouté", "bel air", "académie", "banco"
    ]
  },
  KOUMASSI: {
    nom: "Koumassi",
    aliases: ["koumassi", "koum", "km"],
    quartiers: [
      "remblais", "sopim", "progres", "grand campement", "sicogi", "djo 6", "inch'allah", "bia-sud", "zone industrielle"
    ]
  },
  MARCORY: {
    nom: "Marcory",
    aliases: ["marcory", "marco"],
    quartiers: [
      "zone 4", "bietry", "biétry", "anoumabo", "remblais", "residentiel", "sicogi", "hibiscus", "sainte therese", "mille maquis"
    ]
  },
  ADJAME: {
    nom: "Adjamé",
    aliases: ["adjame", "adjamé", "adja"],
    quartiers: [
      "220 logements", "liberte", "liberté", "williamsville", "bracodi", "mirador", "st michel", "ebie", "fraternite"
    ]
  },
  ABOBO: {
    nom: "Abobo",
    aliases: ["abobo", "abo", "bobo"],
    quartiers: [
      "pk18", "dokui", "banco", "sogefia", "anador", "avocatier", "sagbe", "kennedy", "baoule", "plaque", "gare", "senateur"
    ]
  },
  TREICHVILLE: {
    nom: "Treichville",
    aliases: ["treichville", "treich", "treich city"],
    quartiers: [
      "biafra", "arrah 11", "avenue 16", "avenue 21", "quartier france", "gare lagune", "appollonia", "habiba"
    ]
  },
  PORT_BOUET: {
    nom: "Port-Bouët",
    aliases: ["port-bouet", "port bouet", "pb", "aeroport"],
    quartiers: [
      "gonzagueville", "gonzague", "vridi", "adjouffou", "jean folly", "phare", "anani", "syndicat", "derriere rail"
    ]
  },
  BINGERVILLE: {
    nom: "Bingerville",
    aliases: ["bingerville", "binger"],
    quartiers: [
      "feh kesse", "eloka", "akandje", "sechbi", "gbagba", "marché", "carrefour chu", "adjamé bingerville"
    ]
  },
  PLATEAU: {
    nom: "Le Plateau",
    aliases: ["plateau", "le plateau", "centre ville"],
    quartiers: [
      "cité administrative", "commerce", "pyramide", "postel 2001", "sorbonne", "avenue chardy"
    ]
  },
  ATTECOUBE: {
    nom: "Attécoubé",
    aliases: ["attecoube", "attécoubé"],
    quartiers: [
      "locodjro", "sebroko", "jeremie", "agban", "santai", "abobodoume"
    ]
  },
  ANYAMA: {
    nom: "Anyama",
    aliases: ["anyama"],
    quartiers: [
      "christianoi", "ran", "michel", "zomayi", "cité verte", "palmeraie anyama"
    ]
  }
};

export const LEXIQUE_TYPES_BIENS: Record<string, string[]> = {
  "studio": ["studio", "stud", "chambre salon", "piaule", "entrer coucher", "pièce autonome", "1 pièce"],
  "appartement": ["appartement", "appart", "2 pièces", "3 pièces", "4 pièces", "5 pièces", "deux pièces", "trois pièces", "quatre pièces", "f2", "f3", "f4"],
  "chambre": ["chambre", "chambre simple", "chambre individuelle", "piaule simple", "entrer coucher simple"],
  "villa": ["villa", "maison", "duplex", "triplex", "villa basse", "villa duplex", "cour commune", "maison individuelle"],
  "bureau": ["bureau", "plateau bureau", "open space", "espace travail"],
  "commercial": ["magasin", "boutique", "local commercial", "entrepôt", "dépôt", "espace commercial", "kiosque", "échoppe"],
  "terrain": ["terrain", "parcelle", "lot", "ilot", "hectare", "terrain nu"]
};

export const LEXIQUE_EXPRESSIONS_NOUCHI: Record<string, { loyer_max?: number; loyer_min?: number; tri?: string; proximite?: string[] }> = {
  "pas cher": { tri: "loyer_asc" },
  "moins cher": { tri: "loyer_asc" },
  "barat": { tri: "loyer_asc" },
  "molo molo": { tri: "loyer_asc" },
  "prix cadeau": { tri: "loyer_asc" },
  "social": { loyer_max: 75000, tri: "loyer_asc" },
  "haut standing": { loyer_min: 250000, tri: "loyer_desc" },
  "luxe": { loyer_min: 500000, tri: "loyer_desc" },
  "vip": { loyer_min: 300000, tri: "loyer_desc" },
  "goudron": { proximite: ["route principale", "goudron", "accès facile"] },
  "bord de route": { proximite: ["route principale", "goudron", "arrêt bus"] },
  "pres de la route": { proximite: ["route principale", "goudron"] },
  "pres d'une ecole": { proximite: ["école", "groupe scolaire", "lycée", "collège", "université"] },
  "pres ecole": { proximite: ["école", "groupe scolaire", "lycée", "collège", "université"] },
  "carrefour": { proximite: ["carrefour"] },
  "marché": { proximite: ["marché", "marche"] },
  "sotra": { proximite: ["arrêt bus", "sotra", "gare"] }
};

/**
 * Normalise une chaîne textuelle (minuscules, sans accents, nettoyage espaces)
 */
export function normaliserTexte(texte: string): string {
  return texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, " ")
    .replace(/[^a-z0-9\s<>=-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Résout une commune ou un quartier depuis un texte libre
 */
export function resoudreLocalisation(texteNormalise: string): { commune?: string; quartier?: string } {
  let communeTrouvee: string | undefined;
  let quartierTrouve: string | undefined;

  for (const [key, info] of Object.entries(REFERENTIEL_COMMUNES_ABIDJAN)) {
    // Vérification des alias de commune
    for (const alias of info.aliases) {
      const aliasNorm = normaliserTexte(alias);
      if (new RegExp(`\\b${aliasNorm}\\b`).test(texteNormalise)) {
        communeTrouvee = info.nom;
        break;
      }
    }

    // Vérification des quartiers
    for (const quartier of info.quartiers) {
      const quartierNorm = normaliserTexte(quartier);
      if (new RegExp(`\\b${quartierNorm}\\b`).test(texteNormalise)) {
        communeTrouvee = info.nom;
        quartierTrouve = quartier;
        break;
      }
    }

    if (communeTrouvee && quartierTrouve) break;
  }

  return { commune: communeTrouvee, quartier: quartierTrouve };
}
