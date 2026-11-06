import os, re

patterns = [
    (r'borderRadius:\s*999', 'borderRadius: 999'),
    (r"fontWeight:\s*['\"](?:800|900)['\"]", 'fontWeight 800/900'),
    (r'animate-pulse', 'animate-pulse'),
    (r'animate-ping', 'animate-ping'),
    (r'hover:-translate-y', 'hover:-translate-y'),
    (r'font-black', 'font-black')
]

dirs_to_scan = [
    'native_apps/locataire/app',
    'native_apps/proprietaire/app',
    'src/app/admin',
    'src/components/dashboard'
]

targets = []
for d in dirs_to_scan:
    for root, dirs, files in os.walk(d):
        if 'node_modules' in dirs: dirs.remove('node_modules')
        if '.expo' in dirs: dirs.remove('.expo')
        if '.next' in dirs: dirs.remove('.next')
        for f in files:
            if f.endswith(('.tsx', '.ts', '.css')):
                targets.append(os.path.join(root, f))

print(f"Auditing {len(targets)} targeted source files...")
for f in targets:
    try:
        content = open(f, 'r', encoding='utf-8').read()
        issues = []
        for p, label in patterns:
            cnt = len(re.findall(p, content))
            if cnt > 0:
                issues.append(f"{cnt}x {label}")
        if issues:
            print(f"{f}: {', '.join(issues)}")
    except Exception as e:
        pass
