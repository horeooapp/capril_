import paramiko

host = '187.77.182.168'
user = 'root'
pwd = 'Qap@vpserv2026'

print('Connecting to VPS...')
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(host, username=user, password=pwd, timeout=30)

sql_content = """DO $RESET$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
          AND tablename <> '_prisma_migrations'
    ) LOOP
        EXECUTE 'TRUNCATE TABLE public.' || quote_ident(r.tablename) || ' CASCADE;';
    END LOOP;
END $RESET$;

INSERT INTO public.users (
    user_id, phone, first_name, last_name, email, role, kyc_level, kyc_status,
    password, is_certified, onboarding_complete, capacite_active, preferred_lang,
    created_at, updated_at, status, active_plan_tier
) VALUES 
(
    '2f725515-d247-4355-9234-c0e28d07e6f9',
    '+2250707334770',
    'Administrateur',
    'Central',
    'admin@qapril.net',
    'SUPER_ADMIN',
    4,
    'verified',
    '$2a$10$52WuAdGQvdNKcYlS1vZ.sOyZ6cjO6UqO/NKtf.onCLpb7h7iK5aXi',
    true,
    true,
    'AGENCY',
    'fr',
    '2026-10-25 10:38:37.318',
    now(),
    'ACTIVE',
    'LOCATAIRE'
),
(
    '0e88381e-615b-481e-aae6-df2bed2a1b60',
    '+2250707167616',
    'Frederic',
    'Soummahoro',
    'fsoumahoro@qapril.net',
    'ADMIN',
    4,
    'verified',
    '$2a$10$Fz9VhGRohw/lc2tTN4xBF.ruRAYehpjfF8BaIyRldUSnMkHUmi3iy',
    true,
    true,
    'PROPRIETAIRE',
    'fr',
    '2026-10-28 17:16:39.163',
    now(),
    'ACTIVE',
    'LOCATAIRE'
);
"""

# Upload via SFTP
sftp = c.open_sftp()
with sftp.file('/tmp/reset_db_admins.sql', 'w') as f:
    f.write(sql_content)
sftp.close()

def run(cmd):
    print(f'\n--- {cmd} ---')
    stdin, stdout, stderr = c.exec_command(cmd)
    out = stdout.read().decode()
    err = stderr.read().decode()
    if out: print(out.strip())
    if err: print('ERR:', err.strip())

# Copy into container and execute with psql -f
run('docker cp /tmp/reset_db_admins.sql qapril_postgres:/tmp/reset_db_admins.sql')
run('docker exec qapril_postgres psql -U postgres -d qapril -f /tmp/reset_db_admins.sql')

# Verify results
run('docker exec qapril_postgres psql -U postgres -d qapril -c "SELECT user_id, email, phone, role, first_name, last_name FROM users;"')
run('docker exec qapril_postgres psql -U postgres -d qapril -c "SELECT relname AS table_with_data, n_live_tup AS row_count FROM pg_stat_user_tables WHERE n_live_tup > 0;"')

# Restart qapril_app container
run('cd /opt/qapril && docker compose restart app')

# Cleanup temp sql
run('rm -f /tmp/reset_db_admins.sql')
run('docker exec qapril_postgres rm -f /tmp/reset_db_admins.sql')

c.close()
print('\nExecution finished.')
