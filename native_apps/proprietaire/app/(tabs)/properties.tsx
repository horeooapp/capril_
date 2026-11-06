import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
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
import { useRouter } from 'expo-router';
import {
  Building2,
  ShieldCheck,
  Lock,
  Search,
  X,
  ArrowUpDown,
  User,
  Plus,
  FileSpreadsheet,
} from 'lucide-react-native';
import { fetchWithAuth } from '../../lib/api';

export default function PropertiesScreen() {
  const router = useRouter();
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

  // Synchronisation dynamique : recharge les biens dès que l'écran reprend le focus
  useFocusEffect(
    useCallback(() => {
      fetchProperties();
    }, [])
  );

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
        {/* TITRE + BOUTONS D'ACTION RAPIDE (NOUVEAU BIEN / NOUVEAU BAIL) */}
        <View style={styles.headerTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sub}>Patrimoine & Conformité (Loi 2019-576)</Text>
            <Text style={styles.title}>Mes Biens ({properties.length})</Text>
          </View>
          <View style={styles.headerActionBtns}>
            <Pressable
              style={styles.headerBtnPrimary}
              onPress={() => router.push('/create-property')}
            >
              <Plus color="#FFFFFF" size={15} />
              <Text style={styles.headerBtnPrimaryText}>Bien</Text>
            </Pressable>
            <Pressable
              style={styles.headerBtnSecondary}
              onPress={() => router.push('/create-lease')}
            >
              <FileSpreadsheet color="#1B4D3E" size={15} />
              <Text style={styles.headerBtnSecondaryText}>Bail</Text>
            </Pressable>
          </View>
        </View>

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
          <View style={{ alignItems: 'center', justifyContent: 'center', padding: 32, marginTop: 20 }}>
            <Building2 size={44} color="#94A3B8" />
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#64748B', textAlign: 'center', marginTop: 12 }}>
              {hasActiveFilters ? 'Aucun bien ne correspond aux filtres' : 'Aucun bien enregistré'}
            </Text>
            <Text style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 6, lineHeight: 18, maxWidth: 280 }}>
              {hasActiveFilters
                ? 'Essayez de réinitialiser la recherche ou de changer de filtre pour voir vos biens.'
                : 'Ajoutez votre première maison, appartement ou commerce pour démarrer la gestion.'}
            </Text>
            {hasActiveFilters ? (
              <Pressable style={styles.resetBtn} onPress={resetFilters}>
                <Text style={styles.resetBtnText}>Réinitialiser les filtres</Text>
              </Pressable>
            ) : (
              <Pressable
                style={styles.emptyAddBtn}
                onPress={() => router.push('/create-property')}
              >
                <Plus color="#FFFFFF" size={16} />
                <Text style={styles.emptyAddBtnText}>Ajouter mon premier bien</Text>
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

                {/* BADGE STATUT : LOUÉ / VACANT */}
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

              {/* ACTION CRÉER UN BAIL SI LE BIEN EST VACANT */}
              {!rented && (
                <Pressable
                  style={styles.createLeaseBtn}
                  onPress={() =>
                    router.push({
                      pathname: '/create-lease',
                      params: {
                        propertyId: item.id,
                        propertyName: item.name,
                        rent: String(item.currentRent || item.declaredRentFcfa || 0),
                      },
                    } as any)
                  }
                >
                  <FileSpreadsheet color="#1B4D3E" size={14} />
                  <Text style={styles.createLeaseBtnText}>Rédiger un bail pour ce bien</Text>
                </Pressable>
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
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, gap: 8 },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerActionBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  headerBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1B4D3E',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  headerBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#1B4D3E',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  headerBtnSecondaryText: {
    color: '#1B4D3E',
    fontSize: 12,
    fontWeight: '700',
  },
  sub: { fontSize: 11, color: '#6E6E73', fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '700', color: '#1C1C1E', marginTop: 1 },
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
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E0D7',
  },
  chipOn: { backgroundColor: '#1B4D3E', borderColor: '#1B4D3E' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#4B5563' },
  chipTextOn: { color: '#FFFFFF', fontWeight: '700' },
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  sortLabel: { fontSize: 11, color: '#6E6E73', fontWeight: '600' },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E0D7',
  },
  sortChipActive: { backgroundColor: '#E8A020', borderColor: '#E8A020' },
  sortChipText: { fontSize: 11, color: '#6E6E73', fontWeight: '500' },
  sortChipTextActive: { color: '#FFFFFF', fontWeight: '700' },
  list: { padding: 16, gap: 12, paddingBottom: 32 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E4E0D7',
    gap: 10,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 8 },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#E6EFEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyName: { fontSize: 15, fontWeight: '700', color: '#1C1C1E' },
  propertyAddress: { fontSize: 12, color: '#6E6E73', marginTop: 1 },
  statusBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6 },
  statusOccupied: { backgroundColor: '#E3F5EC' },
  statusVacant: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 11, fontWeight: '700' },
  statusTextOccupied: { color: '#1E7E4E' },
  statusTextVacant: { color: '#DC2626' },
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
  tenantText: { fontSize: 12, color: '#166534', fontWeight: '600' },
  createLeaseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 2,
  },
  createLeaseBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  rent: { fontSize: 14, fontWeight: '800', color: '#1B4D3E' },
  badgesRight: { flexDirection: 'row', gap: 6 },
  nivPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E3F5EC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  nivText: { fontSize: 10, color: '#1E7E4E', fontWeight: '600' },
  maskPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  maskText: { fontSize: 10, color: '#92400E', fontWeight: '600' },
  resetBtn: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1B4D3E',
    borderRadius: 8,
  },
  resetBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    backgroundColor: '#1B4D3E',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
