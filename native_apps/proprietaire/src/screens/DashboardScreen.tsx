import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity, StatusBar } from 'react-native';
import { Menu, User, Bell, Wallet, FilePlus, Users, FileText } from 'lucide-react-native';

export default function DashboardScreen({ route, navigation }: any) {
  const token = route.params?.token || 'DUMMY_TOKEN';
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = 'https://www.qapril.ci/api/mobile/dashboard';

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
      <StatusBar barStyle="dark-content" />

      {/* Premium Header */}
      <View style={styles.topHeader}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>Capril Propriétaire</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.profileIcon}>
            <User size={20} color="#001C29" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Bell size={24} color="#001C29" />
          </TouchableOpacity>
        </View>
      </View>

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

        {/* Nouveaux Raccourcis Rapides */}
        <Text style={styles.sectionTitle}>Accès Rapides</Text>
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Wallet')}>
            <View style={[styles.actionIcon, {backgroundColor: '#e0e7ff'}]}><Wallet size={20} color="#4f46e5" /></View>
            <Text style={styles.actionText}>Tirelire</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('CreateLease')}>
            <View style={[styles.actionIcon, {backgroundColor: '#dcfce7'}]}><FilePlus size={20} color="#16a34a" /></View>
            <Text style={styles.actionText}>Créer Bail</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Tenants')}>
            <View style={[styles.actionIcon, {backgroundColor: '#fef3c7'}]}><Users size={20} color="#d97706" /></View>
            <Text style={styles.actionText}>Locataires</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Applications')}>
            <View style={[styles.actionIcon, {backgroundColor: '#fee2e2'}]}><FileText size={20} color="#dc2626" /></View>
            <Text style={styles.actionText}>Dossiers</Text>
          </TouchableOpacity>
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
  container: { padding: 24, paddingTop: 10 },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
  },
  headerIcon: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#001C29',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 10 },
  greeting: { fontSize: 28, fontWeight: '800', color: '#111827' },
  badge: { backgroundColor: '#ffedd5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText: { color: '#064E3B', fontWeight: '700', fontSize: 12 },
  balanceCard: { backgroundColor: '#064E3B', padding: 24, borderRadius: 24, marginBottom: 32, shadowColor: '#064E3B', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 10 },
  balanceLabel: { color: '#ffedd5', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  balanceAmount: { color: '#ffffff', fontSize: 36, fontWeight: '900' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#374151', marginBottom: 16 },
  propertyCard: { backgroundColor: '#ffffff', padding: 20, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  propertyName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  propertyRent: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusGreen: { backgroundColor: '#ecfdf5' },
  textGreen: { color: '#064E3B', fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
  statusRed: { backgroundColor: '#fef2f2' },
  textRed: { color: '#b91c1c', fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
  statusText: { fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
  quickActionsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 8 },
  actionBtn: { flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#f3f4f6' },
  actionIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionText: { fontSize: 10, fontWeight: '800', color: '#374151', textAlign: 'center' }
});
