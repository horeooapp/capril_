const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log("Creation de l'index unique insensible a la casse (C-06A)...")
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_property_unit_unique_ci 
    ON properties (parent_property_id, LOWER(unit_label)) 
    WHERE parent_property_id IS NOT NULL AND unit_label IS NOT NULL;
  `)
  console.log("Index SQL C-06A cree avec succes.")
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
