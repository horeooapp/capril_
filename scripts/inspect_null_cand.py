import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('187.77.182.168', username='root', password='Qap@vpserv2026', timeout=20)

cmd = 'docker exec -i qapril_postgres psql -U postgres -d qapril -c "SELECT cand_id, logement_id, annonce_id, candidat_id, nom, prenom, statut FROM candidatures;"'
stdin, stdout, stderr = client.exec_command(cmd)
print('CANDIDATURES:\n', stdout.read().decode())

cmd2 = 'docker exec -i qapril_postgres psql -U postgres -d qapril -c "SELECT annonce_id, logement_id, statut FROM annonces;"'
stdin, stdout, stderr = client.exec_command(cmd2)
print('ANNONCES:\n', stdout.read().decode())

client.close()

