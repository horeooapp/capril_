

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import ChampionDashboardClient from "./champion-client"

export default async function ChampionDashboardPage() {
    const session = await auth()
    if (!session?.user?.id) return null

    // Load or create champion profile
    let profile = await prisma.championProfile.findUnique({
        where: { userId: session.user.id },
        include: { prospects: true }
    })

    if (!profile) {
        profile = await prisma.championProfile.create({
            data: {
                userId: session.user.id,
                statut: "ACTIF",
                zonePrincipale: "Abidjan"
            },
            include: { prospects: true }
        })
    }

    const leaderboard = [
        { rank: 1, name: "Kobenan Valery", points: 245000 },
        { rank: 2, name: (session.user as any).firstName + ' ' + ((session.user as any).lastName || ''), points: Number(profile.totalCommissionsFcfa) }
    ]

    return <ChampionDashboardClient user={session.user} profile={profile} leaderboard={leaderboard} />
}
