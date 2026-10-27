import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.77.182.168', port=22, username='root', password='Qap@vpserv2026', disabled_algorithms={'pubkeys': ['rsa-sha2-256', 'rsa-sha2-512']}, timeout=15)

# Création du script wrapper sur le serveur
wrapper_content = """#!/bin/sh
exec /usr/bin/chromium --no-sandbox --disable-setuid-sandbox "$@"
"""

sftp = ssh.open_sftp()
with sftp.file('/tmp/chrome-wrapper.sh', 'w') as f:
    f.write(wrapper_content)

# Copier également le server.js local vers /tmp/server.js
with open(r'e:\Projets_Cornerstone\site_crnstneros\capril_\openwa-server\server.js', 'r', encoding='utf-8') as f:
    local_serverjs = f.read()

with sftp.file('/tmp/server.js', 'w') as f:
    f.write(local_serverjs)

sftp.close()

def run(cmd):
    print(f'=== CMD: {cmd} ===')
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    print(out)
    if err:
        print('[ERR]', err)

# Injecter dans le conteneur qapril_openwa
run('docker cp /tmp/chrome-wrapper.sh qapril_openwa:/usr/local/bin/chrome-wrapper')
run('docker exec qapril_openwa chmod +x /usr/local/bin/chrome-wrapper')
run('docker cp /tmp/server.js qapril_openwa:/app/server.js')
run('docker exec qapril_openwa rm -rf /app/session/* /app/session/.[!.]*')
run('docker restart qapril_openwa')

ssh.close()
print("Terminé !")
