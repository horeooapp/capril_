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
    print(out)
    if err:
        print("[ERR]", err)
    return out

# Vérifier si le contact existe via /api/contacts/check-exists
run("""curl -s -X GET "http://127.0.0.1:2785/api/default/contacts/check-exists?phone=2250707334770" \
  -H "X-Api-Key: qapril_wa_secret_2026" """)

# Vérifier get-number-id
run("""curl -s -X GET "http://127.0.0.1:2785/api/default/contacts/about?contactId=2250707334770@c.us" \
  -H "X-Api-Key: qapril_wa_secret_2026" """)

# Tester l'envoi vers son propre numéro WhatsApp (le compte connecté: 2250502641311)
run("""curl -s -X POST http://127.0.0.1:2785/api/sendText \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: qapril_wa_secret_2026" \
  -d '{"session":"default","chatId":"2250502641311@c.us","text":"Test QAPRIL vers soi-meme"}'""")

ssh.close()
