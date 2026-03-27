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

    // 4. Initialisation des Feature Flags
    const defaultFeatures = [
        { id: "M01-M03", name: "Vérification KYC", description: "Gestion des documents d'identité et niveaux de certification" },
        { id: "M04", name: "Gestion des Baux", description: "Émission et suivi des contrats de location certifiés" },
        { id: "M05", name: "Mandats de Gestion", description: "Gestion des délégations entre propriétaires et agences" },
        { id: "M06-M09", name: "Maintenance & Incidents", description: "Suivi des interventions techniques et signalements locataires" },
        { id: "M10-M11", name: "Médiation & Contentieux", description: "Centre de résolution amiable et procédures CACI" },
        { id: "M16", name: "Fiscalité Immobilière", description: "Calcul automatique des taxes et aide à la déclaration" },
        { id: "M-PGW", name: "Passerelle de Paiement", description: "Intégration Mobile Money (Orange, Wave, MTN) et SEPA" },
        { id: "DIASPORA_PACKAGE", name: "Pack Diaspora", description: "Fonctionnalités premium pour les propriétaires résidant à l'étranger" },
        { id: "M-EDL", name: "États des Lieux", description: "EDL numériques avec photos et signature certifiée" },
        { id: "M-SIGN", name: "Signature Électronique", description: "Service de signature légale pour tous les documents" },
        { id: "NEWS_TICKER", name: "News Ticker", description: "Informations défilantes sur la page d'accueil" },
        { id: "SMS_NOTIFICATIONS", name: "Notifications SMS", description: "Alertes automatiques par SMS et WhatsApp" }
    ]

    for (const feature of defaultFeatures) {
        await (prisma as any).featureFlag.upsert({
            where: { id: feature.id },
            update: { name: feature.name, description: feature.description },
            create: { 
                id: feature.id, 
                name: feature.name, 
                description: feature.description,
                enabled: true 
            }
        })
    }

    // 5. Initialisation des News par défaut
    const defaultNews = [
        "Bienvenue sur QAPRIL, la plateforme de certification foncière et immobilière.",
        "Le marché immobilier à Abidjan affiche une croissance de +12% en 2026.",
        "Nouveau : Le Pack Diaspora est désormais disponible pour tous les propriétaires à l'étranger."
    ]

    const newsCount = await prisma.newsTicker.count()
    if (newsCount === 0) {
        for (const content of defaultNews) {
            await prisma.newsTicker.create({
                data: { content, priority: 0, isActive: true }
            })
        }
    }

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
