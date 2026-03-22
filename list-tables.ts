import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const tables = await prisma.$queryRawUnsafe("SELECT name FROM sqlite_master WHERE type='table';")
    console.log('Tables in database:')
    console.log(tables)
  } catch (error) {
    console.error('Error listing tables:', error)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
