const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const res = await prisma.lease.findUnique({
        where: { id: '60448d20-65eb-4b5a-914e-187ef2886639' },
        include: {
            property: true,
            landlord: { select: { firstName: true, lastName: true, phone: true, email: true, neighborhood: true, taxId: true, companyRegNumber: true, walletConfig: { select: { landlordCode: true } } } },
            tenant: { select: { id: true, firstName: true, lastName: true, phone: true, email: true, neighborhood: true, taxId: true, companyRegNumber: true, reliabilityScores: { take: 1, orderBy: { createdAt: 'desc' } } } },
            procedurePhases: true,
            repaymentPlans: {
                orderBy: { createdAt: 'desc' },
                take: 1
            },
            mediation: {
                include: { messages: true }
            },
            cdcDeposits: true,
            insurance: true,
            inspections: {
                orderBy: { date: 'desc' },
                include: { rooms: true }
            },
            reminders: {
                orderBy: { sentAt: 'desc' }
            }
        }
    });

    const { serializeLease } = require('./src/lib/serialize.ts'); // we probably can't require TS without ts-node
    console.log('Got lease:', res ? 'Yes' : 'No');
  } catch(e) {
    console.error('ERROR:', e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
