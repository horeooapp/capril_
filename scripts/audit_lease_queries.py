import os
import re

src_dir = 'src'
results = []

pattern = re.compile(r'prisma\.lease\.(findMany|findFirst|findUnique)\s*\(\s*\{', re.MULTILINE)

for root, dirs, files in os.walk(src_dir):
    for f in files:
        if f.endswith('.ts') or f.endswith('.tsx'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8', errors='ignore') as file:
                content = file.read()
                matches = list(pattern.finditer(content))
                if matches:
                    results.append((path, len(matches)))

print(f"Found {sum(r[1] for r in results)} prisma.lease queries across {len(results)} files:")
for path, count in sorted(results, key=lambda x: x[0]):
    print(f"  {path} ({count})")
