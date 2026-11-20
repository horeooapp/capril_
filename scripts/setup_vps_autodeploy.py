import paramiko
import sys

print("Connecting to VPS...", flush=True)
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(
    '187.77.182.168',
    username='root',
    password='Qap@vpserv2026',
    timeout=30,
    disabled_algorithms={'pubkeys': ['rsa-sha2-256', 'rsa-sha2-512']}
)
print("Connected!", flush=True)

script_content = '''#!/bin/bash
set -e

REPO_DIR="/opt/qapril"
LOCK_FILE="/tmp/qapril_autodeploy.lock"
LOG_FILE="/var/log/qapril-autodeploy.log"

exec >> "$LOG_FILE" 2>&1

if [ -f "$LOCK_FILE" ]; then
    PID=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
    if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
        exit 0
    fi
fi

echo $$ > "$LOCK_FILE"

cleanup() {
    rm -f "$LOCK_FILE"
}
trap cleanup EXIT

cd "$REPO_DIR"

git fetch origin main --quiet 2>/dev/null || exit 0

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
    exit 0
fi

echo "=================================================="
echo "[$(date '+%Y-%m-%d %H:%M:%S')] NOUVELLE VERSION DETECTEE"
echo "Commit local  : $LOCAL"
echo "Commit distant: $REMOTE"
echo "Debut de la mise a jour automatique..."
echo "=================================================="

git reset --hard origin/main

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Reconstruction de l'image Docker..."
docker compose build app

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Redemarrage du conteneur..."
docker compose up -d --no-deps app

sleep 10
CONTAINER_STATUS=$(docker inspect --format='{{.State.Health.Status}}' qapril_app 2>/dev/null || echo "unknown")
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Statut du conteneur: $CONTAINER_STATUS"

echo "=================================================="
echo "[$(date '+%Y-%m-%d %H:%M:%S')] MISE A JOUR TERMINEE AVEC SUCCES"
echo "=================================================="
'''

service_content = '''[Unit]
Description=QAPRIL VPS Auto Deploy on Git Push
After=network.target docker.service

[Service]
Type=oneshot
ExecStart=/opt/qapril/scripts/vps-autodeploy.sh
User=root
WorkingDirectory=/opt/qapril
'''

timer_content = '''[Unit]
Description=Verifie les mises a jour de code QAPRIL toutes les 2 minutes

[Timer]
OnBootSec=1min
OnUnitActiveSec=2min
Persistent=true

[Install]
WantedBy=timers.target
'''

sftp = client.open_sftp()

print("Installation de /opt/qapril/scripts/vps-autodeploy.sh...", flush=True)
with sftp.file('/opt/qapril/scripts/vps-autodeploy.sh', 'w') as f:
    f.write(script_content)
sftp.chmod('/opt/qapril/scripts/vps-autodeploy.sh', 0o755)

print("Installation de /etc/systemd/system/qapril-autodeploy.service...", flush=True)
with sftp.file('/etc/systemd/system/qapril-autodeploy.service', 'w') as f:
    f.write(service_content)

print("Installation de /etc/systemd/system/qapril-autodeploy.timer...", flush=True)
with sftp.file('/etc/systemd/system/qapril-autodeploy.timer', 'w') as f:
    f.write(timer_content)

sftp.close()

print("Activation du timer systemd...", flush=True)
stdin, stdout, stderr = client.exec_command('systemctl daemon-reload && systemctl enable --now qapril-autodeploy.timer && systemctl is-active qapril-autodeploy.timer', get_pty=True)
for line in iter(stdout.readline, ''):
    print(line, end='', flush=True)

client.close()
print("\nTermine avec succes !", flush=True)
