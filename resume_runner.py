import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('187.77.93.154', port=22, username='root', key_filename='github_deploy_key')

commands = [
    "su - github -c \"cd ~/actions-runner && ./config.sh --url https://github.com/horeooapp/capril_ --token B7AEOHWIBKAZASSGCKV2IS3JWDGOO --unattended --name Hostinger-VPS --replace\"",
    "cd /home/github/actions-runner && ./svc.sh install github || true",
    "cd /home/github/actions-runner && ./svc.sh start || true",
    "cd /home/github/actions-runner && ./svc.sh status"
]

for cmd in commands:
    print(f"Executing: {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd)
    
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    
    if out: print(out)
    if err: print("ERR:", err)

client.close()
