const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
     const r = await prisma.receipt.create({ 
         data: { 
             receiptRef: 'REC-TEST-999', 
             leaseId: 'some-fake-id', // this will foreign key error if checked
             periodMonth: '2026-03', 
             rentAmount: 100, 
             chargesAmount: 0, 
             totalAmount: 100, 
             paymentMethod: 'CASH', 
             paidAt: new Date(), 
             receiptHash: 'hash', 
             qrToken: 'token999', 
             status: 'PAID' 
         } 
     });
     console.log("SUCCESS:", r);
  } catch (e) {
     console.log("ERROR MESSAGE:", e.message);
     console.log("ERROR NAME:", e.name);
     console.log("ERROR CODE:", e.code);
  } finally {
     await prisma.$disconnect()
  }
}
test();
