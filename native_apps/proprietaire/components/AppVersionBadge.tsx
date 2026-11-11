import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import * as Updates from 'expo-updates';
import { APP_NAME, APP_VERSION, BUILD_NUMBER, BUILD_DATE, BUILD_TIME, getFullVersionString } from '../lib/version';

export function AppVersionBadge() {
  const [checking, setChecking] = useState(false);

  const handlePress = async () => {
    if (checking) return;
    setChecking(true);

    try {
      if (__DEV__ || !Updates.isEnabled) {
        Alert.alert(
          APP_NAME,
          `${getFullVersionString()}\n\nDernière mise à jour : ${BUILD_DATE} à ${BUILD_TIME}\nMode développement actif.`
        );
        return;
      }

      const check = await Updates.checkForUpdateAsync();
      if (check.isAvailable) {
        Alert.alert(
          'Mise à jour détectée',
          'Une nouvelle mise à jour est en cours de téléchargement...',
          [{ text: 'Patienter' }]
        );
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      } else {
        const updateIdStr = Updates.updateId ? Updates.updateId.substring(0, 8) : 'Base';
        Alert.alert(
          'Application à jour',
          `${APP_NAME} v${APP_VERSION} (Build ${BUILD_NUMBER})\n\nDernière mise à jour appliquée : ${BUILD_DATE} à ${BUILD_TIME}\nCanal OTA : ${Updates.channel || 'production'} (${updateIdStr})\n\nVotre application dispose de la version certifiée la plus récente.`
        );
      }
    } catch (e: any) {
      Alert.alert(
        APP_NAME,
        `${getFullVersionString()}\n\nErreur de vérification : ${e?.message || 'Problème de connexion réseau'}`
      );
    } finally {
      setChecking(false);
    }
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <View style={styles.row}>
        {checking ? (
          <ActivityIndicator size="small" color="#10B981" style={{ marginRight: 6 }} />
        ) : (
          <View style={styles.dot} />
        )}
        <Text style={styles.text}>{getFullVersionString()}</Text>
      </View>
      <Text style={styles.subtext}>Mis à jour le {BUILD_DATE} à {BUILD_TIME} · Vérifier</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 3,
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
    backgroundColor: '#10B981',
  },
  text: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'monospace',
    letterSpacing: 0.2,
  },
  subtext: {
    fontSize: 9,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});
