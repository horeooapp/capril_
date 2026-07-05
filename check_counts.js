const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.count();
  const properties = await prisma.property.count();
  console.log(`Users: ${users}, Properties: ${properties}`);
}

main().finally(() => prisma.$disconnect());
