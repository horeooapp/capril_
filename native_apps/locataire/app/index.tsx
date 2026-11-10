import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { getStoredToken } from '../lib/api';

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
          router.replace('/onboarding' as any);
        }
      } catch {
        if (active) router.replace('/onboarding' as any);
      }
    };
    checkAuth();
    return () => { active = false; };
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#00C896" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1117',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
