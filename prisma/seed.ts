import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt-ts'

const prisma = new PrismaClient()

async function main() {
    console.log('Début du seeding de la base de données (Transformed Schema)...')

    // 1. Créer un Utilisateur Bailleur (Landlord)
    const landlord = await prisma.user.upsert({
        where: { email: 'bailleur@qapril.ci' },
        update: {},
        create: {
            email: 'bailleur@qapril.ci',
            fullName: 'Koffi Amadou (Propriétaire)',
            name: 'Koffi Amadou (Propriétaire)',
            role: 'LANDLORD',
            phone: '+225 01 02 03 04 05'
        }
    })

    // 2. Créer un Utilisateur Locataire (Tenant)
    const tenant = await prisma.user.upsert({
        where: { email: 'locataire@qapril.ci' },
        update: {},
        create: {
            email: 'locataire@qapril.ci',
            fullName: 'Awa Sylla (Locataire)',
            name: 'Awa Sylla (Locataire)',
            role: 'TENANT',
            phone: '+225 05 04 03 02 01'
        }
    })

    // 3. Créer un Utilisateur Administrateur (Admin)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@qapril.ci' },
        update: {
            role: 'ADMIN', // Force the role if it exists
        },
        create: {
            email: 'admin@qapril.ci',
            fullName: 'Ministère de la Construction',
            name: 'Ministère de la Construction',
            role: 'ADMIN',
            password: await bcrypt.hash('admin1234', 10)
        }
    })

    // 4. Créer une Propriété
    const property = await prisma.property.create({
        data: {
            propertyCode: 'PROP-001',
            name: 'Résidence Les Cocotiers - Appt A12',
            address: 'Angré 8ème Tranche',
            commune: 'Cocody',
            propertyType: 'apartment',
            ownerUserId: landlord.id,
            status: 'active'
        }
    })

    // 5. Créer un Contrat de Location (Bail)
    const lease = await prisma.lease.create({
        data: {
            leaseReference: 'BAIL-2024-001',
            propertyId: property.id,
            landlordId: landlord.id,
            tenantId: tenant.id,
            startDate: new Date('2024-01-01'),
            durationMonths: 12,
            rentAmount: 150000,
            chargesAmount: 15000,
            status: 'ACTIVE'
        }
    })

    // 6. Générer quelques quittances
    await prisma.receipt.create({
        data: {
            receiptRef: 'REC-2024-01-001',
            leaseId: lease.id,
            periodMonth: '2024-01',
            rentAmount: 150000,
            chargesAmount: 15000,
            totalAmount: 165000,
            paymentMethod: 'MOBILE_MONEY',
            status: 'paid',
            paidAt: new Date('2024-01-05')
        }
    })

    console.log('Seeding terminé avec succès !')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
