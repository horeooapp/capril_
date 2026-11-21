import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runSafeMigration() {
    console.log('--- DÉBUT DE LA MIGRATION SÉCURISÉE ADD-33 (SQL NON DESTRUCTIF) ---');

    try {
        // 1. Création des Enums PostgreSQL si inexistants
        const enums = [
            `DO $$ BEGIN CREATE TYPE "CompteStatut" AS ENUM ('A_RECLAMER', 'ACTIF', 'GELE'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
            `DO $$ BEGIN CREATE TYPE "TelephoneStatut" AS ENUM ('ACTIF', 'A_REVERIFIER', 'RETIRE'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
            `DO $$ BEGIN CREATE TYPE "EspaceEnum" AS ENUM ('LOCATAIRE', 'BAILLEUR', 'AGENCE'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
            `DO $$ BEGIN CREATE TYPE "AgenceProfilEnum" AS ENUM ('CHEF', 'COLLABORATEUR'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
            `DO $$ BEGIN CREATE TYPE "FusionStatut" AS ENUM ('DEMANDEE', 'CODES_VALIDES', 'ACCEPTEE', 'REFUSEE'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
        ];

        for (const sql of enums) {
            await prisma.$executeRawUnsafe(sql);
        }
        console.log('✅ Étape 1 : Types énumérés vérifiés/créés.');

        // 2. Évolution de la table users (colonnes ADD-33)
        const userCols = [
            `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "statut_compte" "CompteStatut" NOT NULL DEFAULT 'ACTIF';`,
            `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "cree_par_tiers_id" TEXT;`,
            `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reclame_at" TIMESTAMPTZ;`,
            `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "gele_at" TIMESTAMPTZ;`,
        ];
        for (const sql of userCols) {
            await prisma.$executeRawUnsafe(sql);
        }
        console.log('✅ Étape 2 : Colonnes users ADD-33 ajoutées.');

        // 3. Création de la table user_telephones
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "user_telephones" (
                "telephone_id" TEXT PRIMARY KEY,
                "user_id" TEXT NOT NULL REFERENCES "users"("user_id") ON DELETE CASCADE,
                "numero_e164" VARCHAR(20) NOT NULL,
                "principal" BOOLEAN NOT NULL DEFAULT FALSE,
                "statut" "TelephoneStatut" NOT NULL DEFAULT 'ACTIF',
                "verifie_at" TIMESTAMPTZ,
                "derniere_connexion_at" TIMESTAMPTZ,
                "retire_at" TIMESTAMPTZ,
                "created_at" TIMESTAMPTZ DEFAULT now()
            );
        `);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_user_tel_num_statut" ON "user_telephones"("numero_e164", "statut");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_user_tel_user_statut" ON "user_telephones"("user_id", "statut");`);
        console.log('✅ Étape 3 : Table user_telephones créée avec index.');

        // 4. Création de la table demandes_fusion
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "demandes_fusion" (
                "fusion_id" TEXT PRIMARY KEY,
                "compte_garde_id" TEXT NOT NULL REFERENCES "users"("user_id"),
                "compte_absorbe_id" TEXT NOT NULL REFERENCES "users"("user_id"),
                "statut" "FusionStatut" NOT NULL DEFAULT 'DEMANDEE',
                "conseiller_id" TEXT,
                "motif_refus" TEXT,
                "created_at" TIMESTAMPTZ DEFAULT now(),
                "decide_at" TIMESTAMPTZ
            );
        `);
        console.log('✅ Étape 4 : Table demandes_fusion créée.');

        // 5. Création de la table journal_telephones
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "journal_telephones" (
                "evenement_id" TEXT PRIMARY KEY,
                "user_id" TEXT NOT NULL REFERENCES "users"("user_id") ON DELETE CASCADE,
                "numero_e164" VARCHAR(20) NOT NULL,
                "type" VARCHAR(30) NOT NULL,
                "auteur_id" TEXT,
                "horodatage" TIMESTAMPTZ DEFAULT now()
            );
        `);
        console.log('✅ Étape 5 : Table journal_telephones créée.');

        // 6. Peuplement des numéros existants de users vers user_telephones (Idempotent)
        const users = await prisma.$queryRawUnsafe(`
            SELECT "user_id" AS id, "phone", "created_at" AS "createdAt", "last_login_at" AS "lastLoginAt"
            FROM "users"
            WHERE "phone" IS NOT NULL AND "phone" <> '';
        `);

        console.log(`Population des téléphones : ${users.length} utilisateurs trouvés...`);
        let inserted = 0;

        for (const u of users) {
            let num = u.phone.trim().replace(/[\s\-\.\(\)]/g, '');
            if (!num.startsWith('+')) {
                if (num.startsWith('225')) num = '+' + num;
                else num = '+225' + num;
            }

            const existing = await prisma.$queryRawUnsafe(
                `SELECT "telephone_id" FROM "user_telephones" WHERE "user_id" = $1 AND "numero_e164" = $2 LIMIT 1;`,
                u.id, num
            );

            if (!existing || existing.length === 0) {
                const telId = `tel_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
                await prisma.$executeRawUnsafe(
                    `INSERT INTO "user_telephones" ("telephone_id", "user_id", "numero_e164", "principal", "statut", "verifie_at", "derniere_connexion_at")
                     VALUES ($1, $2, $3, TRUE, 'ACTIF', $4, $5);`,
                    telId, u.id, num, u.createdAt || new Date(), u.lastLoginAt || null
                );
                inserted++;
            }
        }
        console.log(`✅ Étape 6 : Synchronisation terminée. ${inserted} numéros insérés dans user_telephones.`);

        // 7. Contrainte RG-IDN-24 : Bail avec soi-même interdit au niveau SQL
        await prisma.$executeRawUnsafe(`
            DO $$ BEGIN
                ALTER TABLE "leases" ADD CONSTRAINT "chk_bail_parties_distinctes" CHECK ("landlord_id" <> "tenant_id");
            EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        `);
        console.log('✅ Étape 7 : Contrainte SQL chk_bail_parties_distinctes (RG-IDN-24) active sur leases.');

        console.log('🎉 MIGRATION ADD-33 TERMINÉE AVEC SUCCÈS SANS AUCUNE PERTE DE DONNÉES !');
    } catch (err) {
        console.error('❌ Erreur lors de la migration ADD-33:', err);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

runSafeMigration();
