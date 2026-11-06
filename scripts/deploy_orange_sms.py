import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("🚀 Connexion SSH au VPS (187.77.182.168)...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(
    '187.77.182.168', 
    port=22, 
    username='root', 
    password='Qap@vpserv2026', 
    disabled_algorithms={'pubkeys': ['rsa-sha2-256', 'rsa-sha2-512']}, 
    timeout=60
)

def run_cmd(cmd):
    print(f"\n--- EXEC: {cmd} ---", flush=True)
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)
    while True:
        line = stdout.readline()
        if not line:
            break
        print(line, end="")
        sys.stdout.flush()
    exit_status = stdout.channel.recv_exit_status()
    print(f"[Exit status: {exit_status}]", flush=True)
    return exit_status

# 1. Mettre à jour .env sur le VPS
print("\n--- Mise à jour des variables Orange SMS dans /opt/qapril/.env ---")
env_patch = """
python3 -c '
with open("/opt/qapril/.env", "r") as f:
    c = f.read()

import re
if "ORANGE_SMS_CLIENT_ID" in c:
    c = re.sub(r"ORANGE_SMS_CLIENT_ID=.*", "ORANGE_SMS_CLIENT_ID=\\\"NwdPqbZaW7ne4xhKMdtQKgjTIWc5l9AZ\\\"", c)
    c = re.sub(r"ORANGE_SMS_CLIENT_SECRET=.*", "ORANGE_SMS_CLIENT_SECRET=\\\"jsik63aaYJpLTRQIglGpi9fN4EEvdLokruZZwfpimMrq\\\"", c)
else:
    c += "\\nORANGE_SMS_CLIENT_ID=\\\"NwdPqbZaW7ne4xhKMdtQKgjTIWc5l9AZ\\\"\\nORANGE_SMS_CLIENT_SECRET=\\\"jsik63aaYJpLTRQIglGpi9fN4EEvdLokruZZwfpimMrq\\\"\\nORANGE_SMS_SENDER_NUMBER=\\\"tel:+22500000000\\\"\\nORANGE_SMS_SENDER_NAME=\\\"QAPRIL\\\"\\n"

if "SMS_GATEWAY_PROVIDER=" in c:
    c = re.sub(r"SMS_GATEWAY_PROVIDER=.*", "SMS_GATEWAY_PROVIDER=\\\"ORANGE\\\"", c)
else:
    c += "\\nSMS_GATEWAY_PROVIDER=\\\"ORANGE\\\"\\n"

with open("/opt/qapril/.env", "w") as f:
    f.write(c)
print("Updated /opt/qapril/.env!")
'
"""
run_cmd(env_patch)

# 2. Git pull / reset
run_cmd("cd /opt/qapril && git fetch origin main && git reset --hard origin/main")

# 3. Docker build & up
run_cmd("cd /opt/qapril && docker compose build app && docker compose up -d app")

# 4. Permissions volume
run_cmd("docker exec -u 0 qapril_app chown -R nextjs:nodejs /app/uploads_data && docker exec -u 0 qapril_app chmod -R 775 /app/uploads_data")

# 5. Statut des conteneurs
run_cmd("docker ps --filter name=qapril_app --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'")

ssh.close()
print("\n✅ Déploiement Orange SMS terminé avec succès !")

