import { PrismaClient, Role, LeaseStatus } from '@prisma/client'
import * as bcrypt from 'bcrypt-ts'

const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Démarrage de la génération des comptes DEMO SHOWCASE...')

    const demoPassword = await bcrypt.hash('DemoQapril2026!', 10)

    // 1. PROPRIÉTAIRE DEMO
    const landlord = await prisma.user.upsert({
        where: { phone: '+225 0101010101' },
        update: {
            fullName: 'Yao Kouassi (PROPRIÉTAIRE DEMO)',
            email: 'bailleur.demo@qapril.ci',
            password: demoPassword,
            role: Role.LANDLORD,
            kycLevel: 4,
            kycStatus: 'verified'
        },
        create: {
            phone: '+225 0101010101',
            fullName: 'Yao Kouassi (PROPRIÉTAIRE DEMO)',
            email: 'bailleur.demo@qapril.ci',
            password: demoPassword,
            role: Role.LANDLORD,
            kycLevel: 4,
            kycStatus: 'verified'
        }
    })
    console.log('✅ Propriétaire Demo créé/mis à jour')

    // 2. LOCATAIRE DEMO
    const tenant = await prisma.user.upsert({
        where: { phone: '+225 0202020202' },
        update: {
            fullName: 'Awa Koné (LOCATAIRE DEMO)',
            email: 'locataire.demo@qapril.ci',
            password: demoPassword,
            role: Role.TENANT,
            kycLevel: 2,
            kycStatus: 'verified'
        },
        create: {
            phone: '+225 0202020202',
            fullName: 'Awa Koné (LOCATAIRE DEMO)',
            email: 'locataire.demo@qapril.ci',
            password: demoPassword,
            role: Role.TENANT,
            kycLevel: 2,
            kycStatus: 'verified'
        }
    })
    console.log('✅ Locataire Demo créé/mis à jour')

    // 3. AGENCE DEMO
    const agencyOwner = await prisma.user.upsert({
        where: { phone: '+225 0303030303' },
        update: {
            fullName: 'Bakary Traoré (AGENCE DEMO)',
            email: 'agence.demo@qapril.ci',
            password: demoPassword,
            role: Role.AGENCY,
            kycLevel: 4,
            kycStatus: 'verified',
            isCertified: true
        },
        create: {
            phone: '+225 0303030303',
            fullName: 'Bakary Traoré (AGENCE DEMO)',
            email: 'agence.demo@qapril.ci',
            password: demoPassword,
            role: Role.AGENCY,
            kycLevel: 4,
            kycStatus: 'verified',
            isCertified: true
        }
    })
    
    // Entité Légale pour l'agence
    const legalEntity = await prisma.legalEntity.upsert({
        where: { id: 'demo-agency-entity' },
        update: {},
        create: {
            id: 'demo-agency-entity',
            companyName: 'IVORY IMMO SERVICES (DEMO)',
            rccmNumber: 'CI-ABJ-03-2026-B12-00500',
            legalForm: 'SARL',
            status: 'verified',
            createdByUserId: agencyOwner.id
        }
    })

    // Lier l'utilisateur à l'entité
    await prisma.user.update({
        where: { id: agencyOwner.id },
        data: { legalEntityId: legalEntity.id }
    })
    console.log('✅ Agence Demo + Entité Légale créées/mises à jour')

    // 4. DONNÉES DE TEST (Propriété + Bail)
    const property = await prisma.property.upsert({
        where: { propertyCode: 'DEMO-PRO-001' },
        update: {},
        create: {
            propertyCode: 'DEMO-PRO-001',
            name: 'Villa Prestige Cocody (DEMO)',
            address: 'Riviera Bonoumin, Impasse des Lauriers',
            city: 'Abidjan',
            commune: 'Cocody',
            propertyType: 'villa',
            ownerUserId: landlord.id,
            status: 'active',
            declaredRentFcfa: 750000
        }
    })

    const lease = await prisma.lease.upsert({
        where: { leaseReference: 'BAIL-DEMO-2026-001' },
        update: {},
        create: {
            leaseReference: 'BAIL-DEMO-2026-001',
            propertyId: property.id,
            landlordId: landlord.id,
            tenantId: tenant.id,
            startDate: new Date('2026-01-01'),
            durationMonths: 12,
            rentAmount: 750000,
            status: LeaseStatus.ACTIVE,
            paymentDay: 5
        }
    })
    console.log('✅ Propriété & Bail Demo créés')

    console.log('\n--- 🎫 COMPTES DE TEST GÉNÉRÉS ---')
    console.log('Pass Commun: DemoQapril2026!')
    console.log('Bailleur:  +225 0101010101 / bailleur.demo@qapril.ci')
    console.log('Locataire: +225 0202020202 / locataire.demo@qapril.ci')
    console.log('Agence:    +225 0303030303 / agence.demo@qapril.ci')
    console.log('-----------------------------------\n')

    console.log('🎉 Seeding DEMO terminé avec succès.')
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
