import paramiko

host = '187.77.182.168'
user = 'root'
pwd = 'Qap@vpserv2026'

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(host, username=user, password=pwd, timeout=30)

def run(cmd):
    print(f'\n--- {cmd} ---')
    stdin, stdout, stderr = c.exec_command(cmd)
    out = stdout.read().decode()
    err = stderr.read().decode()
    if out: print(out.strip())
    if err: print('ERR:', err.strip())

# Find admins / super admins in users table
run('docker exec qapril_postgres psql -U postgres -d qapril -c "SELECT user_id, phone, email, role, first_name, last_name, created_at FROM users WHERE role::text ILIKE \'%admin%\';"')

# List count of records in main tables
run('docker exec qapril_postgres psql -U postgres -d qapril -c "SELECT relname AS table, n_live_tup AS rows FROM pg_stat_user_tables WHERE n_live_tup > 0 ORDER BY n_live_tup DESC LIMIT 20;"')

c.close()
