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
DO $$ BEGIN
    CREATE TYPE "public"."PaymentCanal" AS ENUM ('ORANGE', 'MTN', 'WAVE', 'MOOV', 'CINETPAY_M17', 'SMS_DECLARATIF');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "public"."PaymentPgwStatus" AS ENUM ('INITIEE', 'EN_ATTENTE_PAIEMENT', 'CONFIRMEE', 'ECHEC', 'EXPIREE', 'DECLAREE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "public"."ReversalStatus" AS ENUM ('PENDING', 'REVERSED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "public"."payments_pgw" (
    "payment_id" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "mois_concerne" DATE NOT NULL,
    "montant" DECIMAL(12,0) NOT NULL,
    "payeur_id" TEXT NOT NULL,
    "beneficiaire_id" TEXT NOT NULL,
    "canal" "public"."PaymentCanal" NOT NULL,
    "msisdn_payeur" TEXT,
    "msisdn_beneficiaire" TEXT,
    "statut" "public"."PaymentPgwStatus" NOT NULL DEFAULT 'INITIEE',
    "ref_interne" TEXT NOT NULL,
    "ref_operateur" TEXT,
    "ref_cinetpay" TEXT,
    "webhook_payload" JSONB,
    "webhook_received_at" TIMESTAMP(3),
    "quittance_id" TEXT,
    "tentatives" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reversal_status" "public"."ReversalStatus" NOT NULL DEFAULT 'PENDING',
    "honoraires_agence" DECIMAL(12,0),
    "source_migration_id" TEXT,
    CONSTRAINT "payments_pgw_pkey" PRIMARY KEY ("payment_id")
);

CREATE TABLE IF NOT EXISTS "public"."pgw_msisdn_lookup" (
    "prefixe" TEXT NOT NULL,
    "operateur" "public"."PaymentCanal" NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pgw_msisdn_lookup_pkey" PRIMARY KEY ("prefixe")
);

CREATE TABLE IF NOT EXISTS "public"."pgw_webhooks" (
    "webhook_id" TEXT NOT NULL,
    "canal" "public"."PaymentCanal" NOT NULL,
    "ref_operateur" TEXT,
    "payload" JSONB NOT NULL,
    "signature_valid" BOOLEAN NOT NULL,
    "traite" BOOLEAN NOT NULL DEFAULT false,
    "payment_id" TEXT,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pgw_webhooks_pkey" PRIMARY KEY ("webhook_id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "payments_pgw_ref_interne_key" ON "public"."payments_pgw"("ref_interne");
CREATE INDEX IF NOT EXISTS "payments_pgw_lease_id_mois_concerne_idx" ON "public"."payments_pgw"("lease_id", "mois_concerne");
CREATE INDEX IF NOT EXISTS "payments_pgw_statut_expires_at_idx" ON "public"."payments_pgw"("statut", "expires_at");
CREATE INDEX IF NOT EXISTS "payments_pgw_ref_interne_idx" ON "public"."payments_pgw"("ref_interne");
CREATE INDEX IF NOT EXISTS "pgw_webhooks_ref_operateur_canal_idx" ON "public"."pgw_webhooks"("ref_operateur", "canal");

DO $$ BEGIN
    ALTER TABLE "public"."payments_pgw" ADD CONSTRAINT "payments_pgw_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "public"."leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "public"."payments_pgw" ADD CONSTRAINT "payments_pgw_payeur_id_fkey" FOREIGN KEY ("payeur_id") REFERENCES "public"."users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "public"."payments_pgw" ADD CONSTRAINT "payments_pgw_beneficiaire_id_fkey" FOREIGN KEY ("beneficiaire_id") REFERENCES "public"."users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "public"."payments_pgw" ADD CONSTRAINT "payments_pgw_quittance_id_fkey" FOREIGN KEY ("quittance_id") REFERENCES "public"."receipts"("receipt_id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "public"."pgw_webhooks" ADD CONSTRAINT "pgw_webhooks_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "public"."payments_pgw"("payment_id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

GRANT ALL PRIVILEGES ON TABLE "public"."payments_pgw" TO "qapril_user";
GRANT ALL PRIVILEGES ON TABLE "public"."pgw_msisdn_lookup" TO "qapril_user";
GRANT ALL PRIVILEGES ON TABLE "public"."pgw_webhooks" TO "qapril_user";
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
