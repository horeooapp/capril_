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
import { Building2, ShieldCheck, Lock } from 'lucide-react-native';
import { fetchWithAuth } from '../../lib/api';

export default function PropertiesScreen() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'Loué' | 'Vacant'>('all');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetchWithAuth('/proprietaire/properties');
        const json = await response.json();
        if (response.ok && json.properties) {
          setProperties(json.properties);
        }
      } catch (e) {
        console.error("Erreur chargement biens", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#1B4D3E" />
      </SafeAreaView>
    );
  }

  const list = properties.filter((p) => filter === 'all' || p.occupancyStatus === filter);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sub}>Patrimoine & Niveaux de vérification 1 à 4 (ADD-22)</Text>
        <Text style={styles.title}>Mes Biens ({properties.length})</Text>
        <View style={styles.filterRow}>
          {(['all', 'Loué', 'Vacant'] as const).map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.chip, filter === f && styles.chipOn]}
            >
              <Text style={[styles.chipText, filter === f && styles.chipTextOn]}>
                {f === 'all' ? 'Tous' : f === 'Loué' ? 'Loués' : 'Vacants'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', justifyContent: 'center', padding: 32, marginTop: 40 }}>
            <Building2 size={40} color="#94A3B8" />
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#64748B', textAlign: 'center', marginTop: 12 }}>
              Aucun bien trouvé
            </Text>
            <Text style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 6, lineHeight: 18 }}>
              {filter !== 'all' ? `Aucun bien au statut ${filter.toLowerCase()}.` : 'Vos biens enregistrés apparaîtront ici avec leur niveau de conformité.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <View style={styles.rowLeft}>
                <View style={styles.iconBox}>
                  <Building2 color="#1B4D3E" size={20} />
                </View>
                <View>
                  <Text style={styles.propertyName}>{item.name}</Text>
                  <Text style={styles.propertyAddress}>{item.address || item.commune || 'Abidjan'}</Text>
                </View>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  item.occupancyStatus === 'Loué' || item.occupancyStatus === 'Occupé'
                    ? styles.statusOccupied
                    : styles.statusVacant,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    item.occupancyStatus === 'Loué' || item.occupancyStatus === 'Occupé'
                      ? styles.statusTextOccupied
                      : styles.statusTextVacant,
                  ]}
                >
                  {item.occupancyStatus}
                </Text>
              </View>
            </View>

            <View style={styles.footerRow}>
              <Text style={styles.rent}>
                {(item.currentRent || item.declaredRentFcfa || 0).toLocaleString('fr-FR')} F / mois
              </Text>
              <View style={styles.badgesRight}>
                <View style={styles.nivPill}>
                  <ShieldCheck color="#1E7E4E" size={12} />
                  <Text style={styles.nivText}>Vérif. niv. {item.niv || 3}</Text>
                </View>
                {item.masque && (
                  <View style={styles.maskPill}>
                    <Lock color="#9A6500" size={12} />
                    <Text style={styles.maskText}>Identité masquée</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2EC' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 10 },
  sub: { fontSize: 12, color: '#6E6E73', fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '800', color: '#1C1C1E', marginTop: 2 },
  filterRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E0D7',
  },
  chipOn: { backgroundColor: '#1B4D3E', borderColor: '#1B4D3E' },
  chipText: { fontSize: 12, fontWeight: '700', color: '#1C1C1E' },
  chipTextOn: { color: '#FFFFFF' },
  list: { paddingHorizontal: 18, paddingBottom: 40, gap: 10 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E4E0D7',
    gap: 10,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E3EDE9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  propertyName: { fontSize: 14, color: '#1C1C1E', fontWeight: '800' },
  propertyAddress: { fontSize: 12, color: '#6E6E73', marginTop: 2 },
  statusBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 },
  statusOccupied: { backgroundColor: '#E3F5EC' },
  statusVacant: { backgroundColor: '#FBEAE8' },
  statusText: { fontSize: 11, fontWeight: '800' },
  statusTextOccupied: { color: '#1E7E4E' },
  statusTextVacant: { color: '#C0392B' },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E4E0D7',
  },
  rent: { fontSize: 14, fontWeight: '800', color: '#1B4D3E' },
  badgesRight: { flexDirection: 'row', gap: 6 },
  nivPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E3F5EC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  nivText: { fontSize: 10, fontWeight: '800', color: '#1E7E4E' },
  maskPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FDF3DF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  maskText: { fontSize: 10, fontWeight: '800', color: '#9A6500' },
});
