const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
    const superAdminCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } })
    console.log('Admins:', adminCount)
    console.log('SuperAdmins:', superAdminCount)
    
    if (adminCount + superAdminCount > 0) {
      const admins = await prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
        select: { id: true, email: true, role: true, name: true }
      })
      console.log('Admin details:', JSON.stringify(admins, null, 2))
    } else {
      console.log('NO ADMINS FOUND IN DATABASE')
    }
  } catch (e) {
    console.error('Error:', e.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
