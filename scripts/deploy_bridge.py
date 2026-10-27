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
    print(out[:400] if len(out) > 400 else out)
    if err:
        print('[ERR]', err)
    return out

# Copier le nouveau server.js dans qapril_openwa
sftp = ssh.open_sftp()
with open(r'e:\Projets_Cornerstone\site_crnstneros\capril_\openwa-server\server.js', 'r', encoding='utf-8') as f:
    content = f.read()

with sftp.file('/tmp/bridge_server.js', 'w') as f:
    f.write(content)
sftp.close()

run('docker cp /tmp/bridge_server.js qapril_openwa:/app/server.js')
run('docker restart qapril_openwa')

print("Attente de 5s...")
time.sleep(5)

run('docker logs qapril_openwa --tail=20')
run('curl -s http://127.0.0.1:8085/qr')

ssh.close()
