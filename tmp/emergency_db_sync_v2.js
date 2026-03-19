const { NodeSSH } = require('node-ssh');

const ssh = new NodeSSH();

async function run() {
  try {
    console.log('Connecting to SSH...');
    await ssh.connect({
      host: '187.77.93.154',
      username: 'root',
      password: 'Qap@server2026',
      port: 2222
    });
    console.log('Connected!');

    const sqlContent = `
-- Enums
DO $$ BEGIN
    CREATE TYPE "public"."LegalType" AS ENUM ('PRE_NOTICE', 'COMMAND_TO_PAY', 'TERMINATION_NOTICE', 'EVICTION_ORDER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "public"."MigrationStatus" AS ENUM ('UPLOADE', 'EN_ANALYSE', 'RAPPORT_GENERE', 'COMMITE', 'ERREUR');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: fraud_blacklist
CREATE TABLE IF NOT EXISTS "public"."fraud_blacklist" (
    "bl_id" TEXT NOT NULL,
    "user_id" TEXT,
    "document_hash" VARCHAR(64),
    "motif" TEXT NOT NULL,
    "ajoute_par" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fraud_blacklist_pkey" PRIMARY KEY ("bl_id")
);

-- Table: tva_transactions
CREATE TABLE IF NOT EXISTS "public"."tva_transactions" (
    "tva_id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "service_type" TEXT NOT NULL,
    "montant_ht" DECIMAL(12,2) NOT NULL,
    "taux_tva" DECIMAL(5,2) NOT NULL DEFAULT 18.00,
    "montant_tva" DECIMAL(12,2) NOT NULL,
    "montant_ttc" DECIMAL(12,2) NOT NULL,
    "periode_fiscale" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tva_transactions_pkey" PRIMARY KEY ("tva_id")
);

-- Table: procurations_numeriques
CREATE TABLE IF NOT EXISTS "public"."procurations_numeriques" (
    "proc_id" TEXT NOT NULL,
    "mandant_id" TEXT NOT NULL,
    "mandataire_id" TEXT NOT NULL,
    "droits" JSONB NOT NULL,
    "date_debut" DATE NOT NULL,
    "date_fin" DATE,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "procurations_numeriques_pkey" PRIMARY KEY ("proc_id")
);

-- Table: subscription_audits
CREATE TABLE IF NOT EXISTS "public"."subscription_audits" (
    "sub_audit_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "old_tier" "public"."PlanTier" NOT NULL,
    "new_tier" "public"."PlanTier" NOT NULL,
    "reason" TEXT,
    "executed_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "subscription_audits_pkey" PRIMARY KEY ("sub_audit_id")
);

-- Table: legal_procedures
CREATE TABLE IF NOT EXISTS "public"."legal_procedures" (
    "procedure_id" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "type" "public"."LegalType" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "description" TEXT,
    "served_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "legal_procedures_pkey" PRIMARY KEY ("procedure_id")
);

-- Table: coop_groups
CREATE TABLE IF NOT EXISTS "public"."coop_groups" (
    "coop_id" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "total_target" DECIMAL(12,0) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "coop_groups_pkey" PRIMARY KEY ("coop_id")
);

-- Table: migration_sessions
CREATE TABLE IF NOT EXISTS "public"."migration_sessions" (
    "session_id" TEXT NOT NULL,
    "agence_id" TEXT NOT NULL,
    "fichier_nom" TEXT NOT NULL,
    "fichier_format" TEXT NOT NULL,
    "source_logiciel" TEXT,
    "statut" "public"."MigrationStatus" NOT NULL DEFAULT 'UPLOADE',
    "nb_logements" INTEGER NOT NULL DEFAULT 0,
    "nb_locataires" INTEGER NOT NULL DEFAULT 0,
    "nb_baux" INTEGER NOT NULL DEFAULT 0,
    "nb_paiements" INTEGER NOT NULL DEFAULT 0,
    "nb_erreurs" INTEGER NOT NULL DEFAULT 0,
    "nb_warnings" INTEGER NOT NULL DEFAULT 0,
    "rapport_pdf_url" TEXT,
    "validation_token" TEXT,
    "validated_at" TIMESTAMP(3),
    "committed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "migration_sessions_pkey" PRIMARY KEY ("session_id")
);

-- Table: migration_staging
CREATE TABLE IF NOT EXISTS "public"."migration_staging" (
    "staging_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "agence_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "raw_data" JSONB NOT NULL,
    "mapped_data" JSONB,
    "validation_status" TEXT NOT NULL DEFAULT 'PENDING',
    "errors" JSONB,
    "warnings" JSONB,
    "committed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "migration_staging_pkey" PRIMARY KEY ("staging_id")
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "migration_sessions_validation_token_key" ON "public"."migration_sessions"("validation_token");
CREATE UNIQUE INDEX IF NOT EXISTS "coop_groups_lease_id_key" ON "public"."coop_groups"("lease_id");

-- Foreign Keys
DO $$ BEGIN
    ALTER TABLE "public"."fraud_blacklist" ADD CONSTRAINT "fraud_blacklist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "public"."fraud_blacklist" ADD CONSTRAINT "fraud_blacklist_ajoute_par_fkey" FOREIGN KEY ("ajoute_par") REFERENCES "public"."users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "public"."tva_transactions" ADD CONSTRAINT "tva_transactions_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "public"."payments_pgw"("payment_id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Permissions
GRANT ALL PRIVILEGES ON TABLE "public"."fraud_blacklist" TO "qapril_user";
GRANT ALL PRIVILEGES ON TABLE "public"."tva_transactions" TO "qapril_user";
GRANT ALL PRIVILEGES ON TABLE "public"."procurations_numeriques" TO "qapril_user";
GRANT ALL PRIVILEGES ON TABLE "public"."subscription_audits" TO "qapril_user";
GRANT ALL PRIVILEGES ON TABLE "public"."legal_procedures" TO "qapril_user";
GRANT ALL PRIVILEGES ON TABLE "public"."coop_groups" TO "qapril_user";
GRANT ALL PRIVILEGES ON TABLE "public"."migration_sessions" TO "qapril_user";
GRANT ALL PRIVILEGES ON TABLE "public"."migration_staging" TO "qapril_user";
`;

    console.log('Executing SQL via sudo -u postgres on VPS...');
    const result = await ssh.execCommand(`sudo -u postgres psql -d qapril <<'EOF'
${sqlContent}
EOF
`);

    console.log('STDOUT:', result.stdout);
    console.log('STDERR:', result.stderr);
    
    if (result.code === 0) {
      console.log('Success!');
    } else {
      console.log('Failed with code', result.code);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    ssh.dispose();
  }
}

run();
