import { PrismaClient, Role, LeaseStatus, PaymentMethod } from '@prisma/client'
import * as bcrypt from 'bcrypt-ts'

const prisma = new PrismaClient()

async function main() {
    console.log('Début du seeding de la base de données...')

    // 1. Créer un Utilisateur Bailleur (Landlord)
    const landlord = await prisma.user.upsert({
        where: { email: 'bailleur@qapril.ci' },
        update: {},
        create: {
            email: 'bailleur@qapril.ci',
            name: 'Koffi Amadou (Propriétaire)',
            role: Role.LANDLORD,
            phone: '+225 01 02 03 04 05'
        }
    })

    // 2. Créer un Utilisateur Locataire (Tenant)
    const tenant = await prisma.user.upsert({
        where: { email: 'locataire@qapril.ci' },
        update: {},
        create: {
            email: 'locataire@qapril.ci',
            name: 'Awa Sylla (Locataire)',
            role: Role.TENANT,
            phone: '+225 05 04 03 02 01'
        }
    })

    // 3. Créer un Utilisateur Administrateur (Admin)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@qapril.ci' },
        update: {},
        create: {
            email: 'admin@qapril.ci',
            name: 'Ministère de la Construction',
            role: Role.ADMIN,
            password: await bcrypt.hash('admin1234', 10)
        }
    })

    // 4. Créer une Propriété
    const property = await prisma.property.create({
        data: {
            name: 'Résidence Les Cocotiers - Appt A12',
            address: 'Angré 8ème Tranche',
            city: 'Abidjan',
            postalCode: 'BP 1234',
            ownerId: landlord.id,
            managerId: landlord.id // Auto-géré pour cet exemple
        }
    })

    // 5. Créer un Contrat de Location (Bail)
    const lease = await prisma.lease.create({
        data: {
            propertyId: property.id,
            tenantId: tenant.id,
            startDate: new Date('2023-01-01'),
            endDate: new Date('2024-12-31'),
            rentAmount: 150000,
            charges: 15000,
            status: LeaseStatus.ACTIVE
        }
    })

    // 6. Générer quelques quittances
    const receipt1 = await prisma.receipt.create({
        data: {
            receiptNumber: 'Q-202310-0001',
            leaseId: lease.id,
            periodStart: new Date('2023-10-01'),
            periodEnd: new Date('2023-10-31'),
            amountPaid: 165000,
            paymentMethod: PaymentMethod.MOBILE_MONEY,
            paymentDate: new Date('2023-10-05'),
            isSent: true,
            qrCodeHash: 'hash-test-qr-code-12345'
        }
    })

    const receipt2 = await prisma.receipt.create({
        data: {
            receiptNumber: 'Q-202311-0002',
            leaseId: lease.id,
            periodStart: new Date('2023-11-01'),
            periodEnd: new Date('2023-11-30'),
            amountPaid: 165000,
            paymentMethod: PaymentMethod.BANK_TRANSFER,
            paymentDate: new Date('2023-11-02'),
            isSent: true,
            qrCodeHash: 'hash-test-qr-code-67890'
        }
    })

    // 7. Configuration Wallet (ADD-07)
    const walletConfigs = [
        { cle: 'wallet_seuil_alerte_defaut', valeur: 500, description: 'Seuil par défaut pour alerte SMS/WA' },
        { cle: 'wallet_mois_couverture', valeur: 2, description: 'Nombre de mois de couverture suggérés' },
        { cle: 'wallet_rappel_defaut_jour', valeur: 25, description: 'Jour par défaut pour le rappel mensuel' },
        { cle: 'wallet_alerte_max_par_jour', valeur: 1, description: "Nombre max d'alertes automatiques par jour" },
        { cle: 'wallet_deeplink_wave_base', valeur: 0, description: 'Base URL Deep Link Wave CI', metadata: 'https://wave.me/pay?amount={amt}&ref={ref}' },
        { cle: 'wallet_deeplink_om_base', valeur: 0, description: 'Base URL Deep Link Orange Money', metadata: 'https://orange.ci/pay?m={amt}&r={ref}' },
        { cle: 'wallet_deeplink_mtn_base', valeur: 0, description: 'Base URL Deep Link MTN CI', metadata: 'https://mymtn.ci/pay?a={amt}&id={ref}' },
        { cle: 'wallet_deeplink_fallback', valeur: 0, description: 'URL de repli rechargement', metadata: 'https://qapril.ci/recharge?amount={amt}&op={op}&ref={ref}' },
    ]

    for (const config of walletConfigs) {
        // Note: On utilise metadata pour stocker les strings si 'valeur' est un Decimal (nombre)
        // Mais dans la structure actuelle de ConfigTarif, 'valeur' est Decimal.
        // Si on veut stocker une URL, on peut soit détourner 'valeur' (mais c'est un nombre), 
        // soit utiliser un autre champ. 
        // Vérifions la structure de ConfigTarif.
        await prisma.configTarif.upsert({
            where: { cle: config.cle },
            update: {},
            create: {
                cle: config.cle,
                valeur: config.valeur,
                description: config.description
            }
        })
    }

    console.log('Seeding terminé avec succès !')
    console.log('--- Comptes de test créés ---')
    console.log('Bailleur: bailleur@qapril.ci')
    console.log('Locataire: locataire@qapril.ci')
    console.log('Admin: admin@qapril.ci')
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
