import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Exécution de ETAPE 11A : ALTER TABLE tickets_maintenance ADD COLUMN proprio_vu_at DATETIME");
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE tickets_maintenance ADD COLUMN proprio_vu_at DATETIME;`);
    console.log("✅ Colonne proprio_vu_at ajoutée avec succès.");
  } catch (err) {
    if (err.message.includes("duplicate column name")) {
      console.log("ℹ️ La colonne proprio_vu_at existe déjà. Poursuite sans erreur.");
    } else {
      console.error("❌ Erreur : ", err.message);
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
