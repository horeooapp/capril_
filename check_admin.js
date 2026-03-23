const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    try {
        const users = await prisma.user.findMany({
            where: {
                role: { in: ['ADMIN', 'SUPER_ADMIN'] }
            },
            select: {
                email: true,
                role: true,
                fullName: true,
                password: true
            }
        })
        console.log('--- Current Admins in DB ---')
        users.forEach(u => {
            console.log(`Email: ${u.email}, Role: ${u.role}, HasPassword: ${!!u.password}`)
        })
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
