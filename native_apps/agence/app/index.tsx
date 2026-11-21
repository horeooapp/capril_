import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { getStoredToken, getHasSeenOnboarding } from '../lib/api';

export default function AuthGateIndex() {
  const router = useRouter();

  useEffect(() => {
    let active = true;
    const checkAuth = async () => {
      try {
        const token = await getStoredToken();
        if (!active) return;
        if (token) {
          router.replace('/(tabs)');
        } else {
          const hasSeen = await getHasSeenOnboarding();
          if (!active) return;
          if (hasSeen) {
            router.replace('/login' as any);
          } else {
            router.replace('/onboarding' as any);
          }
        }
      } catch {
        if (active) router.replace('/onboarding' as any);
      }
    };
    checkAuth();
    return () => {
      active = false;
    };
  }, []);

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
