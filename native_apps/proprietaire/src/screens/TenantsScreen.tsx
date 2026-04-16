import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity, Linking, TextInput } from 'react-native';
import { ChevronLeft, Users, Phone, MapPin, AlertCircle, Search, Award } from 'lucide-react-native';
import { API_ENDPOINTS } from '../config/api';

export default function TenantsScreen({ route, navigation }: any) {
  const token = route.params?.token;
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const API_TENANTS = API_ENDPOINTS.TENANTS;

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.propertyAddress?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={18} color="#9ca3af" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Rechercher un locataire ou un bien..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {tenants.length === 0 ? (
          <View style={styles.emptyBox}>
             <Users size={40} color="#d1d5db" style={{marginBottom: 16}} />
             <Text style={styles.emptyText}>Aucun locataire enregistré pour le moment.</Text>
          </View>
        ) : filteredTenants.length === 0 ? (
          <View style={styles.emptyBox}>
             <Search size={40} color="#d1d5db" style={{marginBottom: 16}} />
             <Text style={styles.emptyText}>Aucun résultat pour "{searchQuery}"</Text>
          </View>
        ) : (
          filteredTenants.map(t => (
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
                  <View style={styles.reliabilityColumn}>
                     <View style={[styles.badgeTiny, { backgroundColor: t.reliability?.badge === 'A+' ? '#D97706' : '#6B7280' }]}>
                        <Award size={10} color="#fff" />
                        <Text style={styles.badgeTinyText}>{t.reliability?.badge}</Text>
                     </View>
                     <Text style={styles.scoreTiny}>{t.reliability?.score} pts</Text>
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
  searchContainer: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 16, height: 48, borderWidth: 1, borderColor: '#e5e7eb' },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 14, color: '#111827', fontWeight: '600' },
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
  activeText: { fontSize: 10, fontWeight: '800', color: '#059669', textTransform: 'uppercase' },
  reliabilityColumn: { alignItems: 'flex-end', marginRight: 12 },
  badgeTiny: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, gap: 4 },
  badgeTinyText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  scoreTiny: { fontSize: 10, fontWeight: '700', color: '#4b5563', marginTop: 2 }
});
