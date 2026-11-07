import * as Updates from 'expo-updates';
import { Platform } from 'react-native';

export const APP_NAME = 'QAPRIL Locataire';
export const APP_KEY = 'locataire';
export const APP_VERSION = '1.1.6';
export const BUILD_NUMBER = 6;

export interface VersionCheckResult {
  isUpdateAvailable: boolean;
  isForceUpdate: boolean;
  latestVersion: string;
  minSupportedVersion: string;
  releaseNotes?: string;
  downloadUrl?: string;
}

export async function checkBackendVersionAsync(): Promise<VersionCheckResult | null> {
  try {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://qapril.net/api/mobile';
    const res = await fetch(
      `${apiUrl}/version?app=${APP_KEY}&currentVersion=${APP_VERSION}&platform=${Platform.OS}`
    );
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success) return null;
    return json;
  } catch (e) {
    return null;
  }
}

export function getFullVersionString(): string {
  const ota = Updates.updateId ? Updates.updateId.substring(0, 8) : 'Local';
  const ch = Updates.channel || 'prod';
  return `v${APP_VERSION} (b${BUILD_NUMBER}) · OTA ${ota} · ${ch}`;
}

