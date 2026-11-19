import os
import re

pattern = re.compile(r'prisma\.lease\.(findMany|findFirst|findUnique)\s*\(\s*\{([^;]+?)\}\s*\)', re.DOTALL)

for root, dirs, files in os.walk('src'):
    for f in files:
        if f.endswith('.ts') or f.endswith('.tsx'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8', errors='ignore') as file:
                content = file.read()
            for m in pattern.finditer(content):
                query_body = m.group(2)
                if 'ACTIVE' in query_body:
                    print(f"=== {path} ===")
                    lines = [line.strip() for line in query_body.split('\n') if any(k in line for k in ['status', 'where', 'find', 'signed', 'deleted'])]
                    for l in lines[:10]:
                        print(f"   {l}")
