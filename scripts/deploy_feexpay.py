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
if ssh.get_transport():
    ssh.get_transport().set_keepalive(10)

def run_cmd(cmd):
    print(f"\n--- EXEC: {cmd} ---")
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)
    while True:
        line = stdout.readline()
        if not line:
            break
        print(line, end="")
        sys.stdout.flush()
    exit_status = stdout.channel.recv_exit_status()
    print(f"\n[Exit status: {exit_status}]")
    return exit_status

# 1. Git pull
run_cmd("cd /opt/qapril && git fetch origin main && git reset --hard origin/main")

# 2. Mise à jour des variables d'environnement FeexPay sur le VPS
feexpay_env = """
# FeexPay
FEEXPAY_API_KEY="test_Hg7Kjl3ZAM63UuIUpuudD9nKuu3ZAM67Kjl3Uuhn"
FEEXPAY_SHOP_ID="698dd650a7ffb88696f5id86"
FEEXPAY_SANDBOX="true"
"""

# Vérifier si déjà présent
stdin, stdout, stderr = ssh.exec_command("grep -c FEEXPAY_API_KEY /opt/qapril/.env 2>/dev/null || echo 0")
count = stdout.read().decode().strip()
print(f"\nFEEXPAY in .env: {count}")

if count == "0":
    run_cmd(f'echo \'{feexpay_env.strip()}\' >> /opt/qapril/.env')
    print("✅ Variables FeexPay ajoutées au .env du VPS")
else:
    print("ℹ️ Variables FeexPay déjà présentes dans .env")

# 3. Rebuild et redémarrage du conteneur
run_cmd("cd /opt/qapril && docker compose build app && docker compose up -d app")

# 4. Permissions uploads
run_cmd("docker exec -u 0 qapril_app chown -R nextjs:nodejs /app/uploads_data && docker exec -u 0 qapril_app chmod -R 775 /app/uploads_data")

# 5. Vérification
run_cmd("docker ps --filter name=qapril_app --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'")

ssh.close()
print("\n✅ Déploiement FeexPay terminé avec succès !")

