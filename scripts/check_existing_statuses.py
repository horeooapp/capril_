import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('187.77.182.168', username='root', password='Qap@vpserv2026', timeout=20)

queries = [
    "SELECT DISTINCT statut FROM candidatures;",
    "SELECT DISTINCT statut FROM annonces;",
    "SELECT DISTINCT statut_position FROM properties;",
    "SELECT DISTINCT niveau_certification FROM leases;",
    "SELECT DISTINCT niveau_certification FROM receipts;"
]

for q in queries:
    cmd = f'docker exec -i qapril_postgres psql -U postgres -d qapril -c "{q}"'
    stdin, stdout, stderr = client.exec_command(cmd)
    print(f'=== {q} ===')
    print(stdout.read().decode())
    err = stderr.read().decode()
    if err:
        print('ERR:', err)

client.close()

