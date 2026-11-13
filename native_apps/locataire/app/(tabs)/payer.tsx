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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  CreditCard,
  Calendar,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react-native';
import { TopNavHeader } from '../../components/TopNavHeader';
import { fetchWithAuth } from '../../lib/api';

export default function PayerScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lease, setLease] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const res = await fetchWithAuth('/v1/leases/active');
      if (res.ok) {
        const data = await res.json();
        setLease(data.lease || null);
        setHistory(data.history || []);
      }
    } catch (e) {
      console.warn('Erreur chargement loyer:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Calcul ML-07 : Échéance et jours restants
  const paymentDay = lease?.paymentDay || 5;
  const now = new Date();
  const targetDueDate = new Date(now.getFullYear(), now.getMonth(), paymentDay);
  if (now > targetDueDate && now.getDate() > paymentDay) {
    targetDueDate.setMonth(targetDueDate.getMonth() + 1);
  }
  const diffTime = targetDueDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const formattedDate = targetDueDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

  const currentMonthName = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <SafeAreaView style={styles.container}>
      <TopNavHeader title="Payer" subtitle="Loyer & Règlements" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2C3E6B']} />}
      >
        <Text style={styles.sub}>Règlement sécurisé & Paiement déclaré</Text>
        <Text style={styles.title}>Payer mon loyer</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#2C3E6B" style={{ marginTop: 40 }} />
        ) : !lease ? (
          <View style={styles.cardEmpty}>
            <AlertCircle color="#D97706" size={40} />
            <Text style={styles.emptyTitle}>Aucun loyer en cours</Text>
            <Text style={styles.emptyText}>
              Vous n'avez pas encore de bail actif rattaché. Déclarez votre logement pour activer vos paiements et quittances.
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
            {/* CARTE LOYER CONTRACTUELLE (Ticket ML-07 / CDC IC-01-R1) */}
            <View style={styles.heroCard}>
              <View style={styles.badgeRow}>
                <View style={styles.pillDate}>
                  <Clock size={12} color="#1E7E4E" />
                  <Text style={styles.pillDateText}>
                    À payer avant le {formattedDate} · dans {daysRemaining} jours
                  </Text>
                </View>
              </View>

              <Text style={styles.loyerTitle}>Loyer de {currentMonthName}</Text>
              <Text style={styles.amountBig}>
                {Number(lease.rentAmount || 0).toLocaleString('fr-FR')} F CFA
              </Text>

              {/* Strictement ZÉRO champ « Frais » hors mandat (ML-07) */}
              {lease.chargesAmount > 0 && (
                <Text style={styles.chargesText}>
                  + {Number(lease.chargesAmount).toLocaleString('fr-FR')} F (Provisions pour charges)
                </Text>
              )}

              <View style={styles.btnRow}>
                <Pressable
                  style={styles.btnPayMain}
                  onPress={() => {
                    // Ouvre la passerelle de paiement Wave / Mobile Money
                    Alert.alert(
                      'Paiement QAPRIL',
                      `Régler ${Number(lease.rentAmount || 0).toLocaleString('fr-FR')} F CFA via Mobile Money (Wave, Orange, MTN, Moov).`,
                      [
                        { text: 'Annuler', style: 'cancel' },
                        { text: 'Continuer vers le paiement', onPress: () => router.push('/(tabs)/' as any) }
                      ]
                    );
                  }}
                >
                  <CreditCard size={18} color="#FFFFFF" />
                  <Text style={styles.btnPayMainText}>Payer</Text>
                </Pressable>

                <Pressable
                  style={styles.btnDeclare}
                  onPress={() => {
                    // Ouvre le modal de déclaration de paiement (S-14)
                    router.push('/(tabs)/' as any);
                  }}
                >
                  <Text style={styles.btnDeclareText}>J'ai payé autrement</Text>
                </Pressable>
              </View>
            </View>

            {/* AIDE PAIEMENT DÉCLARÉ (lexique.paiement) */}
            <View style={styles.cardInfo}>
              <ShieldCheck color="#2C3E6B" size={20} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Payé en espèces ou virement direct ?</Text>
                <Text style={styles.infoDesc}>
                  Vous avez payé directement votre bailleur ? Déclarez-le : il confirme par SMS, et vous recevez la même quittance certifiée.
                </Text>
              </View>
            </View>

            {/* HISTORIQUE DES QUITTANCES */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <CheckCircle2 color="#1E7E4E" size={20} />
                <Text style={styles.cardTitle}>Mes dernières quittances</Text>
              </View>
              <Text style={styles.cardSub}>
                Chaque paiement donne droit à une quittance acceptée par les banques et administrations.
              </Text>

              <Pressable
                style={styles.btnSecondary}
                onPress={() => router.push('/(tabs)/receipts' as any)}
              >
                <Text style={styles.btnSecondaryText}>Voir toutes mes quittances</Text>
                <ArrowRight size={14} color="#2C3E6B" />
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
  badgeRow: { flexDirection: 'row', marginBottom: 10 },
  pillDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EBF5F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C6E7D6',
  },
  pillDateText: { fontSize: 11, fontWeight: '700', color: '#1E7E4E' },
  loyerTitle: { fontSize: 15, fontWeight: '700', color: '#64748B', textTransform: 'capitalize' },
  amountBig: { fontSize: 32, fontWeight: '900', color: '#0F172A', marginTop: 4 },
  chargesText: { fontSize: 12, color: '#64748B', marginTop: 4 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  btnPayMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E7E4E',
    paddingVertical: 14,
    borderRadius: 12,
  },
  btnPayMainText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  btnDeclare: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 14,
    borderRadius: 12,
  },
  btnDeclareText: { color: '#0F172A', fontSize: 13, fontWeight: '700' },
  cardInfo: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    marginBottom: 16,
  },
  infoTitle: { fontSize: 13, fontWeight: '800', color: '#166534' },
  infoDesc: { fontSize: 12, color: '#15803D', lineHeight: 18, marginTop: 4 },
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
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
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

