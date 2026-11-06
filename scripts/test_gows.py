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

# Démarrer un test WAHA avec GOWS
run("docker rm -f openwa-gows 2>/dev/null || true")
run("""docker run -d --name openwa-gows \
  -p 127.0.0.1:2786:3000 \
  -e WHATSAPP_DEFAULT_ENGINE=GOWS \
  -e WAHA_PRINT_QR=true \
  -e WAHA_API_KEY=qapril_wa_secret_2026 \
  devlikeapro/waha:latest""")

print("Attente 5s...")
time.sleep(5)

run("curl -s -H 'X-Api-Key: qapril_wa_secret_2026' http://127.0.0.1:2786/api/version")
run("curl -s -X POST -H 'Content-Type: application/json' -H 'X-Api-Key: qapril_wa_secret_2026' -d '{\"name\":\"default\",\"start\":true}' http://127.0.0.1:2786/api/sessions")

print("Attente 3s...")
time.sleep(3)

run("curl -s -H 'X-Api-Key: qapril_wa_secret_2026' http://127.0.0.1:2786/api/sessions/default")

ssh.close()
