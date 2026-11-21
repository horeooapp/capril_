import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import * as Updates from 'expo-updates';
import { RefreshCw, CheckCircle2, Smartphone } from 'lucide-react-native';
import { APP_NAME, APP_VERSION, BUILD_NUMBER, BUILD_DATE, BUILD_TIME, BUILD_TIMESTAMP, getFullVersionString } from '../lib/version';

export function AppVersionBadge() {
  const [checking, setChecking] = useState(false);

  const handlePress = async () => {
    if (checking) return;
    setChecking(true);

    try {
      if (__DEV__ || !Updates.isEnabled) {
        Alert.alert(
          APP_NAME,
          `Version : v${APP_VERSION}\nNuméro de build : Build ${BUILD_NUMBER}\nDate de mise à jour : ${BUILD_TIMESTAMP}\n\nMode développement actif.`
        );
        return;
      }

      const check = await Updates.checkForUpdateAsync();
      if (check.isAvailable) {
        Alert.alert(
          'Mise à jour détectée',
          'Une nouvelle mise à jour est disponible et en cours de téléchargement...',
          [{ text: 'Patienter' }]
        );
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      } else {
        const updateIdStr = Updates.updateId ? Updates.updateId.substring(0, 8) : 'Base';
        Alert.alert(
          'Application à jour',
          `${APP_NAME} v${APP_VERSION} · Build ${BUILD_NUMBER}\n\nDate de mise à jour : ${BUILD_TIMESTAMP}\nCanal OTA : ${Updates.channel || 'production'} (${updateIdStr})\n\nVotre application est synchronisée avec la dernière version.`
        );
      }
    } catch (e: any) {
      Alert.alert(
        APP_NAME,
        `Version : v${APP_VERSION} (Build ${BUILD_NUMBER})\nDate : ${BUILD_TIMESTAMP}\n\nInfo réseau : ${e?.message || 'Connexion au serveur'}`
      );
    } finally {
      setChecking(false);
    }
  };

  return (
    <Pressable style={styles.card} onPress={handlePress}>
      <View style={styles.headerRow}>
        <View style={styles.statusPill}>
          <View style={styles.dotActive} />
          <Text style={styles.statusPillText}>Application à jour · Build {BUILD_NUMBER}</Text>
        </View>
        {checking ? (
          <ActivityIndicator size="small" color="#1E7E4E" />
        ) : (
          <RefreshCw color="#64748B" size={14} />
        )}
      </View>

      <View style={styles.bodyRow}>
        <Smartphone color="#2C3E6B" size={16} />
        <Text style={styles.versionTitle}>
          {APP_NAME} v{APP_VERSION}
        </Text>
      </View>

      <Text style={styles.dateLabel}>
        Dernière mise à jour OTA : {BUILD_DATE} à {BUILD_TIME}
      </Text>
      <Text style={styles.tapToVerify}>Toucher pour vérifier les mises à jour</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginVertical: 10,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  dotActive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1E7E4E',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#166534',
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  versionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  dateLabel: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
  },
  tapToVerify: {
    fontSize: 10,
    color: '#2C3E6B',
    fontWeight: '600',
    marginTop: 4,
  },
});
