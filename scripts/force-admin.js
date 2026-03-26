const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt-ts');
const prisma = new PrismaClient();

async function forceAdmin() {
  const email = 'admin@qapril.ci';
  const password = 'admin1234';
  
  try {
    console.log(`[RECOVERY] Forcing admin status for: ${email}`);
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        role: 'ADMIN',
        password: hashedPassword,
        status: 'active'
      },
      create: {
        email,
        fullName: 'Admin de Secours',
        role: 'ADMIN',
        password: hashedPassword,
        status: 'active'
      }
    });

    console.log('✅ Admin user updated/created successfully:');
    console.log(JSON.stringify({ email: user.email, role: user.role, status: user.status }, null, 2));
  } catch (error) {
    console.error('❌ Error during recovery:', error);
  } finally {
    await prisma.$disconnect();
  }
}

forceAdmin();
