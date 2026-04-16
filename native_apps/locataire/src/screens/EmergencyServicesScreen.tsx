import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Linking,
  Platform
} from 'react-native';
import { Colors } from '../theme/colors';
import { 
  ChevronLeft, 
  Search, 
  Filter, 
  X, 
  Phone, 
  Map as MapIcon, 
  Wrench, 
  Zap, 
  Building, 
  ShieldAlert 
} from 'lucide-react-native';

import { API_ENDPOINTS } from '../config/api';

export default function EmergencyServicesScreen({ navigation, route }: any) {
  const [contacts, setContacts] = React.useState<any[]>([]);
  const [filteredContacts, setFilteredContacts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const token = route?.params?.token;

  React.useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(API_ENDPOINTS.EMERGENCY_CONTACTS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
    .then(res => res.json())
    .then(data => {
      if(data.success) {
        setContacts(data.contacts);
        setFilteredContacts(data.contacts);
      }
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, [token]);

  React.useEffect(() => {
    const filtered = contacts.filter(contact => 
      contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredContacts(filtered);
  }, [searchQuery, contacts]);
  const makeCall = (number: string) => {
    Linking.openURL(`tel:${number.replace(/\s/g, '')}`);
  };

  const openMaps = (lat: number, lng: number, label: string) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${lat},${lng}`;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });
    Linking.openURL(url!);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Services de proximité</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={20} color={Colors.text.muted} style={styles.searchIcon} />
            <TextInput 
              placeholder="Rechercher un service..." 
              style={styles.searchInput}
              placeholderTextColor={Colors.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={18} color={Colors.text.muted} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity 
            style={[styles.filterButton, { backgroundColor: Colors.white, borderColor: Colors.border }]}
            onPress={() => setSearchQuery('')}
          >
            <Filter size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Dynamic Tags */}
        <View style={styles.tagsContainer}>
          {searchQuery.length > 0 && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>Filtre: {searchQuery}</Text>
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={14} color={Colors.primary} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.tag}>
            <Text style={styles.tagText}>{filteredContacts.length} services trouvés</Text>
          </View>
        </View>

        {/* List */}
        {filteredContacts.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun contact d'urgence trouvé pour "{searchQuery}".</Text>
          </View>
        )}
        {filteredContacts.map((contact: any) => (
          <View key={contact.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>{contact.name}</Text>
                <View style={styles.locationRow}>
                  <MapIcon size={14} color={Colors.text.muted} />
                  <Text style={styles.cardSubtitle}>{contact.category} - {contact.location}</Text>
                </View>
                <View style={[styles.locationRow, { marginTop: 4 }]}>
                  <Text style={styles.hoursText}>{contact.hours}</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity 
                style={styles.phoneButton}
                onPress={() => makeCall(contact.phone)}
              >
                <Phone size={18} color={Colors.primary} />
                <Text style={styles.phoneText}>{contact.phone}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.itineraryButton}
                onPress={() => openMaps(contact.lat, contact.lng, contact.name)}
              >
                <MapIcon size={18} color={Colors.white} />
                <Text style={styles.itineraryText}>Itinéraire</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.background,
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
    color: Colors.primary,
  },
  container: { padding: 16 },
  searchSection: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: Colors.primary },
  filterButton: {
    width: 50,
    height: 50,
    backgroundColor: Colors.cardColors.rose,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Colors.text.muted,
    fontWeight: '500',
  },
  hoursText: {
    fontSize: 12,
    color: Colors.text.muted,
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  phoneButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    height: 48,
    gap: 8,
  },
  phoneText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  itineraryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 48,
    gap: 8,
  },
  itineraryText: { fontSize: 13, fontWeight: '700', color: Colors.white },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.text.muted,
    fontSize: 14,
    fontWeight: '600',
  }
});
