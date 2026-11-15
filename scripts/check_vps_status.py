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

run('curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/dashboard')
run('curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/dashboard/documents')
run('curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/dashboard/certificates')
run('curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/dashboard/succession')
run('docker logs --tail 30 qapril_app')

c.close()
