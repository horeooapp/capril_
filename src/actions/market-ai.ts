"use server"

import { prisma } from "@/lib/prisma"

export async function getMarketAIInsights() {
    try {
        // 1. Fetch latest observatory data
        const snapshots = await prisma.observatorySnapshot.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        // 2. Base insights (Fallback if DB is empty)
        const baseInsights = [
            "Côte d'Ivoire : Le secteur immobilier affiche une croissance de 5,8% au 1er trimestre.",
            "Abidjan : Forte demande sur les petits appartements à Cocody Angré et Riviera.",
            "Taux d'occupation moyen à 94% sur l'ensemble du parc QAPRIL.",
            "Yopougon : L'extension du 4ème pont stimule la valeur foncière des quartiers environnants.",
            "QAPRIL : Plus de 2 500 baux sécurisés via la certification ICL."
        ];

        // 3. Transform DB snapshots into insights
        const dbInsights = snapshots.map(s => {
            const trendIcon = Number(s.trendPct) > 0 ? "↗️" : "↘️";
            return `${s.commune} (${s.propertyType}) : Loyer moyen ${s.avgRent.toLocaleString()} FCFA ${trendIcon} ${Math.abs(Number(s.trendPct))}%`;
        });

        // 4. Combine and randomize/shuffle
        const allInsights = [...dbInsights, ...baseInsights];
        
        // Return 8 unique insights for the ticker
        return allInsights
            .sort(() => Math.random() - 0.5)
            .slice(0, 8)
            .map((content, index) => ({
                id: `ai-market-${index}`,
                content
            }));

    } catch (error) {
        console.error("Error generating market AI insights:", error);
        return [
            { id: 'fallback-1', content: "Mise à jour QAPRIL : Stabilité du marché locatif à Abidjan." },
            { id: 'fallback-2', content: "Programme Horeoo : Extension de la garantie loyers impayés." }
        ];
    }
}
