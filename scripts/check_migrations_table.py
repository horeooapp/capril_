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

# Check migration entries in db
run('docker exec -i qapril_postgres psql -U postgres -d qapril -c "SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY started_at;"')

# Check locataire_profiles columns
run('docker exec -i qapril_postgres psql -U postgres -d qapril -c "\d locataire_profiles"')

ssh.close()

