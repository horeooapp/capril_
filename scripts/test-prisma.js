const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function run() {
  try {
    console.log("Testing count query on FiscalDossier...");
    const declarationsEnAttente = await prisma.fiscalDossier.count({
        where: { statut: 'EN_ATTENTE_DECLARATION' },
    });
    console.log("OK! Result:", declarationsEnAttente);
  } catch (err) {
    console.error("PRISMA ERROR:", err);
  } finally {
    await prisma.$disconnect();
  }
}
run();
