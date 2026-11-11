import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.77.182.168', port=22, username='root', password='Qap@vpserv2026', disabled_algorithms={'pubkeys': ['rsa-sha2-256', 'rsa-sha2-512']}, timeout=30)

def run(cmd):
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='ignore').strip()
    err = stderr.read().decode('utf-8', errors='ignore').strip()
    return out, err

print("--- VPS GIT LOG ---")
out, _ = run("cd /opt/capril_ && git log -n 1 --oneline")
print(out)

print("\n--- VPS GIT STATUS ---")
out, _ = run("cd /opt/capril_ && git status -s")
print(out if out else "Clean working directory")

print("\n--- VPS DOCKER CONTAINERS ---")
out, _ = run("docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'")
print(out)

print("\n--- VPS PRISMA STATUS ---")
out, _ = run("cd /opt/capril_ && npx prisma status || true")
print(out)

ssh.close()
