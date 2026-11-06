import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.77.182.168', port=22, username='root', password='Qap@vpserv2026', disabled_algorithms={'pubkeys': ['rsa-sha2-256', 'rsa-sha2-512']}, timeout=15)

stdin, stdout, stderr = ssh.exec_command('docker exec qapril_redis redis-cli keys "*ratelimit*"')
keys = stdout.read().decode().strip().split()
print("Total ratelimit keys:", len(keys))
for k in keys[:20]:
    stdin, stdout, stderr = ssh.exec_command(f'docker exec qapril_redis redis-cli get "{k}"')
    val = stdout.read().decode().strip()
    stdin, stdout, stderr = ssh.exec_command(f'docker exec qapril_redis redis-cli ttl "{k}"')
    ttl = stdout.read().decode().strip()
    print(f"Key: {k} -> Val: {val}, TTL: {ttl}s")

ssh.close()

