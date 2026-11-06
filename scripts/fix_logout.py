import os

# 1. Update native_apps/locataire/app/(tabs)/profile.tsx
p_loc_profile = 'native_apps/locataire/app/(tabs)/profile.tsx'
with open(p_loc_profile, 'r', encoding='utf-8') as f:
    c = f.read()

# Add Platform import
if 'Platform,' not in c:
    c = c.replace('import {\n  View,', 'import {\n  Platform,\n  View,').replace('import {\r\n  View,', 'import {\r\n  Platform,\r\n  View,')

# Replace handleLogout
target_logout = """  const handleLogout = async () => {
    await clearAppSessionAndCache();
    if (typeof window !== 'undefined') {
      window.location.replace('/');
    } else {
      router.replace('/');
    }
  };"""

replacement_loc_profile = """  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter de votre compte locataire ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAppSessionAndCache();
            } catch (err) {
              console.warn('Erreur clearAppSessionAndCache:', err);
            }
            if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
              window.location.href = '/';
            } else {
              try {
                if (router.canDismiss()) {
                  router.dismissAll();
                }
              } catch {}
              router.replace('/');
            }
          },
        },
      ]
    );
  };"""

c = c.replace(target_logout.replace('\r\n', '\n'), replacement_loc_profile)
c = c.replace(target_logout.replace('\n', '\r\n'), replacement_loc_profile.replace('\n', '\r\n'))

with open(p_loc_profile, 'w', encoding='utf-8') as f:
    f.write(c)
print('Updated locataire profile.tsx')


# 2. Update native_apps/locataire/app/(tabs)/index.tsx
p_loc_index = 'native_apps/locataire/app/(tabs)/index.tsx'
with open(p_loc_index, 'r', encoding='utf-8') as f:
    c = f.read()

if 'Platform,' not in c:
    c = c.replace('import {\n  View,', 'import {\n  Platform,\n  View,').replace('import {\r\n  View,', 'import {\r\n  Platform,\r\n  View,')

target_loc_drawer = """                onPress={async () => {
                  setMenuOpen(false);
                  await clearAppSessionAndCache();
                  if (typeof window !== 'undefined') {
                    window.location.replace('/');
                  } else {
                    router.replace('/');
                  }
                }}"""

replacement_loc_drawer = """                onPress={() => {
                  setMenuOpen(false);
                  Alert.alert(
                    'Déconnexion',
                    'Voulez-vous fermer votre session mobile locataire ?',
                    [
                      { text: 'Annuler', style: 'cancel' },
                      {
                        text: 'Se déconnecter',
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            await clearAppSessionAndCache();
                          } catch (err) {
                            console.warn('Erreur clearAppSessionAndCache:', err);
                          }
                          if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
                            window.location.href = '/';
                          } else {
                            try {
                              if (router.canDismiss()) {
                                router.dismissAll();
                              }
                            } catch {}
                            router.replace('/');
                          }
                        },
                      },
                    ]
                  );
                }}"""

c = c.replace(target_loc_drawer.replace('\r\n', '\n'), replacement_loc_drawer)
c = c.replace(target_loc_drawer.replace('\n', '\r\n'), replacement_loc_drawer.replace('\n', '\r\n'))

with open(p_loc_index, 'w', encoding='utf-8') as f:
    f.write(c)
print('Updated locataire (tabs)/index.tsx')


# 3. Update native_apps/proprietaire/app/(tabs)/profile.tsx
p_prop_profile = 'native_apps/proprietaire/app/(tabs)/profile.tsx'
with open(p_prop_profile, 'r', encoding='utf-8') as f:
    c = f.read()

if 'Platform,' not in c:
    c = c.replace('import {\n  View,', 'import {\n  Platform,\n  View,').replace('import {\r\n  View,', 'import {\r\n  Platform,\r\n  View,')

replacement_prop_profile = """  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter de votre compte ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAppSessionAndCache();
            } catch (err) {
              console.warn('Erreur clearAppSessionAndCache:', err);
            }
            if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
              window.location.href = '/';
            } else {
              try {
                if (router.canDismiss()) {
                  router.dismissAll();
                }
              } catch {}
              router.replace('/');
            }
          },
        },
      ]
    );
  };"""

c = c.replace(target_logout.replace('\r\n', '\n'), replacement_prop_profile)
c = c.replace(target_logout.replace('\n', '\r\n'), replacement_prop_profile.replace('\n', '\r\n'))

with open(p_prop_profile, 'w', encoding='utf-8') as f:
    f.write(c)
print('Updated proprietaire profile.tsx')


# 4. Update native_apps/proprietaire/app/(tabs)/index.tsx
p_prop_index = 'native_apps/proprietaire/app/(tabs)/index.tsx'
with open(p_prop_index, 'r', encoding='utf-8') as f:
    c = f.read()

if 'Platform,' not in c:
    c = c.replace('import {\n  View,', 'import {\n  Platform,\n  View,').replace('import {\r\n  View,', 'import {\r\n  Platform,\r\n  View,')

target_prop_drawer = """                onPress={async () => {
                  setMenuOpen(false);
                  await clearAppSessionAndCache();
                  if (typeof window !== 'undefined') {
                    window.location.replace('/');
                  } else {
                    router.replace('/');
                  }
                }}"""

replacement_prop_drawer = """                onPress={() => {
                  setMenuOpen(false);
                  Alert.alert(
                    'Changer de profil / Déconnexion',
                    'Voulez-vous fermer cette session pour changer de profil (Propriétaire ou Agence) ou vous reconnecter ?',
                    [
                      { text: 'Annuler', style: 'cancel' },
                      {
                        text: 'Déconnexion',
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            await clearAppSessionAndCache();
                          } catch (err) {
                            console.warn('Erreur clearAppSessionAndCache:', err);
                          }
                          if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
                            window.location.href = '/';
                          } else {
                            try {
                              if (router.canDismiss()) {
                                router.dismissAll();
                              }
                            } catch {}
                            router.replace('/');
                          }
                        },
                      },
                    ]
                  );
                }}"""

c = c.replace(target_prop_drawer.replace('\r\n', '\n'), replacement_prop_drawer)
c = c.replace(target_prop_drawer.replace('\n', '\r\n'), replacement_prop_drawer.replace('\n', '\r\n'))

with open(p_prop_index, 'w', encoding='utf-8') as f:
    f.write(c)
print('Updated proprietaire (tabs)/index.tsx')
