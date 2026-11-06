import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("🚀 Connexion SSH au VPS (187.77.182.168) pour nettoyage du disque...")
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

def run(cmd):
    print(f"\n--- EXEC: {cmd} ---", flush=True)
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)
    while True:
        line = stdout.readline()
        if not line:
            break
        print(line, end="")
        sys.stdout.flush()
    exit_status = stdout.channel.recv_exit_status()
    print(f"[Exit: {exit_status}]", flush=True)
    return exit_status

# 1. Avant nettoyage
print("\n=== ÉTAT AVANT NETTOYAGE ===")
run("df -h /")
run("docker system df")

# 2. Nettoyage du cache de build (63+ Go)
print("\n=== 1. PURGE DU CACHE DE BUILD DOCKER ===")
run("docker builder prune -a -f")

# 3. Nettoyage des images orphelines et inutilisées (> 24h)
print("\n=== 2. PURGE DES IMAGES DOCKER OBSOLÈTES ===")
run("docker image prune -f")
run('docker image prune -a -f --filter "until=24h"')

# 4. Après nettoyage
print("\n=== ÉTAT APRÈS NETTOYAGE ===")
run("df -h /")
run("docker system df")

# 5. Vérification de santé des conteneurs
print("\n=== VÉRIFICATION DES CONTENEURS EN SERVICE ===")
run("docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'")
run("curl -s -o /dev/null -w 'Status API: %{http_code}\n' https://qapril.net/api/health")

ssh.close()
print("\n✅ Nettoyage terminé avec succès !")

