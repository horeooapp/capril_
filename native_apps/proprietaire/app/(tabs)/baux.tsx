import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  FileText,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  Building2,
} from 'lucide-react-native';
import { TopNavHeader } from '../../components/TopNavHeader';
import { fetchWithAuth } from '../../lib/api';

export default function BauxScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [leases, setLeases] = useState<any[]>([]);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadLeases = async () => {
    try {
      const res = await fetchWithAuth('/v1/leases');
      if (res.ok) {
        const data = await res.json();
        setLeases(data.leases || []);
      }
    } catch (e) {
      console.warn('Erreur chargement baux:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLeases();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadLeases();
  };

  const toggleIdentite = async (leaseId: string, currentValue: boolean) => {
    setTogglingId(leaseId);
    try {
      await fetchWithAuth(`/landlord/leases/${leaseId}`, {
        method: 'PATCH',
        body: JSON.stringify({ bailleurMasque: !currentValue }),
      });
      setLeases(prev => prev.map(l =>
        l.id === leaseId ? { ...l, bailleurMasque: !currentValue } : l
      ));
    } catch {}
    setTogglingId(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNavHeader title="Baux" subtitle="Gestion locative" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1B4D3E']} />}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.sub}>Contrats & Engagements</Text>
            <Text style={styles.title}>Mes baux</Text>
          </View>

          <Pressable
            style={styles.btnAdd}
            onPress={() => router.push('/create-lease' as any)}
          >
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.btnAddText}>Nouveau bail</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#1B4D3E" style={{ marginTop: 40 }} />
        ) : leases.length === 0 ? (
          <View style={styles.cardEmpty}>
            <FileText color="#9CA3AF" size={40} />
            <Text style={styles.emptyTitle}>Aucun bail actif</Text>
            <Text style={styles.emptyText}>
              Créez votre premier bail certifié en quelques clics. Les plafonds légaux de caution et les calculs DGI sont automatiquement appliqués.
            </Text>
            <Pressable
              style={styles.btnPrimary}
              onPress={() => router.push('/create-lease' as any)}
            >
              <Text style={styles.btnPrimaryText}>Créer un nouveau bail</Text>
            </Pressable>
          </View>
        ) : (
          leases.map((l) => (
            <View key={l.id} style={styles.leaseCard}>
              <View style={styles.cardTop}>
                <View style={styles.refBadge}>
                  <Text style={styles.refText}>{l.leaseReference || 'BAIL-QAPRIL'}</Text>
                </View>
                <View style={l.status === 'ACTIVE' ? styles.pillActive : styles.pillPending}>
                  <Text style={l.status === 'ACTIVE' ? styles.pillActiveText : styles.pillPendingText}>
                    {l.status === 'ACTIVE' ? 'Actif' : 'En attente'}
                  </Text>
                </View>
              </View>

              <Text style={styles.propTitle}>
                {l.property?.name || l.property?.unitLabel || 'Bien conventionné'}
              </Text>
              <Text style={styles.tenantName}>
                Locataire : {l.tenant ? `${l.tenant.firstName || ''} ${l.tenant.lastName || ''}`.trim() : 'En attente de rattachement'}
              </Text>

              <View style={styles.separator} />

              <View style={styles.grid2}>
                <View>
                  <Text style={styles.label}>Loyer net</Text>
                  <Text style={styles.val}>{Number(l.rentAmount || 0).toLocaleString('fr-FR')} F</Text>
                </View>
                <View>
                  <Text style={styles.label}>Statut fiscal</Text>
                  <Text style={styles.val}>
                    {l.statutDgi === 'ENREGISTRE' ? 'Enregistré DGI' : "En attente d'enregistrement"}
                  </Text>
                </View>
              </View>

              {/* MB-09 : Interrupteur identité */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151' }}>Masquer mon identité</Text>
                  {l.sousMandat ? (
                    <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
                      Identité protégée automatiquement sous mandat agréé.
                    </Text>
                  ) : (
                    <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
                      Votre nom n'apparaîtra pas sur les documents partagés avec ce locataire.
                    </Text>
                  )}
                </View>
                <Switch
                  value={l.bailleurMasque || false}
                  onValueChange={() => toggleIdentite(l.id, l.bailleurMasque || false)}
                  disabled={l.sousMandat || togglingId === l.id}
                  trackColor={{ false: '#E2E8F0', true: '#1B4D3E' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  scroll: { padding: 16, paddingBottom: 100 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sub: { fontSize: 11, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 24, fontWeight: '900', color: '#1B4D3E', marginTop: 2 },
  btnAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1B4D3E',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  btnAddText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  leaseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4E0D7',
    marginBottom: 12,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  refBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  refText: { fontSize: 11, fontWeight: '700', color: '#4B5563' },
  pillActive: { backgroundColor: '#EBF5F0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  pillActiveText: { fontSize: 11, fontWeight: '800', color: '#1E7E4E' },
  pillPending: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  pillPendingText: { fontSize: 11, fontWeight: '800', color: '#92400E' },
  propTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  tenantName: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  separator: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  grid2: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 11, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' },
  val: { fontSize: 14, fontWeight: '800', color: '#111827', marginTop: 2 },
  cardEmpty: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E0D7',
    marginTop: 20,
  },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: '#111827', marginTop: 12 },
  emptyText: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  btnPrimary: {
    backgroundColor: '#1B4D3E',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});

