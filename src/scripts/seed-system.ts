
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Démarrage de l\'initialisation du système QAPRIL...')

  // 1. Initialisation des Feature Flags
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

  console.log('--- Seeding des Feature Flags ---')
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
    console.log(`✅ Module ${feature.id} : OK`)
  }

  // 2. Initialisation des News par défaut
  console.log('\n--- Seeding des News ---')
  const defaultNews = [
    "Bienvenue sur QAPRIL, la plateforme de certification foncière et immobilière.",
    "Le marché immobilier à Abidjan affiche une croissance de +12% en 2026.",
    "Nouveau : Le Pack Diaspora est désormais disponible pour tous les propriétaires à l'étranger.",
    "Rappel : Pensez à certifier vos documents avant le prochain cycle de quittance."
  ]

  const count = await prisma.newsTicker.count()
  if (count === 0) {
    for (const content of defaultNews) {
      await prisma.newsTicker.create({
        data: { content, priority: 0, isActive: true }
      })
    }
    console.log('✅ News par défaut créées.')
  } else {
    console.log('⏩ News déjà présentes, saut de l\'étape.')
  }

  console.log('\n✨ Initialisation terminée avec succès !')
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
