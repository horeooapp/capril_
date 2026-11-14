import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('187.77.182.168', username='root', password='Qap@vpserv2026', timeout=30)

queries = [
    ('M-01: UX candidatures vivantes index', "SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'candidatures' AND indexname = 'ux_candidature_vivante';"),
    ('M-02: Check signing_otp column dropped', "SELECT column_name FROM information_schema.columns WHERE table_name = 'leases' AND column_name = 'signing_otp';"),
    ('M-03: Default NON_CERTIFIE on leases', "SELECT column_name, column_default FROM information_schema.columns WHERE table_name = 'leases' AND column_name = 'niveau_certification';"),
    ('M-04-P0: Enums on candidatures and annonces', "SELECT udt_name FROM information_schema.columns WHERE table_name = 'candidatures' AND column_name = 'statut';"),
    ('M-06: Annonce publie_par_id and check constraints', "SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'annonces'::regclass;"),
    ('M-13: Check custom_scripts dropped', "SELECT column_name FROM information_schema.columns WHERE table_name = 'automation_settings' AND column_name = 'custom_scripts';")
]

for title, q in queries:
    stdin, stdout, stderr = client.exec_command(f'docker exec -i qapril_postgres psql -U postgres -d qapril -c "{q}"')
    print(f'=== {title} ===')
    out = stdout.read().decode('utf-8')
    print(out.strip())

client.close()
