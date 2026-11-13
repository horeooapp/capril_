import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(
    '187.77.182.168',
    port=22,
    username='root',
    password='Qap@vpserv2026',
    disabled_algorithms={'pubkeys': ['rsa-sha2-256', 'rsa-sha2-512']},
    timeout=15,
)

def run(cmd):
    print(f"=== {cmd} ===")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    print(out)
    if err:
        print("[ERR]", err)
    return out

# Check columns on locataire_profiles
run("docker exec -i qapril_postgres psql -U qapril -d qapril -c \"SELECT column_name FROM information_schema.columns WHERE table_name='locataire_profiles';\"")

# Check migrations status & apply
run("cd /opt/qapril && docker compose run --rm migrate npx prisma migrate deploy")

# Or run directly inside the app container or with node if installed on host
run("cd /opt/qapril && docker exec -i qapril_app npx prisma migrate deploy")

# Verify columns again
run("docker exec -i qapril_postgres psql -U qapril -d qapril -c \"SELECT column_name FROM information_schema.columns WHERE table_name='locataire_profiles';\"")

ssh.close()

