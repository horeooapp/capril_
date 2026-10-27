import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.77.182.168', port=22, username='root', password='Qap@vpserv2026', disabled_algorithms={'pubkeys': ['rsa-sha2-256', 'rsa-sha2-512']}, timeout=15)

def run(cmd):
    print(f'=== CMD: {cmd} ===')
    stdin, stdout, stderr = ssh.exec_command(cmd)
    print(stdout.read().decode('utf-8'))
    err = stderr.read().decode('utf-8')
    if err:
        print('[ERR]', err)

run('docker inspect qapril_openwa --format "{{json .NetworkSettings.Networks}}"')
run('docker inspect qapril_app --format "{{json .NetworkSettings.Networks}}"')
run('docker inspect qapril_openwa --format "{{json .Mounts}}"')
run('find /root /var/www /srv /opt /docker /home -maxdepth 4 -name "docker-compose*" 2>/dev/null')
run('docker exec qapril_openwa ls -la /app')
run('docker logs qapril_openwa --tail=40')

ssh.close()
