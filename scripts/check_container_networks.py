import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.77.182.168', port=22, username='root', password='Qap@vpserv2026', disabled_algorithms={'pubkeys': ['rsa-sha2-256', 'rsa-sha2-512']}, timeout=15)

def run(cmd):
    print(f"=== {cmd} ===")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    print(out[:400] if len(out) > 400 else out)
    if err:
        print("[ERR]", err)
    return out

run("docker inspect qapril_openwa --format '{{range $k, $v := .NetworkSettings.Networks}}{{$k}}: {{$v.IPAddress}} {{end}}'")
run("docker inspect openwa-api --format '{{range $k, $v := .NetworkSettings.Networks}}{{$k}}: {{$v.IPAddress}} {{end}}'")

ssh.close()
