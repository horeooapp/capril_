#!/usr/bin/env python3
"""Fix getImagePicker() to robustly detect expo-image-picker exports."""

APPS = ['locataire', 'proprietaire']
BASE = r'e:\Projets_Cornerstone\site_crnstneros\capril_\native_apps'

OLD = """// Chargement sécurisé et paresseux (lazy) des modules natifs pour éviter tout crash au démarrage
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

NEW = """// Chargement sécurisé et paresseux (lazy) des modules natifs pour éviter tout crash au démarrage
function getImagePicker(): any {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('expo-image-picker');
    if (!mod) return null;
    // expo-image-picker utilise des named exports (launchCameraAsync, launchImageLibraryAsync...)
    if (typeof mod.launchCameraAsync === 'function') return mod;
    if (typeof mod.default?.launchCameraAsync === 'function') return mod.default;
    // Fallback: le module existe mais structure différente — retourner quand même
    if (mod.requestCameraPermissionsAsync || mod.launchImageLibraryAsync) return mod;
    return null;
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
    if (mod.hasHardwareAsync || mod.isEnrolledAsync) return mod;
    return null;
  } catch (e) {
    return null;
  }
}"""

for app in APPS:
    path = rf'{BASE}\{app}\components\KycVerificationModal.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if OLD in content:
        content = content.replace(OLD, NEW)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'{app}: getImagePicker() fixed OK')
    else:
        print(f'{app}: pattern not found — checking...')
        # Check partial match
        if 'mod?.launchCameraAsync ? mod : mod?.default ?? null' in content:
            print(f'  -> partial match found, need manual check')
        else:
            print(f'  -> already fixed or different structure')

print('Done.')

