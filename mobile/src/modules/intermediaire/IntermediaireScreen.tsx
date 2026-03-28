import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  Dimensions,
  SafeAreaView,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../theme/theme';
import { Badge } from '../../components/common/Badge';
import { Row } from '../../components/common/Row';
import { SectionTitle } from '../../components/common/SectionTitle';
import { BrandHeader } from '../../components/common/BrandHeader';
import { useIntermediaire, useIntermediaireStats, useIntermediaireActions } from '../../hooks/qapril-hooks';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

export default function IntermediaireScreen({ onBack }: { onBack?: () => void }) {
  const [tab, setTab] = useState("dash");
  const [selectedProp, setSelectedProp] = useState<any>(null);
  const [showSheet, setShowSheet] = useState<string | null>(null);

  const { data: profile } = useIntermediaire();
  const { data: stats, loading, refetch } = useIntermediaireStats();
  const { performAction, loading: actionLoading } = useIntermediaireActions();

  const fmt = (n: number) => n?.toLocaleString("fr-FR") ?? "0";

  // Fallback data
  const D = stats || { stats: {}, mandates: [], properties: [] };
  const S = D.stats || {};
  const properties = D.properties || [];

  const handleAction = async (action: string, params: any) => {
    try {
      const res = await performAction(action, params);
      alert(res.success ? "Succès !" : "Erreur: " + res.error);
      setShowSheet(null);
      refetch();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const changeTab = (t: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTab(t);
  };

  const INTER = {
    nom: (profile?.fullName || "GESTIONNAIRE").toUpperCase(),
    code: profile?.isCertified ? 'AGRÉMENT CDAIM' : 'CODE INTERM.',
    statut: profile?.isCertified ? 'Certifié' : 'Vérifié'
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView bounces={false} contentContainerStyle={styles.scrollContent}>
        
        <BrandHeader 
          title={INTER.nom}
          subtitle={`${INTER.code} · ${INTER.statut}`}
          roleLabel="MANDATAIRE"
          roleColor={Theme.colors.orange}
          onNotifPress={() => alert("Notifications Mandataire")}
        />

        {/* KPI Row - Floating */}
        <View style={{ marginTop: -25, paddingHorizontal: 20 }}>
          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiVal}>{fmt(S.encaisse || 0)} F</Text>
              <Text style={styles.kpiLabel}>COLLECTE MOIS</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={[styles.kpiVal, { color: Theme.colors.navy }]}>{fmt(Math.round(S.totalCommissions || 0))} F</Text>
              <Text style={styles.kpiLabel}>COMMISSIONS</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={[styles.kpiVal, { color: Theme.colors.red }]}>{S.impayesCount || 0}</Text>
              <Text style={styles.kpiLabel}>IMPAYÉS</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {tab === "dash" && (
            <>
              <SectionTitle label="Console & Outils" />
              <View style={styles.toolsGrid}>
                <TouchableOpacity style={styles.toolBtn} onPress={() => setShowSheet('quittance')}>
                  <Text style={{ fontSize: 24 }}>🧾</Text>
                  <Text style={styles.toolLabel}>Q-Cert</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolBtn} onPress={() => setTab('mandats')}>
                  <Text style={{ fontSize: 24 }}>📜</Text>
                  <Text style={styles.toolLabel}>Mandats</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolBtn} onPress={() => setTab('compte')}>
                  <Text style={{ fontSize: 24 }}>💼</Text>
                  <Text style={styles.toolLabel}>Wallet</Text>
                </TouchableOpacity>
              </View>

              {S.impayesCount > 0 && (
                <View style={styles.alertCard}>
                  <View style={styles.alertHeader}>
                    <Text style={styles.alertTitle}>🚨 PRIORITÉ RECOUVREMENT</Text>
                    <Badge label={`${S.impayesCount} DOSSIERS`} color={Theme.colors.white} bg={Theme.colors.red} />
                  </View>
                  <Text style={styles.alertSub}>Des retards M07 ont été détectés sur votre parc.</Text>
                  <TouchableOpacity style={styles.alertActionBtn} onPress={() => setTab('biens')}>
                    <Text style={styles.alertActionText}>VOIR LES DÉTAILS →</Text>
                  </TouchableOpacity>
                </View>
              )}

              <SectionTitle label="Biens en Gestion" />
              {properties.slice(0, 3).map((p: any) => (
                <TouchableOpacity key={p.id} style={styles.propertyCard} onPress={() => { setSelectedProp(p); setShowSheet('detail'); }}>
                  <View style={styles.propertyHeader}>
                    <Text style={styles.propertyName}>{p.name}</Text>
                    <Text style={styles.propertyPrice}>{fmt(p.leases?.[0]?.rentAmount || 0)} F</Text>
                  </View>
                  <View style={styles.propertyFooter}>
                    <Text style={styles.propertyLoc}>{p.city} · {p.neighborhood}</Text>
                    <Badge 
                        label={p.leases?.[0]?.receipts?.[0]?.status === 'paid' ? 'À JOUR' : 'IMPAYÉ'} 
                        color={p.leases?.[0]?.receipts?.[0]?.status === 'paid' ? Theme.colors.green : Theme.colors.red} 
                        bg={p.leases?.[0]?.receipts?.[0]?.status === 'paid' ? Theme.colors.greenPale : Theme.colors.redPale} 
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}

          {tab === "quittances" && (
            <View style={styles.section}>
              <SectionTitle label="Suivi des Collectes" />
              <View style={styles.alertCard}>
                 <Text style={styles.alertTitle}>PORTFOLIO PERFORMANCE</Text>
                 <Text style={styles.walletVal}>{fmt(S.encaisse || 0)} F</Text>
                 <Text style={styles.alertSub}>Total collecté ce mois-ci sur {properties.length} biens.</Text>
              </View>

              <Text style={[styles.sectionTitle, { marginBottom: 15 }]}>Historique des Certifications</Text>
              {properties.map((p: any, i: number) => {
                const lease = p.leases?.[0];
                const receipt = lease?.receipts?.[0];
                return (
                  <View key={i} style={styles.quittanceLine}>
                    <View style={styles.quittanceLineHeader}>
                      <Text style={styles.quittanceLineRef}>{p.name}</Text>
                      <Badge 
                        label={receipt?.status === 'paid' ? 'CERTIFIÉE' : 'EN ATTENTE'} 
                        color={receipt?.status === 'paid' ? Theme.colors.green : Theme.colors.red} 
                        bg={receipt?.status === 'paid' ? Theme.colors.greenPale : Theme.colors.redPale} 
                      />
                    </View>
                    <Text style={styles.quittanceLineLoc}>{p.neighborhood} · {fmt(lease?.rentAmount || 0)} F</Text>
                    {receipt?.status === 'paid' && (
                      <View style={styles.breakdown}>
                        <View style={styles.breakdownRow}><Text style={styles.breakdownLabel}>Commission Interm. (8%)</Text><Text style={styles.breakdownVal}>+{fmt((lease?.rentAmount || 0) * 0.08)} F</Text></View>
                        <View style={styles.breakdownRow}><Text style={styles.breakdownLabel}>Net à reverser au Proprio</Text><Text style={styles.breakdownValBold}>{fmt((lease?.rentAmount || 0) * 0.92)} F</Text></View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {tab === "compte" && (
             <View style={styles.section}>
                <View style={styles.walletCard}>
                   <Text style={styles.walletLabel}>SOLDE COMMISSIONS</Text>
                   <Text style={styles.walletVal}>{fmt(Math.round(S.totalCommissions || 0))} FCFA</Text>
                   <TouchableOpacity style={styles.payoutBtn}>
                      <Text style={styles.payoutText}>DEMANDER LE VIREMENT</Text>
                   </TouchableOpacity>
                </View>

                {onBack && (
                  <TouchableOpacity style={styles.logoutBtn} onPress={onBack}>
                    <Text style={styles.logoutText}>🚪 Changer de portail</Text>
                  </TouchableOpacity>
                )}
             </View>
          )}
        </View>
      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        {[
          { id: "dash", icon: "📊", label: "Dashboard" },
          { id: "biens", icon: "🏘️", label: "Biens" },
          { id: "quittances", icon: "🧾", label: "Quittances" },
          { id: "compte", icon: "👤", label: "Compte" },
        ].map(n => (
          <TouchableOpacity key={n.id} onPress={() => changeTab(n.id)} style={styles.navItem}>
             <Text style={[styles.navIcon, { opacity: tab === n.id ? 1 : 0.4 }]}>{n.icon}</Text>
             <Text style={[styles.navLabel, { color: tab === n.id ? Theme.colors.navy : Theme.colors.textLight }]}>{n.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Action Sheet - Quittance */}
      {showSheet === 'quittance' && (
        <View style={styles.sheetOverlay}>
          <View style={styles.sheetContent}>
             <Text style={styles.sheetTitle}>CERTIFICATION Q-CERT</Text>
             <Text style={styles.sheetSub}>Enregistrez un paiement locataire certifié SHA-256.</Text>
             
             <View style={{ gap: 10, marginVertical: 20 }}>
                {properties.slice(0,3).map((p: any) => (
                   <TouchableOpacity 
                    key={p.id} 
                    style={styles.sheetItem}
                    onPress={() => handleAction('quittance', {
                        leaseId: p.leases?.[0]?.id,
                        periodMonth: "2026-04",
                        rentAmount: p.leases?.[0]?.rentAmount,
                        chargesAmount: 0,
                        paymentChannel: "MOBILE_MONEY"
                    })}
                   >
                     <Text style={styles.sheetItemText}>{p.name}</Text>
                     <Text style={{ fontSize: 11, color: Theme.colors.green }}>{fmt(p.leases?.[0]?.rentAmount)} F →</Text>
                   </TouchableOpacity>
                ))}
             </View>
             
             <TouchableOpacity style={styles.sheetClose} onPress={() => setShowSheet(null)}>
                <Text style={styles.sheetCloseText}>ANNULER</Text>
             </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingBottom: 100 },
  header: { padding: 25, borderBottomLeftRadius: 35, borderBottomRightRadius: 35 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  roleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80', marginLeft: 10, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  userName: { fontSize: 22, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 },
  userSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '700' },
  iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },

  kpiRow: { flexDirection: 'row', gap: 10 },
  kpiCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 20, padding: 15, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  kpiVal: { fontSize: 16, fontWeight: '900', color: Theme.colors.orange },
  kpiLabel: { fontSize: 8, fontWeight: '800', color: Theme.colors.textLight, marginTop: 4, letterSpacing: 0.5 },

  body: { padding: 20 },
  toolsGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  toolBtn: { flex: 1, backgroundColor: '#FFF', borderRadius: 20, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: '#EDF2F7' },
  toolLabel: { fontSize: 10, fontWeight: '800', color: Theme.colors.navy, marginTop: 8 },

  alertCard: { backgroundColor: '#A00000', borderRadius: 25, padding: 20, marginBottom: 25, shadowColor: '#A00000', shadowOpacity: 0.2, shadowRadius: 15 },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  alertTitle: { color: '#FFF', fontSize: 11, fontWeight: '900' },
  alertSub: { color: 'rgba(255,255,255,0.8)', fontSize: 10, lineHeight: 14, marginBottom: 15 },
  alertActionBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  alertActionText: { color: '#FFF', fontSize: 10, fontWeight: '900' },

  propertyCard: { backgroundColor: '#FFF', borderRadius: 22, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  propertyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  propertyName: { fontSize: 14, fontWeight: '800', color: Theme.colors.navy },
  propertyPrice: { fontSize: 14, fontWeight: '900', color: Theme.colors.orange },
  propertyFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  propertyLoc: { fontSize: 11, color: Theme.colors.textLight },

  section: { marginTop: 10 },
  walletCard: { backgroundColor: Theme.colors.gold, borderRadius: 25, padding: 25, marginBottom: 20 },
  walletLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  walletVal: { color: '#FFF', fontSize: 28, fontWeight: '900', marginVertical: 10 },
  payoutBtn: { backgroundColor: '#FFF', borderRadius: 15, paddingVertical: 12, alignItems: 'center' },
  payoutText: { color: Theme.colors.gold, fontSize: 11, fontWeight: '900' },
  
  quittanceLine: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#EDF2F7' },
  quittanceLineHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  quittanceLineRef: { fontSize: 13, fontWeight: '800', color: Theme.colors.navy },
  quittanceLineLoc: { fontSize: 11, color: Theme.colors.textLight, marginBottom: 10 },
  breakdown: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, marginTop: 5 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  breakdownLabel: { fontSize: 10, color: Theme.colors.textLight },
  breakdownVal: { fontSize: 10, fontWeight: '700', color: Theme.colors.orange },
  breakdownValBold: { fontSize: 11, fontWeight: '900', color: Theme.colors.navy },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Theme.colors.navy, marginTop: 10 },
  
  logoutBtn: { backgroundColor: '#F1F5F9', borderRadius: 15, paddingVertical: 15, alignItems: 'center' },
  logoutText: { color: Theme.colors.navy, fontWeight: '800', fontSize: 13 },

  bottomNav: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', flexDirection: 'row', paddingVertical: 10, paddingBottom: 25, justifyContent: 'space-around' },
  navItem: { alignItems: 'center' },
  navIcon: { fontSize: 20 },
  navLabel: { fontSize: 9, marginTop: 2, fontWeight: '700' },

  sheetOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', zIndex: 1000 },
  sheetContent: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, paddingBottom: 50 },
  sheetTitle: { fontSize: 18, fontWeight: '900', color: Theme.colors.navy, letterSpacing: -0.5 },
  sheetSub: { fontSize: 12, color: Theme.colors.textLight, marginTop: 4 },
  sheetItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#F8FAFC', borderRadius: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  sheetItemText: { fontSize: 13, fontWeight: '800', color: Theme.colors.navy },
  sheetClose: { marginTop: 20, paddingVertical: 15, alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 15 },
  sheetCloseText: { color: Theme.colors.textLight, fontWeight: '800', fontSize: 12 },
});
