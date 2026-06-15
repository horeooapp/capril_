const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const user = await prisma.user.findFirst({
        where: { phone: { contains: '0505007188' } },
        include: { leasesAsTenant: true }
    });
    console.log("USER:", JSON.stringify(user, null, 2));
}
run().catch(console.error).finally(() => prisma.$disconnect());
