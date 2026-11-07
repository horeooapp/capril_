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
        const hasSeenIntro = await getHasSeenOnboarding();
        if (!active) return;
        if (token) {
          router.replace('/(tabs)');
        } else if (!hasSeenIntro) {
          router.replace('/onboarding' as any);
        } else {
          router.replace('/login');
        }
      } catch {
        if (active) router.replace('/login');
      }
    };
    checkAuth();
    return () => { active = false; };
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#E8A020" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B2019',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
