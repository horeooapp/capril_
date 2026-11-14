import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('187.77.182.168', username='root', password='Qap@vpserv2026', timeout=20)

# Try inserting duplicate living candidature for candidat 88c9fd8c on annonce 8bb932b1
cmd = '''docker exec -i qapril_postgres psql -U postgres -d qapril -c "
INSERT INTO candidatures (cand_id, logement_id, annonce_id, candidat_id, nom, prenom, telephone, statut)
VALUES ('00000000-0000-0000-0000-000000000099', '64be7ed2-2eb0-4aff-b4f7-3b685274e19b', '8bb932b1-c538-409c-b81f-af4957664e8a', '88c9fd8c-a3d3-4a3a-bcfe-0dbdec945ed8', 'Test', 'Doublon', '+22501020304', 'ENVOYEE');
"'''

stdin, stdout, stderr = client.exec_command(cmd)
out = stdout.read().decode()
err = stderr.read().decode()

print('OUTPUT:\n', out)
print('ERROR (expected 23505):\n', err)

client.close()

