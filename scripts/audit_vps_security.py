import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')

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

def run_cmd(title, cmd):
    print(f"\n{'='*60}\n🔍 {title}\n{'='*60}")
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)
    out = stdout.read().decode('utf-8', errors='replace')
    print(out)
    return out

run_cmd("Traefik config or rules", "find / -name 'traefik.yml' -o -name 'traefik.toml' -o -name 'dynamic_conf.yml' 2>/dev/null")
run_cmd("Traefik file inspection", "docker inspect traefik-soez-traefik-1 --format '{{json .Mounts}}' 2>/dev/null")
run_cmd("QAPRIL Traefik Labels", "docker inspect qapril_app --format '{{json .Config.Labels}}' 2>/dev/null")
run_cmd("Cron Jobs on VPS", "crontab -l; ls -la /etc/cron.* 2>/dev/null")

ssh.close()
