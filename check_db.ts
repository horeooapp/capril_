
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log("Checking User fields...")
    const user = await prisma.user.findFirst()
    if (user) {
        console.log("User found. Keys:", Object.keys(user))
    } else {
        console.log("No user found in database.")
    }
    
    console.log("Checking Lease fields...")
    const lease = await prisma.lease.findFirst()
    if (lease) {
        console.log("Lease found. Keys:", Object.keys(lease))
    } else {
        console.log("No lease found in database.")
    }

  } catch (error: any) {
    console.error("Check failed:")
    console.error(error.message || error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
