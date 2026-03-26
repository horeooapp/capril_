import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt-ts'

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@qapril.ci'
    const password = 'admin1234'
    const hashedPassword = await bcrypt.hash(password, 10)

    console.log(`Checking user ${email}...`)
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: 'SUPER_ADMIN'
        },
        create: {
            email,
            password: hashedPassword,
            role: 'SUPER_ADMIN',
            fullName: 'Admin System',
            status: 'active'
        }
    })

    console.log(`User ${email} initialized with role ${user.role}`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
