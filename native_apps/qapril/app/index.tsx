import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { getStoredToken, getStoredSpace } from '../lib/api';

export default function AuthGateIndex() {
  const router = useRouter();

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      try {
        const token = await getStoredToken();
        const space = await getStoredSpace();

        if (!active) return;

        if (token && space === 'LOCATAIRE') {
          router.replace('/(locataire)/(tabs)' as any);
        } else if (token && space === 'BAILLEUR') {
          router.replace('/(bailleur)/(tabs)' as any);
        } else {
          router.replace('/select-space' as any);
        }
      } catch {
        if (active) {
          router.replace('/select-space' as any);
        }
      }
    };

    checkSession();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#F0774B" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2A44',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
