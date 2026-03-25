const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const admins = await prisma.user.findMany({
    where: {
      role: { in: ['ADMIN', 'SUPER_ADMIN'] }
    },
    select: {
      email: true,
      fullName: true,
      role: true
    }
  })
  console.log(JSON.stringify(admins, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
