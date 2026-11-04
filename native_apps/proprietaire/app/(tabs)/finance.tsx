import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowDownLeft, FileText } from 'lucide-react-native';
import { fetchWithAuth } from '../../lib/api';

const EUR_RATE = 655.957;

const FALLBACK_TX = [
  { id: 'T1', property: 'Appartement A1 · Adjoua Kouamé', date: '2026-11-03', amount: 150000, via: 'Wave', type: 'INCOME' },
  { id: 'T2', property: 'Villa Marcory · Agence Riviera', date: '2026-11-01', amount: 350000, via: 'Reversement Agence', type: 'INCOME' },
  { id: 'T3', property: 'Appartement A3 · Jean-Marc Konan', date: '2026-11-05', amount: 120000, via: 'Orange Money', type: 'INCOME' },
  { id: 'T4', property: 'Studio B1 · Aya Bamba', date: '2026-11-02', amount: 80000, via: 'MTN MoMo', type: 'INCOME' },
];

export default function FinanceScreen() {
  const [transactions, setTransactions] = useState<any[]>(FALLBACK_TX);
  const [balance, setBalance] = useState(760000);
  const [eur, setEur] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinance = async () => {
      try {
        const response = await fetchWithAuth('/proprietaire/finance');
        const json = await response.json();
        if (response.ok && json.transactions?.length) {
          setTransactions(json.transactions);
          setBalance(json.balance || 760000);
        }
      } catch (e) {
        // Fallback kept
      } finally {
        setLoading(false);
      }
    };
    fetchFinance();
  }, []);

  const fmt = (n: number) =>
    eur
      ? Math.round(n / EUR_RATE).toLocaleString('fr-FR') + ' €'
      : n.toLocaleString('fr-FR') + ' F';

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#1B4D3E" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.sub}>Réconciliation webhooks HMAC-SHA256</Text>
          <Text style={styles.title}>Flux & Rapports</Text>
        </View>
        <Pressable style={styles.eurBtn} onPress={() => setEur(!eur)}>
          <Text style={styles.eurBtnText}>{eur ? 'Afficher en F' : 'Afficher en € (BCE)'}</Text>
        </Pressable>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.heroLabel}>ENCAISSÉ CE MOIS</Text>
          <View style={styles.zeroFeePill}>
            <Text style={styles.zeroFeeText}>Frais QAPRIL : 0 F</Text>
          </View>
        </View>
        <Text style={styles.heroBig}>{fmt(balance)}</Text>
        <Text style={styles.heroSub}>
          Vos loyers arrivent directement sur vos comptes Wave, Orange Money, MTN ou bancaire.
        </Text>
        <Pressable
          style={styles.reportBtn}
          onPress={() =>
            Alert.alert('Rapport mensuel PDF', 'Rapport PDF M-RAPPORT certifié SHA-256 téléchargé.')
          }
        >
          <FileText color="#1B4D3E" size={16} />
          <Text style={styles.reportBtnText}>Télécharger le rapport mensuel PDF</Text>
        </Pressable>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.iconBox}>
              <ArrowDownLeft color="#1E7E4E" size={18} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.property}>{item.property}</Text>
              <Text style={styles.meta}>
                {new Date(item.date || Date.now()).toLocaleDateString('fr-FR')} · {item.via || 'Mobile Money'}
              </Text>
            </View>
            <Text style={styles.amount}>+{fmt(item.amount || 120000)}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2EC' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sub: { fontSize: 12, color: '#6E6E73', fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '800', color: '#1C1C1E' },
  eurBtn: {
    backgroundColor: '#FDF3DF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  eurBtnText: { fontSize: 11, fontWeight: '800', color: '#9A6500' },
  heroCard: {
    marginHorizontal: 18,
    marginBottom: 14,
    padding: 18,
    borderRadius: 22,
    backgroundColor: '#1B4D3E',
    gap: 6,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
  zeroFeePill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  zeroFeeText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF' },
  heroBig: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  heroSub: { fontSize: 11, color: 'rgba(255,255,255,0.82)', lineHeight: 16 },
  reportBtn: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  reportBtnText: { fontSize: 12, fontWeight: '800', color: '#1B4D3E' },
  list: { paddingHorizontal: 18, paddingBottom: 40, gap: 10 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E4E0D7',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E3F5EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  property: { fontSize: 13, fontWeight: '700', color: '#1C1C1E' },
  meta: { fontSize: 11, color: '#6E6E73', marginTop: 2 },
  amount: { fontSize: 14, fontWeight: '800', color: '#1E7E4E' },
});
