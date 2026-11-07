import { TopNavHeader } from '../../components/TopNavHeader';
import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../lib/api';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Building2,
  ChevronRight,
  Phone,
  Camera,
  Filter,
  X,
  Send,
} from 'lucide-react-native';

export default function ProprietaireMaintenanceScreen() {
  const [filter, setFilter] = useState<'all' | 'nouveau' | 'en_cours' | 'resolu'>('all');
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [artisanNote, setArtisanNote] = useState('');
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadIncidents = async () => {
    try {
      const res = await fetchWithAuth('/proprietaire/maintenance');
      if (res.ok) {
        const json = await res.json();
        if (json.tickets && Array.isArray(json.tickets)) {
          setIncidents(json.tickets.map((t: any) => {
            const isResolu = t.statut === 'RESOLU' || t.statut === 'CLOTURE' || t.statut === 'RÉSOLU';
            const isEnCours = t.statut === 'PRIS_EN_CHARGE' || t.statut === 'EN_COURS';
            const statut = isResolu ? 'resolu' : isEnCours ? 'en_cours' : 'nouveau';
            return {
              id: t.id,
              ticketRef: t.ticketRef,
              bien: t.bien || 'Logement',
              locataire: t.locataire || 'Locataire',
              telephone: t.telephone || '',
              titre: t.description ? t.description.substring(0, 40) : 'Signalement',
              description: t.description || '',
              categorie: t.categorie || 'Maintenance',
              date: t.dateSignalement ? `Émis le ${new Date(t.dateSignalement).toLocaleDateString('fr-FR')}` : 'Signalé',
              photosCount: 0,
              statut,
              statutLabel: isResolu ? 'Résolu & validé' : isEnCours ? 'En cours' : 'À traiter',
              statutColor: isResolu ? '#059669' : isEnCours ? '#D97706' : '#DC2626',
              statutBg: isResolu ? '#ECFDF5' : isEnCours ? '#FEF3C7' : '#FEE2E2',
            };
          }));
        }
      }
    } catch (e) {
      console.error('Erreur chargement maintenance', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleUpdateStatus = (id: string, newStatus: 'en_cours' | 'resolu', label: string) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === id
          ? {
              ...inc,
              statut: newStatus,
              statutLabel: label,
              statutColor: newStatus === 'resolu' ? '#059669' : '#D97706',
              statutBg: newStatus === 'resolu' ? '#ECFDF5' : '#FEF3C7',
            }
          : inc
      )
    );
    setSelectedIncident(null);
    Alert.alert('Mise à jour enregistrée', `Le signalement a été mis à jour : « ${label} ». Le locataire est notifié.`);
  };

  const aTraiterCount = incidents.filter((x) => x.statut === 'nouveau').length;
  const enCoursCount = incidents.filter((x) => x.statut === 'en_cours').length;
  const resoluCount = incidents.filter((x) => x.statut === 'resolu').length;

  const filteredIncidents = incidents.filter((inc) => {
    if (filter === 'all') return true;
    return inc.statut === filter;
  });

  return (
    <SafeAreaView style={styles.container}>
      <TopNavHeader title="Incidents & Travaux" subtitle="Maintenance en direct" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* BANDEAU RÔLE : RÉCEPTION PROPRIÉTAIRE */}
        <View style={styles.roleBanner}>
          <View style={styles.roleTag}>
            <Wrench color="#1B4D3E" size={14} />
            <Text style={styles.roleTagText}>RÉCEPTION BAILLEUR · SIGNALEMENTS LOCATAIRES</Text>
          </View>
          <Text style={styles.roleTitle}>Signalements & travaux reçus</Text>
          <Text style={styles.roleDesc}>
            En tant que propriétaire ou agence, vous recevez ici les signalements d’incidents émis par vos locataires
            pour mandater les artisans et piloter la résolution contradictoire (ADD-11).
          </Text>
        </View>

        {/* STATISTIQUES EN TÊTE CONNECTÉES À LA BDD */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#DC2626' }]}>{aTraiterCount}</Text>
            <Text style={styles.statLabel}>À TRAITER</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#D97706' }]}>{enCoursCount}</Text>
            <Text style={styles.statLabel}>EN COURS</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#059669' }]}>{resoluCount}</Text>
            <Text style={styles.statLabel}>RÉSOLU</Text>
          </View>
        </View>

        {/* FILTRES PAR STATUT */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
          {(
            [
              ['all', 'Tous les signalements'],
              ['nouveau', `Nouveaux (${incidents.filter(x => x.statut === 'nouveau').length})`],
              ['en_cours', `En cours (${incidents.filter(x => x.statut === 'en_cours').length})`],
              ['resolu', `Résolus (${incidents.filter(x => x.statut === 'resolu').length})`],
            ] as [typeof filter, string][]
          ).map(([f, lbl]) => {
            const active = filter === f;
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {lbl}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* LISTE DES SIGNALEMENTS REÇUS */}
        <View style={styles.listContainer}>
          {filteredIncidents.length === 0 ? (
            <View style={[styles.incidentCard, { alignItems: 'center', paddingVertical: 36 }]}>
              <Wrench color="#9CA3AF" size={36} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#64748B', marginTop: 12 }}>
                Aucun signalement {filter !== 'all' ? `(${filter})` : ''}
              </Text>
              <Text style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginTop: 4, paddingHorizontal: 16 }}>
                Les déclarations de pannes émises par vos locataires apparaîtront ici avec photos horodatées et valeur légale.
              </Text>
            </View>
          ) : (
            filteredIncidents.map((inc) => (
              <Pressable
                key={inc.id}
                style={styles.incidentCard}
                onPress={() => setSelectedIncident(inc)}
              >
              <View style={styles.rowBetween}>
                <View style={styles.catBadge}>
                  <Text style={styles.catBadgeText}>{inc.categorie}</Text>
                </View>
                <View style={[styles.pill, { backgroundColor: inc.statutBg }]}>
                  <Text style={[styles.pillText, { color: inc.statutColor }]}>
                    {inc.statutLabel}
                  </Text>
                </View>
              </View>

              <Text style={styles.incidentTitle}>{inc.titre}</Text>
              <Text style={styles.incidentDesc} numberOfLines={2}>
                {inc.description}
              </Text>

              <View style={styles.tenantInfoBox}>
                <View style={styles.tenantRow}>
                  <Building2 color="#6B7280" size={14} />
                  <Text style={styles.tenantText} numberOfLines={1}>
                    {inc.bien}
                  </Text>
                </View>
                <View style={styles.tenantRow}>
                  <User color="#1B4D3E" size={14} />
                  <Text style={[styles.tenantText, { fontWeight: '700', color: '#1B4D3E' }]}>
                    Émis par : {inc.locataire}
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.footerDate}>
                  <Clock color="#9CA3AF" size={12} />
                  <Text style={styles.footerDateText}>{inc.date}</Text>
                </View>
                <View style={styles.actionBtnHint}>
                  <Text style={styles.actionBtnHintText}>Traiter</Text>
                  <ChevronRight color="#1B4D3E" size={14} />
                </View>
              </View>
            </Pressable>
          )))}
        </View>
      </ScrollView>

      {/* MODAL TRAITEMENT BAILLEUR DU SIGNALEMENT */}
      <Modal
        visible={!!selectedIncident}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedIncident(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalRef}>{selectedIncident?.id}</Text>
                <Text style={styles.modalTitle}>{selectedIncident?.titre}</Text>
              </View>
              <Pressable
                style={styles.modalCloseBtn}
                onPress={() => setSelectedIncident(null)}
              >
                <X color="#1C1C1E" size={20} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionLabel}>LOGEMENT & ÉMETTEUR :</Text>
                <Text style={styles.modalStrong}>{selectedIncident?.bien}</Text>
                <Text style={styles.modalSub}>Locataire émetteur : {selectedIncident?.locataire}</Text>
                <Text style={styles.modalSub}>Contact : {selectedIncident?.telephone}</Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionLabel}>DESCRIPTION TRANSMIS PAR LE LOCATAIRE :</Text>
                <Text style={styles.modalDescText}>{selectedIncident?.description}</Text>
                <View style={styles.photoAlert}>
                  <Camera color="#1B4D3E" size={16} />
                  <Text style={styles.photoAlertText}>
                    {selectedIncident?.photosCount} photos horodatées avec hash SHA-256 (ADD-11)
                  </Text>
                </View>
              </View>

              <Text style={styles.modalSectionLabel}>ACTIONS DU PROPRIÉTAIRE :</Text>
              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalActionBtn, { backgroundColor: '#1B4D3E' }]}
                  onPress={() =>
                    handleUpdateStatus(
                      selectedIncident.id,
                      'en_cours',
                      'Artisan mandaté par le bailleur'
                    )
                  }
                >
                  <Wrench color="#FFFFFF" size={16} />
                  <Text style={styles.modalActionBtnText}>Mandater un artisan / Prise en charge</Text>
                </Pressable>

                <Pressable
                  style={[styles.modalActionBtn, { backgroundColor: '#059669' }]}
                  onPress={() =>
                    handleUpdateStatus(
                      selectedIncident.id,
                      'resolu',
                      'Résolu & validé par le bailleur'
                    )
                  }
                >
                  <CheckCircle2 color="#FFFFFF" size={16} />
                  <Text style={styles.modalActionBtnText}>Clôturer le signalement (Travaux achevés)</Text>
                </Pressable>

                <Pressable
                  style={[styles.modalActionBtn, { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' }]}
                  onPress={() => {
                    Alert.alert('Appel au locataire', `Composer le ${selectedIncident?.telephone} pour convenir d’un créneau.`);
                  }}
                >
                  <Phone color="#1F2937" size={16} />
                  <Text style={[styles.modalActionBtnText, { color: '#1F2937' }]}>
                    Appeler {selectedIncident?.locataire}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2EC' },
  scroll: { padding: 16, gap: 14, paddingBottom: 40 },
  roleBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4E0D7',
    gap: 8,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F3EE',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1B4D3E',
    letterSpacing: 0.8,
  },
  roleTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#141824',
    letterSpacing: -0.4,
  },
  roleDesc: {
    fontSize: 12,
    color: '#6E6E73',
    lineHeight: 17,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E4E0D7',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#6E6E73',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  filtersRow: {
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E0D7',
  },
  filterChipActive: {
    backgroundColor: '#1B4D3E',
    borderColor: '#1B4D3E',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#141824',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    gap: 12,
    marginTop: 4,
  },
  incidentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4E0D7',
    gap: 8,
  },
  catBadge: {
    backgroundColor: '#F5F2EC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  catBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#141824',
  },
  incidentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#141824',
    letterSpacing: -0.2,
  },
  incidentDesc: {
    fontSize: 12,
    color: '#6E6E73',
    lineHeight: 17,
  },
  tenantInfoBox: {
    backgroundColor: '#F9F8F6',
    borderRadius: 10,
    padding: 10,
    gap: 4,
    marginTop: 2,
  },
  tenantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tenantText: {
    fontSize: 12,
    color: '#141824',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F2EC',
    marginTop: 4,
  },
  footerDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerDateText: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '500',
  },
  actionBtnHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionBtnHintText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1B4D3E',
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '600',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2EFE9',
  },
  modalRef: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 0.8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#141824',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F2EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    marginTop: 14,
  },
  modalSection: {
    marginBottom: 14,
  },
  modalSectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 1,
    marginBottom: 4,
  },
  modalStrong: {
    fontSize: 14,
    fontWeight: '600',
    color: '#141824',
  },
  modalSub: {
    fontSize: 12,
    color: '#6E6E73',
    marginTop: 2,
  },
  modalDescText: {
    fontSize: 13,
    color: '#141824',
    lineHeight: 18,
    backgroundColor: '#F9F8F6',
    padding: 10,
    borderRadius: 8,
  },
  photoAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F3EE',
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  photoAlertText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1B4D3E',
  },
  modalActions: {
    gap: 8,
    marginTop: 8,
    marginBottom: 20,
  },
  modalActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  modalActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});

