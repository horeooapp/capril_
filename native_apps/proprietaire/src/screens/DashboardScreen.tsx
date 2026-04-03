import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';

export default function DashboardScreen({ route }: any) {
  const token = route.params?.token || 'DUMMY_TOKEN';
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://192.168.1.9:3000/api/mobile/dashboard';

  useEffect(() => {
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, role: 'OWNER' })
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
        <ActivityIndicator size="large" color="#C55A11" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>{data?.greeting || 'Bonjour'}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{data?.pendingRepairs || 0} Alertes</Text>
          </View>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Revenus Globaux (Taux d'occupation {data?.occupancyRate})</Text>
          <Text style={styles.balanceAmount}>{data?.totalRevenue || '0 FCFA'}</Text>
        </View>

        <Text style={styles.sectionTitle}>Mes Biens Immobiliers</Text>
        {data?.properties?.map((prop: any) => (
          <View key={prop.id} style={styles.propertyCard}>
            <View>
              <Text style={styles.propertyName}>{prop.name}</Text>
              <Text style={styles.propertyRent}>{prop.rent}</Text>
            </View>
            <View style={[styles.statusBadge, prop.status === 'Loué' ? styles.statusGreen : styles.statusRed]}>
              <Text style={[styles.statusText, prop.status === 'Loué' ? styles.textGreen : styles.textRed]}>{prop.status}</Text>
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
  badge: { backgroundColor: '#ffedd5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText: { color: '#C55A11', fontWeight: '700', fontSize: 12 },
  balanceCard: { backgroundColor: '#C55A11', padding: 24, borderRadius: 24, marginBottom: 32, shadowColor: '#C55A11', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 10 },
  balanceLabel: { color: '#ffedd5', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  balanceAmount: { color: '#ffffff', fontSize: 36, fontWeight: '900' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#374151', marginBottom: 16 },
  propertyCard: { backgroundColor: '#ffffff', padding: 20, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  propertyName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  propertyRent: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusGreen: { backgroundColor: '#ecfdf5' },
  textGreen: { color: '#059669', fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
  statusRed: { backgroundColor: '#fef2f2' },
  textRed: { color: '#b91c1c', fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
  statusText: { fontWeight: '800', fontSize: 12, textTransform: 'uppercase' }
});
