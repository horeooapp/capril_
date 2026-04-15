import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { ChevronLeft, Users, Phone, MapPin, AlertCircle } from 'lucide-react-native';

export default function TenantsScreen({ route, navigation }: any) {
  const token = route.params?.token || 'DUMMY_TOKEN';
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_TENANTS = 'https://www.qapril.ci/api/mobile/owner/tenants';

  useEffect(() => {
    fetch(API_TENANTS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) setTenants(json.tenants);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const makeCall = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#064E3B" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color="#064E3B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes Locataires</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {tenants.length === 0 ? (
          <View style={styles.emptyBox}>
             <Users size={40} color="#d1d5db" style={{marginBottom: 16}} />
             <Text style={styles.emptyText}>Aucun locataire enregistré pour le moment.</Text>
          </View>
        ) : (
          tenants.map(t => (
            <View key={t.leaseId} style={styles.card}>
               <View style={styles.cardHeader}>
                  <View style={styles.avatar}>
                     <Text style={styles.avatarText}>{t.name.charAt(0)}</Text>
                  </View>
                  <View style={{flex: 1}}>
                     <Text style={styles.name}>{t.name}</Text>
                     <View style={styles.locationRow}>
                        <MapPin size={12} color="#6b7280" />
                        <Text style={styles.address}>{t.propertyAddress}</Text>
                     </View>
                  </View>
                  <TouchableOpacity onPress={() => makeCall(t.phone)} style={styles.phoneBtn}>
                     <Phone size={16} color="#064E3B" />
                  </TouchableOpacity>
               </View>

               <View style={styles.divider} />

               <View style={styles.footerRow}>
                  <Text style={styles.rentLabel}>Loyer: <Text style={{fontWeight: '800', color: '#111827'}}>{t.rent?.toLocaleString()} FCFA</Text></Text>
                  
                  {t.status === 'LOYER_IMPAYE' ? (
                     <View style={styles.unpaidBadge}>
                        <AlertCircle size={12} color="#b91c1c" />
                        <Text style={styles.unpaidText}>Impayé</Text>
                     </View>
                  ) : (
                     <View style={styles.activeBadge}>
                        <Text style={styles.activeText}>À jour</Text>
                     </View>
                  )}
               </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3f4f6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  backButton: { padding: 8, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 12, marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#064E3B' },
  container: { padding: 16 },
  emptyBox: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#6b7280', fontSize: 14 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ffedd5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 16, fontWeight: '800', color: '#064E3B' },
  name: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  address: { fontSize: 12, color: '#6b7280' },
  phoneBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ecfdf5', justifyContent: 'center', alignItems: 'center' },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 12 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rentLabel: { fontSize: 13, color: '#4b5563' },
  unpaidBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fef2f2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  unpaidText: { fontSize: 10, fontWeight: '800', color: '#b91c1c', textTransform: 'uppercase' },
  activeBadge: { backgroundColor: '#ecfdf5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  activeText: { fontSize: 10, fontWeight: '800', color: '#059669', textTransform: 'uppercase' }
});
