import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('187.77.182.168', username='root', password='Qap@vpserv2026', timeout=15)

def run(cmd):
    print(f'=== {cmd} ===')
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    if out: print(out)
    if err: print('ERR:', err)

run("docker exec qapril_postgres psql -U postgres -d qapril -c '\\d annonces'")
run("docker exec qapril_postgres psql -U postgres -d qapril -c '\\d leases'")
run("docker exec qapril_postgres psql -U postgres -d qapril -c 'SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = \"properties\" AND column_name LIKE \"%statut%\";'")

client.close()
