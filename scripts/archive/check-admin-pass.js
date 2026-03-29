const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt-ts');

const prisma = new PrismaClient();

async function check() {
  const admin = await prisma.user.findFirst({ where: { email: 'admin@qapril.ci' } });
  if (!admin) {
    console.log("No admin found.");
    return;
  }
  console.log("Admin ID:", admin.id);
  console.log("Admin Password hash length:", admin.password ? admin.password.length : "NO PASSWORD");
  
  if (admin.password) {
    // try to compare a known test password like 'admin123'
    const match = await bcrypt.compare('admin123', admin.password);
    console.log("Is password admin123?", match);
    const match2 = await bcrypt.compare('password', admin.password);
    console.log("Is password password?", match2);
  }
}

check().finally(() => prisma.$disconnect());
