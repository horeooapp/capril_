import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.77.182.168', port=22, username='root', password='Qap@vpserv2026', disabled_algorithms={'pubkeys': ['rsa-sha2-256', 'rsa-sha2-512']}, timeout=15)

def exec_cmd(cmd):
    print(">>>", cmd)
    stdin, stdout, stderr = ssh.exec_command(cmd)
    print(stdout.read().decode('utf-8', errors='replace'))
    err = stderr.read().decode('utf-8', errors='replace')
    if err:
        print("[ERR]", err)

exec_cmd('curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/dashboard/inspections')
exec_cmd('curl -s -L -o /dev/null -w "%{url_effective} - %{http_code}" http://127.0.0.1:3000/dashboard/inspections')
exec_cmd('curl -s -I http://127.0.0.1:3000/dashboard/inspections')
exec_cmd('ls -la /opt/qapril/src/app/dashboard/\(portal\)/inspections')

ssh.close()
