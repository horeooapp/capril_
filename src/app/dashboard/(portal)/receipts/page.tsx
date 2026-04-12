import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import ReceiptsDashboardClient from "./receipts-client"

export default async function ReceiptsDashboardPage() {
    const session = await auth()
    
    let receipts: any[] = []
    
    if (session?.user?.id) {
        // En vrai: fetch receipts where lease agent/landlord is session.user.id
        receipts = await prisma.receipt.findMany({
            take: 20,
            orderBy: { createdAt: 'desc' }
        })
    }

    return <ReceiptsDashboardClient initialReceipts={receipts} />
}
