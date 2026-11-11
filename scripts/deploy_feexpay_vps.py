import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.77.182.168', port=22, username='root', password='Qap@vpserv2026', disabled_algorithms={'pubkeys': ['rsa-sha2-256', 'rsa-sha2-512']}, timeout=30)

def run(cmd):
    print(f"\n>>> Running: {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='ignore').strip()
    err = stderr.read().decode('utf-8', errors='ignore').strip()
    if out:
        print(out)
    if err:
        print(f"[stderr] {err}")
    return out, err

work_dir = "/opt/qapril"

# 1. Reset code on VPS
run(f"cd {work_dir} && git fetch origin main && git reset --hard origin/main")

# 2. Update .env on VPS
update_script = """
import re

env_file = '/opt/qapril/.env'
try:
    with open(env_file, 'r') as f:
        content = f.read()
except Exception:
    content = ''

keys = {
    'FEEXPAY_API_KEY': 'test_key_lhENfeDwvWmkGKppWioKx4dZ7HweD1WWZuQ2OpzThJ5EGuIATTBceb7QmREfA7ga',
    'FEEXPAY_SHOP_ID': '6qaYdqMwX6byG7Q',
    'FEEXPAY_SANDBOX': 'false',
    'DEFAULT_PAYMENT_AGGREGATOR': 'FEEXPAY',
    'NEXT_PUBLIC_PAYMENT_MODE': 'production',
}

for k, v in keys.items():
    pattern = r'^' + k + r'=.*'
    replacement = k + '="' + v + '"'
    if re.search(pattern, content, flags=re.MULTILINE):
        content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
    else:
        content += '\\n' + replacement

with open(env_file, 'w') as f:
    f.write(content)
print('Updated /opt/qapril/.env successfully.')
"""

sftp = ssh.open_sftp()
with sftp.file('/tmp/update_feexpay_env.py', 'w') as f:
    f.write(update_script)
sftp.close()

run("python3 /tmp/update_feexpay_env.py")

# 3. Check Docker containers
run("docker ps --format 'table {{.Names}}\t{{.Status}}'")

# 4. Restart app container
run(f"cd {work_dir} && docker compose restart app || docker restart qapril_app")

# 5. Check Docker containers again
run("docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'")

ssh.close()
print("\nVPS Deploy Finished.")
