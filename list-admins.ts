import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true, email: true, fullName: true, role: true }
  })
  console.log("Current Admin Users:")
  console.log(JSON.stringify(admins, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
