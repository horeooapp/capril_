import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.77.182.168', port=22, username='root', password='Qap@vpserv2026', disabled_algorithms={'pubkeys': ['rsa-sha2-256', 'rsa-sha2-512']}, timeout=15)

def run(cmd):
    print(f'=== CMD: {cmd} ===')
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    print(out)
    if err:
        print('[ERR]', err)
    return out

script = """
fetch('http://openwa:8085/qr')
  .then(r => r.json())
  .then(d => {
    console.log('CONNECTED:', d.connected);
    console.log('STATUS:', d.status);
    console.log('HAS QR:', Boolean(d.qr));
    if (d.qr) console.log('QR PREFIX:', d.qr.substring(0, 50));
  })
  .catch(console.error);
"""

sftp = ssh.open_sftp()
with sftp.file('/tmp/verify_from_app.js', 'w') as f:
    f.write(script)
sftp.close()

run('docker cp /tmp/verify_from_app.js qapril_app:/tmp/verify_from_app.js')
run('docker exec qapril_app node /tmp/verify_from_app.js')

ssh.close()
