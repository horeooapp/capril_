import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.count();
  const properties = await prisma.property.count();
  const leases = await prisma.lease.count();
  console.log(`USERS=${users};PROPERTIES=${properties};LEASES=${leases}`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
