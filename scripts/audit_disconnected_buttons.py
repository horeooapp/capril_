import os
import re

dirs = ['src/app/admin', 'src/app/dashboard', 'src/app/mon-espace-locataire', 'src/components']
dummy_patterns = [
    (re.compile(r'href=[\'"]#[\'"]'), 'href="#"'),
    (re.compile(r'onClick=\{\s*\(\)\s*=>\s*\{\s*\}\s*\}'), 'onClick={() => {}}'),
    (re.compile(r'onClick=\{\s*\(\)\s*=>\s*alert\('), 'onClick alert(...)'),
    (re.compile(r'toast\.(?:info|warning|error)\([\'"][^\'"]*(?:bientôt|prochainement|non disponible|coming soon|développement)[^\'"]*[\'"]', re.IGNORECASE), 'toast "bientôt disponible"'),
    (re.compile(r'//\s*TODO:?\s*(?:connect|db|action|api|prisma)', re.IGNORECASE), 'TODO DB/API'),
    (re.compile(r'console\.log\([\'"]TODO', re.IGNORECASE), 'console.log TODO')
]

findings = []

for d in dirs:
    for root, _, files in os.walk(d):
        for f in files:
            if f.endswith('.tsx') or f.endswith('.ts'):
                path = os.path.join(root, f)
                with open(path, 'r', encoding='utf-8', errors='ignore') as fl:
                    content = fl.read()
                    for pat, desc in dummy_patterns:
                        matches = pat.findall(content)
                        if matches:
                            findings.append((path, desc, len(matches)))

findings.sort(key=lambda x: x[0])
print(f"Total files with potential disconnected features: {len(findings)}\n")
for p, desc, count in findings:
    print(f"{p} -> {desc} ({count})")

