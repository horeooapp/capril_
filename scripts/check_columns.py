import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('187.77.182.168', username='root', password='Qap@vpserv2026', timeout=20)

for table in ['properties', 'annonces', 'candidatures', 'leases']:
    cmd = f'docker exec -i qapril_postgres psql -U postgres -d qapril -c "\\d {table}"'
    stdin, stdout, stderr = client.exec_command(cmd)
    print(f'=== TABLE {table} ===')
    out = stdout.read().decode()
    for line in out.split('\n')[:25]:
        print(' ', line)

client.close()

