import paramiko
import json
import time

host = '187.77.182.168'
user = 'root'
pwd = 'Qap@vpserv2026'

print('Connecting to VPS...')
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(host, username=user, password=pwd, timeout=60)

def exec_cmd(cmd):
    print(f'\n>>> {cmd}')
    stdin, stdout, stderr = c.exec_command(cmd, get_pty=True)
    out = stdout.read().decode('utf-8')
    print(out.strip())
    status = stdout.channel.recv_exit_status()
    if status != 0:
        print(f'Command failed with status {status}')
    return status, out

# ==============================================================================
# PHASE 1: DISK CLEANUP ON VPS (~65 GB)
# ==============================================================================
print('\n' + '='*60)
print('PHASE 1: DISK CLEANUP ON VPS')
print('='*60)

exec_cmd('docker builder prune -a -f')
exec_cmd('docker image prune -a -f')
exec_cmd('rm -f /opt/qapril/qapril-deploy.zip')
exec_cmd('rm -f /opt/qapril/*.docx /opt/qapril/*.doc /opt/qapril/~*')
exec_cmd('rm -rf /opt/qapril/tmp/*')
exec_cmd('df -h /')

# ==============================================================================
# PHASE 2: DATABASE RESET (KEEPING ONLY THE 2 ADMINS)
# ==============================================================================
print('\n' + '='*60)
print('PHASE 2: DATABASE RESET')
print('='*60)

# SQL script to truncate all tables except _prisma_migrations, and reinsert the 2 admins
reset_sql = """
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- 1. Truncate all tables in public schema except _prisma_migrations
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
          AND tablename <> '_prisma_migrations'
    ) LOOP
        EXECUTE 'TRUNCATE TABLE public.' || quote_ident(r.tablename) || ' CASCADE;';
    END LOOP;
END $$;

-- 2. Re-insert the two Admin accounts
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

# Write SQL to temporary file inside container and execute
exec_cmd(f'''docker exec -i qapril_postgres psql -U postgres -d qapril -c "{reset_sql}"''')

# ==============================================================================
# PHASE 3: VERIFICATION
# ==============================================================================
print('\n' + '='*60)
print('PHASE 3: VERIFICATION')
print('='*60)

exec_cmd('docker exec qapril_postgres psql -U postgres -d qapril -c "SELECT user_id, email, phone, role, first_name, last_name FROM users;"')
exec_cmd('docker exec qapril_postgres psql -U postgres -d qapril -c "SELECT relname AS table_name, n_live_tup AS row_count FROM pg_stat_user_tables WHERE n_live_tup > 0 ORDER BY n_live_tup DESC;"')

# Restart qapril_app container to clear any in-memory Redis or Node caches
print('\nRestarting qapril_app to refresh connections and caches...')
exec_cmd('cd /opt/qapril && docker compose restart app')
time.sleep(10)
exec_cmd('docker ps --filter "name=qapril_app"')

c.close()
print('\nReset and cleanup finished successfully!')
