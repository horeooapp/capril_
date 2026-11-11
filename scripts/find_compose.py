import paramiko
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.77.182.168', port=22, username='root', password='Qap@vpserv2026', disabled_algorithms={'pubkeys': ['rsa-sha2-256', 'rsa-sha2-512']}, timeout=30)
cmd = "find / -name 'docker-compose*.yml' -o -name 'Dockerfile' 2>/dev/null"
stdin, stdout, stderr = ssh.exec_command(cmd)
print("COMPOSE/DOCKERFILES:\n", stdout.read().decode('utf-8'))
ssh.close()
