import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, CheckCircle2, Clock, AlertTriangle } from 'lucide-react-native';
import { fetchWithAuth } from '../../lib/api';

export default function MandantsScreen() {
  const [mandats, setMandats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMandats = async () => {
    try {
      const res = await fetchWithAuth('/agency/mandats');
      if (res.ok) {
        const data = await res.json();
        setMandats(data.mandats || []);
      }
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { loadMandats(); }, []);

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <ActivityIndicator color="#1B4D3E" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadMandats(); }} colors={['#1B4D3E']} />}
      >
        <Text style={s.sub}>Relations Propriétaires</Text>
        <Text style={s.title}>Mandants</Text>

        {mandats.length === 0 ? (
          <View style={s.cardEmpty}>
            <Users size={40} color="#64748B" />
            <Text style={s.emptyTitle}>Vos mandats de gestion</Text>
            <Text style={s.emptyText}>
              Suivez les mandats signés avec les bailleurs, les honoraires de gestion et les ordres de reversement.
            </Text>
          </View>
        ) : (
          mandats.map((mandat: any) => (
            <View key={mandat.id} style={s.card}>
              {/* Infos mandant */}
              <Text style={s.mandantNom}>{mandat.mandantNom || 'Bailleur mandant'}</Text>
              <Text style={s.mandantSub}>
                {mandat.nbBiens ?? 0} bien{(mandat.nbBiens ?? 0) > 1 ? 's' : ''} sous gestion
                {mandat.tauxHonoraires ? ` · Honoraires : ${mandat.tauxHonoraires}%` : ''}
              </Text>

              {/* Double signature */}
              <View style={s.signaturesRow}>
                <View style={[s.sigBadge, mandat.signatureMandant ? s.sigOk : s.sigPending]}>
                  <Text style={[s.sigText, mandat.signatureMandant ? s.sigTextOk : s.sigTextPending]}>
                    {mandat.signatureMandant ? 'Mandant signé' : 'Signature mandant en attente'}
                  </Text>
                </View>
                <View style={[s.sigBadge, mandat.signatureAgence ? s.sigOk : s.sigPending]}>
                  <Text style={[s.sigText, mandat.signatureAgence ? s.sigTextOk : s.sigTextPending]}>
                    {mandat.signatureAgence ? 'Agence signée' : 'Signature agence en attente'}
                  </Text>
                </View>
              </View>

              {/* Alerte réclamation 48h */}
              {mandat.reclamations?.some((r: any) => r.statut === 'EN_ATTENTE') && (
                <View style={s.reclamBanner}>
                  <AlertTriangle size={12} color="#991B1B" />
                  <Text style={s.reclamText}>Réclamation à traiter sous 48h</Text>
                </View>
              )}

              {/* Reversements */}
              {mandat.dernierReversement && (
                <View style={s.separator} />
              )}
              {mandat.dernierReversement && (
                <Text style={s.reversText}>
                  Dernier reversement : {Number(mandat.dernierReversement.montant || 0).toLocaleString('fr-FR')} F
                  {mandat.dernierReversement.date
                    ? ` le ${new Date(mandat.dernierReversement.date).toLocaleDateString('fr-FR')}`
                    : ''}
                </Text>
              )}
            </View>
          ))
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
  title: { fontSize: 24, fontWeight: '900', color: '#1F2A44', marginTop: 2, marginBottom: 16 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#E2E5EE', marginBottom: 12,
  },
  mandantNom: { fontSize: 16, fontWeight: '800', color: '#1F2A44' },
  mandantSub: { fontSize: 12, color: '#64748B', marginTop: 2, marginBottom: 10 },
  signaturesRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  sigBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  sigOk: { backgroundColor: '#DCFCE7' },
  sigPending: { backgroundColor: '#FEF3C7' },
  sigText: { fontSize: 10, fontWeight: '700' },
  sigTextOk: { color: '#166534' },
  sigTextPending: { color: '#92400E' },
  reclamBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FEE2E2', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginTop: 8,
  },
  reclamText: { fontSize: 10, fontWeight: '700', color: '#991B1B' },
  separator: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 10 },
  reversText: { fontSize: 12, color: '#475569' },
  cardEmpty: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24,
    alignItems: 'center', borderWidth: 1, borderColor: '#E2E5EE', marginTop: 20,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#1F2A44', marginTop: 12 },
  emptyText: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 8, lineHeight: 20 },
});
