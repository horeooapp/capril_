import paramiko
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.77.182.168', port=22, username='root', password='Qap@vpserv2026', disabled_algorithms={'pubkeys': ['rsa-sha2-256', 'rsa-sha2-512']}, timeout=15)

def run(cmd):
    print(f"=== {cmd} ===")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    print(out)
    if err:
        print("[ERR]", err)
    return out

# Bascule d'openwa-api vers GOWS (moteur WhatsApp Go ultra-rapide et insensible au bug LID de Chromium)
run("docker rm -f openwa-api 2>/dev/null || true")
run("""docker run -d --name openwa-api --restart unless-stopped \
  -p 127.0.0.1:2785:3000 \
  -e WHATSAPP_DEFAULT_ENGINE=GOWS \
  -e WAHA_PRINT_QR=true \
  -e WAHA_API_KEY=qapril_wa_secret_2026 \
  -v openwa_sessions:/app/.sessions \
  devlikeapro/waha:latest""")

run("docker network connect qapril_qapril_net openwa-api")

print("Attente 5s démarrage GOWS...")
time.sleep(5)

run("curl -s -X POST -H 'Content-Type: application/json' -H 'X-Api-Key: qapril_wa_secret_2026' -d '{\"name\":\"default\",\"start\":true}' http://127.0.0.1:2785/api/sessions")

print("Attente 3s...")
time.sleep(3)

run("curl -s -H 'X-Api-Key: qapril_wa_secret_2026' http://127.0.0.1:2785/api/sessions/default")

# Mettre à jour /opt/openwa/docker-compose.yml
compose_openwa = '''name: openwa

services:
  api:
    image: devlikeapro/waha:latest
    container_name: openwa-api
    restart: unless-stopped
    ports:
      - "127.0.0.1:2785:3000"
    environment:
      WHATSAPP_DEFAULT_ENGINE: GOWS
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

run("docker restart qapril_openwa")

ssh.close()
