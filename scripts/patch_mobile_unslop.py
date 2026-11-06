import re

files = [
    'native_apps/locataire/app/(tabs)/index.tsx',
    'native_apps/locataire/app/(tabs)/receipts.tsx',
    'native_apps/locataire/app/(tabs)/maintenance.tsx',
    'native_apps/locataire/app/(tabs)/profile.tsx',
    'native_apps/proprietaire/app/(tabs)/finance.tsx',
    'native_apps/proprietaire/app/(tabs)/maintenance.tsx',
    'native_apps/proprietaire/app/(tabs)/profile.tsx',
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    orig = content
    # 1. Replace borderRadius: 999 with 8
    content = re.sub(r'borderRadius:\s*999\b', 'borderRadius: 8', content)
    
    # 2. Replace fontWeight 800/900 with 600
    content = re.sub(r"fontWeight:\s*['\"](?:800|900)['\"]", "fontWeight: '600'", content)
    
    # 3. If Sparkles is imported in index.tsx, remove it
    if 'Sparkles,' in content:
        content = content.replace('  Sparkles,\n', '')

    if content != orig:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched: {filepath}")
    else:
        print(f"No changes: {filepath}")

print("Mobile Unslop completed successfully!")

