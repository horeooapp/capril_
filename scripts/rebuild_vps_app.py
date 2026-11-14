import paramiko
import sys
import time

host = '187.77.182.168'
user = 'root'
pwd = 'Qap@vpserv2026'

print('Connecting to VPS...')
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(host, username=user, password=pwd, timeout=30)

def exec_stream(cmd):
    print(f'\n>>> {cmd}')
    stdin, stdout, stderr = client.exec_command(cmd, get_pty=True)
    for line in iter(stdout.readline, ''):
        print(line, end='')
    status = stdout.channel.recv_exit_status()
    print(f'Exit status: {status}')
    return status

# 1. Pull latest code
s1 = exec_stream('cd /opt/qapril && git fetch origin && git reset --hard origin/main')
if s1 != 0:
    print('Failed to pull code!')
    client.close()
    sys.exit(1)

# 2. Build app image with latest code & Prisma schema
s2 = exec_stream('cd /opt/qapril && docker compose build app')
if s2 != 0:
    print('Failed to build app image!')
    client.close()
    sys.exit(1)

# 3. Restart app container with newly built image
s3 = exec_stream('cd /opt/qapril && docker compose up -d --no-deps app')
if s3 != 0:
    print('Failed to start app container!')
    client.close()
    sys.exit(1)

# 4. Wait for healthcheck
print('\nWaiting for container to become healthy...')
time.sleep(10)
exec_stream('docker ps --filter "name=qapril_app"')
exec_stream('docker logs --tail 30 qapril_app')

client.close()
print('\n=== DEPLOYMENT COMPLETED SUCCESSFULLY ===')
