const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
     const lease = await prisma.lease.findFirst({
        where: { status: { not: 'PENDING' } },
        include: { landlord: true }
     });
     if (!lease) {
         console.log("No lease found");
         return;
     }

     const { createReceipt } = require('./src/actions/receipts.js') || {}; 
     // Wait, it's a TS file, I'll just import it using ts-node or run it in Next.js environment.
  } catch(e) {}
}
test();
