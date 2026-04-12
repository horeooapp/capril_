import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import DiasporaHubClient from "./diaspora-client"

export default async function DiasporaHubPage() {
    const session = await auth()
    
    let transactions: any[] = []
    
    if (session?.user?.id) {
        transactions = await prisma.walletTransaction.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 10
        })
    }

    return <DiasporaHubClient initialTransactions={transactions} />
}
