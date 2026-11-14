import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('187.77.182.168', username='root', password='Qap@vpserv2026', timeout=20)

cmd = 'docker exec -i qapril_postgres psql -U postgres -d qapril -c "SELECT count(*) AS users FROM users; SELECT count(*) AS candidatures FROM candidatures; SELECT count(*) AS annonces FROM annonces; SELECT count(*) AS leases FROM leases;"'
stdin, stdout, stderr = client.exec_command(cmd)
print('STDOUT:\n', stdout.read().decode())
err = stderr.read().decode()
if err:
    print('STDERR:\n', err)
client.close()

