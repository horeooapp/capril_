const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt-ts');

const prisma = new PrismaClient();

async function resetPass() {
  const hash = await bcrypt.hash('admin123', 10);
  await prisma.user.update({
    where: { email: 'admin@qapril.ci' },
    data: { password: hash }
  });
  console.log("Admin password reset to 'admin123'");
}

resetPass().finally(() => prisma.$disconnect());
