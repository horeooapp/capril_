import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { getHasSeenOnboarding } from '../lib/api';

export default function AgenceLoginScreen() {
  const router = useRouter();

  useEffect(() => {
    getHasSeenOnboarding().then((hasSeen) => {
      if (!hasSeen) {
        router.replace('/onboarding' as any);
      }
    });
  }, []);
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2A44" />
      <View style={styles.card}>
        <Text style={styles.badge}>QAPRIL AGENCE AGRÉÉE · CPRAIMA-CI</Text>
        <Text style={styles.title}>Portail Agence Immobilière</Text>
        <Text style={styles.sub}>
          Substitution totale et exclusive (RG-MAN-01) · Masquage BAI-NNN (RG-CONF-02 à 05) · Enregistrement DGI (ADD-23) · Visites Niveau 4 (ADD-22)
        </Text>
        <Pressable
          style={styles.btn}
          onPress={() => router.replace('/(tabs)' as any)}
        >
          <Text style={styles.btnText}>Ouvrir l’espace Agence agréée →</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2A44',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    gap: 12,
  },
  badge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F0774B',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#141824',
  },
  sub: {
    fontSize: 13,
    color: '#666D80',
    lineHeight: 19,
  },
  btn: {
    marginTop: 8,
    backgroundColor: '#1F2A44',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});

