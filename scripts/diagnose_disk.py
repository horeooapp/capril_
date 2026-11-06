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
    timeout=30
)

def run(cmd):
    print(f"\n=== CMD: {cmd} ===", flush=True)
    _, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if out:
        print(out, flush=True)
    if err:
        print("[STDERR]", err, flush=True)

run('df -h')
run('docker system df')
run('docker system df -v')
run('du -sh /var/lib/docker/* 2>/dev/null | sort -hr | head -n 10')
run('du -sh /var/log/* 2>/dev/null | sort -hr | head -n 10')
run('find /var/lib/docker/containers/ -name "*-json.log" -exec du -h {} + | sort -hr | head -n 10')
run('du -sh /opt/* 2>/dev/null | sort -hr | head -n 10')

ssh.close()

