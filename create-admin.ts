import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt-ts'

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@qapril.net'
    const password = 'adminPassword123!'

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
        where: { email }
    })

    if (existingAdmin) {
        console.log(`Admin ${email} already exists.`)
        return
    }

    console.log(`Creating admin user ${email}...`)

    const hashedPassword = await bcrypt.hash(password, 10)

    const admin = await prisma.user.create({
        data: {
            email,
            name: 'Admin QApril',
            password: hashedPassword,
            role: 'ADMIN',
            isCertified: true,
        }
    })

    console.log('✅ Admin user created successfully:', admin.email)
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
    console.log('You can now log in using these credentials.')
}

main()
    .catch(e => {
        console.error('❌ Error creating admin:', e)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
