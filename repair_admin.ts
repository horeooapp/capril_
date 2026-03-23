import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt-ts'

const prisma = new PrismaClient()

async function main() {
    console.log('--- QAPRIL Admin Recovery Script ---')
    
    const email = 'admin@qapril.net'
    const password = 'Qapril@securty2026'
    const role = 'SUPER_ADMIN'
    const phone = '+22500000000' // Placeholder unique phone

    console.log(`Ciblage de l'utilisateur : ${email}`)
    
    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        const user = await prisma.user.upsert({
            where: { email: email },
            update: {
                password: hashedPassword,
                role: role as any,
                status: 'active'
            },
            create: {
                email: email,
                password: hashedPassword,
                role: role as any,
                phone: phone,
                fullName: 'Super Administrateur QAPRIL',
                status: 'active',
                onboardingComplete: true
            }
        })

        console.log('✅ Succès !')
        console.log(`L'utilisateur ${user.email} a été créé ou mis à jour avec le rôle ${user.role}.`)
        console.log(`Vous pouvez maintenant vous connecter sur https://www.qapril.ci/admin/login`)
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour :', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
