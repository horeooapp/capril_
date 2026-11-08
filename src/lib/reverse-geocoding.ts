/**
 * QAPRIL — Infrastructure numérique de confiance (Côte d'Ivoire)
 * Module de Reverse Geocoding Souverain : Coordonnées GPS -> Ville, Commune, Quartier
 * Référentiel national ivoirien avec fallback résilient haute disponibilité.
 */

export interface ReverseGeocodingResult {
    ville: string;            // Ex: "Abidjan", "Yamoussoukro", "Bouaké"
    commune: string;          // Ex: "Cocody", "Marcory", "Yopougon"
    quartier: string;         // Ex: "Angré", "Deux Plateaux", "Zone 4", "Niangon"
    adresseComplete: string;  // Ex: "Angré 8ème Tranche, Cocody, Abidjan"
    precisionEstimee: string;
    source: 'OSM_NOMINATIM' | 'REFERENTIEL_LOCAL';
}

interface LocalCommuneRef {
    commune: string;
    ville: string;
    lat: number;
    lng: number;
    rayonKm: number;
    quartiers: { nom: string; lat: number; lng: number }[];
}

// Référentiel des communes et quartiers majeurs de Côte d'Ivoire
const COMMUNES_CI_REF: LocalCommuneRef[] = [
    {
        commune: "Cocody",
        ville: "Abidjan",
        lat: 5.3599,
        lng: -3.9850,
        rayonKm: 7.5,
        quartiers: [
            { nom: "Angré 8ème Tranche", lat: 5.4050, lng: -3.9880 },
            { nom: "Angré Château", lat: 5.4180, lng: -3.9820 },
            { nom: "Angré Mahou", lat: 5.3950, lng: -3.9900 },
            { nom: "Deux-Plateaux Vallons", lat: 5.3620, lng: -3.9990 },
            { nom: "Deux-Plateaux Aghien", lat: 5.3780, lng: -3.9870 },
            { nom: "Riviera 2", lat: 5.3480, lng: -3.9780 },
            { nom: "Riviera 3", lat: 5.3520, lng: -3.9610 },
            { nom: "Riviera Golf", lat: 5.3350, lng: -3.9800 },
            { nom: "Riviera Palmeraie", lat: 5.3680, lng: -3.9450 },
            { nom: "Riviera Bonoumin", lat: 5.3660, lng: -3.9680 },
            { nom: "Riviera Faya", lat: 5.3640, lng: -3.9180 },
            { nom: "Danga", lat: 5.3390, lng: -3.9990 },
            { nom: "Abatta", lat: 5.3580, lng: -3.9020 },
            { nom: "M'Pouto", lat: 5.3350, lng: -3.9480 },
            { nom: "Attoban", lat: 5.3720, lng: -3.9620 },
        ]
    },
    {
        commune: "Marcory",
        ville: "Abidjan",
        lat: 5.3020,
        lng: -3.9830,
        rayonKm: 4.5,
        quartiers: [
            { nom: "Zone 4C", lat: 5.2890, lng: -3.9780 },
            { nom: "Biétry", lat: 5.2850, lng: -3.9900 },
            { nom: "Marcory Résidentiel", lat: 5.3050, lng: -3.9870 },
            { nom: "Remblais", lat: 5.3080, lng: -3.9750 },
            { nom: "Anoumabo", lat: 5.3080, lng: -3.9620 },
            { nom: "Champroux / Hibiscus", lat: 5.3040, lng: -3.9950 },
        ]
    },
    {
        commune: "Plateau",
        ville: "Abidjan",
        lat: 5.3240,
        lng: -4.0190,
        rayonKm: 3.0,
        quartiers: [
            { nom: "Centre des Affaires", lat: 5.3240, lng: -4.0190 },
            { nom: "Avenue Chardy", lat: 5.3210, lng: -4.0160 },
            { nom: "Boulevard de la République", lat: 5.3280, lng: -4.0220 },
            { nom: "Cité Administrative", lat: 5.3310, lng: -4.0180 },
        ]
    },
    {
        commune: "Treichville",
        ville: "Abidjan",
        lat: 5.3050,
        lng: -4.0080,
        rayonKm: 3.5,
        quartiers: [
            { nom: "Avenue 16", lat: 5.3080, lng: -4.0060 },
            { nom: "Arras", lat: 5.3010, lng: -4.0110 },
            { nom: "Bellegarde", lat: 5.3120, lng: -4.0040 },
            { nom: "Grand Marché", lat: 5.3060, lng: -4.0090 },
            { nom: "Zone Portuaire", lat: 5.2950, lng: -4.0180 },
        ]
    },
    {
        commune: "Yopougon",
        ville: "Abidjan",
        lat: 5.3450,
        lng: -4.0780,
        rayonKm: 8.0,
        quartiers: [
            { nom: "Niangon Lokoa", lat: 5.3390, lng: -4.1120 },
            { nom: "Niangon Sud", lat: 5.3250, lng: -4.1080 },
            { nom: "Maroc", lat: 5.3620, lng: -4.0880 },
            { nom: "Bel Air", lat: 5.3520, lng: -4.0720 },
            { nom: "Toits Rouges", lat: 5.3380, lng: -4.0880 },
            { nom: "Selmer", lat: 5.3420, lng: -4.0680 },
            { nom: "Siporex", lat: 5.3500, lng: -4.0580 },
            { nom: "Port-Bouët 2", lat: 5.3580, lng: -4.0620 },
            { nom: "Gesco", lat: 5.3850, lng: -4.1120 },
            { nom: "Kouté", lat: 5.3480, lng: -4.0920 },
            { nom: "Sideci", lat: 5.3540, lng: -4.0820 },
        ]
    },
    {
        commune: "Koumassi",
        ville: "Abidjan",
        lat: 5.3010,
        lng: -3.9510,
        rayonKm: 4.5,
        quartiers: [
            { nom: "Remblais", lat: 5.3050, lng: -3.9620 },
            { nom: "Prodomo", lat: 5.2980, lng: -3.9550 },
            { nom: "Campement", lat: 5.2890, lng: -3.9480 },
            { nom: "Divo", lat: 5.3090, lng: -3.9420 },
            { nom: "Sopim", lat: 5.3040, lng: -3.9520 },
            { nom: "Zone Industrielle Koumassi", lat: 5.2920, lng: -3.9650 },
        ]
    },
    {
        commune: "Port-Bouët",
        ville: "Abidjan",
        lat: 5.2580,
        lng: -3.9480,
        rayonKm: 7.0,
        quartiers: [
            { nom: "Vridi", lat: 5.2650, lng: -4.0050 },
            { nom: "Aéroport Félix Houphouët-Boigny", lat: 5.2580, lng: -3.9320 },
            { nom: "Gonzagueville", lat: 5.2480, lng: -3.8950 },
            { nom: "Derrière-Wharf", lat: 5.2490, lng: -3.9620 },
            { nom: "Jean Folly", lat: 5.2450, lng: -3.8750 },
            { nom: "Adjouffou", lat: 5.2520, lng: -3.9180 },
        ]
    },
    {
        commune: "Adjamé",
        ville: "Abidjan",
        lat: 5.3620,
        lng: -4.0260,
        rayonKm: 4.0,
        quartiers: [
            { nom: "220 Logements", lat: 5.3550, lng: -4.0190 },
            { nom: "Liberté", lat: 5.3620, lng: -4.0250 },
            { nom: "Bracodi", lat: 5.3680, lng: -4.0220 },
            { nom: "Williamsville", lat: 5.3780, lng: -4.0280 },
            { nom: "Mirador", lat: 5.3580, lng: -4.0320 },
            { nom: "Paillet", lat: 5.3750, lng: -4.0380 },
        ]
    },
    {
        commune: "Attécoubé",
        ville: "Abidjan",
        lat: 5.3420,
        lng: -4.0410,
        rayonKm: 4.0,
        quartiers: [
            { nom: "Locodjro", lat: 5.3280, lng: -4.0480 },
            { nom: "Abobo-Doumé", lat: 5.3220, lng: -4.0550 },
            { nom: "Agban", lat: 5.3520, lng: -4.0350 },
            { nom: "Santé", lat: 5.3410, lng: -4.0450 },
        ]
    },
    {
        commune: "Abobo",
        ville: "Abidjan",
        lat: 5.4180,
        lng: -4.0180,
        rayonKm: 7.5,
        quartiers: [
            { nom: "Samaké", lat: 5.4150, lng: -4.0180 },
            { nom: "Avocatier", lat: 5.4280, lng: -4.0120 },
            { nom: "Clouetcha", lat: 5.4050, lng: -4.0220 },
            { nom: "Abobo Baoulé", lat: 5.4220, lng: -3.9980 },
            { nom: "PK18", lat: 5.4450, lng: -4.0280 },
            { nom: "N'Dotré", lat: 5.4650, lng: -4.0380 },
            { nom: "Sagbé", lat: 5.4120, lng: -4.0320 },
            { nom: "Kennedy", lat: 5.4190, lng: -4.0250 },
            { nom: "Anador", lat: 5.4090, lng: -4.0150 },
        ]
    },
    {
        commune: "Bingerville",
        ville: "Abidjan",
        lat: 5.3580,
        lng: -3.8920,
        rayonKm: 6.0,
        quartiers: [
            { nom: "Feh Kessé", lat: 5.3620, lng: -3.9180 },
            { nom: "Blanchon", lat: 5.3540, lng: -3.8950 },
            { nom: "Jardin Botanique", lat: 5.3580, lng: -3.8880 },
            { nom: "Gbagba", lat: 5.3680, lng: -3.8820 },
            { nom: "Savane", lat: 5.3520, lng: -3.8750 },
        ]
    },
    {
        commune: "Songon",
        ville: "Abidjan",
        lat: 5.3210,
        lng: -4.2480,
        rayonKm: 9.0,
        quartiers: [
            { nom: "Songon Agban", lat: 5.3210, lng: -4.2480 },
            { nom: "Songon Kassemblé", lat: 5.3280, lng: -4.2250 },
            { nom: "Bimbresso", lat: 5.3450, lng: -4.1850 },
        ]
    },
    {
        commune: "Anyama",
        ville: "Abidjan",
        lat: 5.4950,
        lng: -4.0520,
        rayonKm: 7.0,
        quartiers: [
            { nom: "Stade Alassane Ouattara", lat: 5.4780, lng: -4.0720 },
            { nom: "Belle-Ville", lat: 5.4920, lng: -4.0480 },
            { nom: "Schneider", lat: 5.4980, lng: -4.0550 },
            { nom: "Zossonkoi", lat: 5.5050, lng: -4.0420 },
        ]
    },
    {
        commune: "Grand-Bassam",
        ville: "Grand-Bassam",
        lat: 5.2120,
        lng: -3.7380,
        rayonKm: 6.5,
        quartiers: [
            { nom: "Quartier France", lat: 5.1980, lng: -3.7350 },
            { nom: "Mockeyville", lat: 5.2150, lng: -3.7420 },
            { nom: "Rosiers", lat: 5.2180, lng: -3.7550 },
            { nom: "Impérial", lat: 5.2050, lng: -3.7250 },
        ]
    },
    {
        commune: "Yamoussoukro",
        ville: "Yamoussoukro",
        lat: 6.8210,
        lng: -5.2760,
        rayonKm: 9.0,
        quartiers: [
            { nom: "Habitat", lat: 6.8150, lng: -5.2680 },
            { nom: "Dioulakro", lat: 6.8220, lng: -5.2750 },
            { nom: "Morofé", lat: 6.8350, lng: -5.2580 },
            { nom: "Basilique", lat: 6.8110, lng: -5.2950 },
        ]
    },
    {
        commune: "Bouaké",
        ville: "Bouaké",
        lat: 7.6910,
        lng: -5.0310,
        rayonKm: 10.0,
        quartiers: [
            { nom: "Commerce", lat: 7.6890, lng: -5.0280 },
            { nom: "Air France", lat: 7.7020, lng: -5.0180 },
            { nom: "Nimbo", lat: 7.6820, lng: -5.0420 },
            { nom: "Koko", lat: 7.6950, lng: -5.0350 },
            { nom: "Kennedy", lat: 7.6780, lng: -5.0220 },
        ]
    },
    {
        commune: "San Pedro",
        ville: "San Pedro",
        lat: 4.7520,
        lng: -6.6420,
        rayonKm: 8.0,
        quartiers: [
            { nom: "Cité", lat: 4.7480, lng: -6.6450 },
            { nom: "Bardot", lat: 4.7580, lng: -6.6380 },
            { nom: "Séwéké", lat: 4.7620, lng: -6.6510 },
            { nom: "Balmer", lat: 4.7380, lng: -6.6280 },
        ]
    }
];

// Distance euclidienne approximative rapide
function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Rayon Terre en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Détermination par référentiel local haute précision (Garanti sans dépendance externe)
 */
export function reverseGeocodeLocal(lat: number, lng: number): ReverseGeocodingResult {
    // 1. Trouver la commune la plus proche
    let closestCommune: LocalCommuneRef | null = null;
    let minCommuneDist = Infinity;

    for (const c of COMMUNES_CI_REF) {
        const d = distanceKm(lat, lng, c.lat, c.lng);
        if (d < minCommuneDist) {
            minCommuneDist = d;
            closestCommune = c;
        }
    }

    const fallbackCommune = closestCommune || COMMUNES_CI_REF[0];

    // 2. Trouver le quartier le plus proche dans cette commune
    let closestQuartier = fallbackCommune.quartiers[0]?.nom || fallbackCommune.commune;
    let minQuartierDist = Infinity;

    for (const q of fallbackCommune.quartiers) {
        const d = distanceKm(lat, lng, q.lat, q.lng);
        if (d < minQuartierDist) {
            minQuartierDist = d;
            closestQuartier = q.nom;
        }
    }

    return {
        ville: fallbackCommune.ville,
        commune: fallbackCommune.commune,
        quartier: closestQuartier,
        adresseComplete: `${closestQuartier}, ${fallbackCommune.commune}, ${fallbackCommune.ville}`,
        precisionEstimee: minQuartierDist <= 1.5 ? "Haute précision de quartier" : "Zone communale",
        source: 'REFERENTIEL_LOCAL'
    };
}

/**
 * Normalise le nom de la commune pour correspondre exactement aux options officielles QAPRIL
 */
function normalizeCommuneName(raw: string): string | null {
    if (!raw) return null;
    const clean = raw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (clean.includes("cocody")) return "Cocody";
    if (clean.includes("marcory")) return "Marcory";
    if (clean.includes("plateau")) return "Plateau";
    if (clean.includes("treichville")) return "Treichville";
    if (clean.includes("yopougon")) return "Yopougon";
    if (clean.includes("abobo")) return "Abobo";
    if (clean.includes("koumassi")) return "Koumassi";
    if (clean.includes("adjame")) return "Adjamé";
    if (clean.includes("attecoube")) return "Attécoubé";
    if (clean.includes("port-bouet") || clean.includes("port bouet")) return "Port-Bouët";
    if (clean.includes("bingerville")) return "Bingerville";
    if (clean.includes("songon")) return "Songon";
    if (clean.includes("anyama")) return "Anyama";
    if (clean.includes("grand-bassam") || clean.includes("bassam")) return "Grand-Bassam";
    if (clean.includes("yamoussoukro")) return "Yamoussoukro";
    if (clean.includes("bouake")) return "Bouaké";
    if (clean.includes("san pedro")) return "San Pedro";
    return null;
}

/**
 * Effectue un reverse geocoding hybride :
 * 1. Tente l'API OpenStreetMap Nominatim avec timeout strict (2.5s)
 * 2. Bascule instantanément sur le référentiel géométrique local ivoirien en cas d'indisponibilité
 */
export async function reverseGeocodeCoordinates(lat: number, lng: number): Promise<ReverseGeocodingResult> {
    const localFallback = reverseGeocodeLocal(lat, lng);

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&addressdetails=1&zoom=18`;
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'QAPRIL-Cadastre-CI/1.0 (infrastructure@qapril.net)',
                'Accept-Language': 'fr-FR,fr;q=0.9',
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            return localFallback;
        }

        const data = await res.json();
        const addr = data.address || {};

        // Extraire la commune
        const rawCommune = addr.suburb || addr.municipality || addr.city_district || addr.district || addr.county || addr.town || "";
        const matchedCommune = normalizeCommuneName(rawCommune) || localFallback.commune;

        // Extraire la ville
        const rawCity = addr.city || addr.town || addr.state || "";
        const cleanCity = rawCity.toLowerCase().includes("abidjan") ? "Abidjan" : (matchedCommune === "Grand-Bassam" ? "Grand-Bassam" : (matchedCommune === "Yamoussoukro" ? "Yamoussoukro" : (matchedCommune === "Bouaké" ? "Bouaké" : (matchedCommune === "San Pedro" ? "San Pedro" : (rawCity || localFallback.ville)))));

        // Extraire le quartier ou repère
        const rawQuartier = addr.neighbourhood || addr.quarter || addr.residential || addr.suburb || addr.road || localFallback.quartier;

        const cleanQuartier = (rawQuartier && rawQuartier.toLowerCase() !== matchedCommune.toLowerCase())
            ? rawQuartier
            : localFallback.quartier;

        const adresseComplete = `${cleanQuartier}, ${matchedCommune}, ${cleanCity}`;

        return {
            ville: cleanCity,
            commune: matchedCommune,
            quartier: cleanQuartier,
            adresseComplete,
            precisionEstimee: "Haute précision (Cadastre & Satellite)",
            source: 'OSM_NOMINATIM'
        };
    } catch (_err) {
        // En cas de timeout ou erreur réseau, le référentiel local prend le relais avec 0 latence
        return localFallback;
    }
}
