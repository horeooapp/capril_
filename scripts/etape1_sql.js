const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- STARTING STEP 1 SQL SCRIPT ---');
  
  // 1.1 Update Users wallet_seuil_alerte
  try {
    await prisma.$executeRawUnsafe(`UPDATE "User" SET "wallet_seuil_alerte" = 1000 WHERE "wallet_seuil_alerte" = 500 OR "wallet_seuil_alerte" IS NULL`);
    console.log('✅ 1.1 - User wallet_seuil_alerte updated to 1000.');
  } catch (error) {
    try {
      await prisma.$executeRawUnsafe(`UPDATE "users" SET "wallet_seuil_alerte" = 1000 WHERE "wallet_seuil_alerte" = 500 OR "wallet_seuil_alerte" IS NULL`);
      console.log('✅ 1.1 - "users" wallet_seuil_alerte updated to 1000.');
    } catch (e2) {
      console.log('⚠️ 1.1 - User update failed, perhaps the column wallet_seuil_alerte does not exist yet. It will be created in step 2.', e2.message);
    }
  }

  // 1.2 Insert Config Tarifs
  try {
    await prisma.$executeRawUnsafe(`INSERT OR REPLACE INTO "config_tarifs" ("cle", "valeur", "description", "modifiable") VALUES
      ('quittance_ttc',           90,    'Prix quittance TTC en FCFA',           0),
      ('bail_standard',           2000,  'Frais création bail standard FCFA',    0),
      ('bail_cour_entiere',       10000, 'Frais bail Cour Entière FCFA',         0),
      ('wallet_seuil_alerte',     1000,  'Seuil alerte solde bas FCFA',          1),
      ('wallet_mois_couverture',  2,     'Mois de couverture calcul montant',    1),
      ('wallet_credit_max',       1500,  'Débit crédit max wallet FCFA',         0)`);
    console.log('✅ 1.2 - config_tarifs updated.');
  } catch (e) {
    console.log('⚠️ 1.2 - config_tarifs table likely does not exist yet. Ignoring as per instructions.');
  }

  // 1.3 Indexes
  try {
    // Usually receipts table is mapped as 'Receipt' or 'receipts'
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_receipts_period" ON "Receipt"("periodMonth")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_receipts_status" ON "Receipt"("status")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_leases_status" ON "Lease"("status")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_wallet_links_user" ON "WalletRechargeLink"("userId", "createdAt" DESC)`);
    console.log('✅ 1.3 - Indexes created.');
  } catch (e) {
    console.log('⚠️ 1.3 - Index creation failed. Tables/columns might not exist yet.', e.message);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
