import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.77.182.168', port=22, username='root', password='Qap@vpserv2026', disabled_algorithms={'pubkeys': ['rsa-sha2-256', 'rsa-sha2-512']}, timeout=15)

def run(cmd):
    print(f"=== {cmd} ===")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    print(out[:400] if len(out) > 400 else out)
    if err:
        print("[ERR]", err)
    return out

run("cd /opt/qapril && git pull origin main")

# Mise à jour du fichier docker-compose dans /opt/openwa pour persister la config WEBJS
compose_openwa = '''name: openwa

services:
  api:
    image: devlikeapro/waha:latest
    container_name: openwa-api
    restart: unless-stopped
    ports:
      - "127.0.0.1:2785:3000"
    environment:
      WHATSAPP_DEFAULT_ENGINE: WEBJS
      WAHA_PRINT_QR: "true"
      WAHA_API_KEY: "qapril_wa_secret_2026"
    volumes:
      - openwa_sessions:/app/.sessions
    networks:
      - openwa-network
      - qapril_qapril_net

volumes:
  openwa_sessions:

networks:
  openwa-network:
    driver: bridge
  qapril_qapril_net:
    external: true
'''

sftp = ssh.open_sftp()
with sftp.file('/opt/openwa/docker-compose.yml', 'w') as f:
    f.write(compose_openwa)
sftp.close()

run("cat /opt/openwa/docker-compose.yml")

ssh.close()
