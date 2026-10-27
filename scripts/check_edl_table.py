import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.77.182.168', port=22, username='root', password='Qap@vpserv2026', disabled_algorithms={'pubkeys': ['rsa-sha2-256', 'rsa-sha2-512']}, timeout=15)

def exec_cmd(cmd):
    print(">>>", cmd)
    stdin, stdout, stderr = ssh.exec_command(cmd)
    print(stdout.read().decode('utf-8', errors='replace'))
    err = stderr.read().decode('utf-8', errors='replace')
    if err:
        print("[ERR]", err)

exec_cmd("docker exec qapril_postgres psql -U qapril_user -d qapril -c \"SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND (table_name LIKE '%edl%' OR table_name LIKE '%etat%' OR table_name LIKE '%inspect%');\"")

ssh.close()
