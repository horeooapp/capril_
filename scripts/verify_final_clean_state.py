import paramiko

host = '187.77.182.168'
user = 'root'
pwd = 'Qap@vpserv2026'

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(host, username=user, password=pwd, timeout=30)

def run(cmd):
    print(f'=== {cmd} ===')
    stdin, stdout, stderr = c.exec_command(cmd)
    out = stdout.read().decode()
    err = stderr.read().decode()
    if out: print(out.strip())
    if err: print('ERR:', err.strip())

run('df -h /')
run('docker system df')
run('docker exec qapril_postgres psql -U postgres -d qapril -c "SELECT user_id, email, phone, role, first_name, last_name FROM users;"')
run('docker exec qapril_postgres psql -U postgres -d qapril -c "SELECT relname, n_live_tup FROM pg_stat_user_tables WHERE n_live_tup > 0;"')
run('curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/api/health')
run('curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/dashboard')

c.close()
