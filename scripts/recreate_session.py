import paramiko
import time
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

run('curl -s -X DELETE -H "x-api-key: qapril_wa_secret_2026" http://127.0.0.1:2785/api/sessions/qapril')
run('curl -s -X POST -H "Content-Type: application/json" -H "x-api-key: qapril_wa_secret_2026" -d \'{"name":"qapril","start":true}\' http://127.0.0.1:2785/api/sessions')
time.sleep(2)
run('curl -s -H "x-api-key: qapril_wa_secret_2026" http://127.0.0.1:2785/api/sessions/qapril')
run('curl -s http://127.0.0.1:8085/qr | head -c 200')

ssh.close()
