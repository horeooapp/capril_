import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { ChevronLeft, Home, User, CreditCard, Search } from 'lucide-react-native';
import { API_ENDPOINTS } from '../config/api';

export default function PropertiesScreen({ route, navigation }: any) {
  const token = route.params?.token;
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const API_PROPERTIES = API_ENDPOINTS.PROPERTIES;

  const filteredProperties = properties.filter(p => 
    p.address.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.propertyCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tenantName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetch(API_PROPERTIES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) setProperties(json.properties);
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
        <Text style={styles.headerTitle}>Mes Biens Immobiliers</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={18} color="#9ca3af" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Rechercher une adresse, un code ou un locataire..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {properties.length === 0 ? (
          <Text style={styles.emptyText}>Aucun bien enregistré dans votre parc.</Text>
        ) : filteredProperties.length === 0 ? (
          <View style={styles.emptyBox}>
             <Search size={40} color="#d1d5db" style={{marginBottom: 16}} />
             <Text style={styles.emptyText}>Aucun résultat pour "{searchQuery}"</Text>
          </View>
        ) : (
          filteredProperties.map(prop => (
            <View key={prop.id} style={styles.card}>
                <View style={styles.cardHeader}>
              <View style={styles.iconBox}>
                <Home size={24} color="#FFF" />
              </View>
              <View style={styles.cardTitleBox}>
                 <Text style={styles.cardTitle}>{prop.address}</Text>
                 <Text style={styles.cardSubtitle}>{prop.propertyType} - {prop.commune}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoCol}>
                 <User size={16} color="#6b7280" style={{marginBottom: 4}} />
                 <Text style={styles.infoLabel}>Locataire</Text>
                 <Text style={styles.infoValue}>{prop.tenantName || 'Aucun'}</Text>
              </View>
              <View style={styles.infoCol}>
                 <CreditCard size={16} color="#6b7280" style={{marginBottom: 4}} />
                 <Text style={styles.infoLabel}>Loyer</Text>
                 <Text style={styles.infoValue}>{prop.rent?.toLocaleString()} FCFA</Text>
              </View>
            </View>
            
            <View style={[styles.statusBadge, prop.status === 'Occupé' ? styles.badgeGreen : styles.badgeYellow]}>
              <Text style={[styles.statusText, prop.status === 'Occupé' ? styles.textGreen : styles.textYellow]}>
                {prop.status}
              </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#064E3B',
  },
  searchContainer: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 16, height: 48, borderWidth: 1, borderColor: '#e5e7eb' },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 14, color: '#111827', fontWeight: '600' },
  emptyBox: { alignItems: 'center', marginTop: 40 },
  container: { padding: 16 },
  emptyText: { textAlign: 'center', color: '#6b7280', marginTop: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 48, height: 48, 
    borderRadius: 12, 
    backgroundColor: '#064E3B',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12
  },
  cardTitleBox: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  cardSubtitle: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoCol: { flex: 1 },
  infoLabel: { fontSize: 11, color: '#6b7280', fontWeight: '700', textTransform: 'uppercase' },
  infoValue: { fontSize: 14, color: '#111827', fontWeight: '700', marginTop: 2 },
  statusBadge: {
    position: 'absolute',
    top: 20, right: 20,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8
  },
  badgeGreen: { backgroundColor: '#ecfdf5' },
  textGreen: { color: '#059669', fontSize: 10, fontWeight: '800' },
  badgeYellow: { backgroundColor: '#fef3c7' },
  textYellow: { color: '#d97706', fontSize: 10, fontWeight: '800' },
  statusText: { textTransform: 'uppercase' }
});
