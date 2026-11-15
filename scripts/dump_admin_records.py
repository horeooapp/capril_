import paramiko
import json

host = '187.77.182.168'
user = 'root'
pwd = 'Qap@vpserv2026'

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(host, username=user, password=pwd, timeout=30)

def query(sql):
    stdin, stdout, stderr = c.exec_command(f'docker exec qapril_postgres psql -U postgres -d qapril -t -A -c "{sql}"')
    return stdout.read().decode('utf-8').strip()

# 1. Fetch exact admin rows as JSON
admin_users_json = query("SELECT json_agg(u) FROM (SELECT * FROM users WHERE email IN ('admin@qapril.net', 'fsoumahoro@qapril.net')) u;")
print("=== ADMIN USERS ===")
print(admin_users_json)

# Check accounts for these users
accounts_json = query("SELECT json_agg(a) FROM (SELECT * FROM accounts WHERE user_id IN (SELECT user_id FROM users WHERE email IN ('admin@qapril.net', 'fsoumahoro@qapril.net'))) a;")
print("=== ACCOUNTS ===")
print(accounts_json)

# Check user_capacites for these users
capacites_json = query("SELECT json_agg(c) FROM (SELECT * FROM user_capacites WHERE user_id IN (SELECT user_id FROM users WHERE email IN ('admin@qapril.net', 'fsoumahoro@qapril.net'))) c;")
print("=== USER CAPACITES ===")
print(capacites_json)

c.close()
