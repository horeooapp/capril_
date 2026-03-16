const { NodeSSH } = require('node-ssh')

const ssh = new NodeSSH()

async function run() {
  try {
    console.log('Connecting to SSH (Port 2222)...')
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
    // Using the local DB URL on the VPS
    // Derived from the .env's DATABASE_URL="postgresql://qapril_user:Qapril2026@187.77.93.154:5432/qapril"
    const dbUrl = "postgresql://qapril_user:Qapril2026@localhost:5432/qapril"
    
    console.log('Checking VPS environment (docker and psql)...')
    
    const checkDocker = await ssh.execCommand('docker ps')
    console.log('DOCKER PS:', checkDocker.stdout)

    // Try to run a simple psql -l to see if connection works or if we need different host
    const checkPsql = await ssh.execCommand('psql -l')
    console.log('PSQL -L:', checkPsql.stdout)
    console.log('PSQL -L ERR:', checkPsql.stderr)

    console.log('Executing SQL via sudo -u postgres on VPS...')
    
    // Constructing the command with a heredoc for sudo -u postgres
    // Note: We use the local database name 'qapril' directly
    const command = `sudo -u postgres psql -d qapril <<'EOF'
${sqlContent}
EOF
`
    const result = await ssh.execCommand(command)

    console.log('STDOUT:', result.stdout)
    console.log('STDERR:', result.stderr)
    
    if (result.code === 0 && result.stdout.includes('CREATE TABLE')) {
       console.log('SUCCESS: Table "news_tickers" created or already exists.')
    } else if (result.code === 0) {
       console.log('SUCCESS: Migration completed.')
    } else {
       console.log('FAILED with code', result.code)
    }

  } catch (error) {
    console.error('CRITICAL ERROR:', error)
  } finally {
    ssh.dispose()
    process.exit()
  }
}

run()
