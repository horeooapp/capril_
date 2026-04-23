import { auth } from "@/auth"
import ChampionClient from "./champion-client"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function ChampionPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/dashboard/login");
    }

    // Mock Champion data for the UI
    const mockChampionData = {
        isChampion: true,
        codeChampion: "QAPRIL-CHMP-042",
        totalInscriptions: 14,
        totalCommissionsFcfa: 75000,
        objectifMensuel: 30,
        recentProspects: [
            { id: "PRO-1", nom: "Koné Salif", type: "LOCATAIRE", date: "2026-04-20", statut: "CONVERTI", commission: 5000 },
            { id: "PRO-2", nom: "Bamba Immobilier", type: "PROPRIETAIRE", date: "2026-04-21", statut: "EN_ATTENTE", commission: 0 },
            { id: "PRO-3", nom: "Yao Marie", type: "LOCATAIRE", date: "2026-04-22", statut: "CONVERTI", commission: 5000 }
        ]
    };

    return <ChampionClient data={mockChampionData} />
}
