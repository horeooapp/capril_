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

# Tester l'envoi de 0707334770 via le bridge avec le fallback intelligent
run("""curl -s -X POST http://127.0.0.1:8085/sendText \
  -H "Content-Type: application/json" \
  -d '{"chatId":"2250707334770@c.us","text":"🚀 Test QAPRIL reussi vers 0707334770 !"}'""")

ssh.close()
