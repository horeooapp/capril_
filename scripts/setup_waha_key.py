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

waha_compose = """name: openwa

services:
  api:
    image: devlikeapro/waha:latest
    container_name: openwa-api
    restart: unless-stopped
    ports:
      - "127.0.0.1:2785:3000"
    environment:
      WHATSAPP_DEFAULT_ENGINE: NOWEB
      WAHA_PRINT_QR: "true"
      WAHA_API_KEY: "qapril_wa_secret_2026"
    volumes:
      - openwa_sessions:/app/.sessions
    networks:
      - openwa-network

volumes:
  openwa_sessions:

networks:
  openwa-network:
    driver: bridge
"""

sftp = ssh.open_sftp()
with sftp.file('/opt/openwa/docker-compose.yml', 'w') as f:
    f.write(waha_compose)
sftp.close()

run('cd /opt/openwa && docker compose up -d')
run('sleep 3 && curl -i -H "x-api-key: qapril_wa_secret_2026" http://127.0.0.1:2785/api/health')
run('curl -i -H "x-api-key: qapril_wa_secret_2026" http://127.0.0.1:2785/api/sessions')

ssh.close()
