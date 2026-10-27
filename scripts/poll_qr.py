import paramiko
import time
import sys

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.77.182.168', port=22, username='root', password='Qap@vpserv2026', disabled_algorithms={'pubkeys': ['rsa-sha2-256', 'rsa-sha2-512']}, timeout=15)

for i in range(4):
    time.sleep(3)
    stdin, stdout, stderr = ssh.exec_command('curl -s -H "x-api-key: qapril_wa_secret_2026" http://127.0.0.1:2785/api/sessions/qapril')
    print(f"Status check {i+1}:", stdout.read().decode('utf-8'))

stdin, stdout, stderr = ssh.exec_command('curl -s http://127.0.0.1:8085/qr')
res = stdout.read().decode('utf-8')
print("BRIDGE QR STATUS:", res[:100])
if "data:image" in res:
    print(">>> QR CODE BASE64 IS LIVE AND READY FOR SCAN! <<<")
else:
    print("Full output:", res)

ssh.close()
