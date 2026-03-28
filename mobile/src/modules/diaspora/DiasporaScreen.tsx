import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../theme/theme';
import { Badge } from '../../components/common/Badge';
import { Row } from '../../components/common/Row';
import { SectionTitle } from '../../components/common/SectionTitle';
import { WalletCard } from '../../components/common/WalletCard';
import { useDiaspora, useDiasporaStats, useDiasporaTransfer } from '../../hooks/qapril-hooks';

const { width } = Dimensions.get('window');
const FCFA_EUR = 655.957;

export default function DiasporaScreen({ onBack }: { onBack?: () => void }) {
  const [tab, setTab] = useState("dash");
  const [devise, setDevise] = useState("FCFA");

  const { data: profile } = useDiaspora();
  const { data: stats, loading, refetch } = useDiasporaStats();
  const { transfer, generateInvite, loading: actionLoading } = useDiasporaTransfer();

  const fmt = (n: number) => n?.toLocaleString("fr-FR") ?? "0";
  const fmtE = (n: number) => (n / FCFA_EUR).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const aff = (fcfa: number) => devise === "EUR" ? `${fmtE(fcfa)} €` : `${fmt(fcfa)} FCFA`;

  // Fallback data
  const D = stats || { 
    properties: [], 
    settings: { pays: "France", fuseau: "Europe/Paris" },
    mobileMoney: [], 
    webhooks: [] 
  };

  const totalFCFA = D.properties?.filter((b: any) => b.activeLease).reduce((s: number, b: any) => s + (b.activeLease?.rentFcfa || 0), 0) || 0;
  const impayesN = D.properties?.filter((b: any) => b.isImpaye).length || 0;
  const alertesSLA = D.properties?.filter((b: any) => b.isHorsSLA).length || 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView bounces={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER */}
        <LinearGradient
          colors={[Theme.colors.diaspora || '#0E3A8C', Theme.colors.teal]}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View>
              <View style={styles.roleRow}>
                <Badge label="DIASPORA PREMIUM" color={Theme.colors.gold} bg="rgba(0,0,0,0.3)" />
                <View style={styles.onlineDot} />
              </View>
              <Text style={styles.userName}>{(profile?.fullName || "INVESTISSEUR").toUpperCase()}</Text>
              <Text style={styles.userSub}>{profile?.paysResidence || 'Europe'} · {D.settings?.fuseau?.split('/')[1] || 'Paris'}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
               {onBack && (
                  <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
                    <Text style={{ fontSize: 18 }}>🔄</Text>
                  </TouchableOpacity>
               )}
            </View>
          </View>

          {/* Devise Switcher */}
          <View style={styles.deviseSwitcher}>
            {["FCFA", "EUR"].map(d => (
              <TouchableOpacity 
                key={d} 
                onPress={() => setDevise(d)}
                style={[styles.deviseBtn, devise === d && styles.deviseBtnActive]}
              >
                <Text style={[styles.deviseText, devise === d && styles.deviseTextActive]}>{d === "EUR" ? "€ EUR" : "XOF"}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* KPIs */}
          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiVal}>{aff(totalFCFA)}</Text>
              <Text style={styles.kpiLabel}>REVENUS / MOIS</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={[styles.kpiVal, { color: Theme.colors.red }]}>{impayesN}</Text>
              <Text style={styles.kpiLabel}>IMPAYÉS</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={[styles.kpiVal, { color: Theme.colors.gold }]}>{alertesSLA}</Text>
              <Text style={styles.kpiLabel}>ALERTES SLA</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {tab === "dash" && (
            <>
              <SectionTitle label="Analyse de Trésorerie" />
              <TouchableOpacity style={styles.treasuryCard} onPress={() => {}}>
                <View style={styles.treasuryTop}>
                   <View>
                      <Text style={styles.treasuryLabel}>DISPONIBLE SEPA</Text>
                      <Text style={styles.treasuryVal}>{aff(totalFCFA)}</Text>
                   </View>
                   <View style={styles.euroCircle}>
                      <Text style={{ fontSize: 20 }}>💶</Text>
                   </View>
                </View>
                <TouchableOpacity 
                    style={styles.transferBtn}
                    onPress={async () => {
                      try {
                        const res = await transfer(totalFCFA, devise);
                        alert(res.message);
                      } catch (e: any) {
                        alert(e.message);
                      }
                    }}
                >
                  <Text style={styles.transferBtnText}>INITIER LE VIREMENT SEPA</Text>
                </TouchableOpacity>
              </TouchableOpacity>

              <SectionTitle label="Patrimoine Local (RCI)" />
              {D.properties?.map((p: any) => (
                <View key={p.id} style={styles.propertyCard}>
                  <View style={styles.propertyHeader}>
                    <Text style={styles.propertyName}>{p.name}</Text>
                    <Badge 
                        label={p.managementMode === "AGENCY" ? "AGENCE" : "DIRECT"} 
                        color={Theme.colors.teal} 
                        bg={Theme.colors.tealPale} 
                    />
                  </View>
                  <Row label="Revenu" value={aff(p.activeLease?.rentFcfa || 0)} />
                  <Row label="Localisation" value={`${p.commune} · ${p.propertyCode}`} />
                </View>
              ))}

              <SectionTitle label="Mandataires & Gestion" />
              <TouchableOpacity 
                style={styles.inviteCard}
                onPress={async () => {
                    const res = await generateInvite();
                    alert("Lien d'invitation généré : " + res.inviteUrl);
                }}
              >
                <Text style={{ fontSize: 24, marginBottom: 8 }}>🤝</Text>
                <Text style={styles.inviteTitle}>INVITER UN GESTIONNAIRE</Text>
                <Text style={styles.inviteSub}>Donnez un accès sécurisé à un proche en RCI</Text>
              </TouchableOpacity>
            </>
          )}

          {tab === "profil" && (
            <View style={styles.section}>
                <View style={styles.profileCard}>
                   <View style={styles.avatar}><Text style={{ fontSize: 32 }}>👤</Text></View>
                   <Text style={styles.profileName}>{profile?.fullName || "Investisseur Diaspora"}</Text>
                   <Text style={styles.profileSub}>{profile?.email}</Text>
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
          { id: "biens", icon: "🏢", label: "Biens" },
          { id: "virements", icon: "💶", label: "Virements" },
          { id: "profil", icon: "👤", label: "Profil" },
        ].map(n => (
          <TouchableOpacity key={n.id} onPress={() => setTab(n.id)} style={styles.navItem}>
            <Text style={[styles.navIcon, { opacity: tab === n.id ? 1 : 0.4 }]}>{n.icon}</Text>
            <Text style={[styles.navLabel, { color: tab === n.id ? Theme.colors.diaspora || '#0E3A8C' : Theme.colors.textLight }]}>{n.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
  userSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  
  deviseSwitcher: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 12, padding: 4, marginBottom: 20 },
  deviseBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  deviseBtnActive: { backgroundColor: '#FFF' },
  deviseText: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.5)' },
  deviseTextActive: { color: '#0E3A8C' },

  kpiRow: { flexDirection: 'row', gap: 10 },
  kpiCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  kpiVal: { fontSize: 15, fontWeight: '900', color: '#FFF' },
  kpiLabel: { fontSize: 8, fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginTop: 4, letterSpacing: 1 },

  body: { padding: 20 },
  treasuryCard: { backgroundColor: '#FFF', borderRadius: 25, padding: 20, borderBottomWidth: 4, borderBottomColor: Theme.colors.diaspora || '#0E3A8C', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  treasuryTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  treasuryLabel: { fontSize: 10, fontWeight: '800', color: Theme.colors.textLight, letterSpacing: 1 },
  treasuryVal: { fontSize: 24, fontWeight: '900', color: Theme.colors.navy, marginTop: 4 },
  euroCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: Theme.colors.goldPale, alignItems: 'center', justifyContent: 'center' },
  transferBtn: { backgroundColor: Theme.colors.diaspora || '#0E3A8C', borderRadius: 15, paddingVertical: 15, alignItems: 'center' },
  transferBtnText: { color: '#FFF', fontSize: 12, fontWeight: '900', letterSpacing: 1 },

  propertyCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#EDF2F7' },
  propertyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  propertyName: { fontSize: 14, fontWeight: '800', color: Theme.colors.navy },
  
  inviteCard: { backgroundColor: Theme.colors.navy, borderRadius: 20, padding: 25, alignItems: 'center', marginTop: 10 },
  inviteTitle: { color: '#FFF', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  inviteSub: { color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 4, textAlign: 'center' },

  section: { marginTop: 10 },
  profileCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 25, alignItems: 'center', marginBottom: 20 },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  profileName: { fontSize: 18, fontWeight: '900', color: Theme.colors.navy },
  profileSub: { fontSize: 13, color: Theme.colors.textLight, marginTop: 4 },
  logoutBtn: { backgroundColor: '#F1F5F9', borderRadius: 15, paddingVertical: 15, alignItems: 'center' },
  logoutText: { color: Theme.colors.navy, fontWeight: '800', fontSize: 13 },

  bottomNav: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', flexDirection: 'row', paddingVertical: 10, paddingBottom: 25, justifyContent: 'space-around' },
  navItem: { alignItems: 'center' },
  navIcon: { fontSize: 20 },
  navLabel: { fontSize: 9, marginTop: 2, fontWeight: '700' },
});
