const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const admin = await prisma.user.findFirst({
      where: { email: 'admin@qapril.ci' }
    });
    console.log('Admin User:', JSON.stringify(admin, null, 2));
    
    const allAdmins = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'SUPER_ADMIN'] }
      }
    });
    console.log('All Admins:', JSON.stringify(allAdmins.map(u => ({ email: u.email, role: u.role })), null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
