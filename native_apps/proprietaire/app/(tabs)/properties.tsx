import { TopNavHeader } from '../../components/TopNavHeader';
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
  Alert,
  Image,
  Modal,
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
  MapPin,
  Navigation,
  ChevronRight,
  Bed,
  Maximize2,
  Home,
  CheckCircle2,
} from 'lucide-react-native';
import { fetchWithAuth } from '../../lib/api';

// Chargement sécurisé conditionnel du module de géolocalisation
let LocationModule: any = null;
try {
  LocationModule = require('expo-location');
} catch {
  LocationModule = null;
}

const formatImageUrl = (uri?: string | null) => {
  if (!uri) return null;
  if (uri.startsWith('http://') || uri.startsWith('https://')) return uri;
  if (uri.startsWith('/')) return `https://qapril.net${uri}`;
  return `https://qapril.net/${uri}`;
};

const fmtFcfa = (n?: number | string | null) => {
  const num = typeof n === 'number' ? n : Number(n);
  if (isNaN(num)) return '0 F';
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' F';
};

export default function PropertiesScreen() {
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'Loué' | 'Vacant'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<'default' | 'rent_asc' | 'rent_desc' | 'name'>('default');
  const [capturingPropertyId, setCapturingPropertyId] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);

  const handleCaptureGpsForProperty = async (propertyId: string) => {
    if (!LocationModule || !LocationModule.requestForegroundPermissionsAsync) {
      Alert.alert(
        'Capture GPS',
        'La capture GPS directe depuis l\'application nécessite la dernière mise à jour native. Vous pouvez renseigner l\'adresse complète dans le formulaire du bien.'
      );
      return;
    }

    setCapturingPropertyId(propertyId);
    try {
      const { status } = await LocationModule.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Veuillez autoriser l\'accès à la géolocalisation pour enregistrer la position de ce bien.'
        );
        setCapturingPropertyId(null);
        return;
      }

      const pos = await LocationModule.getCurrentPositionAsync({
        accuracy: LocationModule.Accuracy?.High ?? 4,
      });

      if (pos?.coords) {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy || 15);

        const response = await fetchWithAuth(`/proprietaire/properties/${propertyId}/geolocalisation`, {
          method: 'POST',
          body: JSON.stringify({
            lat,
            lng,
            precisionM: accuracy,
          }),
        });

        const data = await response.json();
        if (response.ok && data.success) {
          Alert.alert(
            'Position enregistrée !',
            data.message || `Coordonnées certifiées : ${lat.toFixed(5)}°, ${lng.toFixed(5)}°`
          );
          fetchProperties();
        } else {
          Alert.alert('Erreur', data.error || 'Impossible d\'enregistrer la position.');
        }
      }
    } catch (e: any) {
      Alert.alert('Erreur GPS', e.message || 'Impossible d\'obtenir les coordonnées GPS.');
    } finally {
      setCapturingPropertyId(null);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await fetchWithAuth('/proprietaire/properties');
      if (!response.ok) {
        return;
      }
      const json = await response.json();
      if (json && Array.isArray(json.properties)) {
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
    if (!p) return false;
    const s = String(p.occupancyStatus || '').toLowerCase();
    return (
      s === 'loué' ||
      s === 'loue' ||
      s === 'occupé' ||
      s === 'occupe' ||
      p.isRented === true ||
      String(p.status || '').toLowerCase() === 'rented' ||
      (typeof p.tenantName === 'string' && p.tenantName.trim().length > 0)
    );
  };

  const safeProperties = Array.isArray(properties) ? properties : [];
  const rentedCount = safeProperties.filter(isRentedProperty).length;
  const vacantCount = safeProperties.filter((p) => !isRentedProperty(p)).length;

  const filteredList = [...safeProperties]
    .filter((p) => {
      if (!p) return false;
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
        const rentA = Number(a.currentRent || a.declaredRentFcfa || 0);
        const rentB = Number(b.currentRent || b.declaredRentFcfa || 0);
        return rentA - rentB;
      }
      if (sortMode === 'rent_desc') {
        const rentA = Number(a.currentRent || a.declaredRentFcfa || 0);
        const rentB = Number(b.currentRent || b.declaredRentFcfa || 0);
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
      <TopNavHeader title="Mes Biens" subtitle="Patrimoine & Conformité" />
      <View style={styles.header}>
        {/* TITRE + BOUTONS D'ACTION RAPIDE (NOUVEAU BIEN / NOUVEAU BAIL) */}
        <View style={styles.headerTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sub}>Gestion de votre patrimoine</Text>
            <Text style={styles.title}>Mes Biens ({safeProperties.length})</Text>
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
            { id: 'all', label: `Tous (${safeProperties.length})` },
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
        keyExtractor={(item, index) => (item?.id ? String(item.id) : String(index))}
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
          if (!item) return null;
          const rented = isRentedProperty(item);
          const hasGps = item.gpsLatitude != null && item.gpsLongitude != null && !isNaN(Number(item.gpsLatitude)) && !isNaN(Number(item.gpsLongitude));
          const imgUri = formatImageUrl(item.imageUrl);
          const allImgs = Array.isArray(item.images) && item.images.length > 0
            ? item.images
            : (item.imageUrl ? [item.imageUrl] : []);

          return (
            <Pressable style={styles.card} onPress={() => setSelectedProperty(item)}>
              {/* IMAGE PRINCIPALE DU BIEN */}
              {imgUri ? (
                <View style={styles.cardImageContainer}>
                  <Image source={{ uri: imgUri }} style={styles.cardImage} resizeMode="cover" />
                  <View style={[styles.statusBadgeOverlay, rented ? styles.statusOccupied : styles.statusVacant]}>
                    <Text style={[styles.statusText, rented ? styles.statusTextOccupied : styles.statusTextVacant]}>
                      {rented ? 'Loué' : 'Vacant'}
                    </Text>
                  </View>
                  {allImgs.length > 1 && (
                    <View style={styles.photosCountBadge}>
                      <Text style={styles.photosCountText}>📷 {allImgs.length} photos</Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.cardImagePlaceholder}>
                  <Building2 color="#94A3B8" size={30} />
                  <Text style={styles.cardImagePlaceholderText}>Photo du bien en attente</Text>
                  <View style={[styles.statusBadgeOverlay, rented ? styles.statusOccupied : styles.statusVacant]}>
                    <Text style={[styles.statusText, rented ? styles.statusTextOccupied : styles.statusTextVacant]}>
                      {rented ? 'Loué' : 'Vacant'}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.rowBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.propertyName} numberOfLines={1}>{item.name || 'Bien sans nom'}</Text>
                  <Text style={styles.propertyAddress} numberOfLines={1}>
                    {item.address ? `${item.address} · ` : ''}{item.commune || 'Abidjan'}{item.city && item.city !== item.commune ? ` (${item.city})` : ''}
                  </Text>
                </View>
              </View>

              {/* CARACTÉRISTIQUES CLÉS (PIÈCES, SURFACE) */}
              {(item.rooms || item.bedrooms || item.superficieM2 || item.propertyType) && (
                <View style={styles.specsRow}>
                  {item.propertyType ? (
                    <View style={styles.specItem}>
                      <Home color="#64748B" size={12} />
                      <Text style={styles.specText}>{item.propertyType}</Text>
                    </View>
                  ) : null}
                  {item.rooms ? (
                    <View style={styles.specItem}>
                      <Building2 color="#64748B" size={12} />
                      <Text style={styles.specText}>{item.rooms} pce{item.rooms > 1 ? 's' : ''}</Text>
                    </View>
                  ) : null}
                  {item.bedrooms ? (
                    <View style={styles.specItem}>
                      <Bed color="#64748B" size={12} />
                      <Text style={styles.specText}>{item.bedrooms} ch.</Text>
                    </View>
                  ) : null}
                  {item.superficieM2 ? (
                    <View style={styles.specItem}>
                      <Maximize2 color="#64748B" size={12} />
                      <Text style={styles.specText}>{item.superficieM2} m²</Text>
                    </View>
                  ) : null}
                </View>
              )}

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
                  onPress={(e) => {
                    e.stopPropagation();
                    router.push({
                      pathname: '/create-lease',
                      params: {
                        propertyId: item.id,
                        propertyName: item.name,
                        rent: String(item.currentRent || item.declaredRentFcfa || 0),
                      },
                    } as any);
                  }}
                >
                  <FileSpreadsheet color="#1B4D3E" size={14} />
                  <Text style={styles.createLeaseBtnText}>Rédiger un bail pour ce bien</Text>
                </Pressable>
              )}

              {/* BLOC GÉOLOCALISATION GPS */}
              <View style={styles.geoRow}>
                <View style={styles.geoRowLeft}>
                  <MapPin color={hasGps ? '#1E7E4E' : '#94A3B8'} size={13} />
                  <Text style={styles.geoRowText} numberOfLines={1}>
                    {hasGps
                      ? `GPS : ${Number(item.gpsLatitude).toFixed(4)}°, ${Number(item.gpsLongitude).toFixed(4)}° (${item.codeLocalisation || 'Déclaré'})`
                      : 'Position GPS non renseignée'}
                  </Text>
                </View>

                <Pressable
                  style={[styles.geoCaptureBtn, capturingPropertyId === item.id && { opacity: 0.6 }]}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleCaptureGpsForProperty(item.id);
                  }}
                  disabled={capturingPropertyId === item.id}
                >
                  {capturingPropertyId === item.id ? (
                    <ActivityIndicator size="small" color="#1B4D3E" />
                  ) : (
                    <>
                      <Navigation color="#1B4D3E" size={11} />
                      <Text style={styles.geoCaptureBtnText}>
                        {hasGps ? 'Actualiser' : 'Capturer GPS'}
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>

              <View style={styles.footerRow}>
                <Text style={styles.rent}>
                  {fmtFcfa(item.currentRent || item.declaredRentFcfa)} / mois
                </Text>
                <View style={styles.badgesRight}>
                  <View style={[styles.nivPill, !item.isBienVerifie && !(item.gpsLatitude != null) && { backgroundColor: '#F1F5F9' }]}>
                    <ShieldCheck color={item.isBienVerifie || item.gpsLatitude != null ? "#1E7E4E" : "#64748B"} size={12} />
                    <Text style={[styles.nivText, !item.isBienVerifie && !(item.gpsLatitude != null) && { color: '#64748B' }]}>
                      {item.isBienVerifie || (item.niveauVerifVente && item.niveauVerifVente >= 3)
                        ? 'Titre vérifié (niv. 3)'
                        : item.gpsLatitude != null
                        ? 'GPS certifié (niv. 2)'
                        : 'Déclaré (niv. 1)'}
                    </Text>
                  </View>
                  {item.masque && (
                    <View style={styles.maskPill}>
                      <Lock color="#9A6500" size={12} />
                      <Text style={styles.maskText}>Identité masquée</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* BOUTON DÉTAIL DU BIEN */}
              <View style={styles.cardDetailLink}>
                <Text style={styles.cardDetailLinkText}>Voir les détails complets</Text>
                <ChevronRight color="#1B4D3E" size={14} />
              </View>
            </Pressable>
          );
        }}
      />

      {/* MODAL DÉTAILS DU BIEN */}
      {selectedProperty && (
        <Modal
          visible={Boolean(selectedProperty)}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedProperty(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle} numberOfLines={1}>{selectedProperty.name || 'Détails du bien'}</Text>
                  <Text style={styles.modalSub}>{selectedProperty.propertyCode || 'Code certifié QAPRIL'}</Text>
                </View>
                <Pressable style={styles.modalCloseBtn} onPress={() => setSelectedProperty(null)}>
                  <X color="#1C1C1E" size={18} />
                </Pressable>
              </View>

              <ScrollView contentContainerStyle={styles.modalScroll}>
                {/* GALERIE D'IMAGES DU BIEN */}
                {Array.isArray(selectedProperty.images) && selectedProperty.images.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16, paddingHorizontal: 16 }}>
                    {selectedProperty.images.map((img: string, idx: number) => {
                      const u = formatImageUrl(img);
                      if (!u) return null;
                      return (
                        <Image
                          key={idx}
                          source={{ uri: u }}
                          style={styles.detailGalleryImg}
                          resizeMode="cover"
                        />
                      );
                    })}
                  </ScrollView>
                ) : selectedProperty.imageUrl ? (
                  <Image
                    source={{ uri: formatImageUrl(selectedProperty.imageUrl) || '' }}
                    style={[styles.detailGalleryImg, { width: '100%', marginRight: 0 }]}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.detailImagePlaceholder}>
                    <Building2 color="#94A3B8" size={40} />
                    <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>Aucune photo enregistrée</Text>
                  </View>
                )}

                {/* STATUT & FINANCES */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Statut & Finances</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Occupation</Text>
                    <View style={[styles.statusBadge, isRentedProperty(selectedProperty) ? styles.statusOccupied : styles.statusVacant]}>
                      <Text style={[styles.statusText, isRentedProperty(selectedProperty) ? styles.statusTextOccupied : styles.statusTextVacant]}>
                        {isRentedProperty(selectedProperty) ? 'Loué' : 'Vacant'}
                      </Text>
                    </View>
                  </View>

                  {isRentedProperty(selectedProperty) && selectedProperty.tenantName && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Locataire actuel</Text>
                      <Text style={[styles.detailValue, { color: '#166534' }]}>{selectedProperty.tenantName}</Text>
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Loyer mensuel</Text>
                    <Text style={[styles.detailValue, { color: '#1B4D3E', fontSize: 15 }]}>
                      {fmtFcfa(selectedProperty.currentRent || selectedProperty.declaredRentFcfa)} / mois
                    </Text>
                  </View>

                  {selectedProperty.declaredRentFcfa ? (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Loyer de référence déclaré</Text>
                      <Text style={styles.detailValue}>{fmtFcfa(selectedProperty.declaredRentFcfa)}</Text>
                    </View>
                  ) : null}
                </View>

                {/* LOCALISATION */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Localisation</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Adresse</Text>
                    <Text style={styles.detailValue}>{selectedProperty.address || 'Non précisée'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Commune</Text>
                    <Text style={styles.detailValue}>{selectedProperty.commune || 'Abidjan'}</Text>
                  </View>
                  {selectedProperty.city && selectedProperty.city !== selectedProperty.commune && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Ville</Text>
                      <Text style={styles.detailValue}>{selectedProperty.city}</Text>
                    </View>
                  )}
                  {selectedProperty.gpsLatitude != null && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Coordonnées GPS</Text>
                      <Text style={styles.detailValue}>
                        {Number(selectedProperty.gpsLatitude).toFixed(4)}°, {Number(selectedProperty.gpsLongitude).toFixed(4)}°
                      </Text>
                    </View>
                  )}
                </View>

                {/* CARACTÉRISTIQUES DU LOGEMENT */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Caractéristiques</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Type de bien</Text>
                    <Text style={styles.detailValue}>{selectedProperty.propertyType || 'Résidentiel'}</Text>
                  </View>
                  {selectedProperty.typeStructure && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Structure</Text>
                      <Text style={styles.detailValue}>{selectedProperty.typeStructure}</Text>
                    </View>
                  )}
                  {selectedProperty.rooms != null && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Nombre de pièces</Text>
                      <Text style={styles.detailValue}>{selectedProperty.rooms} pièce(s)</Text>
                    </View>
                  )}
                  {selectedProperty.bedrooms != null && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Chambres</Text>
                      <Text style={styles.detailValue}>{selectedProperty.bedrooms} chambre(s)</Text>
                    </View>
                  )}
                  {selectedProperty.superficieM2 != null && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Superficie</Text>
                      <Text style={styles.detailValue}>{selectedProperty.superficieM2} m²</Text>
                    </View>
                  )}
                </View>

                {/* ACTION CRÉER UN BAIL SI VACANT */}
                {!isRentedProperty(selectedProperty) && (
                  <Pressable
                    style={styles.modalPrimaryBtn}
                    onPress={() => {
                      const p = selectedProperty;
                      setSelectedProperty(null);
                      router.push({
                        pathname: '/create-lease',
                        params: {
                          propertyId: p.id,
                          propertyName: p.name,
                          rent: String(p.currentRent || p.declaredRentFcfa || 0),
                        },
                      } as any);
                    }}
                  >
                    <FileSpreadsheet color="#FFFFFF" size={16} />
                    <Text style={styles.modalPrimaryBtnText}>Rédiger un contrat de bail</Text>
                  </Pressable>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
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
  geoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 8,
  },
  geoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  geoRowText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
  },
  geoCaptureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6EFEA',
    borderWidth: 1,
    borderColor: '#C6E7D4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  geoCaptureBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1B4D3E',
  },
  // Styles cartes et images du bien
  cardImageContainer: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
    gap: 4,
  },
  cardImagePlaceholderText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  statusBadgeOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  photosCountBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  photosCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 2,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  cardDetailLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cardDetailLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1B4D3E',
  },
  // Modal de détail du bien
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    padding: 16,
    gap: 14,
  },
  detailGalleryImg: {
    width: 280,
    height: 190,
    marginRight: 10,
    borderRadius: 12,
  },
  detailImagePlaceholder: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  detailSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1E',
    maxWidth: '65%',
    textAlign: 'right',
  },
  modalPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1B4D3E',
    borderRadius: 10,
    paddingVertical: 13,
    marginTop: 6,
  },
  modalPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
