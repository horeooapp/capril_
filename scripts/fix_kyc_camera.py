#!/usr/bin/env python3
"""
Fix KYC camera handlers: remove all fake capture:// URI injections.
Replace with real error handling (Alerts) so the camera must actually be used.
"""
import re

APPS = ['locataire', 'proprietaire']
BASE = r'e:\Projets_Cornerstone\site_crnstneros\capril_\native_apps'

NEW_CAMERA_FUNCTIONS = r"""  // \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  // CAPTURE CAMERA RECTO
  // \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  const handleLaunchCameraRecto = async () => {
    setIsCapturingRecto(true);
    try {
      const ImagePicker = getImagePicker();
      if (!ImagePicker) {
        Alert.alert(
          'Mise \u00e0 jour requise',
          "L'appareil photo n\u00e9cessite la derni\u00e8re version de l'application. Veuillez mettre \u00e0 jour et r\u00e9essayer, ou s\u00e9lectionner depuis la galerie.",
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Depuis la galerie', onPress: handlePickFromGalleryRecto },
          ]
        );
        return;
      }

      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Permission requise',
          "Veuillez autoriser l'acc\u00e8s \u00e0 l'appareil photo dans les param\u00e8tres de votre t\u00e9l\u00e9phone.",
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
        'Erreur appareil photo',
        'Impossible d\'ouvrir l\'appareil photo. Veuillez r\u00e9essayer ou choisir depuis la galerie.',
        [
          { text: 'OK', style: 'cancel' },
          { text: 'Depuis la galerie', onPress: handlePickFromGalleryRecto },
        ]
      );
    } finally {
      setIsCapturingRecto(false);
    }
  };

  const handlePickFromGalleryRecto = async () => {
    try {
      const ImagePicker = getImagePicker();
      if (!ImagePicker) {
        Alert.alert('Erreur', "Impossible d'acc\u00e9der \u00e0 la galerie. Veuillez mettre \u00e0 jour l'application.");
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
      Alert.alert('Erreur', "Impossible d'acc\u00e9der \u00e0 la galerie photo.");
    }
  };

  // \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  // CAPTURE CAMERA VERSO
  // \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  const handleLaunchCameraVerso = async () => {
    setIsCapturingVerso(true);
    try {
      const ImagePicker = getImagePicker();
      if (!ImagePicker) {
        Alert.alert(
          'Mise \u00e0 jour requise',
          "L'appareil photo n\u00e9cessite la derni\u00e8re version de l'application. Veuillez mettre \u00e0 jour et r\u00e9essayer, ou s\u00e9lectionner depuis la galerie.",
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Depuis la galerie', onPress: handlePickFromGalleryVerso },
          ]
        );
        return;
      }

      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Permission requise',
          "Veuillez autoriser l'appareil photo dans les param\u00e8tres.",
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
      Alert.alert(
        'Erreur appareil photo',
        'Impossible d\'ouvrir l\'appareil photo. Veuillez r\u00e9essayer ou choisir depuis la galerie.',
        [
          { text: 'OK', style: 'cancel' },
          { text: 'Depuis la galerie', onPress: handlePickFromGalleryVerso },
        ]
      );
    } finally {
      setIsCapturingVerso(false);
    }
  };

  const handlePickFromGalleryVerso = async () => {
    try {
      const ImagePicker = getImagePicker();
      if (!ImagePicker) {
        Alert.alert('Erreur', "Impossible d'acc\u00e9der \u00e0 la galerie. Veuillez mettre \u00e0 jour l'application.");
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
      Alert.alert('Erreur', "Impossible d'acc\u00e9der \u00e0 la galerie photo.");
    }
  };

  // \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  // CAPTURE CONTR\u00d4LE FACIAL (SELFIE CAM\u00c9RA FRONTALE)
  // \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  const handleLaunchSelfieCamera = async () => {
    setIsCapturingSelfie(true);
    try {
      const ImagePicker = getImagePicker();
      if (!ImagePicker) {
        Alert.alert(
          'Selfie non disponible',
          "L'appareil photo n\u00e9cessite une mise \u00e0 jour. Utilisez le capteur biom\u00e9trique pour valider votre identit\u00e9.",
          [{ text: 'Capteur biom\u00e9trique', onPress: () => triggerNativeBiometrics() }]
        );
        return;
      }

      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Permission requise',
          "Veuillez autoriser l'acc\u00e8s \u00e0 l'appareil photo, ou utilisez le capteur biom\u00e9trique.",
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Capteur biom\u00e9trique', onPress: () => triggerNativeBiometrics() },
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
      // Si annul\u00e9 \u2192 ne rien faire, l'utilisateur peut r\u00e9essayer ou utiliser le capteur
    } catch (err: any) {
      console.warn('Erreur selfie camera:', err);
      Alert.alert(
        'Erreur appareil photo',
        "Impossible d'ouvrir la cam\u00e9ra frontale. Utilisez le capteur biom\u00e9trique.",
        [
          { text: 'OK', style: 'cancel' },
          { text: 'Capteur biom\u00e9trique', onPress: () => triggerNativeBiometrics() },
        ]
      );
    } finally {
      setIsCapturingSelfie(false);
    }
  };"""

# Regex pattern to match the three camera function blocks (recto, verso, selfie)
# from the first "CAPTURE CAMERA RECTO" comment to the end of handleLaunchSelfieCamera
PATTERN = re.compile(
    r'(  // [\u2500-]+\r?\n  // CAPTURE CAMERA RECTO\r?\n  // [\u2500-]+\r?\n)'
    r'.*?'
    r'(  // [\u2500-]+\r?\n  // V\u00c9RIFICATION BIOM\u00c9TRIQUE)',
    re.DOTALL
)

for app in APPS:
    path = rf'{BASE}\{app}\components\KycVerificationModal.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the section between CAPTURE CAMERA RECTO and VÉRIFICATION BIOMÉTRIQUE
    start_marker = '  // CAPTURE CAMERA RECTO'
    end_marker = '  // VÉRIFICATION BIOMÉTRIQUE MATÉRIELLE NATIVE'
    
    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker)
    
    if start_idx == -1 or end_idx == -1:
        print(f'{app}: markers not found (start={start_idx}, end={end_idx})')
        continue
    
    # Find the start of the comment block before CAPTURE CAMERA RECTO (the ─── line)
    # Walk back to find the line starting with "  // ─"
    block_start = content.rfind('\n  // ', 0, start_idx)
    if block_start == -1:
        block_start = start_idx
    else:
        block_start += 1  # skip the newline
    
    # The replacement ends just before the VÉRIFICATION BIOMÉTRIQUE comment block
    # Find the ─── line before that marker
    bio_comment_start = content.rfind('\n  // ', 0, end_idx)
    if bio_comment_start == -1:
        block_end = end_idx
    else:
        block_end = bio_comment_start + 1  # skip newline, keep from start of that line
    
    old_block = content[block_start:block_end]
    print(f'{app}: replacing {len(old_block)} chars, {old_block.count(chr(10))} lines')
    
    new_content = content[:block_start] + NEW_CAMERA_FUNCTIONS + '\n\n' + content[block_end:]
    
    # Verify no fake URIs remain in camera functions area
    remaining = new_content.count('capture://recto_piece.jpg') + \
                new_content.count('capture://verso_piece.jpg') + \
                new_content.count('capture://selfie_visage.jpg')
    print(f'  -> remaining fake URIs: {remaining}')
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f'  -> {path} updated OK')

print('Done.')

