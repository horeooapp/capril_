import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(
    '187.77.182.168',
    port=22,
    username='root',
    password='Qap@vpserv2026',
    disabled_algorithms={'pubkeys': ['rsa-sha2-256', 'rsa-sha2-512']},
    timeout=15
)

stdin, stdout, stderr = ssh.exec_command('docker exec -i qapril_postgres psql -U postgres -d qapril -c "SELECT * FROM declarations_paiement LIMIT 1;"')
print(stdout.read().decode())
err = stderr.read().decode()
if err: print('ERR:', err)
ssh.close()
