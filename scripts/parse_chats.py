import paramiko
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.77.182.168', port=22, username='root', password='Qap@vpserv2026', disabled_algorithms={'pubkeys': ['rsa-sha2-256', 'rsa-sha2-512']}, timeout=15)

stdin, stdout, stderr = ssh.exec_command("curl -s -H 'X-Api-Key: qapril_wa_secret_2026' 'http://127.0.0.1:2785/api/default/chats?limit=50'")
data = stdout.read().decode('utf-8')
try:
    chats = json.loads(data)
    for c in chats:
        cid = c.get('id', {}).get('_serialized') or c.get('id')
        name = c.get('name') or c.get('formattedTitle')
        if cid and '@c.us' in cid:
            print(f"Chat individuel: {cid} | Nom: {name}")
except Exception as e:
    print("Erreur parse JSON:", e)

ssh.close()
