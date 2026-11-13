import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Search,
  MapPin,
  Calendar,
  SlidersHorizontal,
  ShieldCheck,
  Building2,
  ChevronDown,
  Check,
  Tag,
  ArrowRight,
} from 'lucide-react-native';
import { TopNavHeader } from '../../components/TopNavHeader';
import { fetchWithAuth } from '../../lib/api';

// Référentiel des communes et quartiers d'Abidjan (S-08 / ML-08)
const COMMUNES_ABIDJAN = [
  'Toutes les communes',
  'Cocody',
  'Plateau',
  'Marcory',
  'Yopougon',
  'Koumassi',
  'Treichville',
  'Port-Bouët',
  'Abobo',
  'Adjamé',
  'Attécoubé',
  'Bingerville',
  'Songon',
];

const QUARTIERS_PAR_COMMUNE: Record<string, string[]> = {
  Cocody: ['Tous les quartiers', 'Angré', 'Riviera', 'II Plateaux', 'Danga', 'Ambassades'],
  Marcory: ['Tous les quartiers', 'Zone 4', 'Biétry', 'Résidentiel', 'Anoumabo'],
  Plateau: ['Tous les quartiers', 'Centre des Affaires', 'Cité Administrative'],
  Yopougon: ['Tous les quartiers', 'Niangon', 'Maroc', 'Selmer', 'Toits Rouges'],
};

export default function RechercheScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [annonces, setAnnonces] = useState<any[]>([]);

  // Filtres (ML-08)
  const [selectedCommune, setSelectedCommune] = useState('Cocody');
  const [selectedQuartier, setSelectedQuartier] = useState('Tous les quartiers');
  const [communeModalVisible, setCommuneModalVisible] = useState(false);
  const [budgetMin, setBudgetMin] = useState(100000);
  const [budgetMax, setBudgetMax] = useState(400000);
  const [typeBien, setTypeBien] = useState('TOUS'); // 2 pièces, 3 pièces, etc.

  const loadAnnonces = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        commune: selectedCommune === 'Toutes les communes' ? '' : selectedCommune,
        quartier: selectedQuartier === 'Tous les quartiers' ? '' : selectedQuartier,
        budgetMin: String(budgetMin),
        budgetMax: String(budgetMax),
      });

      const res = await fetchWithAuth(`/v1/portail/annonces?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAnnonces(data.annonces || []);
      }
    } catch (e) {
      console.warn('Erreur chargement annonces:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnnonces();
  }, [selectedCommune, selectedQuartier]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAnnonces();
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNavHeader title="Recherche" subtitle="Trouver un logement" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2C3E6B']} />}
      >
        <Text style={styles.sub}>Logements contrôlés & Candidatures transparentes</Text>
        <Text style={styles.title}>Trouver un logement</Text>

        {/* BLOC OÙ SUR LE RÉFÉRENTIEL (Ticket ML-08) */}
        <View style={styles.filterCard}>
          <Text style={styles.filterSectionTitle}>OÙ CHERCHEZ-VOUS ?</Text>

          {/* Sélecteur de commune */}
          <Pressable
            style={styles.selectBtn}
            onPress={() => setCommuneModalVisible(true)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MapPin size={16} color="#2C3E6B" />
              <Text style={styles.selectBtnText}>{selectedCommune}</Text>
            </View>
            <ChevronDown size={16} color="#64748B" />
          </Pressable>

          {/* Quartiers de la commune */}
          {QUARTIERS_PAR_COMMUNE[selectedCommune] && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {QUARTIERS_PAR_COMMUNE[selectedCommune].map((q) => (
                  <Pressable
                    key={q}
                    style={[styles.chip, selectedQuartier === q && styles.chipActive]}
                    onPress={() => setSelectedQuartier(q)}
                  >
                    <Text style={[styles.chipText, selectedQuartier === q && styles.chipTextActive]}>{q}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          )}

          {/* BLOC COMBIEN : BUDGET PAR PALIERS DE 5 000 (ML-08) */}
          <View style={styles.budgetRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.budgetLabel}>Budget max (F)</Text>
              <View style={styles.budgetControls}>
                <Pressable
                  style={styles.budgetBtn}
                  onPress={() => setBudgetMax(Math.max(50000, budgetMax - 10000))}
                >
                  <Text style={styles.budgetBtnText}>- 10 k</Text>
                </Pressable>
                <Text style={styles.budgetValue}>{budgetMax.toLocaleString('fr-FR')} F</Text>
                <Pressable
                  style={styles.budgetBtn}
                  onPress={() => setBudgetMax(budgetMax + 10000)}
                >
                  <Text style={styles.budgetBtnText}>+ 10 k</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* LISTE DES ANNONCES (Ticket ML-09 / CDC IC-R3) */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={styles.listHeader}>
            {annonces.length} logement(s) disponible(s)
          </Text>
          <Text style={styles.locationNotice}>Placement au quartier seul</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#2C3E6B" style={{ marginTop: 30 }} />
        ) : annonces.length === 0 ? (
          <View style={styles.cardEmpty}>
            <Building2 color="#94A3B8" size={36} />
            <Text style={styles.emptyTitle}>Aucune annonce dans ce secteur</Text>
            <Text style={styles.emptyText}>
              Modifiez votre sélection de commune ou augmentez le budget pour découvrir de nouveaux logements.
            </Text>
          </View>
        ) : (
          annonces.map((item) => (
            <View key={item.id} style={styles.annonceCard}>
              {/* En-tête carte IC-R3 */}
              <View style={styles.annonceHeader}>
                <View style={styles.badgeBien}>
                  <Text style={styles.badgeBienText}>Bien vérifié · Niveau {item.level || 2}</Text>
                </View>
                <Text style={styles.publiantText}>
                  {item.agencyName ? item.agencyName : 'Bailleur particulier'}
                </Text>
              </View>

              {/* Titre & Quartier seul (ML-09 / S-04 : jamais l'adresse exacte) */}
              <Text style={styles.annonceTitle}>
                {item.propertyType || 'Logement'} · {item.rooms || 3} pièces
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <MapPin size={13} color="#64748B" />
                <Text style={styles.annonceQuartier}>
                  {item.quartier || item.commune || 'Cocody'}, Abidjan (Rayon 300 m)
                </Text>
              </View>

              {/* Conditions financières conformes cadre légal */}
              <View style={styles.annoncePriceRow}>
                <Text style={styles.annoncePrice}>
                  {Number(item.rentAmount || 250000).toLocaleString('fr-FR')} F / mois
                </Text>
                <View style={styles.pillCaution}>
                  <Text style={styles.pillCautionText}>Caution consignée</Text>
                </View>
              </View>

              <View style={styles.conditionsRow}>
                <Text style={styles.condText}>Dépôt : max 2 mois</Text>
                <Text style={styles.condDot}>·</Text>
                <Text style={styles.condText}>Avance : max 2 mois</Text>
                <Text style={styles.condDot}>·</Text>
                <Text style={styles.condText}>
                  {item.isNegotiable ? 'Loyer négociable' : 'Prix ferme'}
                </Text>
              </View>

              {/* Bouton Candidature Passeport (ML-02 / ML-09) */}
              <Pressable
                style={styles.btnCandidater}
                onPress={() => {
                  Alert.alert(
                    'Candidature avec mon passeport',
                    `Transmettre votre dossier (tranche de confiance, badges de paiement) pour ce logement à ${item.quartier || item.commune}.\n\nVos pièces d'identité et quittances restent strictement confidentielles.`,
                    [
                      { text: 'Annuler', style: 'cancel' },
                      {
                        text: 'Confirmer la candidature',
                        onPress: async () => {
                          try {
                            const res = await fetchWithAuth(`/v1/annonces/${item.id}/candidater`, { method: 'POST' });
                            const data = await res.json();
                            if (res.ok) {
                              Alert.alert('Candidature transmise', 'Votre candidature a été envoyée au bailleur.');
                            } else {
                              Alert.alert('Information', data.message || 'Candidature déjà transmise.');
                            }
                          } catch {
                            Alert.alert('Erreur', 'Impossible de transmettre la candidature.');
                          }
                        },
                      },
                    ]
                  );
                }}
              >
                <ShieldCheck size={16} color="#FFFFFF" />
                <Text style={styles.btnCandidaterText}>Candidater avec mon passeport</Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal Sélection Commune */}
      <Modal visible={communeModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sélectionnez une commune d'Abidjan</Text>
            <ScrollView style={{ maxHeight: 350 }}>
              {COMMUNES_ABIDJAN.map((c) => (
                <Pressable
                  key={c}
                  style={styles.modalOption}
                  onPress={() => {
                    setSelectedCommune(c);
                    setSelectedQuartier('Tous les quartiers');
                    setCommuneModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalOptionText, selectedCommune === c && styles.modalOptionTextActive]}>
                    {c}
                  </Text>
                  {selectedCommune === c && <Check size={16} color="#1E7E4E" />}
                </Pressable>
              ))}
            </ScrollView>
            <Pressable
              style={styles.modalCloseBtn}
              onPress={() => setCommuneModalVisible(false)}
            >
              <Text style={styles.modalCloseBtnText}>Fermer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F9' },
  scroll: { padding: 16, paddingBottom: 100 },
  sub: { fontSize: 11, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 24, fontWeight: '900', color: '#0F172A', marginTop: 4, marginBottom: 16 },
  filterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EF',
    marginBottom: 16,
  },
  filterSectionTitle: { fontSize: 11, fontWeight: '800', color: '#64748B', letterSpacing: 0.5, marginBottom: 8 },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  selectBtnText: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: { backgroundColor: '#EBF5F0', borderColor: '#1E7E4E' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  chipTextActive: { color: '#1E7E4E', fontWeight: '800' },
  budgetRow: { marginTop: 14 },
  budgetLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', marginBottom: 4 },
  budgetControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: 8, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  budgetBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1' },
  budgetBtnText: { fontSize: 12, fontWeight: '800', color: '#2C3E6B' },
  budgetValue: { fontSize: 16, fontWeight: '900', color: '#0F172A' },
  listHeader: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  locationNotice: { fontSize: 11, color: '#94A3B8' },
  annonceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EF',
    marginBottom: 14,
  },
  annonceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  badgeBien: { backgroundColor: '#EBF5F0', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, borderWidth: 1, borderColor: '#C6E7D6' },
  badgeBienText: { fontSize: 10, fontWeight: '800', color: '#1E7E4E' },
  publiantText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  annonceTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  annonceQuartier: { fontSize: 12, color: '#64748B' },
  annoncePriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  annoncePrice: { fontSize: 18, fontWeight: '900', color: '#1B4D3E' },
  pillCaution: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  pillCautionText: { fontSize: 10, fontWeight: '800', color: '#92400E' },
  conditionsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  condText: { fontSize: 11, color: '#64748B' },
  condDot: { color: '#94A3B8' },
  btnCandidater: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2C3E6B',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  btnCandidaterText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  cardEmpty: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EF' },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginTop: 10 },
  emptyText: { fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
  modalOption: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalOptionText: { fontSize: 14, color: '#334155' },
  modalOptionTextActive: { fontWeight: '800', color: '#1E7E4E' },
  modalCloseBtn: { marginTop: 16, paddingVertical: 12, backgroundColor: '#F1F5F9', borderRadius: 12, alignItems: 'center' },
  modalCloseBtnText: { fontSize: 13, fontWeight: '700', color: '#475569' },
});

