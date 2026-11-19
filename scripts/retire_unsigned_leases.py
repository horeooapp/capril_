import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(
    '187.77.182.168',
    port=22,
    username='root',
    password='Qap@vpserv2026',
    disabled_algorithms={'pubkeys': ['rsa-sha2-256', 'rsa-sha2-512']},
    timeout=15
)

sql = """
BEGIN;

-- 1. Retirer tous les baux non bilatéralement signés
UPDATE leases
SET 
    status = 'CANCELLED',
    deleted_at = NOW()
WHERE is_signed_electronically = false OR signed_at IS NULL;

-- 2. Libérer les propriétés indûment marquées comme louées
UPDATE properties
SET status = 'ACTIVE'
WHERE property_id IN (
    '27cc2565-6b8d-479d-a34c-b7db04d03b1a',
    'edf04ab9-2725-4e23-83ac-8b9e8e18e8a4'
) AND status = 'rented';

COMMIT;
"""

stdin, stdout, stderr = ssh.exec_command('docker exec -i qapril_postgres psql -U postgres -d qapril')
stdin.write(sql)
stdin.channel.shutdown_write()
print("SQL OUT:", stdout.read().decode())
err = stderr.read().decode()
if err:
    print("SQL ERR:", err)

# Check remaining active leases
stdin, stdout, stderr = ssh.exec_command('docker exec -i qapril_postgres psql -U postgres -d qapril -c "SELECT lease_id, lease_reference, status, is_signed_electronically, signed_at, deleted_at FROM leases;"')
print("\n=== ETAT DES BAUX DANS LA BASE ===")
print(stdout.read().decode())

# Check properties
stdin, stdout, stderr = ssh.exec_command('docker exec -i qapril_postgres psql -U postgres -d qapril -c "SELECT property_id, name, status FROM properties WHERE property_id IN (\'27cc2565-6b8d-479d-a34c-b7db04d03b1a\', \'edf04ab9-2725-4e23-83ac-8b9e8e18e8a4\');"')
print("\n=== ETAT DES PROPRIETES ===")
print(stdout.read().decode())

ssh.close()
