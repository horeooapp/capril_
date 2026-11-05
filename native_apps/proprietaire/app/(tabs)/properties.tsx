import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  TextInput,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Building2, ShieldCheck, Lock, Search, X, ArrowUpDown, User } from 'lucide-react-native';
import { fetchWithAuth } from '../../lib/api';

export default function PropertiesScreen() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'Loué' | 'Vacant'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<'default' | 'rent_asc' | 'rent_desc' | 'name'>('default');

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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProperties();
  };

  const isRentedProperty = (p: any) => {
    const s = (p.occupancyStatus || '').toLowerCase();
    return (
      s === 'loué' ||
      s === 'loue' ||
      s === 'occupé' ||
      s === 'occupe' ||
      p.isRented === true ||
      p.status === 'rented' ||
      p.status === 'RENTED' ||
      (typeof p.tenantName === 'string' && p.tenantName.trim().length > 0)
    );
  };

  const rentedCount = properties.filter(isRentedProperty).length;
  const vacantCount = properties.filter((p) => !isRentedProperty(p)).length;

  const filteredList = properties
    .filter((p) => {
      // 1. Filtre statut (Tous, Loués, Vacants)
      if (filter === 'Loué' && !isRentedProperty(p)) return false;
      if (filter === 'Vacant' && isRentedProperty(p)) return false;

      // 2. Recherche par mot-clé (nom, adresse, commune, locataire, code)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          (p.name || '').toLowerCase().includes(q) ||
          (p.address || '').toLowerCase().includes(q) ||
          (p.commune || '').toLowerCase().includes(q) ||
          (p.tenantName || '').toLowerCase().includes(q) ||
          (p.propertyCode || '').toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortMode === 'rent_asc') {
        const rentA = a.currentRent || a.declaredRentFcfa || 0;
        const rentB = b.currentRent || b.declaredRentFcfa || 0;
        return rentA - rentB;
      }
      if (sortMode === 'rent_desc') {
        const rentA = a.currentRent || a.declaredRentFcfa || 0;
        const rentB = b.currentRent || b.declaredRentFcfa || 0;
        return rentB - rentA;
      }
      if (sortMode === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      }
      return 0;
    });

  const hasActiveFilters = filter !== 'all' || Boolean(searchQuery.trim()) || sortMode !== 'default';

  const resetFilters = () => {
    setFilter('all');
    setSearchQuery('');
    setSortMode('default');
  };

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
        <Text style={styles.sub}>Patrimoine & Niveaux de vérification 1 à 4 (ADD-22)</Text>
        <Text style={styles.title}>Mes Biens ({properties.length})</Text>

        {/* 1. BARRE DE RECHERCHE */}
        <View style={styles.searchBar}>
          <Search color="#6E6E73" size={17} style={{ marginLeft: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher par nom, adresse, commune, locataire..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} style={{ padding: 6, marginRight: 6 }}>
              <X color="#6E6E73" size={16} />
            </Pressable>
          )}
        </View>

        {/* 2. SÉLECTEUR DE STATUT (TOUS, LOUÉS, VACANTS) AVEC COMPTEURS RÉELS */}
        <View style={styles.filterRow}>
          {[
            { id: 'all', label: `Tous (${properties.length})` },
            { id: 'Loué', label: `Loués (${rentedCount})` },
            { id: 'Vacant', label: `Vacants (${vacantCount})` },
          ].map((item) => (
            <Pressable
              key={item.id}
              onPress={() => setFilter(item.id as any)}
              style={[styles.chip, filter === item.id && styles.chipOn]}
            >
              <Text style={[styles.chipText, filter === item.id && styles.chipTextOn]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* 3. TRI PAR PRIX / NOM */}
        <View style={styles.sortRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <ArrowUpDown color="#6E6E73" size={13} />
            <Text style={styles.sortLabel}>Tri :</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {[
              { id: 'default', label: 'Défaut' },
              { id: 'rent_asc', label: 'Loyer croissant ↗' },
              { id: 'rent_desc', label: 'Loyer décroissant ↘' },
              { id: 'name', label: 'Nom (A-Z)' },
            ].map((s) => {
              const active = sortMode === s.id;
              return (
                <Pressable
                  key={s.id}
                  onPress={() => setSortMode(s.id as any)}
                  style={[styles.sortChip, active && styles.sortChipActive]}
                >
                  <Text style={[styles.sortChipText, active && styles.sortChipTextActive]}>
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>

      <FlatList
        data={filteredList}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1B4D3E']} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', justifyContent: 'center', padding: 32, marginTop: 30 }}>
            <Building2 size={44} color="#94A3B8" />
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#64748B', textAlign: 'center', marginTop: 12 }}>
              {hasActiveFilters ? 'Aucun bien ne correspond aux filtres' : 'Aucun bien enregistré'}
            </Text>
            <Text style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 6, lineHeight: 18 }}>
              {hasActiveFilters
                ? 'Essayez de réinitialiser la recherche ou de changer de filtre pour voir vos biens.'
                : 'Vos biens apparaîtront ici dès qu’ils seront créés avec leur niveau de conformité.'}
            </Text>
            {hasActiveFilters && (
              <Pressable style={styles.resetBtn} onPress={resetFilters}>
                <Text style={styles.resetBtnText}>Réinitialiser les filtres</Text>
              </Pressable>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const rented = isRentedProperty(item);
          return (
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconBox, rented && { backgroundColor: '#E3F5EC' }]}>
                    <Building2 color={rented ? '#1E7E4E' : '#1B4D3E'} size={20} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.propertyName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.propertyAddress} numberOfLines={1}>
                      {item.address ? `${item.address} · ` : ''}{item.commune || 'Abidjan'}
                    </Text>
                  </View>
                </View>

                {/* BADGE STATUT CONFORME : LOUÉ / VACANT */}
                <View style={[styles.statusBadge, rented ? styles.statusOccupied : styles.statusVacant]}>
                  <Text style={[styles.statusText, rented ? styles.statusTextOccupied : styles.statusTextVacant]}>
                    {rented ? 'Loué' : 'Vacant'}
                  </Text>
                </View>
              </View>

              {/* LOCATAIRE ACTIF SI LE BIEN EST LOUÉ */}
              {rented && item.tenantName && (
                <View style={styles.tenantBanner}>
                  <User color="#1E7E4E" size={13} />
                  <Text style={styles.tenantText}>Locataire : {item.tenantName}</Text>
                </View>
              )}

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
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2EC' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 10, gap: 8 },
  sub: { fontSize: 12, color: '#6E6E73', fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '800', color: '#1C1C1E' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E0D7',
    borderRadius: 12,
    marginTop: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 8,
    fontSize: 13,
    color: '#1C1C1E',
  },
  filterRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E0D7',
  },
  chipOn: { backgroundColor: '#1B4D3E', borderColor: '#1B4D3E' },
  chipText: { fontSize: 12, fontWeight: '700', color: '#1C1C1E' },
  chipTextOn: { color: '#FFFFFF' },
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  sortLabel: { fontSize: 11, fontWeight: '800', color: '#6E6E73' },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#EBE7DE',
  },
  sortChipActive: {
    backgroundColor: '#1B4D3E',
  },
  sortChipText: { fontSize: 11, fontWeight: '700', color: '#555' },
  sortChipTextActive: { color: '#FFF' },
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
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 8 },
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
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusOccupied: { backgroundColor: '#E3F5EC' },
  statusVacant: { backgroundColor: '#FBEAE8' },
  statusText: { fontSize: 11, fontWeight: '800' },
  statusTextOccupied: { color: '#1E7E4E' },
  statusTextVacant: { color: '#C0392B' },
  tenantBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  tenantText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
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
  resetBtn: {
    marginTop: 14,
    backgroundColor: '#1B4D3E',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
  },
  resetBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
