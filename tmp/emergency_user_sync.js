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
-- Ensure PlanTier enum exists
DO $$ BEGIN
    CREATE TYPE "public"."PlanTier" AS ENUM ('LOCATAIRE', 'ESSENTIEL', 'PRO', 'PREMIUM', 'INSTITUTIONNEL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Update users table with missing columns
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "kyc_level" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "kyc_status" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "is_certified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "pays_residence" CHAR(3);
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "fuseau_horaire" TEXT NOT NULL DEFAULT 'Africa/Abidjan';
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "email_rapport_mensuel" TEXT;
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "device_fingerprint" VARCHAR(64);
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "fraud_score" SMALLINT NOT NULL DEFAULT 0;
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "fraud_flags" JSONB;
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "white_label_config" JSONB;
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "company_reg_number" TEXT;
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "tax_id" TEXT;
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "active_plan_tier" "public"."PlanTier" NOT NULL DEFAULT 'LOCATAIRE';
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "plan_expires_at" TIMESTAMP(3);

-- Permissions check
COMMENT ON COLUMN "public"."users"."fraud_flags" IS 'Added for compliance v3.2';
`;

    console.log('Executing User Sync SQL via sudo -u postgres on VPS...');
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
