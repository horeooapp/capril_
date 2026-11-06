import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.77.182.168', port=22, username='root', password='Qap@vpserv2026', disabled_algorithms={'pubkeys': ['rsa-sha2-256', 'rsa-sha2-512']}, timeout=15)
stdin, stdout, stderr = ssh.exec_command('docker logs --tail 200 qapril_app')
out = stdout.read().decode('utf-8', errors='ignore')
for line in out.splitlines():
    if any(k in line.lower() for k in ['agency', 'erreur', 'error', 'candidature', 'propertyaccess', 'agences']):
        print(line)
ssh.close()
