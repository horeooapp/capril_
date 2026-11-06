import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import * as Updates from 'expo-updates';
import { RefreshCw, Download, CheckCircle2 } from 'lucide-react-native';

export function UpdateNotificationBanner() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkOTA() {
      try {
        if (__DEV__ || !Updates.isEnabled) {
          return;
        }

        const check = await Updates.checkForUpdateAsync();
        if (check.isAvailable && isMounted) {
          setUpdateAvailable(true);
          // Pré-téléchargement silencieux de la mise à jour
          try {
            await Updates.fetchUpdateAsync();
            if (isMounted) {
              setUpdateReady(true);
            }
          } catch (fetchErr) {
            console.log('Erreur fetchUpdate:', fetchErr);
          }
        }
      } catch (err) {
        // Mode développement ou absence de réseau
        console.log('OTA check info:', err);
      }
    }

    checkOTA();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleApplyUpdate = async () => {
    setIsUpdating(true);
    try {
      if (!updateReady) {
        await Updates.fetchUpdateAsync();
      }
      await Updates.reloadAsync();
    } catch (err) {
      console.log('Erreur reload OTA:', err);
      setIsUpdating(false);
    }
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <View style={styles.bannerContainer}>
      <View style={styles.textContainer}>
        <View style={styles.badgeRow}>
          <View style={styles.pulseDot} />
          <Text style={styles.badgeText}>MISE À JOUR DISPONIBLE</Text>
        </View>
        <Text style={styles.titleText}>
          {updateReady
            ? 'La nouvelle version est prête.'
            : 'Téléchargement de la mise à jour...'}
        </Text>
      </View>

      <Pressable
        style={styles.actionBtn}
        onPress={handleApplyUpdate}
        disabled={isUpdating}
      >
        {isUpdating ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <RefreshCw size={14} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>
              {updateReady ? 'Redémarrer' : 'Appliquer'}
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#34D399',
    letterSpacing: 0.5,
  },
  titleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  actionBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
