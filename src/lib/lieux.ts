/**
 * S-08 — Référentiel des lieux (config/lieux.json)
 * Ville → Commune → Quartiers, points d'intérêt, recherche par rayon.
 * Aucune saisie libre de commune ou de quartier n'est acceptée à la création d'un bien.
 */

import lieuxData from "../../config/lieux.json";

export type LatLng = [number, number];

export interface QuartierRef { nom: string; centre: LatLng; alias?: string[] }
export interface CommuneRef { nom: string; centre: LatLng; rayon_km: number; quartiers: QuartierRef[] }
export interface VilleRef { nom: string; communes: CommuneRef[] }
export interface PointInteretRef { nom: string; commune: string; centre: LatLng }

export const LIEUX = lieuxData as unknown as {
    version: string;
    villes: VilleRef[];
    points_interet: PointInteretRef[];
};

export const LIEUX_MESSAGES = {
    commune_requise: "Choisissez la commune dans la liste.",
    commune_inconnue: "Cette commune ne figure pas dans la liste QAPRIL. Choisissez-la dans la liste.",
    quartier_inconnu: "Ce quartier ne figure pas dans la liste de la commune. Choisissez-le dans la liste.",
};

/** Normalisation : minuscules, sans accents, sans ponctuation, espaces simples */
export function normaliserTexte(s: string | null | undefined): string {
    return String(s || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/['’`\-_.,/()]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

interface CommuneIndexEntry { ville: string; commune: CommuneRef }

const communeIndex = new Map<string, CommuneIndexEntry>();
for (const v of LIEUX.villes) {
    for (const c of v.communes) {
        communeIndex.set(normaliserTexte(c.nom), { ville: v.nom, commune: c });
    }
}

export function listerCommunes(): { ville: string; commune: string; quartiers: string[] }[] {
    return LIEUX.villes.flatMap((v) =>
        v.communes.map((c) => ({ ville: v.nom, commune: c.nom, quartiers: c.quartiers.map((q) => q.nom) }))
    );
}

/** Retrouve une commune officielle à partir d'une saisie (exacte, à la casse/aux accents près). */
export function trouverCommune(saisie: string | null | undefined): CommuneIndexEntry | null {
    const key = normaliserTexte(saisie);
    if (!key) return null;
    return communeIndex.get(key) || null;
}

/** Retrouve un quartier officiel d'une commune (nom ou alias, à la casse/aux accents près). */
export function trouverQuartier(commune: CommuneRef, saisie: string | null | undefined): QuartierRef | null {
    const key = normaliserTexte(saisie);
    if (!key) return null;
    for (const q of commune.quartiers) {
        if (normaliserTexte(q.nom) === key) return q;
        if ((q.alias || []).some((a) => normaliserTexte(a) === key)) return q;
    }
    return null;
}

/**
 * Recherche tolérante d'un quartier dans un texte libre (utilisée uniquement pour la migration
 * des anciennes saisies). Le nom ou alias le plus long trouvé dans le texte l'emporte.
 */
export function detecterQuartierDansTexte(commune: CommuneRef, texte: string | null | undefined): QuartierRef | null {
    const t = ` ${normaliserTexte(texte)} `;
    let best: { q: QuartierRef; len: number } | null = null;
    for (const q of commune.quartiers) {
        for (const nom of [q.nom, ...(q.alias || [])]) {
            const n = normaliserTexte(nom);
            if (n && t.includes(` ${n} `) && (!best || n.length > best.len)) best = { q, len: n.length };
        }
    }
    return best?.q || null;
}

export interface ValidationLieu {
    ok: boolean;
    status: 200 | 422;
    error?: string;
    code?: "COMMUNE_REQUISE" | "COMMUNE_INCONNUE" | "QUARTIER_INCONNU";
    ville?: string;
    commune?: string;
    quartier?: string | null;
    centre?: LatLng;
}

/**
 * Valide un lieu saisi à la création d'un bien : la commune est obligatoire et doit appartenir
 * au référentiel ; le quartier, s'il est fourni, doit appartenir à la commune.
 */
export function validerLieu(communeSaisie: unknown, quartierSaisi?: unknown): ValidationLieu {
    const communeStr = typeof communeSaisie === "string" ? communeSaisie : "";
    if (!communeStr.trim()) {
        return { ok: false, status: 422, code: "COMMUNE_REQUISE", error: LIEUX_MESSAGES.commune_requise };
    }
    const entry = trouverCommune(communeStr);
    if (!entry) {
        return { ok: false, status: 422, code: "COMMUNE_INCONNUE", error: LIEUX_MESSAGES.commune_inconnue };
    }
    const quartierStr = typeof quartierSaisi === "string" ? quartierSaisi : "";
    if (quartierStr.trim()) {
        const q = trouverQuartier(entry.commune, quartierStr);
        if (!q) {
            return { ok: false, status: 422, code: "QUARTIER_INCONNU", error: LIEUX_MESSAGES.quartier_inconnu };
        }
        return { ok: true, status: 200, ville: entry.ville, commune: entry.commune.nom, quartier: q.nom, centre: q.centre };
    }
    return { ok: true, status: 200, ville: entry.ville, commune: entry.commune.nom, quartier: null, centre: entry.commune.centre };
}

export function distanceKm(a: LatLng, b: LatLng): number {
    const R = 6371;
    const dLat = ((b[0] - a[0]) * Math.PI) / 180;
    const dLon = ((b[1] - a[1]) * Math.PI) / 180;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function trouverPointInteret(saisie: string | null | undefined): PointInteretRef | null {
    const key = normaliserTexte(saisie);
    if (!key) return null;
    return LIEUX.points_interet.find((p) => normaliserTexte(p.nom) === key) || null;
}

/**
 * Position de référence d'un bien pour la recherche par rayon :
 * GPS réel si présent, sinon centre du quartier, sinon centre de la commune.
 */
export function positionReferenceBien(bien: { gpsLatitude?: number | null; gpsLongitude?: number | null; commune?: string | null; quartier?: string | null }): LatLng | null {
    if (typeof bien.gpsLatitude === "number" && typeof bien.gpsLongitude === "number") {
        return [bien.gpsLatitude, bien.gpsLongitude];
    }
    const entry = trouverCommune(bien.commune);
    if (!entry) return null;
    const q = bien.quartier ? trouverQuartier(entry.commune, bien.quartier) : null;
    return q ? q.centre : entry.commune.centre;
}

