import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Switch, ScrollView, ActivityIndicator, Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchWithAuth } from '../../lib/api';
import { Shield } from 'lucide-react-native';

interface PasseportPrefs {
  share_tranche: boolean;
  share_badges: boolean;
  share_foyer: boolean;
  share_duree_bail: boolean;
  tranche?: 'A' | 'B' | 'C' | 'D' | null;
  nb_paiements_ok?: number;
}

const TRANCHE_COLORS: Record<string, string> = {
  A: '#1B4D3E',
  B: '#2C3E6B',
  C: '#FF8200',
  D: '#64748B',
};

export default function PasseportScreen() {
  const [prefs, setPrefs] = useState<PasseportPrefs>({
    share_tranche: false,
    share_badges: false,
    share_foyer: false,
    share_duree_bail: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchWithAuth('/tenant/passport');
        if (res.ok) {
          const data = await res.json();
          setPrefs(data);
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const toggle = async (key: keyof PasseportPrefs) => {
    const next = { ...prefs, [key]: !prefs[key as string] };
    setPrefs(next);
    setSaving(true);
    try {
      await fetchWithAuth('/tenant/passport', {
        method: 'POST',
        body: JSON.stringify({
          action: 'UPDATE_PREFS',
          share_tranche: next.share_tranche,
          share_badges: next.share_badges,
          share_foyer: next.share_foyer,
          share_duree_bail: next.share_duree_bail,
        }),
      });
    } catch {}
    setSaving(false);
  };

  const nbPaiements = prefs.nb_paiements_ok ?? 0;
  const hasPasseport = nbPaiements >= 3;

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
        <Text style={s.sub}>Votre profil</Text>
        <Text style={s.title}>Passeport locataire</Text>

        {!hasPasseport ? (
          <View style={s.emptyCard}>
            <Shield size={32} color="#64748B" />
            <Text style={s.emptyTitle}>Passeport non disponible</Text>
            <Text style={s.emptySub}>
              Payez vos 3 premiers loyers à l'heure pour obtenir la tranche C.
            </Text>
            <Text style={s.emptyCount}>{nbPaiements} paiement{nbPaiements !== 1 ? 's' : ''} à l'heure sur 3 requis</Text>
          </View>
        ) : (
          <>
            {prefs.tranche && (
              <View style={[s.trancheCard, { borderColor: TRANCHE_COLORS[prefs.tranche] ?? '#64748B' }]}>
                <Text style={s.trancheLabel}>Votre tranche</Text>
                <Text style={[s.trancheValue, { color: TRANCHE_COLORS[prefs.tranche] ?? '#64748B' }]}>
                  Tranche {prefs.tranche}
                </Text>
                <Text style={s.trancheSub}>Calculée depuis vos paiements à l'heure</Text>
              </View>
            )}

            <Text style={s.sectionTitle}>Ce que je partage avec le publiant</Text>

            {([
              { key: 'share_tranche', label: 'Ma tranche (A, B, C ou D)', desc: 'Votre niveau de fiabilité locative, sans détail de score' },
              { key: 'share_badges', label: 'Mes attestations', desc: 'Pièce vérifiée, Mobile Money rapproché' },
              { key: 'share_foyer', label: 'Composition du foyer', desc: "Nombre d'occupants déclarés" },
              { key: 'share_duree_bail', label: 'Durée de mon bail actuel', desc: 'Sans adresse ni nom du bailleur' },
            ] as { key: keyof PasseportPrefs; label: string; desc: string }[]).map(({ key, label, desc }) => (
              <View key={key} style={s.row}>
                <View style={{ flex: 1 }}>
                  <Text style={s.rowLabel}>{label}</Text>
                  <Text style={s.rowDesc}>{desc}</Text>
                </View>
                <Switch
                  value={!!prefs[key]}
                  onValueChange={() => toggle(key)}
                  trackColor={{ false: '#E2E8F0', true: '#1B4D3E' }}
                  thumbColor="#FFFFFF"
                  disabled={saving}
                />
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  scroll: { padding: 16, paddingBottom: 100 },
  sub: { fontSize: 11, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 24, fontWeight: '900', color: '#1F2A44', marginTop: 2, marginBottom: 20 },
  emptyCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#E2E5EE', alignItems: 'center', gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#1F2A44', textAlign: 'center' },
  emptySub: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20 },
  emptyCount: { fontSize: 12, color: '#FF8200', fontWeight: '700', marginTop: 4 },
  trancheCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 2, marginBottom: 20, alignItems: 'center' },
  trancheLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', textTransform: 'uppercase' },
  trancheValue: { fontSize: 36, fontWeight: '900', marginTop: 4 },
  trancheSub: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E2E5EE', marginBottom: 10, gap: 12 },
  rowLabel: { fontSize: 14, fontWeight: '700', color: '#1F2A44' },
  rowDesc: { fontSize: 12, color: '#64748B', marginTop: 2, lineHeight: 16 },
});
