import paramiko

host = '187.77.182.168'
user = 'root'
pwd = 'Qap@vpserv2026'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(host, username=user, password=pwd, timeout=30)

cmds = [
    'cd /opt/qapril && git fetch origin && git reset --hard origin/main',
]

for cmd in cmds:
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode()
    err = stderr.read().decode()
    print(f'CMD: {cmd}')
    if out: print('OUT:', out)
    if err: print('ERR:', err)

client.close()
print('VPS sync done.')

