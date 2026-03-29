
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log("Checking User fields...")
    const userCount = await prisma.user.count()
    console.log(`User count: ${userCount}`)
    
    console.log("Checking FeatureFlag...")
    const featureCount = await (prisma as any).featureFlag.count()
    console.log(`FeatureFlag count: ${featureCount}`)

    console.log("Checking NewsTicker...")
    const newsCount = await prisma.newsTicker.count()
    console.log(`NewsTicker count: ${newsCount}`)

  } catch (error: any) {
    console.error("Check failed:")
    console.error(error.message || error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
