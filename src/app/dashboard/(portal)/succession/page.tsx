import { getSuccessions } from "@/actions/succession-actions"
import SuccessionDashboardClient from "./succession-client"
import { prisma } from "@/lib/prisma"

export default async function SuccessionDashboardPage() {
    const successions = await getSuccessions()
    
    const activeLeasesRaw = await prisma.lease.findMany({
        where: { status: 'ACTIVE' },
        include: { tenant: true, property: true }
    });
    
    // Fix Next.js 15 Serialization error for Prisma objects
    const activeLeases = JSON.parse(JSON.stringify(activeLeasesRaw));

    return <SuccessionDashboardClient initialSuccessions={successions} activeLeases={activeLeases} />
}
