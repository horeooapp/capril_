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
            firstName: 'Koffi',
            lastName: 'Amadou',
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
            firstName: 'Awa',
            lastName: 'Sylla',
            role: 'TENANT',
            phone: '+225 05 04 03 02 01'
        }
    })

    // 3. Créer un Utilisateur Administrateur (Admin)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@qapril.ci' },
        update: {
            role: 'ADMIN',
            password: await bcrypt.hash('admin', 10)
        },
        create: {
            email: 'admin@qapril.ci',
            firstName: 'Admin',
            lastName: 'Qapril',
            role: 'ADMIN',
            password: await bcrypt.hash('admin', 10)
        }
    })

    // 6. Créer une Propriété
    const property = await prisma.property.upsert({
        where: { propertyCode: 'PROP-001' },
        update: {},
        create: {
            propertyCode: 'PROP-001',
            name: 'Résidence Les Cocotiers - Appt A12',
            address: 'Angré 8ème Tranche',
            commune: 'Cocody',
            propertyType: 'apartment',
            ownerUserId: landlord.id,
            status: 'active'
        }
    })

    // 7. Créer un Contrat de Location (Bail)
    const existingLease = await prisma.lease.findFirst({
        where: { leaseReference: 'BAIL-2024-001' }
    })
    
    if (!existingLease) {
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

        // 8. Générer quelques quittances
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
    }

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
