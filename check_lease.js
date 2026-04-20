const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const lease = await prisma.lease.findUnique({where: {id: '60448d20-65eb-4b5a-914e-187ef2886639'}});
  console.log("LEASE FOUND:", lease);
}
main().finally(() => prisma.$disconnect());
