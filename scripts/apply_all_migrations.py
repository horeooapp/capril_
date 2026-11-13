import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(
    '187.77.182.168',
    port=22,
    username='root',
    password='Qap@vpserv2026',
    disabled_algorithms={'pubkeys': ['rsa-sha2-256', 'rsa-sha2-512']},
    timeout=15,
)

def run(cmd):
    print(f"=== {cmd} ===")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    print(out)
    if err:
        print("[ERR]", err)
    return out

# 1. Apply SQL directly to database first (immediate fix for the user)
sql_commands = """
-- S-08
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "quartier" TEXT;
CREATE INDEX IF NOT EXISTS "properties_commune_quartier_idx" ON "properties" ("commune", "quartier");

-- S-09
ALTER TABLE "locataire_profiles"
  ADD COLUMN IF NOT EXISTS "share_tranche"    BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "share_badges"     BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "share_foyer"      BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "share_duree_bail" BOOLEAN NOT NULL DEFAULT true;

-- S-14
ALTER TABLE "declarations_paiement"
  ADD COLUMN IF NOT EXISTS "idempotency_key" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "declarations_paiement_idempotency_key_key"
  ON "declarations_paiement"("idempotency_key")
  WHERE "idempotency_key" IS NOT NULL;
"""

stdin, stdout, stderr = ssh.exec_command('docker exec -i qapril_postgres psql -U postgres -d qapril')
stdin.write(sql_commands)
stdin.channel.shutdown_write()
out = stdout.read().decode('utf-8', errors='replace')
err = stderr.read().decode('utf-8', errors='replace')
print("SQL OUT:", out)
if err:
    print("SQL ERR:", err)

# 2. Check locataire_profiles columns now
run('docker exec -i qapril_postgres psql -U postgres -d qapril -c "\\d locataire_profiles"')

# 3. Build migrate service so Prisma is in sync
run('cd /opt/qapril && docker compose build migrate')
run('cd /opt/qapril && docker compose run --rm migrate npx prisma migrate deploy')

# 4. Check _prisma_migrations
run('docker exec -i qapril_postgres psql -U postgres -d qapril -c "SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY started_at;"')

# 5. Restart app to make sure Prisma connection pools pick up schema
run('cd /opt/qapril && docker compose restart app')

ssh.close()
print("ALL DONE!")

