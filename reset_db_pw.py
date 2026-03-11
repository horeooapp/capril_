import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('187.77.93.154', port=22, username='root', key_filename='github_deploy_key')

cmd = "sudo -u postgres psql -c \"ALTER USER qapril_user WITH PASSWORD 'QaprilSecure2026!';\""
print(f"Executing: {cmd}")
stdin, stdout, stderr = client.exec_command(cmd)

out = stdout.read().decode('utf-8', errors='replace')
err = stderr.read().decode('utf-8', errors='replace')

if out: print("OUT:", out.strip())
if err: print("ERR:", err.strip())

client.close()
