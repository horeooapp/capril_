import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { serializeObject } from "@/lib/serialize"
import ReceiptsDashboardClient from "./receipts-client"

export default async function ReceiptsDashboardPage() {
    const session = await auth()
    
    let receipts: any[] = []
    let activeLeases: any[] = []
    
    if (session?.user?.id) {
        const userId = session.user.id
        const userRole = session.user.role as string
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(userRole)

        // 1. Fetch user's receipts with full lease, property, and tenant relations
        const userReceipts = await prisma.receipt.findMany({
            where: isAdmin ? {} : {
                OR: [
                    { lease: { landlordId: userId } },
                    { lease: { agentId: userId } },
                    { lease: { tenantId: userId } },
                    { lease: { property: { ownerUserId: userId } } },
                    { lease: { property: { managedByUserId: userId } } }
                ]
            },
            include: {
                lease: {
                    include: {
                        property: {
                            select: { id: true, name: true, address: true, commune: true }
                        },
                        tenant: {
                            select: { id: true, firstName: true, lastName: true, phone: true, email: true }
                        },
                        landlord: {
                            select: { id: true, firstName: true, lastName: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 200
        })

        // 2. Fetch user's active leases for M+1 generation and manual receipt creation
        const leases = await prisma.lease.findMany({
            where: {
                ...(isAdmin ? {} : {
                    OR: [
                        { landlordId: userId },
                        { agentId: userId },
                        { property: { ownerUserId: userId } },
                        { property: { managedByUserId: userId } }
                    ]
                }),
                status: { in: ['ACTIVE', 'LOYER_IMPAYE', 'MISE_EN_DEMEURE', 'ACTIVE_DECLARATIF'] }
            },
            include: {
                property: {
                    select: { id: true, name: true, address: true, commune: true }
                },
                tenant: {
                    select: { id: true, firstName: true, lastName: true, phone: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        receipts = serializeObject(userReceipts)
        activeLeases = serializeObject(leases)
    }

    return (
        <ReceiptsDashboardClient 
            initialReceipts={receipts} 
            activeLeases={activeLeases} 
        />
    )
}
