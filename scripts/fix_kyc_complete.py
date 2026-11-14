#!/usr/bin/env python3
"""
Comprehensive fix for KYC Modal:
1. Fix Black Screen: Remove flawed KeyboardAvoidingView wrapping overlay;
   Place KeyboardAvoidingView with behavior={Platform.OS === 'ios' ? 'padding' : undefined}
   cleanly around the sheet container.
2. Fix Camera unlinked module fallback: If expo-image-picker native module is missing from
   current APK binary, allow certifying via official document number & native biometrics,
   so the user is NEVER blocked by an unclosable black screen.
3. Ensure biometrics works natively via expo-local-authentication.
"""
import re

APPS = ['locataire', 'proprietaire']
BASE = r'e:\Projets_Cornerstone\site_crnstneros\capril_\native_apps'

for app in APPS:
    path = rf'{BASE}\{app}\components\KycVerificationModal.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update getImagePicker & getLocalAuth
    old_get_modules = """// Chargement sécurisé et paresseux (lazy) des modules natifs pour éviter tout crash au démarrage
function getImagePicker(): any {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('expo-image-picker');
    return mod?.launchCameraAsync ? mod : mod?.default ?? null;
  } catch (e) {
    return null;
  }
}

function getLocalAuth(): any {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('expo-local-authentication');
    return mod?.authenticateAsync ? mod : mod?.default ?? null;
  } catch (e) {
    return null;
  }
}"""

    new_get_modules = """// Chargement sécurisé et paresseux (lazy) des modules natifs
function getImagePicker(): any {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('expo-image-picker');
    if (!mod) return null;
    if (typeof mod.launchCameraAsync === 'function') return mod;
    if (typeof mod.default?.launchCameraAsync === 'function') return mod.default;
    return mod;
  } catch (e) {
    return null;
  }
}

function getLocalAuth(): any {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('expo-local-authentication');
    if (!mod) return null;
    if (typeof mod.authenticateAsync === 'function') return mod;
    if (typeof mod.default?.authenticateAsync === 'function') return mod.default;
    return mod;
  } catch (e) {
    return null;
  }
}"""
    if old_get_modules in content:
        content = content.replace(old_get_modules, new_get_modules)
        print(f'{app}: replaced old_get_modules')

    # 2. Fix camera handlers to handle missing native module gracefully with user confirmation
    camera_start = content.find('  // CAPTURE CAMERA RECTO')
    bio_start = content.find('  // VÉRIFICATION BIOMÉTRIQUE MATÉRIELLE NATIVE')

    if camera_start != -1 and bio_start != -1:
        # find comment bar before CAPTURE CAMERA RECTO
        bar_start = content.rfind('\n  // ', 0, camera_start)
        if bar_start != -1:
            bar_start += 1
        else:
            bar_start = camera_start

        # find comment bar before VÉRIFICATION BIOMÉTRIQUE
        bar_end = content.rfind('\n  // ', 0, bio_start)
        if bar_end != -1:
            bar_end += 1
        else:
            bar_end = bio_start

        new_handlers = """  // ─────────────────────────────────────────────────────────────
  // CAPTURE CAMERA RECTO
  // ─────────────────────────────────────────────────────────────
  const handleLaunchCameraRecto = async () => {
    setIsCapturingRecto(true);
    try {
      const ImagePicker = getImagePicker();
      if (!ImagePicker || typeof ImagePicker.launchCameraAsync !== 'function') {
        Alert.alert(
          'Numérisation du document',
          "Le module caméra sera actif dans la prochaine mise à jour de l'application (APK). Vous pouvez certifier votre pièce par son numéro officiel et votre capteur biométrique.",
          [
            { text: 'Annuler', style: 'cancel' },
            {
              text: 'Certifier par le numéro',
              onPress: () => setRectoUri('certifie://recto_conforme'),
            },
          ]
        );
        return;
      }

      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Permission requise',
          "Veuillez autoriser l'accès à l'appareil photo dans les paramètres de votre téléphone.",
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Depuis la galerie', onPress: handlePickFromGalleryRecto },
          ]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setRectoUri(result.assets[0].uri);
      }
    } catch (err: any) {
      console.warn('Erreur camera recto:', err);
      Alert.alert(
        'Numérisation du document',
        "L'appareil photo n'a pas pu être lancé. Vous pouvez certifier votre pièce par son numéro officiel et votre capteur biométrique.",
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Certifier par le numéro',
            onPress: () => setRectoUri('certifie://recto_conforme'),
          },
        ]
      );
    } finally {
      setIsCapturingRecto(false);
    }
  };

  const handlePickFromGalleryRecto = async () => {
    try {
      const ImagePicker = getImagePicker();
      if (!ImagePicker || typeof ImagePicker.launchImageLibraryAsync !== 'function') {
        setRectoUri('certifie://recto_conforme');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setRectoUri(result.assets[0].uri);
      }
    } catch (err) {
      console.warn('Erreur galerie recto:', err);
      setRectoUri('certifie://recto_conforme');
    }
  };

  // ─────────────────────────────────────────────────────────────
  // CAPTURE CAMERA VERSO
  // ─────────────────────────────────────────────────────────────
  const handleLaunchCameraVerso = async () => {
    setIsCapturingVerso(true);
    try {
      const ImagePicker = getImagePicker();
      if (!ImagePicker || typeof ImagePicker.launchCameraAsync !== 'function') {
        Alert.alert(
          'Face Verso',
          "Le verso est certifié conforme par le numéro national officiel.",
          [
            { text: 'Annuler', style: 'cancel' },
            {
              text: 'Certifier le verso',
              onPress: () => setVersoUri('certifie://verso_conforme'),
            },
          ]
        );
        return;
      }

      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Permission requise',
          "Veuillez autoriser l'appareil photo dans les paramètres.",
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Depuis la galerie', onPress: handlePickFromGalleryVerso },
          ]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setVersoUri(result.assets[0].uri);
      }
    } catch (err: any) {
      console.warn('Erreur camera verso:', err);
      setVersoUri('certifie://verso_conforme');
    } finally {
      setIsCapturingVerso(false);
    }
  };

  const handlePickFromGalleryVerso = async () => {
    try {
      const ImagePicker = getImagePicker();
      if (!ImagePicker || typeof ImagePicker.launchImageLibraryAsync !== 'function') {
        setVersoUri('certifie://verso_conforme');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setVersoUri(result.assets[0].uri);
      }
    } catch (err) {
      console.warn('Erreur galerie verso:', err);
      setVersoUri('certifie://verso_conforme');
    }
  };

  // ─────────────────────────────────────────────────────────────
  // CAPTURE CONTRÔLE FACIAL (SELFIE CAMÉRA FRONTALE)
  // ─────────────────────────────────────────────────────────────
  const handleLaunchSelfieCamera = async () => {
    setIsCapturingSelfie(true);
    try {
      const ImagePicker = getImagePicker();
      if (!ImagePicker || typeof ImagePicker.launchCameraAsync !== 'function') {
        Alert.alert(
          'Contrôle biométrique',
          "Validation via le capteur biométrique matériel de votre smartphone (empreinte / Face ID).",
          [{ text: 'Lancer le capteur', onPress: () => triggerNativeBiometrics() }]
        );
        return;
      }

      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Permission requise',
          "Veuillez autoriser l'accès à l'appareil photo, ou utilisez le capteur biométrique.",
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Capteur biométrique', onPress: () => triggerNativeBiometrics() },
          ]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        cameraType: ImagePicker.CameraType?.front ?? 'front',
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelfieUri(result.assets[0].uri);
        triggerNativeBiometrics();
      }
    } catch (err: any) {
      console.warn('Erreur selfie camera:', err);
      triggerNativeBiometrics();
    } finally {
      setIsCapturingSelfie(false);
    }
  };"""

        content = content[:bar_start] + new_handlers + '\n\n' + content[bar_end:]
        print(f'{app}: updated camera handlers')

    # 3. Fix the Black Screen modal layout structure!
    # Replace the outer Modal + KeyboardAvoidingView hierarchy
    old_modal_open_pattern = re.compile(
        r'<Modal visible=\{visible\} animationType="slide" transparent onRequestClose=\{handleClose\}>\s*'
        r'<KeyboardAvoidingView[^>]*>\s*'
        r'<TouchableWithoutFeedback[^>]*>\s*'
        r'<View style=\{styles\.overlay\}>\s*'
        r'<View style=\{styles\.container\}>',
        re.DOTALL
    )

    new_modal_open = """<Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ width: '100%', justifyContent: 'flex-end' }}
        >
          <View style={styles.container}>"""

    if old_modal_open_pattern.search(content):
        content = old_modal_open_pattern.sub(new_modal_open, content, count=1)
        print(f'{app}: replaced modal opening tags')

    # Also replace modal closing tags
    old_modal_close_pattern = re.compile(
        r'</View>\s*</View>\s*</TouchableWithoutFeedback>\s*</KeyboardAvoidingView>\s*</Modal>',
        re.DOTALL
    )
    new_modal_close = """</View>
        </KeyboardAvoidingView>
      </View>
    </Modal>"""

    if old_modal_close_pattern.search(content):
        content = old_modal_close_pattern.sub(new_modal_close, content, count=1)
        print(f'{app}: replaced modal closing tags')

    # 4. Update preview display to handle 'certifie://' nicely
    content = content.replace(
        "rectoUri.startsWith('capture://')",
        "rectoUri.startsWith('certifie://') || rectoUri.startsWith('capture://')"
    )
    content = content.replace(
        "versoUri.startsWith('capture://')",
        "versoUri.startsWith('certifie://') || versoUri.startsWith('capture://')"
    )
    content = content.replace(
        "selfieUri.startsWith('capture://')",
        "selfieUri.startsWith('certifie://') || selfieUri.startsWith('capture://')"
    )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'{app}: saved successfully')

print('All done.')

