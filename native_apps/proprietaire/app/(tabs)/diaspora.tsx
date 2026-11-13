import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchWithAuth } from '../../lib/api';
import { Globe } from 'lucide-react-native';

export default function DiasporaScreen() {
  const [diasporaActif, setDiasporaActif] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchWithAuth('/landlord/profile');
        if (res.ok) {
          const data = await res.json();
          setDiasporaActif(data.diaspora === true);
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <ActivityIndicator color="#1B4D3E" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.sub}>Options</Text>
        <Text style={s.title}>Espace Diaspora</Text>

        {!diasporaActif ? (
          <View style={s.card}>
            <Globe size={28} color="#1B4D3E" />
            <Text style={s.cardTitle}>Gérez vos biens depuis l'étranger</Text>
            <Text style={s.cardSub}>
              L'espace Diaspora vous permet d'afficher vos loyers en euros et de gérer vos biens
              à distance. Activation par abonnement mensuel.
            </Text>
            <Pressable
              style={s.activateBtn}
              onPress={() => Linking.openURL('https://qapril.net/diaspora/activer')}
            >
              <Text style={s.activateBtnText}>Activer — 7 € / mois</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={s.activeCard}>
              <Globe size={24} color="#FFFFFF" />
              <View style={{ flex: 1 }}>
                <Text style={s.activeTitle}>Diaspora actif</Text>
                <Text style={s.activeSub}>Vos loyers sont affichés en euros et en francs.</Text>
              </View>
            </View>
            <View style={s.infoCard}>
              <Text style={s.infoText}>
                Le montant en euros est calculé selon le taux de change officiel BCEAO du jour.
                Aucun frais supplémentaire n'est prélevé sur vos loyers.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  scroll: { padding: 16, paddingBottom: 100 },
  sub: {
    fontSize: 11, fontWeight: '700', color: '#64748B',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  title: { fontSize: 24, fontWeight: '900', color: '#1F2A44', marginTop: 2, marginBottom: 20 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24,
    borderWidth: 1, borderColor: '#E2E5EE', alignItems: 'center', gap: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#1F2A44', textAlign: 'center' },
  cardSub: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20 },
  activateBtn: {
    backgroundColor: '#1B4D3E', borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 14, marginTop: 8,
  },
  activateBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  activeCard: {
    backgroundColor: '#1B4D3E', borderRadius: 16, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12,
  },
  activeTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  activeSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  infoCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#E2E5EE',
  },
  infoText: { fontSize: 13, color: '#475569', lineHeight: 20 },
});

