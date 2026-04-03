import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';

export default function DashboardScreen({ route }: any) {
  // Optionnel: On pourrait récupérer le token. Pour un MVP rapide, on injecte un jeton dummy.
  const token = route.params?.token || 'DUMMY_TOKEN';
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://192.168.1.9:3000/api/mobile/dashboard';

  useEffect(() => {
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, role: 'TENANT' })
    })
      .then(res => res.json())
      .then(json => {
        setData(json.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>{data?.greeting || 'Bonjour'}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{data?.activeRequests || 0} Demande(s)</Text>
          </View>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Loyer à payer (Avant le {data?.nextDueDate})</Text>
          <Text style={styles.balanceAmount}>{data?.balanceDue || '0 FCFA'}</Text>
        </View>

        <Text style={styles.sectionTitle}>Dernières Quittances</Text>
        {data?.recentReceipts?.map((receipt: any) => (
          <View key={receipt.id} style={styles.receiptCard}>
            <View>
              <Text style={styles.receiptMonth}>{receipt.month}</Text>
              <Text style={styles.receiptAmount}>{receipt.amount}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{receipt.status}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3f4f6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 40 },
  greeting: { fontSize: 28, fontWeight: '800', color: '#111827' },
  badge: { backgroundColor: '#d1fae5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText: { color: '#059669', fontWeight: '700', fontSize: 12 },
  balanceCard: { backgroundColor: '#059669', padding: 24, borderRadius: 24, marginBottom: 32, shadowColor: '#059669', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 10 },
  balanceLabel: { color: '#d1fae5', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  balanceAmount: { color: '#ffffff', fontSize: 36, fontWeight: '900' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#374151', marginBottom: 16 },
  receiptCard: { backgroundColor: '#ffffff', padding: 20, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  receiptMonth: { fontSize: 16, fontWeight: '700', color: '#111827' },
  receiptAmount: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  statusBadge: { backgroundColor: '#ecfdf5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusText: { color: '#059669', fontWeight: '800', fontSize: 12, textTransform: 'uppercase' }
});
