# 1. Patch native_apps/locataire/app/(tabs)/index.tsx
with open('native_apps/locataire/app/(tabs)/index.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

if 'UpdateNotificationBanner' not in code:
    code = code.replace(
        "import { useRouter } from 'expo-router';",
        "import { useRouter } from 'expo-router';\nimport { UpdateNotificationBanner } from '../../components/UpdateNotificationBanner';"
    )
    # Insert banner after header close
    header_end = '</View>\n\n      {/* MENU MOBILE DÉROULANT / TIROIR */}'
    replacement = '</View>\n\n      {/* BANNIÈRE MISE À JOUR DISPONIBLE */}\n      <UpdateNotificationBanner />\n\n      {/* MENU MOBILE DÉROULANT / TIROIR */}'
    if header_end in code:
        code = code.replace(header_end, replacement, 1)
    else:
        # Fallback if whitespace differs
        code = code.replace('onRequestClose={() => setMenuOpen(false)}', 'onRequestClose={() => setMenuOpen(false)}')
        idx = code.find('      {/* MENU MOBILE DÉROULANT / TIROIR */}')
        if idx != -1:
            code = code[:idx] + '      <UpdateNotificationBanner />\n\n' + code[idx:]

with open('native_apps/locataire/app/(tabs)/index.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
print("locataire index.tsx patched!")

# 2. Patch native_apps/proprietaire/app/(tabs)/index.tsx
with open('native_apps/proprietaire/app/(tabs)/index.tsx', 'r', encoding='utf-8') as f:
    prop_code = f.read()

if 'UpdateNotificationBanner' not in prop_code:
    prop_code = prop_code.replace(
        "import { useRouter, useLocalSearchParams } from 'expo-router';",
        "import { useRouter, useLocalSearchParams } from 'expo-router';\nimport { UpdateNotificationBanner } from '../../components/UpdateNotificationBanner';"
    )
    if 'UpdateNotificationBanner' not in prop_code:
        prop_code = prop_code.replace(
            "import { useRouter } from 'expo-router';",
            "import { useRouter } from 'expo-router';\nimport { UpdateNotificationBanner } from '../../components/UpdateNotificationBanner';"
        )
    
    idx = prop_code.find('      {/* MENU MOBILE DÉROULANT / TIROIR DE GAUCHE */}')
    if idx != -1:
        prop_code = prop_code[:idx] + '      {/* BANNIÈRE MISE À JOUR DISPONIBLE */}\n      <UpdateNotificationBanner />\n\n' + prop_code[idx:]

with open('native_apps/proprietaire/app/(tabs)/index.tsx', 'w', encoding='utf-8') as f:
    f.write(prop_code)
print("proprietaire index.tsx patched!")

