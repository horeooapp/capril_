// ══════════════════════════════════════════════════════════════════════════════
// QAPRIL — Moteur Hybride de Recherche IA & Règles
// Référence : SPEC/026-C/2026 (ADD-26 §1 — RG-IA-01, RG-IA-03)
// ══════════════════════════════════════════════════════════════════════════════

import { 
  normaliserTexte, 
  resoudreLocalisation, 
  LEXIQUE_TYPES_BIENS, 
  LEXIQUE_EXPRESSIONS_NOUCHI 
} from "./lexique-abidjan";
import { prisma } from "@/lib/prisma";

export interface CriteresRecherche {
  type_bien?: string;
  commune?: string;
  quartier?: string;
  loyer_max?: number;
  loyer_min?: number;
  nb_pieces?: number;
  proximite?: string[];
  tri?: "loyer_asc" | "loyer_desc" | "date_desc";
}

export interface ResultatRechercheIA {
  criteres_extraits: CriteresRecherche;
  besoin_precision: boolean;
  question?: string;
  resultats: Array<{
    annonce_id: string;
    titre: string;
    description: string;
    loyer: number;
    charges: number;
    commune: string;
    quartier?: string;
    type_bien: string;
    nb_pieces?: number | null;
    photos_urls: string[];
    tags: string[];
    publiee_at: Date | null;
  }>;
  total: number;
  moteur_utilise: "REGLES_LOCALES" | "LLM_ASSISTE" | "REPLI_DEGRADE";
}

/**
 * Extraction par règles et mots-clés (moteur local rapide et gratuit)
 */
export function extraireCriteresParRegles(texte: string): { criteres: CriteresRecherche; confiance: number } {
  const norm = normaliserTexte(texte);
  const criteres: CriteresRecherche = {};
  let scoreConfiance = 0;
  let matchesCount = 0;

  // 1. Localisation (Commune & Quartier)
  const loc = resoudreLocalisation(norm);
  if (loc.commune) {
    criteres.commune = loc.commune;
    scoreConfiance += 0.35;
    matchesCount++;
  }
  if (loc.quartier) {
    criteres.quartier = loc.quartier;
    scoreConfiance += 0.15;
    matchesCount++;
  }

  // 2. Type de bien
  for (const [typeStandard, aliasList] of Object.entries(LEXIQUE_TYPES_BIENS)) {
    for (const alias of aliasList) {
      const aliasNorm = normaliserTexte(alias);
      if (new RegExp(`\\b${aliasNorm}\\b`).test(norm)) {
        criteres.type_bien = typeStandard;
        scoreConfiance += 0.25;
        matchesCount++;
        break;
      }
    }
    if (criteres.type_bien) break;
  }

  // 3. Nombre de pièces
  const piecesMatch = norm.match(/\b(\d+)\s*(piece|pieces|pce|pces|chambres)\b/) || norm.match(/\bf(\d+)\b/);
  if (piecesMatch && piecesMatch[1]) {
    criteres.nb_pieces = parseInt(piecesMatch[1], 10);
    scoreConfiance += 0.15;
    matchesCount++;
  }

  // 4. Loyer maximum & minimum (ex: < 60000, max 150k, sous 80000, budget 100 000)
  const loyerMaxMatch = norm.match(/(?:<|moins de|max|sous|budget de|loyer max)\s*(\d+)\s*(k|000|mille|f|fcfa)?/);
  if (loyerMaxMatch && loyerMaxMatch[1]) {
    let val = parseInt(loyerMaxMatch[1], 10);
    if (loyerMaxMatch[2] === "k" || loyerMaxMatch[2] === "mille" || val < 1000) {
      val *= 1000;
    }
    criteres.loyer_max = val;
    scoreConfiance += 0.2;
    matchesCount++;
  }

  // Exact loyer mentionné (ex: 60k, 150000 fcfa) sans préfixe
  if (!criteres.loyer_max) {
    const exactPriceMatch = norm.match(/\b(\d{2,4})\s*(k|000|mille)\s*(f|fcfa)?\b/);
    if (exactPriceMatch && exactPriceMatch[1]) {
      let val = parseInt(exactPriceMatch[1], 10);
      if (exactPriceMatch[2] === "k" || exactPriceMatch[2] === "mille" || exactPriceMatch[2] === "000") {
        if (val < 1000) val *= 1000;
      }
      // On le considère comme un loyer max par défaut dans la recherche
      criteres.loyer_max = val;
      scoreConfiance += 0.15;
      matchesCount++;
    }
  }

  // 5. Expressions Nouchi & Proximité
  for (const [expr, config] of Object.entries(LEXIQUE_EXPRESSIONS_NOUCHI)) {
    const exprNorm = normaliserTexte(expr);
    if (norm.includes(exprNorm)) {
      if (config.loyer_max && !criteres.loyer_max) criteres.loyer_max = config.loyer_max;
      if (config.loyer_min && !criteres.loyer_min) criteres.loyer_min = config.loyer_min;
      if (config.tri) criteres.tri = config.tri as any;
      if (config.proximite) {
        criteres.proximite = Array.from(new Set([...(criteres.proximite || []), ...config.proximite]));
      }
      scoreConfiance += 0.15;
      matchesCount++;
    }
  }

  // Si au moins 1 critère trouvé, on majore la confiance
  const confianceFinale = Math.min(1.0, scoreConfiance + (matchesCount > 0 ? 0.1 : 0));
  return { criteres, confiance: confianceFinale };
}

/**
 * Fallback LLM si les règles locales ont une confiance insuffisante
 * Inclut une protection contre les timeouts (crucial pour le canal WhatsApp §1.4 & §5.3)
 */
export async function extraireCriteresParLLM(texte: string, criteresRegles: CriteresRecherche): Promise<CriteresRecherche> {
  const timeoutMs = 2000; // 2 secondes max pour éviter le timeout webhook WhatsApp

  const llmPromise = new Promise<CriteresRecherche>(async (resolve) => {
    try {
      // Simulation / Point d'accroche pour l'API LLM (Gemini 3.1 Pro / OpenAI)
      // En production, appel à l'API LLM avec un prompt structuré en JSON Mode
      if (process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY) {
        // Logique d'appel externe ici...
      }
      // Si pas de clé ou fallback rapide, on enrichit intelligemment ce qu'on a
      resolve({
        ...criteresRegles,
        tri: criteresRegles.tri || "loyer_asc"
      });
    } catch (e) {
      resolve(criteresRegles);
    }
  });

  const timeoutPromise = new Promise<CriteresRecherche>((resolve) => {
    setTimeout(() => resolve(criteresRegles), timeoutMs);
  });

  return Promise.race([llmPromise, timeoutPromise]);
}

/**
 * Exécute la recherche d'annonces en base de données à partir des critères extraits
 */
export async function executerRechercheHybride(
  texte: string, 
  canal: "WEB" | "APP" | "WHATSAPP" = "WEB"
): Promise<ResultatRechercheIA> {
  // Étape 1 : Extraction par règles
  const { criteres: criteresRegles, confiance } = extraireCriteresParRegles(texte);
  
  let criteres = criteresRegles;
  let moteur: "REGLES_LOCALES" | "LLM_ASSISTE" | "REPLI_DEGRADE" = "REGLES_LOCALES";

  // RG-IA-01 : Approche hybride. Si confiance < 0.6 ou requête complexe, bascule LLM
  if (confiance < 0.6 && texte.length > 15) {
    moteur = "LLM_ASSISTE";
    criteres = await extraireCriteresParLLM(texte, criteresRegles);
  }

  // Étape 2 : Construction de la requête Prisma (filtres)
  const whereClause: any = {
    statut: { in: ["ACTIVE", "PUBLIEE", "active"] },
    logement: {
      deletedAt: null
    }
  };

  if (criteres.commune) {
    whereClause.logement.commune = {
      equals: criteres.commune,
      mode: "insensitive"
    };
  }

  if (criteres.quartier) {
    whereClause.logement.address = {
      contains: criteres.quartier,
      mode: "insensitive"
    };
  }

  if (criteres.type_bien) {
    whereClause.logement.propertyType = {
      contains: criteres.type_bien,
      mode: "insensitive"
    };
  }

  if (criteres.nb_pieces) {
    whereClause.logement.rooms = criteres.nb_pieces;
  }

  if (criteres.loyer_max) {
    whereClause.loyerDemande = { lte: criteres.loyer_max };
  }
  if (criteres.loyer_min) {
    whereClause.loyerDemande = { ...whereClause.loyerDemande, gte: criteres.loyer_min };
  }

  // Étape 3 : Tri
  let orderByClause: any = { publieeAt: "desc" };
  if (criteres.tri === "loyer_asc") orderByClause = { loyerDemande: "asc" };
  else if (criteres.tri === "loyer_desc") orderByClause = { loyerDemande: "desc" };

  // Limite par canal : WhatsApp nécessite des payloads courts (5 max), Web/App jusqu'à 20
  const limit = canal === "WHATSAPP" ? 5 : 20;

  try {
    const annonces = await prisma.annonce.findMany({
      where: whereClause,
      include: {
        logement: true,
        agence: {
          select: { id: true, firstName: true, lastName: true, companyRegNumber: true }
        }
      },
      orderBy: orderByClause,
      take: limit
    });

    // Étape 4 : Évaluation du besoin de précision (RG-IA-03)
    let besoinPrecision = false;
    let question: string | undefined;

    // Exemple de règle de précision : grande commune sans quartier ni budget précis
    if (criteres.commune === "Yopougon" && !criteres.quartier && annonces.length >= 5) {
      besoinPrecision = true;
      question = "Yopougon est grand ! Quel quartier préférez-vous (ex: Niangon, Maroc, Port-Bouët 2, Selmer) ?";
    } else if (criteres.commune === "Cocody" && !criteres.quartier && annonces.length >= 5) {
      besoinPrecision = true;
      question = "Cocody comporte plusieurs zones ! Préférez-vous la Riviera, les 2 Plateaux ou Angré ?";
    } else if (annonces.length === 0 && criteres.loyer_max && criteres.loyer_max < 75000) {
      // Proposition d'élargissement si aucun résultat (RG-IA-03)
      const budgetElargi = Math.round(criteres.loyer_max * 1.25);
      question = `Aucun bien trouvé sous ${criteres.loyer_max.toLocaleString("fr-FR")} FCFA. Souhaitez-vous voir les offres jusqu'à ${budgetElargi.toLocaleString("fr-FR")} FCFA ?`;
      besoinPrecision = true;
    }

    // Mise en forme des résultats
    const resultatsFormates = annonces.map((a: any) => {
      const tags: string[] = [];
      const now = new Date().getTime();
      const pubTime = a.publieeAt ? new Date(a.publieeAt).getTime() : now;
      if (now - pubTime < 86400000 * 3) {
        tags.push("NOUVEAU");
      }
      if (a.agence?.companyRegNumber) {
        tags.push("AGENCE_AGREEE");
      }

      return {
        annonce_id: a.id,
        titre: a.titre,
        description: a.description,
        loyer: Number(a.loyerDemande),
        charges: Number(a.charges || 0),
        commune: a.logement?.commune || "Abidjan",
        quartier: a.logement?.address || undefined,
        type_bien: a.logement?.propertyType || "Logement",
        nb_pieces: a.logement?.rooms || null,
        photos_urls: a.photosUrls || [],
        tags,
        publiee_at: a.publieeAt || null
      };
    });

    return {
      criteres_extraits: criteres,
      besoin_precision: besoinPrecision,
      question,
      resultats: resultatsFormates,
      total: resultatsFormates.length,
      moteur_utilise: moteur
    };
  } catch (error) {
    console.error("[MOTEUR HYBRIDE ERROR]", error);
    // RG-IA-03 : Jamais d'échec brutal ni d'invention, repli dégradé
    return {
      criteres_extraits: criteres,
      besoin_precision: false,
      resultats: [],
      total: 0,
      moteur_utilise: "REPLI_DEGRADE"
    };
  }
}
