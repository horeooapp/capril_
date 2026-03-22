import { PrismaClient } from "@prisma/client"

async function main() {
    const prisma = new PrismaClient()
    try {
        console.log("Testing getAllUsers logic...")
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                kycLevel: true,
                kycStatus: true,
                status: true,
                createdAt: true,
                phone: true
            }
        })
        console.log(`Successfully fetched ${users.length} users.`)
        if (users.length > 0) {
            console.log("First user role:", users[0].role)
        }
    } catch (error) {
        console.error("Migration/Query Error:", error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
