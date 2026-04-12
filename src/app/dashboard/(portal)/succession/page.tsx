import { getSuccessions } from "@/actions/succession-actions"
import SuccessionDashboardClient from "./succession-client"
import { prisma } from "@/lib/prisma"

export default async function SuccessionDashboardPage() {
    const successions = await getSuccessions()
    
    const activeLeases = await prisma.lease.findMany({
        where: { status: 'ACTIVE' },
        include: { tenant: true, property: true }
    });

    return <SuccessionDashboardClient initialSuccessions={successions} activeLeases={activeLeases} />
}
