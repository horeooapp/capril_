import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  FileText,
  ShieldCheck,
  Building,
  Calendar,
  Users,
  Wrench,
  Download,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react-native';
import { TopNavHeader } from '../../components/TopNavHeader';
import { fetchWithAuth } from '../../lib/api';

export default function MonBailScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lease, setLease] = useState<any>(null);
  const [occupants, setOccupants] = useState<any[]>([]);

  const loadBailData = async () => {
    try {
      const res = await fetchWithAuth('/v1/leases/active');
      if (res.ok) {
        const data = await res.json();
        setLease(data.lease || null);
        setOccupants(data.occupants || []);
      }
    } catch (e) {
      console.warn('Erreur chargement bail:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBailData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadBailData();
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNavHeader title="Mon bail" subtitle="Contrat & Droits" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2C3E6B']} />}
      >
        <Text style={styles.sub}>Gestion du logement & Documents légaux</Text>
        <Text style={styles.title}>Mon bail</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#2C3E6B" style={{ marginTop: 40 }} />
        ) : !lease ? (
          <View style={styles.cardEmpty}>
            <AlertCircle color="#D97706" size={40} />
            <Text style={styles.emptyTitle}>Aucun logement déclaré</Text>
            <Text style={styles.emptyText}>
              Déclarez votre logement en 4 questions. Vous obtenez des quittances pour chaque loyer et une attestation de résidence, même si votre bailleur n'a pas l'application.
            </Text>
            <Pressable
              style={styles.btnPrimary}
              onPress={() => router.push('/(tabs)/' as any)}
            >
              <Text style={styles.btnPrimaryText}>Déclarer mon logement</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* CARTE RÉCAPITULATIVE DU BAIL */}
            <View style={styles.heroCard}>
              <View style={styles.badgeRow}>
                <View style={styles.pillActive}>
                  <Text style={styles.pillActiveText}>Bail actif</Text>
                </View>
                <Text style={styles.leaseRef}>Réf : {lease.leaseReference || 'BAIL-QAPRIL'}</Text>
              </View>

              <Text style={styles.propName}>
                {lease.property?.unitLabel || lease.property?.name || 'Mon Logement'}
              </Text>
              <Text style={styles.propAddress}>
                {lease.property?.commune ? `${lease.property?.commune}, Abidjan` : lease.property?.address || 'Abidjan'}
              </Text>

              <View style={styles.separator} />

              <View style={styles.grid2}>
                <View>
                  <Text style={styles.metaLabel}>Loyer mensuel</Text>
                  <Text style={styles.metaValue}>{Number(lease.rentAmount || 0).toLocaleString('fr-FR')} F</Text>
                </View>
                <View>
                  <Text style={styles.metaLabel}>Durée légale</Text>
                  <Text style={styles.metaValue}>{lease.durationMonths || 12} mois</Text>
                </View>
              </View>

              <View style={[styles.grid2, { marginTop: 12 }]}>
                <View>
                  <Text style={styles.metaLabel}>Caution consignée</Text>
                  <Text style={styles.metaValue}>{Number(lease.depositAmount || 0).toLocaleString('fr-FR')} F</Text>
                  <Text style={styles.metaSub}>Restitution sous 30 j max</Text>
                </View>
                <View>
                  <Text style={styles.metaLabel}>Préavis de congé</Text>
                  <Text style={styles.metaValue}>{lease.preavisRequisMois || 3} mois</Text>
                  <Text style={styles.metaSub}>Cadre légal</Text>
                </View>
              </View>
            </View>

            {/* MENTION DGI & TÉLÉCHARGEMENT CONTRAT (ML-14 / D-02) */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <FileText color="#2C3E6B" size={20} />
                <Text style={styles.cardTitle}>Contrat de bail</Text>
              </View>
              <Text style={styles.cardSub}>
                {lease.statutDgi === 'ENREGISTRE' || lease.dgiReference
                  ? `Enregistré auprès de la DGI · Réf : ${lease.dgiReference || 'DGI-CI'}`
                  : "Signé, en attente d'enregistrement"}
              </Text>

              <Pressable
                style={styles.btnSecondary}
                onPress={() => {
                  Linking.openURL(`https://qapril.net/verifier?ref=${lease.leaseReference}`);
                }}
              >
                <Download color="#2C3E6B" size={16} />
                <Text style={styles.btnSecondaryText}>Télécharger le bail (PDF)</Text>
              </Pressable>
            </View>

            {/* OCCUPANTS DÉCLARÉS & ATTESTATION (ML-13) */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Users color="#2C3E6B" size={20} />
                <Text style={styles.cardTitle}>Occupants du logement</Text>
              </View>
              <Text style={styles.cardSub}>
                {occupants.length} occupant(s) déclaré(s). Les occupants figurent sur votre attestation de résidence.
              </Text>

              <Pressable
                style={styles.btnSecondary}
                onPress={() => router.push('/(tabs)/' as any)}
              >
                <Users color="#2C3E6B" size={16} />
                <Text style={styles.btnSecondaryText}>Gérer les occupants</Text>
              </Pressable>
            </View>

            {/* SIGNALEMENTS & TRAVAUX RATTACHÉS (ML-11) */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Wrench color="#2C3E6B" size={20} />
                <Text style={styles.cardTitle}>Signalements & Travaux</Text>
              </View>
              <Text style={styles.cardSub}>
                Signalez un problème avec photo datée qui fait foi auprès de votre bailleur.
              </Text>

              <Pressable
                style={styles.btnSecondary}
                onPress={() => router.push('/(tabs)/maintenance' as any)}
              >
                <Wrench color="#2C3E6B" size={16} />
                <Text style={styles.btnSecondaryText}>Voir les signalements du bail</Text>
              </Pressable>
            </View>

            {/* QUITTANCES DU BAIL */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <CheckCircle2 color="#1E7E4E" size={20} />
                <Text style={styles.cardTitle}>Mes quittances</Text>
              </View>
              <Text style={styles.cardSub}>
                Historique scellé de vos paiements, accepté par banques, consulats et administrations.
              </Text>

              <Pressable
                style={styles.btnSecondary}
                onPress={() => router.push('/(tabs)/receipts' as any)}
              >
                <FileText color="#2C3E6B" size={16} />
                <Text style={styles.btnSecondaryText}>Consulter mes quittances</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F9' },
  scroll: { padding: 16, paddingBottom: 100 },
  sub: { fontSize: 11, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 24, fontWeight: '900', color: '#0F172A', marginTop: 4, marginBottom: 16 },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EF',
    marginBottom: 16,
  },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  pillActive: { backgroundColor: '#EBF5F0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: '#C6E7D6' },
  pillActiveText: { fontSize: 11, fontWeight: '800', color: '#1E7E4E' },
  leaseRef: { fontSize: 11, fontWeight: '700', color: '#94A3B8' },
  propName: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  propAddress: { fontSize: 13, fontWeight: '500', color: '#64748B', marginTop: 2 },
  separator: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 14 },
  grid2: { flexDirection: 'row', justifyContent: 'space-between' },
  metaLabel: { fontSize: 11, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' },
  metaValue: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginTop: 2 },
  metaSub: { fontSize: 10, color: '#94A3B8', marginTop: 1 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EF',
    marginBottom: 14,
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  cardSub: { fontSize: 12, color: '#64748B', lineHeight: 18, marginBottom: 12 },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  btnSecondaryText: { fontSize: 13, fontWeight: '700', color: '#2C3E6B' },
  btnPrimary: {
    backgroundColor: '#2C3E6B',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  cardEmpty: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EF',
    marginTop: 20,
  },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A', marginTop: 12 },
  emptyText: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 8, lineHeight: 20 },
});

