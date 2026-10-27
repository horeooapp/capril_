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
    print(out[:500] if len(out) > 500 else out)
    if err:
        print('[ERR]', err)
    return out

run('curl -i -H "x-api-key: qapril_wa_secret_2026" http://127.0.0.1:2785/api/qapril/auth/qr')
run('docker network connect qapril_qapril_net openwa-api 2>&1 || true')
run('docker inspect openwa-api --format "{{json .NetworkSettings.Networks}}"')

ssh.close()
