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

run('df -h')
run('docker system df')
run('ls -la /root')
run('ls -la /opt')
run('ls -la /opt/qapril')

c.close()
