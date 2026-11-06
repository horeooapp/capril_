import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { APP_NAME, APP_VERSION, BUILD_NUMBER, getFullVersionString, checkBackendVersionAsync, VersionCheckResult } from '../lib/version';

export function AppVersionBadge() {
  const [remoteCheck, setRemoteCheck] = useState<VersionCheckResult | null>(null);

  useEffect(() => {
    checkBackendVersionAsync().then((res) => {
      if (res && res.isUpdateAvailable) {
        setRemoteCheck(res);
      }
    });
  }, []);

  const handleCopy = () => {
    const full = getFullVersionString();
    try {
      Alert.alert(
        APP_NAME,
        `${full}\nPlateforme certifiée QAPRIL CI.\nToutes les données sont synchronisées.`
      );
    } catch {}
  };

  return (
    <Pressable style={styles.container} onPress={handleCopy}>
      <View style={styles.row}>
        <View style={styles.dot} />
        <Text style={styles.text}>{getFullVersionString()}</Text>
      </View>
      {remoteCheck?.isUpdateAvailable && (
        <View style={styles.updateAvailablePill}>
          <Text style={styles.updateAvailableText}>v{remoteCheck.latestVersion} dispo</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  text: {
    fontSize: 11,
    color: '#6E6E73',
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.2,
  },
  updateAvailablePill: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  updateAvailableText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#047857',
  },
});

