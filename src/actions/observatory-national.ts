"use server"

import { prisma } from "@/lib/prisma"

// Mapping des villes aux régions (Simplifié pour QAPRIL Intelligence)
const REGION_MAPPING: Record<string, string> = {
    "Abidjan": "Lagunes (Abidjan)",
    "Cocody": "Lagunes (Abidjan)",
    "Marcory": "Lagunes (Abidjan)",
    "Plateau": "Lagunes (Abidjan)",
    "Yopougon": "Lagunes (Abidjan)",
    "Bingerville": "Lagunes (Abidjan)",
    "Grand-Bassam": "Sud-Comoé",
    "Yamoussoukro": "Lacs (Capitale)",
    "San Pedro": "Bas-Sassandra",
    "Bouaké": "Gbêkê",
    "Korhogo": "Poro",
    "Daloa": "Haut-Sassandra",
    "Man": "Tonkpi",
    "Abengourou": "Indénié-Djuablin"
}

export async function getNationalMarketComparison() {
    try {
        // 1. Récupérer tous les clichés de l'observatoire les plus récents
        const snapshots = await prisma.observatorySnapshot.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100 // On prend une large fenêtre pour l'agrégation
        });

        // 2. Agrégation par Ville
        const cityStats: Record<string, any> = {};
        
        snapshots.forEach(s => {
            if (!cityStats[s.commune]) {
                cityStats[s.commune] = {
                    name: s.commune,
                    avgRent: 0,
                    sampleCount: 0,
                    totalRent: 0,
                    trend: s.trendPct
                };
            }
            cityStats[s.commune].totalRent += s.avgRent * s.sampleCount;
            cityStats[s.commune].sampleCount += s.sampleCount;
            cityStats[s.commune].avgRent = Math.round(cityStats[s.commune].totalRent / cityStats[s.commune].sampleCount);
        });

        const cities = Object.values(cityStats).sort((a, b) => b.sampleCount - a.sampleCount);

        // 3. Agrégation par Région (basée sur le mapping)
        const regionStats: Record<string, any> = {};
        
        Object.values(cityStats).forEach(city => {
            const regionName = REGION_MAPPING[city.name] || "Autres Régions";
            if (!regionStats[regionName]) {
                regionStats[regionName] = {
                    name: regionName,
                    avgRent: 0,
                    sampleCount: 0,
                    totalRent: 0
                };
            }
            regionStats[regionName].totalRent += city.totalRent;
            regionStats[regionName].sampleCount += city.sampleCount;
            regionStats[regionName].avgRent = Math.round(regionStats[regionName].totalRent / regionStats[regionName].sampleCount);
        });

        const regions = Object.values(regionStats).sort((a, b) => b.sampleCount - a.sampleCount);

        // 4. Calcul de l'ILI National (Moyenne pondérée)
        const totalNationalRent = regions.reduce((acc, r) => acc + r.totalRent, 0);
        const totalNationalSamples = regions.reduce((acc, r) => acc + r.sampleCount, 0);
        const nationalAvg = totalNationalSamples > 0 ? Math.round(totalNationalRent / totalNationalSamples) : 0;

        return {
            success: true,
            data: {
                nationalAvg,
                cities: cities.slice(0, 8), // Top 8 villes/communes
                regions: regions,
                lastUpdated: new Date()
            }
        };

    } catch (error) {
        console.error("Erreur National Market Analysis:", error);
        return { success: false, error: "Impossible de récupérer les statistiques nationales" };
    }
}
