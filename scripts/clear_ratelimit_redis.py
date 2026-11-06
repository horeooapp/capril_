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

stdin, stdout, stderr = ssh.exec_command('docker exec qapril_redis redis-cli --scan --pattern "qapril:ratelimit:*"')
keys = stdout.read().decode('utf-8', errors='replace').strip().split()
print('Found ratelimit keys:', keys)
for k in keys:
    if k:
        ssh.exec_command(f'docker exec qapril_redis redis-cli del "{k}"')
print('Deleted ratelimit keys successfully.')
ssh.close()

