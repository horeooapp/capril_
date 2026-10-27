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

run('docker exec qapril_openwa which chromium || docker exec qapril_openwa which google-chrome-stable || docker exec qapril_openwa which chromium-browser')
run('docker exec qapril_openwa cat /app/server.js | head -n 30')
run('find / -name "chrome-wrapper*" 2>/dev/null')

ssh.close()
