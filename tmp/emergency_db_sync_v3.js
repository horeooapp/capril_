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
    CREATE TYPE "public"."PlanTier" AS ENUM ('LOCATAIRE', 'ESSENTIEL', 'PRO', 'PREMIUM', 'INSTITUTIONNEL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: subscription_audits (Retry)
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

-- Foreign Key
DO $$ BEGIN
    ALTER TABLE "public"."subscription_audits" ADD CONSTRAINT "subscription_audits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

GRANT ALL PRIVILEGES ON TABLE "public"."subscription_audits" TO "qapril_user";
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
