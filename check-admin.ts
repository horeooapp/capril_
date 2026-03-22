import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@qapril.net'
  const user = await ((prisma as any).user.findFirst({
    where: { email }
  }))

  if (user) {
    console.log('User found:')
    console.log('- ID:', user.id)
    console.log('- Email:', user.email)
    console.log('- Role:', user.role)
    console.log('- Has Password:', !!user.password)
    console.log('- Status:', (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') ? 'Admin Access OK' : 'No Admin Access')
  } else {
    console.log(`User with email ${email} not found.`)
    
    // List all admins
    const admins = await (prisma as any).user.findMany({
      where: {
        role: { in: ['ADMIN', 'SUPER_ADMIN'] }
      },
      select: { email: true, role: true }
    })
    console.log('\nExisting Admins in Database:')
    admins.forEach((a: any) => console.log(`- ${a.email} (${a.role})`))
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
