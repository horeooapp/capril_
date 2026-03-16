import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const news = [
    { content: "QAPRIL News : Le marché immobilier en Côte d'Ivoire en forte progression en 2026.", priority: 10 },
    { content: "Digitalisation : Toutes les cautions immobilières doivent désormais être déposées à la CDC-CI via QAPRIL.", priority: 9 },
    { content: "Infrastructure : Extension du Registre Locatif National à de nouvelles communes d'Abidjan.", priority: 8 },
  ]

  console.log('Seeding news...')
  for (const item of news) {
    await prisma.newsTicker.create({
      data: item
    })
  }
  console.log('Done!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
