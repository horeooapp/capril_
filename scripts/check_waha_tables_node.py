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

run('docker exec openwa-api node -e \'
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("/app/.sessions/noweb/waha.sqlite3");
db.all("SELECT name FROM sqlite_master WHERE type=\\"table\\"", [], (err, rows) => {
    if (err) console.error(err);
    else console.log(rows);
});
\' 2>&1')

ssh.close()
