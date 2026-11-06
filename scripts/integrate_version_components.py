# 1. Locataire index.tsx: add VersionUpdateModal
with open('native_apps/locataire/app/(tabs)/index.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

if 'VersionUpdateModal' not in text:
    text = text.replace(
        "import { UpdateNotificationBanner } from '../../components/UpdateNotificationBanner';",
        "import { UpdateNotificationBanner } from '../../components/UpdateNotificationBanner';\nimport { VersionUpdateModal } from '../../components/VersionUpdateModal';"
    )
    text = text.replace(
        "<UpdateNotificationBanner />",
        "<UpdateNotificationBanner />\n      <VersionUpdateModal />"
    )
    with open('native_apps/locataire/app/(tabs)/index.tsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Locataire index.tsx updated with VersionUpdateModal")

# 2. Propriétaire index.tsx: add VersionUpdateModal
with open('native_apps/proprietaire/app/(tabs)/index.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

if 'VersionUpdateModal' not in text:
    text = text.replace(
        "import { UpdateNotificationBanner } from '../../components/UpdateNotificationBanner';",
        "import { UpdateNotificationBanner } from '../../components/UpdateNotificationBanner';\nimport { VersionUpdateModal } from '../../components/VersionUpdateModal';"
    )
    text = text.replace(
        "<UpdateNotificationBanner />",
        "<UpdateNotificationBanner />\n      <VersionUpdateModal />"
    )
    with open('native_apps/proprietaire/app/(tabs)/index.tsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Propriétaire index.tsx updated with VersionUpdateModal")

# 3. Locataire profile.tsx: add AppVersionBadge at bottom
with open('native_apps/locataire/app/(tabs)/profile.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

if 'AppVersionBadge' not in text:
    text = text.replace(
        "import { RefreshCw, LogOut, ShieldCheck } from 'lucide-react-native';",
        "import { RefreshCw, LogOut, ShieldCheck } from 'lucide-react-native';\nimport { AppVersionBadge } from '../../components/AppVersionBadge';"
    )
    text = text.replace(
        "</ScrollView>",
        "  <AppVersionBadge />\n      </ScrollView>"
    )
    with open('native_apps/locataire/app/(tabs)/profile.tsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Locataire profile.tsx updated with AppVersionBadge")

# 4. Propriétaire profile.tsx: add AppVersionBadge at bottom
with open('native_apps/proprietaire/app/(tabs)/profile.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

if 'AppVersionBadge' not in text:
    text = text.replace(
        "import { RefreshCw, LogOut, Globe } from 'lucide-react-native';",
        "import { RefreshCw, LogOut, Globe } from 'lucide-react-native';\nimport { AppVersionBadge } from '../../components/AppVersionBadge';"
    )
    text = text.replace(
        "</ScrollView>",
        "  <AppVersionBadge />\n      </ScrollView>"
    )
    with open('native_apps/proprietaire/app/(tabs)/profile.tsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Propriétaire profile.tsx updated with AppVersionBadge")

