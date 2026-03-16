import { NodeSSH } from 'node-ssh'
import fs from 'fs'
import path from 'path'

const ssh = new NodeSSH()

async function run() {
  try {
    console.log('Connecting to SSH...')
    await ssh.connect({
      host: '187.77.93.154',
      username: 'root',
      password: 'Qap@server2026',
      port: 2222
    })
    console.log('Connected!')

    const sqlContent = `
CREATE TABLE IF NOT EXISTS "public"."news_tickers" (
    "news_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "news_tickers_pkey" PRIMARY KEY ("news_id")
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_news_tickers_updated_at') THEN
        CREATE TRIGGER update_news_tickers_updated_at
            BEFORE UPDATE ON "public"."news_tickers"
            FOR EACH ROW
            EXECUTE PROCEDURE update_updated_at_column();
    END IF;
END $$;
`
    // We assume psql is available and we can connect to the local db
    // Using the credentials from the .env found earlier
    const dbUrl = "postgresql://qapril_user:Qapril2026@localhost:5432/qapril"
    
    console.log('Executing SQL...')
    // Use EOF to pass the SQL string to psql
    const result = await ssh.execCommand(`psql "${dbUrl}" <<'EOF'
${sqlContent}
EOF
`)

    console.log('STDOUT:', result.stdout)
    console.log('STDERR:', result.stderr)
    
    if (result.code === 0) {
      console.log('Success!')
    } else {
      console.log('Failed with code', result.code)
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    ssh.dispose()
  }
}

run()
