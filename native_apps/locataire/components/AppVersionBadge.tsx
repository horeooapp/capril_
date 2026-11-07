import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import * as Updates from 'expo-updates';
import { APP_NAME, APP_VERSION, BUILD_NUMBER, getFullVersionString } from '../lib/version';

export function AppVersionBadge() {
  const [checking, setChecking] = useState(false);

  const handlePress = async () => {
    if (checking) return;
    setChecking(true);

    try {
      if (__DEV__ || !Updates.isEnabled) {
        Alert.alert(
          APP_NAME,
          `${getFullVersionString()}\n\nMode développement actif ou environnement sans support OTA.`
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
          `${APP_NAME} v${APP_VERSION} (b${BUILD_NUMBER})\nOTA ID: ${updateIdStr} (Canal: ${Updates.channel || 'preview'})\n\nVous utilisez la version la plus récente de QAPRIL.`
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
      <Text style={styles.subtext}>Appuyez pour vérifier les mises à jour</Text>
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
