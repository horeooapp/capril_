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

# Create a timestamped backup before any reset
run('mkdir -p /opt/qapril/backups && docker exec qapril_postgres pg_dump -U postgres -d qapril -F c -b -v -f /var/lib/postgresql/data/backup_pre_reset_$(date +%Y%m%d_%H%M%S).dump')
run('docker exec qapril_postgres ls -lh /var/lib/postgresql/data/*.dump')

c.close()
