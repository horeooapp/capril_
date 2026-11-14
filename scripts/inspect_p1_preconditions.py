import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('187.77.182.168', username='root', password='Qap@vpserv2026', timeout=30)

def run_sql(sql):
    cmd = f'docker exec -i qapril_postgres psql -U qapril_user -d qapril_preprod -c "{sql}"'
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8')
    err = stderr.read().decode('utf-8')
    return out.strip(), err.strip()

print("1. Users without phone (M-05):")
out, err = run_sql("SELECT count(*) FROM users WHERE phone IS NULL;")
print(out)

print("\n2. Leases exceeding 2 months rent (M-07):")
out, err = run_sql("SELECT count(*) FROM leases WHERE deposit_amount > 2 * rent_amount OR avance_loyer > 2 * rent_amount;")
print(out)

print("\n3. Active mandats per property (M-07):")
out, err = run_sql("SELECT count(*) FROM mandats_gestion WHERE statut = 'ACTIF';")
print(out)

print("\n4. Users with default PROPRIETAIRE (M-09):")
out, err = run_sql("SELECT count(*) FROM users WHERE capacite_active = 'PROPRIETAIRE';")
print(out)

print("\n5. Declarations / CnvMessages with float amounts (M-12):")
out, err = run_sql("SELECT count(*) FROM declarations_paiement WHERE montant != round(montant);")
print(out)

client.close()
