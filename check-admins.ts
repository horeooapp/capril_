import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Fetching all users...')
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            role: true,
            fullName: true
        }
    })

    console.log('List of users:')
    console.log(users)

    const admins = users.filter(u => u.role === 'ADMIN')
    if (admins.length > 0) {
        console.log('\nFound ADMIN users:')
        console.log(admins)
    } else {
        console.log('\nNO ADMIN USERS FOUND IN DATABASE.')
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
