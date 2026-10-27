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

# 1. Mise à jour du code via git pull dans /opt/qapril
run_cmd("cd /opt/qapril && git fetch origin main && git reset --hard origin/main")

# 2. Rebuild et relance du conteneur Docker app
run_cmd("cd /opt/qapril && docker compose build app && docker compose up -d app")

# 3. Assurer les permissions utilisateur (nextjs:nodejs) sur le volume uploads_data
run_cmd("docker exec -u 0 qapril_app chown -R nextjs:nodejs /app/uploads_data && docker exec -u 0 qapril_app chmod -R 775 /app/uploads_data")

# 4. Vérification du statut du conteneur qapril_app
run_cmd("docker ps --filter name=qapril_app --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'")

ssh.close()
print("\n✅ Mise à jour et déploiement SSH terminés avec succès !")
