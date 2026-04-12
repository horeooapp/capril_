import { getSyndicates } from "@/actions/syndic-actions"
import { prisma } from "@/lib/prisma"
import SyndicDashboardClient from "./syndic-client"

export default async function SyndicDashboardPage() {
    let syndicates = await getSyndicates()

    if (syndicates.length === 0) {
        await prisma.syndicate.createMany({
            data: [
                {
                    residenceName: "Résidence Les Perles, Cocody",
                    totalLots: 24,
                    treasuryBalance: 4550000,
                    agState: "Validée (Mars 2026)"
                },
                {
                    residenceName: "Tour Ivoire, Plateau",
                    totalLots: 12,
                    treasuryBalance: 12200000,
                    agState: "Prévue (Juillet 2026)"
                },
                {
                    residenceName: "Immeuble Saphir, Zone 4",
                    totalLots: 6,
                    treasuryBalance: -450000,
                    agState: "En Souffrance"
                }
            ]
        })
        syndicates = await getSyndicates()
    }

    return <SyndicDashboardClient initialSyndicates={syndicates} />
}
