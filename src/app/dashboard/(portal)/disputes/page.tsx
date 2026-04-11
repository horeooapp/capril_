import { getAgencyDisputes } from "@/actions/disputes-actions"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import CertifieDisputesClient from "./disputes-client"

export default async function DisputesPage() {
    const session = await auth()
    
    const disputes = await getAgencyDisputes()
    
    let activeLeases: any[] = []
    if (session?.user?.id) {
        activeLeases = await prisma.lease.findMany({
            where: {
                OR: [
                    { landlordId: session.user.id },
                    { agentId: session.user.id }
                ],
                status: { in: ['ACTIVE', 'MISE_EN_DEMEURE', 'LOYER_IMPAYE'] }
            },
            include: { tenant: true, property: true }
        })
    }

    return <CertifieDisputesClient initialDisputes={disputes} activeLeases={activeLeases} />
}
