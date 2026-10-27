import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.77.182.168', port=22, username='root', password='Qap@vpserv2026', disabled_algorithms={'pubkeys': ['rsa-sha2-256', 'rsa-sha2-512']}, timeout=15)

def run(cmd):
    print(f'=== CMD: {cmd} ===')
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    print(out)
    if err:
        print('[ERR]', err)
    return out

run('docker exec qapril_app curl -s -I -H "x-api-key: qapril_wa_secret_2026" http://openwa-api:3000/api/sessions')
run('docker exec qapril_app curl -s -I -H "x-api-key: qapril_wa_secret_2026" http://openwa:8085/qr')

ssh.close()
