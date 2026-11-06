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

# 1. Relancer openwa-api avec la nouvelle image
run("docker rm -f openwa-api 2>/dev/null || true")
run("""docker run -d --name openwa-api --restart unless-stopped \
  -p 127.0.0.1:2785:3000 \
  -e WHATSAPP_DEFAULT_ENGINE=WEBJS \
  -e WAHA_PRINT_QR=true \
  -e WAHA_API_KEY=qapril_wa_secret_2026 \
  -v openwa_sessions:/app/.sessions \
  devlikeapro/waha:latest""")

run("docker network connect qapril_qapril_net openwa-api")

print("Attente 10s démarrage WAHA...")
time.sleep(10)

run("curl -s -H 'X-Api-Key: qapril_wa_secret_2026' http://127.0.0.1:2785/api/version")
run("curl -s -H 'X-Api-Key: qapril_wa_secret_2026' http://127.0.0.1:2785/api/sessions")

# Démarrer session 'default' si nécessaire
run("curl -s -X POST -H 'Content-Type: application/json' -H 'X-Api-Key: qapril_wa_secret_2026' -d '{\"name\":\"default\",\"start\":true}' http://127.0.0.1:2785/api/sessions")

print("Attente 5s...")
time.sleep(5)

run("curl -s -H 'X-Api-Key: qapril_wa_secret_2026' http://127.0.0.1:2785/api/sessions/default")

ssh.close()
