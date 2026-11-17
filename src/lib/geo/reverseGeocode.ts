import { prisma } from "@/lib/prisma";

export interface ReverseGeocodeResult {
  quartier: string | null;
  commune: string | null;
  ville: string | null;
  source: "google" | "osm" | "referentiel" | "cache";
  precision: "quartier" | "commune" | "ville";
}

// Communes officielles d'Abidjan et villes majeures de Côte d'Ivoire
export const COMMUNES_ABIDJAN_SET = new Set([
  "cocody",
  "marcory",
  "plateau",
  "treichville",
  "yopougon",
  "koumassi",
  "port-bouet",
  "port-bouët",
  "adjame",
  "adjamé",
  "attecoube",
  "attécoubé",
  "abobo",
  "bingerville",
  "songon",
  "anyama",
]);

// Dictionnaire de correspondances et normalisation des quartiers / communes
export const QUARTIERS_VARIANTS_MAP: Record<string, string> = {
  // Riviera
  "riviera 2": "Riviera 2",
  "riviera ii": "Riviera 2",
  "riviera 3": "Riviera 3",
  "riviera iii": "Riviera 3",
  "riviera 4": "Riviera 4",
  "riviera iv": "Riviera 4",
  "riviera golf": "Riviera Golf",
  "golf": "Riviera Golf",
  "riviera palmeraie": "Riviera Palmeraie",
  "palmeraie": "Riviera Palmeraie",
  "riviera bonoumin": "Riviera Bonoumin",
  "bonoumin": "Riviera Bonoumin",
  "riviera faya": "Riviera Faya",
  "faya": "Riviera Faya",
  "mpouto": "M'Pouto",
  "m'pouto": "M'Pouto",

  // Deux Plateaux
  "deux plateaux": "Deux-Plateaux",
  "deux-plateaux": "Deux-Plateaux",
  "ii plateaux": "Deux-Plateaux",
  "les deux plateaux": "Deux-Plateaux",
  "vallons": "Deux-Plateaux Vallons",
  "deux-plateaux vallons": "Deux-Plateaux Vallons",
  "aghien": "Deux-Plateaux Aghien",
  "deux-plateaux aghien": "Deux-Plateaux Aghien",

  // Angré
  "angre": "Angré",
  "angré": "Angré",
  "angre 8eme": "Angré 8ème Tranche",
  "angre 8e tranche": "Angré 8ème Tranche",
  "angré 8ème tranche": "Angré 8ème Tranche",
  "angre chateau": "Angré Château",
  "angré château": "Angré Château",
  "8eme tranche": "Angré 8ème Tranche",
  "8e tranche": "Angré 8ème Tranche",

  // Marcory
  "zone 4": "Zone 4",
  "zone 4c": "Zone 4",
  "zone iv": "Zone 4",
  "bietry": "Biétry",
  "biétry": "Biétry",
  "remblais": "Remblais",
  "anoumabo": "Anoumabo",

  // Yopougon
  "niangon": "Niangon",
  "niangon lokoa": "Niangon Lokoa",
  "niangon sud": "Niangon Sud",
  "toits rouges": "Toits Rouges",
  "maroc": "Maroc",
  "selmer": "Selmer",
  "siporex": "Siporex",
  "gesco": "Gesco",
  "koute": "Kouté",
  "kouté": "Kouté",
  "sicogi": "Sicogi",

  // Plateau
  "centre des affaires": "Centre des Affaires",
  "cite administrative": "Cité Administrative",
  "cité administrative": "Cité Administrative",

  // Adjamé
  "220 logements": "220 Logements",
  "williamsville": "Williamsville",
  "bracodi": "Bracodi",

  // Treichville
  "avenue 16": "Avenue 16",
  "arras": "Arras",
  "bellegarde": "Bellegarde",
};

/**
 * Normalise un nom de lieu (casse, accents de base, espaces)
 */
export function normaliserLieu(val: string | null | undefined): string | null {
  if (!val) return null;
  const cleaned = val.trim().replace(/\s+/g, " ");
  if (!cleaned) return null;

  const lower = cleaned.toLowerCase();
  if (QUARTIERS_VARIANTS_MAP[lower]) {
    return QUARTIERS_VARIANTS_MAP[lower];
  }

  // Capitalisation élégante si pas dans le dictionnaire
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * Détermine si une chaîne correspond à une commune officielle connue d'Abidjan
 */
export function estUneCommune(nom: string | null | undefined): boolean {
  if (!nom) return false;
  const key = nom.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return COMMUNES_ABIDJAN_SET.has(key);
}

// Throttle pour respecter strictement la limite OSM (1 requête / seconde max)
let dernierAppelOsm = 0;
async function attendreQuotaOsm(): Promise<void> {
  const maintenant = Date.now();
  const tempsEcoule = maintenant - dernierAppelOsm;
  if (tempsEcoule < 1050) {
    await new Promise((resolve) => setTimeout(resolve, 1050 - tempsEcoule));
  }
  dernierAppelOsm = Date.now();
}

/**
 * Mapping des composants d'adresse Google Geocoding
 */
export function extraireDonneesGoogle(results: any[]): {
  quartier: string | null;
  commune: string | null;
  ville: string | null;
} {
  if (!results || results.length === 0) {
    return { quartier: null, commune: null, ville: null };
  }

  let foundQuartier: string | null = null;
  let foundCommune: string | null = null;
  let foundVille: string | null = null;

  for (const res of results) {
    const components: any[] = res.address_components || [];

    for (const c of components) {
      const types: string[] = c.types || [];

      // 1. Quartier : neighborhood, sinon sublocality_level_2, sinon sublocality_level_1 (si pas une commune)
      if (!foundQuartier) {
        if (types.includes("neighborhood")) {
          foundQuartier = c.long_name;
        } else if (types.includes("sublocality_level_2")) {
          foundQuartier = c.long_name;
        } else if (types.includes("sublocality_level_1") && !estUneCommune(c.long_name)) {
          foundQuartier = c.long_name;
        }
      }

      // 2. Commune : sublocality_level_1 ou administrative_area_level_3
      if (!foundCommune) {
        if (types.includes("sublocality_level_1") && estUneCommune(c.long_name)) {
          foundCommune = c.long_name;
        } else if (types.includes("administrative_area_level_3")) {
          foundCommune = c.long_name;
        }
      }

      // 3. Ville : locality ou administrative_area_level_2
      if (!foundVille) {
        if (types.includes("locality")) {
          foundVille = c.long_name;
        } else if (types.includes("administrative_area_level_2")) {
          foundVille = c.long_name;
        }
      }
    }
  }

  // Si le quartier trouvé est en réalité le nom de la commune, ne pas le renvoyer comme quartier
  if (foundQuartier && estUneCommune(foundQuartier)) {
    if (!foundCommune) foundCommune = foundQuartier;
    foundQuartier = null;
  }

  return {
    quartier: normaliserLieu(foundQuartier),
    commune: normaliserLieu(foundCommune) || "Cocody",
    ville: normaliserLieu(foundVille) || "Abidjan",
  };
}

/**
 * Mapping des composants d'adresse OpenStreetMap Nominatim
 */
export function extraireDonneesOsm(data: any): {
  quartier: string | null;
  commune: string | null;
  ville: string | null;
} {
  if (!data || !data.address) {
    return { quartier: null, commune: null, ville: null };
  }

  const addr = data.address;

  // OSM : quartier = neighbourhood, sinon quarter, sinon suburb (si suburb n'est pas une commune)
  let rawQuartier: string | null =
    addr.neighbourhood || addr.quarter || addr.residential || addr.suburb || null;

  // OSM : commune = city_district ou suburb (si suburb est une commune)
  let rawCommune: string | null =
    addr.city_district || addr.county || (estUneCommune(addr.suburb) ? addr.suburb : null);

  // Si rawQuartier est une commune, transférer
  if (rawQuartier && estUneCommune(rawQuartier)) {
    if (!rawCommune) rawCommune = rawQuartier;
    rawQuartier = null;
  }

  // Ville : city, town ou state
  const rawVille: string | null = addr.city || addr.town || addr.state || "Abidjan";

  return {
    quartier: normaliserLieu(rawQuartier),
    commune: normaliserLieu(rawCommune) || "Cocody",
    ville: normaliserLieu(rawVille) || "Abidjan",
  };
}

/**
 * Service centralisé de Reverse Geocoding côté serveur
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ReverseGeocodeResult> {
  // 1. Arrondi à 4 décimales (~11 mètres de précision) pour optimisation du cache
  const latRounded = Math.round(lat * 10000) / 10000;
  const lngRounded = Math.round(lng * 10000) / 10000;
  const coordKey = `${latRounded.toFixed(4)},${lngRounded.toFixed(4)}`;

  // 2. Recherche en Cache (TTL 30 jours)
  try {
    const cached = await prisma.reverseGeocodeCache.findUnique({
      where: { coordKey },
    });

    if (cached && cached.expiresAt > new Date()) {
      return {
        quartier: cached.quartier,
        commune: cached.commune,
        ville: cached.ville,
        source: (cached.source as any) || "google",
        precision: (cached.precision as any) || (cached.quartier ? "quartier" : "commune"),
      };
    }
  } catch (cacheErr) {
    // Si la table de cache rencontre un problème ponctuel, continuer sans bloquer
    console.warn("[GEO CACHE WARN]", cacheErr);
  }

  const googleKey = process.env.GOOGLE_MAPS_SERVER_KEY;
  let result: ReverseGeocodeResult | null = null;

  // 3. Fournisseur Principal : Google Geocoding API (avec timeout strict 4s)
  if (googleKey) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=fr&region=ci&key=${googleKey}`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        if (data.status === "OK" && Array.isArray(data.results)) {
          const parsed = extraireDonneesGoogle(data.results);
          if (parsed.quartier) {
            result = {
              quartier: parsed.quartier,
              commune: parsed.commune,
              ville: parsed.ville,
              source: "google",
              precision: "quartier",
            };
          } else if (parsed.commune) {
            // Pas de quartier franc, mais commune trouvée
            result = {
              quartier: null,
              commune: parsed.commune,
              ville: parsed.ville,
              source: "google",
              precision: "commune",
            };
          }
        } else {
          console.warn("[GOOGLE GEO NOTICE] Status non-OK:", data.status, data.error_message);
        }
      }
    } catch (gErr: any) {
      console.warn("[GOOGLE GEO TIMEOUT/ERR]:", gErr?.message || gErr);
    }
  }

  // 4. Repli automatique : OpenStreetMap Nominatim (si Google n'a pas trouvé de quartier ou est indisponible)
  if (!result || !result.quartier) {
    try {
      await attendreQuotaOsm();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const osmUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&addressdetails=1&zoom=18`;
      const res = await fetch(osmUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "QAPRIL-Geocoding/1.0 (contact@qapril.net; https://qapril.net)",
          "Accept-Language": "fr",
        },
      });
      clearTimeout(timeout);

      if (res.ok) {
        const osmData = await res.json();
        const parsedOsm = extraireDonneesOsm(osmData);

        if (parsedOsm.quartier) {
          result = {
            quartier: parsedOsm.quartier,
            commune: parsedOsm.commune || result?.commune || "Cocody",
            ville: parsedOsm.ville || result?.ville || "Abidjan",
            source: "osm",
            precision: "quartier",
          };
        } else if (!result && parsedOsm.commune) {
          result = {
            quartier: null,
            commune: parsedOsm.commune,
            ville: parsedOsm.ville || "Abidjan",
            source: "osm",
            precision: "commune",
          };
        }
      }
    } catch (osmErr: any) {
      console.warn("[OSM GEO ERR]:", osmErr?.message || osmErr);
    }
  }

  // 5. Repli souverain final de sécurité si aucun fournisseur n'a répondu
  if (!result) {
    result = {
      quartier: null,
      commune: "Cocody",
      ville: "Abidjan",
      source: "referentiel",
      precision: "commune",
    };
  }

  // 6. Sauvegarde en Cache (TTL 30 jours)
  try {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await prisma.reverseGeocodeCache.upsert({
      where: { coordKey },
      update: {
        quartier: result.quartier,
        commune: result.commune,
        ville: result.ville,
        source: result.source,
        precision: result.precision,
        expiresAt,
      },
      create: {
        coordKey,
        latRounded,
        lngRounded,
        quartier: result.quartier,
        commune: result.commune,
        ville: result.ville,
        source: result.source,
        precision: result.precision,
        expiresAt,
      },
    });
  } catch (saveErr) {
    console.warn("[GEO CACHE SAVE NOTICE]:", saveErr);
  }

  return result;
}
