import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import PropertiesDashboardClient from "./properties-client"

export default async function PropertiesDashboardPage() {
    const session = await auth()
    
    let properties: any[] = []
    
    if (session?.user?.id) {
        // Dans le monde réel, on fetch les managed properties ou owned properties
        properties = await prisma.property.findMany({
            where: {
                OR: [
                    { ownerUserId: session.user.id },
                    { managedByUserId: session.user.id }
                ]
            },
            take: 10,
            orderBy: { createdAt: 'desc' }
        })
    }

    return <PropertiesDashboardClient initialProperties={properties} />
}
