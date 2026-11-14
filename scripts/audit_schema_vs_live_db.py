import paramiko
import re

host = '187.77.182.168'
user = 'root'
pwd = 'Qap@vpserv2026'

print('Connecting to VPS...')
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(host, username=user, password=pwd, timeout=30)

def query_db(sql):
    stdin, stdout, stderr = c.exec_command(f'docker exec qapril_postgres psql -U postgres -d qapril -t -A -c "{sql}"')
    return stdout.read().decode('utf-8').strip().splitlines()

# 1. Fetch all tables and columns from information_schema
db_cols_raw = query_db("SELECT table_name || '.' || column_name FROM information_schema.columns WHERE table_schema = 'public';")
db_columns = set(db_cols_raw)
print(f'Total columns in live DB: {len(db_columns)}')

# 2. Parse prisma/schema.prisma
with open('prisma/schema.prisma', 'r', encoding='utf-8') as f:
    schema_text = f.read()

# Map model name to @@map or lowercase table name
models = re.findall(r'model\s+(\w+)\s+\{([^}]+)\}', schema_text)

mismatches = []
for model_name, body in models:
    # check @@map
    table_map_match = re.search(r'@@map\("([^"]+)"\)', body)
    if table_map_match:
        table_name = table_map_match.group(1)
    else:
        # Prisma default table naming (often lowercase or exact model_name)
        # Check which exists in DB
        if model_name.lower() in [c.split('.')[0] for c in db_columns]:
            table_name = model_name.lower()
        elif model_name in [c.split('.')[0] for c in db_columns]:
            table_name = model_name
        else:
            table_name = model_name.lower()

    for line in body.splitlines():
        line = line.strip()
        if not line or line.startswith('//') or line.startswith('@@'):
            continue
        parts = line.split()
        if len(parts) >= 2:
            field_name = parts[0]
            field_type = parts[1]
            # Ignore relation fields (capitalized type that is another model or array)
            if field_type[0].isupper() and not field_type.startswith(('String', 'Int', 'Float', 'Boolean', 'DateTime', 'Json', 'Decimal', 'BigInt')):
                # Check if it's an enum or relation
                # If it's a relation, ignore
                if '@relation' in line or field_type.endswith('[]'):
                    continue
            map_match = re.search(r'@map\("([^"]+)"\)', line)
            col_name = map_match.group(1) if map_match else field_name

            # Check if col exists in DB
            target = f'{table_name}.{col_name}'
            if target not in db_columns:
                # Let's check case-insensitive
                found = False
                for existing in db_columns:
                    if existing.lower() == target.lower():
                        found = True
                        break
                if not found and table_name in [c.split('.')[0] for c in db_columns]:
                    mismatches.append((model_name, table_name, field_name, col_name, line))

print(f'\nMismatches found: {len(mismatches)}')
for m in mismatches:
    print(f'Model: {m[0]} -> Table: {m[1]} | Field: {m[2]} (Col: {m[3]})')
    print(f'   Line: {m[4]}')

c.close()
