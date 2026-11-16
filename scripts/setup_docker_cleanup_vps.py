import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("🚀 Connexion au VPS 187.77.182.168 pour installer le système de purge automatique Docker...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(
    '187.77.182.168',
    port=22,
    username='root',
    password='Qap@vpserv2026',
    disabled_algorithms={'pubkeys': ['rsa-sha2-256', 'rsa-sha2-512']},
    timeout=30
)

script_sh = """#!/usr/bin/env bash
# ==============================================================================
# QAPRIL — Nettoyage automatique du cache et des images orphelines Docker
# Emplacement : /usr/local/bin/qapril-docker-cleanup.sh
# ==============================================================================
set -euo pipefail

LOG_FILE="/var/log/qapril-docker-cleanup.log"
exec >> "$LOG_FILE" 2>&1

DATE=$(date '+%Y-%m-%d %H:%M:%S')
echo "================================================================="
echo "[$DATE] Lancement de la purge automatique du cache Docker..."

# 1. Utilisation avant purge
echo "--- Utilisation avant purge :"
docker system df

# 2. Purge du cache de construction (BuildKit) plafonné à 2 Go max
echo "--- Nettoyage du build cache Docker..."
docker builder prune -a -f --max-used-space 2GB || true

# 3. Suppression des images orphelines/dangling (<none>:<none>)
echo "--- Nettoyage des images orphelines..."
docker image prune -f || true


# 4. Suppression des conteneurs arrêtés (ex: conteneurs 'migrate' terminés)
echo "--- Nettoyage des conteneurs stoppés..."
docker container prune -f || true

# 5. Utilisation après purge
echo "--- Utilisation après purge :"
docker system df

# 6. Rotation du journal si taille > 10 Mo
if [ -f "$LOG_FILE" ] && [ $(stat -c%s "$LOG_FILE") -gt 10485760 ]; then
  tail -n 2000 "$LOG_FILE" > "${LOG_FILE}.tmp" && mv "${LOG_FILE}.tmp" "$LOG_FILE"
fi

echo "[$DATE] Purge du cache Docker terminée avec succès."
echo "================================================================="
"""

service_unit = """[Unit]
Description=QAPRIL - Nettoyage automatique du cache Docker
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
ExecStart=/usr/local/bin/qapril-docker-cleanup.sh
StandardOutput=journal
StandardError=journal
"""

timer_unit = """[Unit]
Description=QAPRIL - Déclencheur quotidien de nettoyage du cache Docker
Requires=qapril-docker-cleanup.service

[Timer]
OnCalendar=*-*-* 03:30:00
Persistent=true
RandomizedDelaySec=15m

[Install]
WantedBy=timers.target
"""

print("📦 Déploiement du script et des unités systemd...")
sftp = ssh.open_sftp()
with sftp.file('/usr/local/bin/qapril-docker-cleanup.sh', 'w') as f:
    f.write(script_sh)
with sftp.file('/etc/systemd/system/qapril-docker-cleanup.service', 'w') as f:
    f.write(service_unit)
with sftp.file('/etc/systemd/system/qapril-docker-cleanup.timer', 'w') as f:
    f.write(timer_unit)
sftp.close()

def run_cmd(cmd):
    print(f"\n--- EXEC: {cmd} ---")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if out:
        print(out.strip())
    if err:
        print(f"[STDERR]: {err.strip()}")

run_cmd("chmod +x /usr/local/bin/qapril-docker-cleanup.sh")
run_cmd("systemctl daemon-reload")
run_cmd("systemctl enable --now qapril-docker-cleanup.timer")
run_cmd("systemctl list-timers --no-pager | grep -E 'UNIT|qapril'")
run_cmd("/usr/local/bin/qapril-docker-cleanup.sh")
run_cmd("cat /var/log/qapril-docker-cleanup.log | tail -n 25")

ssh.close()
print("\n✅ Système de purge automatique du cache Docker installé et opérationnel !")
