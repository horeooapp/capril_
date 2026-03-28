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
  FlatList,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../theme/theme';
import { Badge } from '../../components/common/Badge';
import { Row } from '../../components/common/Row';
import { SectionTitle } from '../../components/common/SectionTitle';
import { WalletCard } from '../../components/common/WalletCard';
import { BrandHeader } from '../../components/common/BrandHeader';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

import { useProprio, usePatrimoine, setAuthToken, useAuth } from '../../hooks/qapril-hooks';

const { width } = Dimensions.get('window');

const QUICK_ACTIONS = [
  { icon: '✍️', label: 'Nouveau bail', color: Theme.colors.navy, bg: Theme.colors.navyPale },
  { icon: '🧾', label: 'Émettre quittance', color: Theme.colors.teal, bg: Theme.colors.tealPale },
  { icon: '📤', label: 'Export historique', color: Theme.colors.green, bg: Theme.colors.greenPale },
  { icon: '⚖️', label: 'Droits & litiges', color: Theme.colors.purple, bg: Theme.colors.purplePale },
];

export default function ProprioScreen({ onBack }: { onBack?: () => void }) {
  const [tab, setTab] = useState("dash");
  const { data: proprio, loading: loadProprio, refetch: refetchProprio } = useProprio();
  const { data: patrimoine, loading: loadPatrimoine } = usePatrimoine();
  const { verifyOTP } = useAuth();

  const fmt = (n: number) => n?.toLocaleString("fr-FR") || "0";

  // Debug Login for testing
  const handleDebugLogin = async () => {
    try {
      await verifyOTP("proprio@qapril.ci", "1234");
      refetchProprio();
    } catch (e) {
      console.error(e);
    }
  };

  const changeTab = (t: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTab(t);
  };

  const PROPRIO_DATA = proprio || { nom: 'Chargement...', formule: '...', biens: 0, wallet: { solde: 0 } };
  const PATRIMOINE_DATA = patrimoine || [];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView bounces={false} contentContainerStyle={styles.scrollContent}>
        
        <BrandHeader 
          title={PROPRIO_DATA.nom}
          subtitle="Compte Certifié Bailleur"
          roleLabel="PROPRIÉTAIRE"
          roleColor={Theme.colors.navy}
          onNotifPress={() => alert("Notifications Bailleur")}
        />

        <View style={{ marginTop: -25 }}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.kpiStrip}
            contentContainerStyle={styles.kpiContainer}
          >
            {[
               { l: "Portefeuille", v: fmt(PROPRIO_DATA.wallet?.solde) + " F", icon: "💰", color: Theme.colors.white },
               { l: "Impayés", v: "0", icon: "⚠️", color: "#FF8080" },
               { l: "Vacance", v: "0", icon: "🏠", color: Theme.colors.white },
               { l: "Patrimoine", v: PATRIMOINE_DATA.length.toString(), icon: "🏘", color: Theme.colors.white },
            ].map((k, i) => (
              <TouchableOpacity key={i} style={styles.kpiCard}>
                <Text style={{ fontSize: 16 }}>{k.icon}</Text>
                <Text style={[styles.kpiValue, { color: k.color }]}>{k.v}</Text>
                <Text style={styles.kpiLabel}>{k.l}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.body}>
          {/* ══ DASHBOARD ══ */}
          {tab === "dash" && (
            <>
              {/* Alertes Impayés */}
              <View style={styles.section}>
                <SectionTitle label="🚨 Impayés actifs" />
                <TouchableOpacity style={styles.alertCard}>
                  <View style={styles.alertHeader}>
                    <Text style={styles.alertUnit}>Appt 3B — Résidence Palmier</Text>
                    <Badge label="J+8" color={Theme.colors.white} bg={Theme.colors.red} />
                  </View>
                  <Text style={styles.alertTenant}>M. Koné Ibrahima · 250 000 FCFA</Text>
                  <View style={styles.alertActions}>
                    <TouchableOpacity style={styles.alertBtnPrimary}>
                      <Text style={styles.alertBtnText}>Relancer SMS+WA</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.alertBtnSecondary}>
                      <Text style={styles.alertBtnTextSecondary}>Détails</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Patrimoine Aperçu */}
              <View style={styles.section}>
                <SectionTitle 
                  label="Patrimoine" 
                  right={<TouchableOpacity onPress={() => setTab("patrimoine")}><Text style={styles.sectionLink}>Tout voir →</Text></TouchableOpacity>} 
                />
                {PATRIMOINE_DATA.map((e: any) => (
                  <TouchableOpacity key={e.id} style={styles.entiteRow} onPress={() => setTab("patrimoine")}>
                    <View style={[styles.entiteIcon, { backgroundColor: e.type === 'immeuble' ? Theme.colors.navyPale : Theme.colors.greenPale }]}>
                      <Text style={{ fontSize: 20 }}>{e.type === 'immeuble' ? '🏢' : '🏠'}</Text>
                    </View>
                    <View style={styles.entiteInfo}>
                      <Text style={styles.entiteNom}>{e.nom}</Text>
                      <Text style={styles.entiteSub}>{e.adresse} · {e.unites} unités</Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Accès Rapides */}
              <View style={[styles.section, { marginBottom: 20 }]}>
                <SectionTitle label="Éclair" />
                <View style={styles.quickGrid}>
                  {QUICK_ACTIONS.map((a, i) => (
                    <TouchableOpacity key={i} style={[styles.quickBox, { backgroundColor: a.bg }]}>
                      <Text style={styles.quickIcon}>{a.icon}</Text>
                      <Text style={[styles.quickLabel, { color: a.color }]}>{a.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* ══ PATRIMOINE ══ */}
          {tab === "patrimoine" && (
            <View style={styles.section}>
              <View style={styles.patrimoineHeader}>
                 <Text style={styles.patrimoineTitle}>Liste des biens</Text>
                 <TouchableOpacity style={styles.addBtn}>
                    <Text style={styles.addBtnText}>+ Ajouter</Text>
                 </TouchableOpacity>
              </View>
              {PATRIMOINE_DATA.length === 0 ? (
                <View style={styles.emptyState}>
                   <Text style={{ fontSize: 40, marginBottom: 15 }}>🏘️</Text>
                   <Text style={styles.emptyTitle}>Aucun bien enregistré</Text>
                </View>
              ) : (
                PATRIMOINE_DATA.map((e: any) => (
                  <TouchableOpacity key={e.id} style={styles.entiteCard}>
                    <View style={styles.entiteCardHeader}>
                      <View>
                        <Text style={styles.entiteCardNom}>{e.nom}</Text>
                        <Text style={styles.entiteCardSub}>{e.adresse}</Text>
                      </View>
                      <Badge label={e.type.toUpperCase()} color={Theme.colors.navy} bg={Theme.colors.navyPale} />
                    </View>
                    <View style={styles.entiteStats}>
                      <View style={styles.statPill}>
                         <Text style={styles.statVal}>{e.unites}</Text>
                         <Text style={styles.statLabel}>UNITÉS</Text>
                      </View>
                      <View style={styles.statPill}>
                         <Text style={[styles.statVal, { color: Theme.colors.green }]}>{e.occupes}</Text>
                         <Text style={styles.statLabel}>OCCUPÉS</Text>
                      </View>
                      {e.impayes > 0 && (
                        <View style={[styles.statPill, { backgroundColor: Theme.colors.redPale }]}>
                           <Text style={[styles.statVal, { color: Theme.colors.red }]}>{e.impayes}</Text>
                           <Text style={styles.statLabel}>IMPAYÉS</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {/* ══ QUITTANCES ══ */}
          {tab === "quittances" && (
            <View style={styles.section}>
              <SectionTitle label="Compte de Rendu Financièr" />
              <LinearGradient
                colors={Theme.gradients.premium as any}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.walletCard}
              >
                <Text style={styles.walletLabel}>DISPONIBLE POUR VIREMENT</Text>
                <Text style={styles.walletVal}>{fmt(PROPRIO_DATA.wallet?.solde || 0)} FCFA</Text>
                <TouchableOpacity style={styles.payoutBtn}>
                   <Text style={styles.payoutText}>DEMANDER UN VIREMENT</Text>
                </TouchableOpacity>
              </LinearGradient>

              <Text style={[styles.sectionTitle, { marginTop: 10, marginBottom: 15 }]}>Dernières Collectes (Net)</Text>
              {[
                { ref: "REC-2026-04-01", loc: "Koné I.", brut: 250000, net: 232500, date: "05/04/2026", status: "Confirmé" },
                { ref: "REC-2026-03-01", loc: "Koné I.", brut: 250000, net: 232500, date: "05/03/2026", status: "Confirmé" },
              ].map((r, i) => (
                <View key={i} style={styles.quittanceLine}>
                   <View style={styles.quittanceLineHeader}>
                      <Text style={styles.quittanceLineRef}>{r.ref}</Text>
                      <Badge label={r.status} color={Theme.colors.green} bg={Theme.colors.greenPale} />
                   </View>
                   <Text style={styles.quittanceLineLoc}>{r.loc} · {r.date}</Text>
                   <View style={styles.breakdown}>
                      <View style={styles.breakdownRow}><Text style={styles.breakdownLabel}>Loyer Brut</Text><Text style={styles.breakdownVal}>+{fmt(r.brut)} F</Text></View>
                      <View style={styles.breakdownRow}><Text style={styles.breakdownLabel}>Comm. Agence (5%)</Text><Text style={[styles.breakdownVal, { color: Theme.colors.red }]}>-{fmt(r.brut * 0.05)} F</Text></View>
                      <View style={styles.breakdownRow}><Text style={styles.breakdownLabel}>Frais Plateforme</Text><Text style={[styles.breakdownVal, { color: Theme.colors.red }]}>-500 F</Text></View>
                      <View style={[styles.breakdownRow, { borderTopWidth: 1, borderColor: '#EEE', paddingTop: 5, marginTop: 5 }]}><Text style={styles.breakdownLabelBold}>Net à Verser</Text><Text style={styles.breakdownValBold}>{fmt(r.net)} F</Text></View>
                   </View>
                </View>
              ))}
            </View>
          )}

          {/* ══ PROFIL ══ */}
          {tab === "profil" && (
            <View style={styles.section}>
               <View style={styles.profileCard}>
                  <View style={styles.avatar}>
                    <Text style={{ fontSize: 32 }}>👤</Text>
                  </View>
                   <Text style={styles.profileName}>{PROPRIO_DATA.nom}</Text>
                   <Text style={styles.profileTel}>{PROPRIO_DATA.telephone || '00 00 00 00 00'}</Text>
                   <Badge label="FORMULE GÉRANT" color={Theme.colors.white} bg={Theme.colors.gold} />
                </View>

                {onBack && (
                  <TouchableOpacity style={styles.logoutBtn} onPress={onBack}>
                    <Text style={styles.logoutText}>🚪 Changer de portail</Text>
                  </TouchableOpacity>
                )}
               
               <SectionTitle label="Abonnement" />
               <WalletCard icon="⭐" label="Gérant Platinum" sub="Expire le 31/12/2026" color={Theme.colors.gold} bg={Theme.colors.goldPale} />
               
               <SectionTitle label="Sécurité" />
               <WalletCard icon="🔒" label="Authentification 2FA" sub="Activée par SMS" color={Theme.colors.green} bg={Theme.colors.greenPale} />
            </View>
          )}
        </View>
      </ScrollView>

      {/* BOTTOM NAV BAR */}
      <View style={styles.bottomNav}>
        {[
          { id: "dash", icon: "📊", label: "Dashboard" },
          { id: "patrimoine", icon: "🏘", label: "Patrimoine" },
          { id: "quittances", icon: "🧾", label: "Quittances" },
          { id: "profil", icon: "👤", label: "Profil" },
        ].map(n => (
          <TouchableOpacity key={n.id} onPress={() => changeTab(n.id)} style={styles.navItem}>
            <Text style={[styles.navIcon, { opacity: tab === n.id ? 1 : 0.4 }]}>{n.icon}</Text>
            <Text style={[styles.navLabel, { color: tab === n.id ? Theme.colors.navy : Theme.colors.textLight }]}>{n.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.bg,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  debugBar: {
    backgroundColor: Theme.colors.navy,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  debugText: {
    color: Theme.colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  header: {
    paddingTop: 14,
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  roleBadge: {
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 2,
    marginRight: 7,
  },
  roleText: {
    fontSize: 9,
    fontWeight: '900',
    color: Theme.colors.white,
    letterSpacing: 1.5,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#5EE7B7',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: Theme.colors.white,
  },
  userSub: {
    fontSize: 12,
    color: Theme.colors.white,
    opacity: 0.7,
    marginTop: 2,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.red,
    borderWidth: 1.5,
    borderColor: Theme.colors.navy,
  },
  kpiStrip: {
    marginTop: 25,
  },
  kpiContainer: {
    gap: 12,
    paddingRight: 20,
  },
  kpiCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    padding: 12,
    width: 110,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 4,
  },
  kpiLabel: {
    fontSize: 9,
    color: Theme.colors.white,
    opacity: 0.6,
    marginTop: 2,
  },
  body: {
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.teal,
  },
  alertCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors.grey2,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  alertUnit: {
    fontSize: 13,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  alertTenant: {
    fontSize: 12,
    color: Theme.colors.textLight,
    marginBottom: 16,
  },
  alertActions: {
    flexDirection: 'row',
    gap: 10,
  },
  alertBtnPrimary: {
    flex: 1,
    backgroundColor: Theme.colors.red,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  alertBtnSecondary: {
    paddingHorizontal: 20,
    backgroundColor: Theme.colors.grey1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  alertBtnText: {
    color: Theme.colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  alertBtnTextSecondary: {
    color: Theme.colors.textMid,
    fontSize: 12,
    fontWeight: 'bold',
  },
  entiteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Theme.colors.grey2,
  },
  entiteIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entiteInfo: {
    flex: 1,
    marginLeft: 12,
  },
  entiteNom: {
    fontSize: 13,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  entiteSub: {
    fontSize: 10,
    color: Theme.colors.textLight,
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: Theme.colors.grey3,
    marginLeft: 8,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickBox: {
    width: (width - 32 - 8) / 2,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  patrimoineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  patrimoineTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Theme.colors.navy,
  },
  addBtn: {
    backgroundColor: Theme.colors.navy,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addBtnText: {
    color: Theme.colors.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  entiteCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Theme.colors.grey2,
  },
  entiteCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  entiteCardNom: {
    fontSize: 15,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  entiteCardSub: {
    fontSize: 11,
    color: Theme.colors.textLight,
  },
  entiteStats: {
    flexDirection: 'row',
    gap: 8,
  },
  statPill: {
    flex: 1,
    backgroundColor: Theme.colors.grey1,
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 14,
    fontWeight: '900',
    color: Theme.colors.text,
  },
  statLabel: {
    fontSize: 7,
    fontWeight: '800',
    color: Theme.colors.textLight,
    marginTop: 2,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Theme.colors.grey2,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Theme.colors.grey1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '900',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  profileTel: {
    fontSize: 12,
    color: Theme.colors.textLight,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Theme.colors.grey3,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: Theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.grey2,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingBottom: 25,
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 20,
  },
  navLabel: { fontSize: 9, marginTop: 2, fontWeight: '700' },
  payoutBtn: { backgroundColor: '#FFF', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 10 },
  payoutText: { color: Theme.colors.navy, fontWeight: '900', fontSize: 11 },
  quittanceLine: { backgroundColor: Theme.colors.white, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Theme.colors.grey2 },
  quittanceLineHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  quittanceLineRef: { fontSize: 13, fontWeight: '800' },
  quittanceLineLoc: { fontSize: 11, color: Theme.colors.textLight, marginBottom: 12 },
  breakdown: { backgroundColor: Theme.colors.grey1, borderRadius: 10, padding: 12 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  breakdownLabel: { fontSize: 10, color: Theme.colors.textLight },
  breakdownVal: { fontSize: 10, fontWeight: '700', color: Theme.colors.text },
  breakdownLabelBold: { fontSize: 11, fontWeight: '800', color: Theme.colors.navy },
  breakdownValBold: { fontSize: 12, fontWeight: '900', color: Theme.colors.green },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Theme.colors.navy },
  walletCard: { backgroundColor: Theme.colors.gold, borderRadius: 25, padding: 25, marginBottom: 20 },
  walletLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  walletVal: { color: '#FFF', fontSize: 28, fontWeight: '900', marginVertical: 10 },
  logoutBtn: { backgroundColor: Theme.colors.grey1, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 15, borderWidth: 1, borderColor: Theme.colors.grey2 },
  logoutText: { color: Theme.colors.navy, fontWeight: '700', fontSize: 13 },
});
