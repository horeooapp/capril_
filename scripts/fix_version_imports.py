# 1. Clean AppVersionBadge.tsx for locataire
with open('native_apps/locataire/components/AppVersionBadge.tsx', 'r', encoding='utf-8') as f:
    text = f.read()
text = text.replace("import * as Clipboard from 'expo-clipboard';\n", "")
text = text.replace("import { Info, Sparkles, Download } from 'lucide-react-native';\n", "")
with open('native_apps/locataire/components/AppVersionBadge.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

# 2. Fix profile.tsx for locataire
with open('native_apps/locataire/app/(tabs)/profile.tsx', 'r', encoding='utf-8') as f:
    text = f.read()
if 'import { AppVersionBadge }' not in text:
    text = "import { AppVersionBadge } from '../../components/AppVersionBadge';\n" + text
    with open('native_apps/locataire/app/(tabs)/profile.tsx', 'w', encoding='utf-8') as f:
        f.write(text)

# 3. Fix profile.tsx for proprietaire
with open('native_apps/proprietaire/app/(tabs)/profile.tsx', 'r', encoding='utf-8') as f:
    text = f.read()
if 'import { AppVersionBadge }' not in text:
    text = "import { AppVersionBadge } from '../../components/AppVersionBadge';\n" + text
    with open('native_apps/proprietaire/app/(tabs)/profile.tsx', 'w', encoding='utf-8') as f:
        f.write(text)

print("Imports fixed!")

