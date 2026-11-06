# Update profile.tsx for locataire
with open('native_apps/locataire/app/(tabs)/profile.tsx', 'r', encoding='utf-8') as f:
    loc_prof = f.read()

old_loc_check = """  const handleCheckUpdate = async () => {
    try {
      setIsCheckingUpdate(true);
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      } else {
        Alert.alert('À jour', 'Vous disposez de la dernière version QAPRIL Locataire.');
      }
    } catch (error) {
      Alert.alert('Info', 'Vérification OTA terminée.');
    } finally {
      setIsCheckingUpdate(false);
    }
  };"""

new_loc_check = """  const [updateAvailable, setUpdateAvailable] = useState<boolean | null>(null);

  const handleCheckUpdate = async () => {
    try {
      setIsCheckingUpdate(true);
      if (__DEV__ || !Updates.isEnabled) {
        Alert.alert('Mode Développement', 'Les mises à jour OTA sont actives sur les versions installées (Canal: ' + (Updates.channel || 'défaut') + ').');
        return;
      }
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        setUpdateAvailable(true);
        Alert.alert(
          'Mise à jour disponible !',
          'Une nouvelle version est disponible pour votre application. Voulez-vous la télécharger et l\\'appliquer maintenant ?',
          [
            {
              text: 'Installer maintenant',
              onPress: async () => {
                await Updates.fetchUpdateAsync();
                await Updates.reloadAsync();
              },
            },
            { text: 'Plus tard', style: 'cancel' }
          ]
        );
      } else {
        setUpdateAvailable(false);
        Alert.alert('Application à jour', 'Votre application dispose déjà de la toute dernière version (Canal: ' + (Updates.channel || 'production') + ').');
      }
    } catch (error: any) {
      Alert.alert('Information', 'Vérification de mise à jour effectuée (Canal: ' + (Updates.channel || 'production') + ').');
    } finally {
      setIsCheckingUpdate(false);
    }
  };"""

loc_prof = loc_prof.replace(old_loc_check, new_loc_check)

old_loc_btn = """            <Pressable style={styles.btnSecondary} onPress={handleCheckUpdate} disabled={isCheckingUpdate}>
              <RefreshCw color="#2C3E6B" size={16} />
              <Text style={styles.btnSecondaryText}>Vérifier les mises à jour (OTA)</Text>
            </Pressable>"""

new_loc_btn = """            <View style={{ gap: 6 }}>
              {updateAvailable === true && (
                <View style={{ backgroundColor: '#059669', padding: 12, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>✓ MISE À JOUR DISPONIBLE</Text>
                  <Text style={{ color: '#A7F3D0', fontSize: 11 }}>Appuyez ci-dessous</Text>
                </View>
              )}
              <Pressable style={styles.btnSecondary} onPress={handleCheckUpdate} disabled={isCheckingUpdate}>
                <RefreshCw color="#2C3E6B" size={16} />
                <Text style={styles.btnSecondaryText}>
                  {isCheckingUpdate ? 'Recherche en cours...' : 'Vérifier les mises à jour (OTA)'}
                </Text>
              </Pressable>
              <Text style={{ fontSize: 10, color: '#9CA3AF', textAlign: 'center' }}>
                Canal actif : {Updates.channel || 'production'} · Version : {Updates.updateId ? Updates.updateId.substring(0, 8) : 'Base APK'}
              </Text>
            </View>"""

loc_prof = loc_prof.replace(old_loc_btn, new_loc_btn)

with open('native_apps/locataire/app/(tabs)/profile.tsx', 'w', encoding='utf-8') as f:
    f.write(loc_prof)
print("locataire profile.tsx patched!")

# Update profile.tsx for proprietaire
with open('native_apps/proprietaire/app/(tabs)/profile.tsx', 'r', encoding='utf-8') as f:
    prop_prof = f.read()

old_prop_check = """  const handleCheckUpdate = async () => {
    try {
      setIsCheckingUpdate(true);
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      } else {
        Alert.alert('À jour', 'Vous disposez de la dernière version QAPRIL Bailleur.');
      }
    } catch (error) {
      Alert.alert('Info', 'Vérification OTA terminée.');
    } finally {
      setIsCheckingUpdate(false);
    }
  };"""

new_prop_check = """  const [updateAvailable, setUpdateAvailable] = useState<boolean | null>(null);

  const handleCheckUpdate = async () => {
    try {
      setIsCheckingUpdate(true);
      if (__DEV__ || !Updates.isEnabled) {
        Alert.alert('Mode Développement', 'Les mises à jour OTA sont actives sur les versions installées (Canal: ' + (Updates.channel || 'défaut') + ').');
        return;
      }
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        setUpdateAvailable(true);
        Alert.alert(
          'Mise à jour disponible !',
          'Une nouvelle version est disponible pour votre application. Voulez-vous la télécharger et l\\'appliquer maintenant ?',
          [
            {
              text: 'Installer maintenant',
              onPress: async () => {
                await Updates.fetchUpdateAsync();
                await Updates.reloadAsync();
              },
            },
            { text: 'Plus tard', style: 'cancel' }
          ]
        );
      } else {
        setUpdateAvailable(false);
        Alert.alert('Application à jour', 'Votre application dispose déjà de la toute dernière version (Canal: ' + (Updates.channel || 'production') + ').');
      }
    } catch (error: any) {
      Alert.alert('Information', 'Vérification de mise à jour effectuée (Canal: ' + (Updates.channel || 'production') + ').');
    } finally {
      setIsCheckingUpdate(false);
    }
  };"""

prop_prof = prop_prof.replace(old_prop_check, new_prop_check)

old_prop_btn = """            <Pressable style={styles.btnSecondary} onPress={handleCheckUpdate} disabled={isCheckingUpdate}>
              <RefreshCw color="#1B4D3E" size={16} />
              <Text style={styles.btnSecondaryText}>Vérifier les mises à jour (OTA)</Text>
            </Pressable>"""

new_prop_btn = """            <View style={{ gap: 6 }}>
              {updateAvailable === true && (
                <View style={{ backgroundColor: '#059669', padding: 12, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>✓ MISE À JOUR DISPONIBLE</Text>
                  <Text style={{ color: '#A7F3D0', fontSize: 11 }}>Appuyez ci-dessous</Text>
                </View>
              )}
              <Pressable style={styles.btnSecondary} onPress={handleCheckUpdate} disabled={isCheckingUpdate}>
                <RefreshCw color="#1B4D3E" size={16} />
                <Text style={styles.btnSecondaryText}>
                  {isCheckingUpdate ? 'Recherche en cours...' : 'Vérifier les mises à jour (OTA)'}
                </Text>
              </Pressable>
              <Text style={{ fontSize: 10, color: '#9CA3AF', textAlign: 'center' }}>
                Canal actif : {Updates.channel || 'production'} · Version : {Updates.updateId ? Updates.updateId.substring(0, 8) : 'Base APK'}
              </Text>
            </View>"""

prop_prof = prop_prof.replace(old_prop_btn, new_prop_btn)

with open('native_apps/proprietaire/app/(tabs)/profile.tsx', 'w', encoding='utf-8') as f:
    f.write(prop_prof)
print("proprietaire profile.tsx patched!")

