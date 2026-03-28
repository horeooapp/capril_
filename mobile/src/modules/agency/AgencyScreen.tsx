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
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../theme/theme';
import { Badge } from '../../components/common/Badge';
import { SectionTitle } from '../../components/common/SectionTitle';
import { BrandHeader } from '../../components/common/BrandHeader';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { useAgency, useAgencyPortfolio, useCandidates, useLeaseActions } from '../../hooks/qapril-hooks';

const { width } = Dimensions.get('window');

// --- Mock Data for Agency ---
const AGENCY = {
  nom: 'IMMOBILIÈRE DU GOLFE',
  code: 'AG-2024-0387',
  commune: 'Cocody',
  biens: 45,
  caTheorique: 12500000,
  caEncaisse: 8250000
};

const CANDIDATES = [
  { nom: "Ouattara Mariam", score: 820, emploi: "Cadre BNI", loyerMax: 150000, statut: "Qualifié", autorisation: "accordée" },
  { nom: "Sanogo Ibrahim", score: null, emploi: "Commerçant", loyerMax: 80000, statut: "En cours", autorisation: "en_attente" },
  { nom: "Koné Fatoumata", score: 775, emploi: "Fonctionnaire", loyerMax: 200000, statut: "Qualifié", autorisation: "accordée" },
];

const PORTFOLIO = [
  { id: 'BN-001', adresse: 'Villa 7 · Résidence Palmier', type: 'Villa', loyer: 320000, statut: 'occupé', paiement: 'À jour' },
  { id: 'BN-002', adresse: 'Appt 3B · Résid. Lagune', type: 'F4', loyer: 150000, statut: 'occupé', paiement: 'Impayé', retard: 12 },
  { id: 'BN-004', adresse: 'Studio A2 · Green Park', type: 'Studio', loyer: 75000, statut: 'vacant', paiement: '—' },
];

export default function AgencyScreen({ onBack }: { onBack?: () => void }) {
  const [tab, setTab] = useState("dash");
  const [requested, setRequested] = useState<Record<string, boolean>>({});
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({ propertyId: '', tenantPhone: '', rent: '150000', duration: '12' });

  const { createLease, loading: creatingLease } = useLeaseActions();

  const handleCreateLease = async () => {
    try {
      const payload = {
        propertyId: wizardData.propertyId,
        leaseType: 'residential',
        tenantPhone: wizardData.tenantPhone,
        startDate: new Date(),
        rentAmount: parseInt(wizardData.rent),
        durationMonths: parseInt(wizardData.duration) || 12,
      };
      
      const res = await createLease(payload);
      alert("Félicitations ! Le bail " + res.lease.leaseReference + " a été créé.");
      setShowWizard(false);
      setWizardStep(1);
    } catch (e: any) {
      alert("Erreur: " + e.message);
    }
  };
  const [showWizard, setShowWizard] = useState(false);

  const changeTab = (t: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTab(t);
  };

  const fmt = (n: number) => n.toLocaleString("fr-FR");
  const fmtK = (n: number) => n >= 1000000 ? (n/1000000).toFixed(1)+"M" : (n/1000).toFixed(0)+"K";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView bounces={false} contentContainerStyle={styles.scrollContent}>
        
        <BrandHeader 
          title={AGENCY.nom}
          subtitle={`${AGENCY.code} · ${AGENCY.commune}`}
          roleLabel="AGENCE AGRÉÉE"
          roleColor={Theme.colors.teal}
          onNotifPress={() => alert("Notifications QAPRIL")}
        />

        {/* KPI Strip - Floating over header */}
        <View style={{ marginTop: -25 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.kpiStrip} contentContainerStyle={styles.kpiContainer}>
            {[
               { l: "Biens", v: AGENCY.biens.toString(), icon: "🏘", color: Theme.colors.white },
               { l: "Taux Occ.", v: "85%", icon: "📊", color: Theme.colors.white },
               { l: "Impayés", v: "3", icon: "⚠️", color: "#FF8080" },
               { l: "Vacance", v: "4", icon: "🔓", color: Theme.colors.white },
            ].map((k, i) => (
              <View key={i} style={styles.kpiCard}>
                <Text style={{ fontSize: 16 }}>{k.icon}</Text>
                <Text style={[styles.kpiValue, { color: k.color }]}>{k.v}</Text>
                <Text style={styles.kpiLabel}>{k.l}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.body}>
          {/* ══ DASHBOARD ══ */}
          {tab === "dash" && (
            <>
              {/* CA Status Card */}
              <View style={styles.section}>
                <View style={styles.caCard}>
                  <Text style={styles.caTitle}>LOIERS THÉORIQUES — AVRIL 2026</Text>
                  <View style={styles.caRow}>
                    <Text style={styles.caVal}>{fmtK(AGENCY.caTheorique)} <Text style={styles.caUnit}>FCFA</Text></Text>
                    <View style={styles.caEncaisseContainer}>
                       <Text style={styles.caEncaisseSub}>Encaissé</Text>
                       <Text style={styles.caEncaisseVal}>{fmtK(AGENCY.caEncaisse)}</Text>
                    </View>
                  </View>
                  <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: `${(AGENCY.caEncaisse/AGENCY.caTheorique)*100}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{Math.round((AGENCY.caEncaisse/AGENCY.caTheorique)*100)}% de recouvrement mensuel</Text>
                </View>
              </View>

              {/* Alertes Prioritaires */}
              <View style={styles.section}>
                <SectionTitle label="🚨 Alertes recouvrement" />
                {PORTFOLIO.filter(b => b.paiement === 'Impayé').map(b => (
                  <TouchableOpacity key={b.id} style={styles.alertCard}>
                    <View style={styles.alertLeft}>
                      <Text style={styles.alertTitle}>{b.adresse.split('·')[0].trim()}</Text>
                      <Text style={styles.alertSub}>J+{b.retard} · {fmt(b.loyer)} FCFA</Text>
                    </View>
                    <Badge label="RELANCER" color={Theme.colors.white} bg={Theme.colors.red} />
                  </TouchableOpacity>
                ))}
              </View>

              {/* M-CAND Quick Access */}
              <View style={styles.section}>
                 <SectionTitle label="M-CAND" right={<TouchableOpacity onPress={() => setTab("candidats")}><Text style={styles.link}>Voir tout →</Text></TouchableOpacity>} />
                 <View style={styles.quickGrid}>
                    {CANDIDATES.slice(0, 2).map((c, i) => (
                       <TouchableOpacity key={i} style={styles.candRow} onPress={() => setTab("candidats")}>
                          <View style={styles.candAvatar}><Text style={{ fontWeight: 'bold', color: Theme.colors.navy }}>{c.nom.charAt(0)}</Text></View>
                          <View style={{ flex: 1, marginLeft: 12 }}>
                             <Text style={styles.candName}>{c.nom}</Text>
                             <Text style={styles.candSub}>{c.emploi} · ICL {c.score || '???'}</Text>
                          </View>
                          <Text style={styles.chevron}>›</Text>
                       </TouchableOpacity>
                    ))}
                 </View>
              </View>
            </>
          )}

          {/* ══ CANDIDATS (M-CAND) ══ */}
          {tab === "candidats" && (
            <View style={styles.section}>
               <SectionTitle label="Base Candidats (M-CAND)" />
               <Text style={styles.infoText}>ICL-CONSENT-01 : Autorisation requise pour voir le score.</Text>
               
               {CANDIDATES.map((c, i) => (
                 <View key={i} style={styles.candCard}>
                    <View style={styles.candCardTop}>
                       <View style={styles.candAvatarLarge}><Text style={{ fontSize: 20 }}>👤</Text></View>
                       <View style={{ flex: 1, marginLeft: 15 }}>
                          <Text style={styles.candCardName}>{c.nom}</Text>
                          <Text style={styles.candCardSub}>{c.emploi} · Max {fmt(c.loyerMax)}F</Text>
                       </View>
                       {c.autorisation === 'accordée' ? (
                          <View style={styles.scoreBox}>
                             <Text style={styles.scoreVal}>{c.score}</Text>
                             <Text style={styles.scoreLabel}>SCORE ICL</Text>
                          </View>
                       ) : (
                          <View style={styles.lockedBox}>
                             <Text style={{ fontSize: 18 }}>🔒</Text>
                          </View>
                       )}
                    </View>
                    
                    {c.autorisation !== 'accordée' && (
                       <View style={styles.authContainer}>
                          {requested[c.nom] ? (
                             <View style={styles.pendingBadge}>
                                <Text style={styles.pendingText}>⏳ Demande envoyée par SMS</Text>
                             </View>
                          ) : (
                             <TouchableOpacity 
                               style={styles.authBtn} 
                               onPress={() => setRequested(prev => ({...prev, [c.nom]: true}))}
                             >
                                <Text style={styles.authBtnText}>Demander l'autorisation</Text>
                             </TouchableOpacity>
                          )}
                       </View>
                    )}
                 </View>
               ))}
            </View>
          )}

          {/* ══ BIENS ══ */}
          {tab === "portefeuille" && (
             <View style={styles.section}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                  <SectionTitle label="Portefeuille Biens" />
                  <TouchableOpacity 
                    style={styles.addBtn}
                    onPress={() => setShowWizard(true)}
                  >
                    <Text style={styles.addBtnText}>+ Nouveau Bail</Text>
                  </TouchableOpacity>
                </View>
                {PORTFOLIO.map(b => (
                   <TouchableOpacity key={b.id} style={styles.bienCard}>
                      <View style={styles.bienLeft}>
                         <Text style={styles.bienType}>{b.type.toUpperCase()}</Text>
                         <Text style={styles.bienAddr}>{b.adresse}</Text>
                         <Text style={styles.bienLoyer}>{fmt(b.loyer)} FCFA/mois</Text>
                      </View>
                      <View style={styles.bienRight}>
                         <Badge 
                           label={b.statut === 'occupé' ? 'OCCUPÉ' : 'VACANT'} 
                           color={b.statut === 'occupé' ? Theme.colors.green : Theme.colors.orange} 
                           bg={b.statut === 'occupé' ? Theme.colors.greenPale : Theme.colors.orangePale} 
                         />
                         {b.paiement === 'Impayé' && <Badge label="IMPAYÉ" color={Theme.colors.white} bg={Theme.colors.red} style={{marginTop: 5}} />}
                      </View>
                   </TouchableOpacity>
                ))}
             </View>
          )}

          {/* ══ PROFIL ══ */}
          {tab === "profil" && (
            <View style={styles.section}>
               <View style={styles.candCard}>
                  <View style={styles.candCardTop}>
                     <View style={styles.candAvatarLarge}><Text style={{ fontSize: 24 }}>🏢</Text></View>
                     <View style={{ flex: 1, marginLeft: 15 }}>
                        <Text style={styles.candCardName}>{AGENCY.nom}</Text>
                        <Text style={styles.candCardSub}>{AGENCY.code} · {AGENCY.commune}</Text>
                     </View>
                  </View>
               </View>

               {onBack && (
                  <TouchableOpacity 
                    style={[styles.authBtn, { backgroundColor: Theme.colors.grey1, borderWidth: 1, borderColor: Theme.colors.grey2, marginTop: 10 }]} 
                    onPress={onBack}
                  >
                    <Text style={[styles.authBtnText, { color: Theme.colors.navy }]}>🚪 Changer de portail (Déconnexion)</Text>
                  </TouchableOpacity>
               )}
            </View>
          )}

          {/* ══ LEASE WIZARD (OVERLAY) ══ */}
          {showWizard && (
            <SafeAreaView style={styles.wizardOverlay}>
              <View style={styles.wizardHeader}>
                 <Text style={styles.wizardTitle}>NOUVEAU BAIL (STEP {wizardStep}/3)</Text>
                 <TouchableOpacity onPress={() => setShowWizard(false)}><Text style={{ color: Theme.colors.red, fontWeight: '800' }}>ANNULER</Text></TouchableOpacity>
              </View>

              <View style={styles.wizardBody}>
                 {wizardStep === 1 && (
                   <View>
                     <Text style={styles.wizardLabel}>CHOIX DU BIEN</Text>
                     {PORTFOLIO.map((p: any) => (
                       <TouchableOpacity 
                         key={p.id} 
                         style={[styles.wizardItem, wizardData.propertyId === p.id && styles.wizardItemActive]}
                         onPress={() => setWizardData({ ...wizardData, propertyId: p.id })}
                       >
                         <Text style={[styles.wizardItemText, wizardData.propertyId === p.id && { color: '#FFF' }]}>{p.name}</Text>
                       </TouchableOpacity>
                     ))}
                     <TouchableOpacity style={styles.nextBtn} onPress={() => setWizardStep(2)} disabled={!wizardData.propertyId}><Text style={styles.nextText}>SUIVANT →</Text></TouchableOpacity>
                   </View>
                 )}

                 {wizardStep === 2 && (
                   <View>
                     <Text style={styles.wizardLabel}>IDENTIFIANT LOCATAIRE (TÉLÉPHONE)</Text>
                     <View style={styles.inputBox}>
                       <Text style={{ fontSize: 18 }}>📞 </Text>
                       <Text style={{ color: Theme.colors.textLight, marginLeft: 10 }}>+225 07 00 00 00 00</Text>
                     </View>
                     <TouchableOpacity 
                      style={[styles.wizardItem, { marginTop: 20 }]}
                      onPress={() => setWizardData({ ...wizardData, tenantPhone: "0700000000" })}
                     >
                       <Text style={styles.wizardItemText}>Utiliser Locataire Test (0700000000)</Text>
                     </TouchableOpacity>

                     <TouchableOpacity style={styles.nextBtn} onPress={() => setWizardStep(3)} disabled={!wizardData.tenantPhone}><Text style={styles.nextText}>SUIVANT →</Text></TouchableOpacity>
                     <TouchableOpacity style={styles.backBtn} onPress={() => setWizardStep(1)}><Text style={styles.backText}>← RETOUR</Text></TouchableOpacity>
                   </View>
                 )}

                 {wizardStep === 3 && (
                   <View>
                     <Text style={styles.wizardLabel}>CONDITIONS FINANCIÈRES</Text>
                     <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Loyer :</Text>
                        <Text style={styles.summaryVal}>{fmt(parseInt(wizardData.rent))} FCFA</Text>
                     </View>
                     <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Durée :</Text>
                        <Text style={styles.summaryVal}>{wizardData.duration} Mois</Text>
                     </View>
                     
                     <TouchableOpacity 
                      style={[styles.nextBtn, { backgroundColor: Theme.colors.green, marginTop: 30 }]} 
                      onPress={handleCreateLease}
                      disabled={creatingLease}
                     >
                       <Text style={styles.nextText}>{creatingLease ? "CRÉATION..." : "GÉNÉRER LE BAIL ✔"}</Text>
                     </TouchableOpacity>
                     <TouchableOpacity style={styles.backBtn} onPress={() => setWizardStep(2)}><Text style={styles.backText}>← RETOUR</Text></TouchableOpacity>
                   </View>
                 )}
              </View>
            </SafeAreaView>
          )}
        </View>
      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        {[
          { id: "dash", icon: "📊", label: "Dashboard" },
          { id: "portefeuille", icon: "🏘", label: "Portefeuille" },
          { id: "candidats", icon: "🔍", label: "M-CAND" },
          { id: "profil", icon: "🏢", label: "Agence" },
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
  container: { flex: 1, backgroundColor: Theme.colors.bg },
  scrollContent: { paddingBottom: 100 },
  header: {
    paddingTop: 14, paddingHorizontal: 20, paddingBottom: 25,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  roleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  roleBadge: { borderRadius: 7, paddingHorizontal: 9, paddingVertical: 2, marginRight: 7 },
  roleText: { fontSize: 9, fontWeight: '900', color: Theme.colors.white, letterSpacing: 1.5 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#5EE7B7' },
  userName: { fontSize: 18, fontWeight: '800', color: Theme.colors.white },
  userSub: { fontSize: 11, color: Theme.colors.white, opacity: 0.7, marginTop: 2 },
  notifBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  notifDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: Theme.colors.red, borderWidth: 1.5, borderColor: Theme.colors.navy },
  kpiStrip: { marginTop: 25 },
  kpiContainer: { gap: 12, paddingRight: 20 },
  kpiCard: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 12, width: 110, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center' },
  kpiValue: { fontSize: 16, fontWeight: '900', marginTop: 4 },
  kpiLabel: { fontSize: 9, color: Theme.colors.white, opacity: 0.6, marginTop: 2 },
  body: { paddingHorizontal: 16 },
  section: { marginTop: 24 },
  caCard: { backgroundColor: Theme.colors.white, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: Theme.colors.grey2 },
  caTitle: { fontSize: 10, fontWeight: '800', color: Theme.colors.textLight, letterSpacing: 1 },
  caRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 15 },
  caVal: { fontSize: 28, fontWeight: '900', color: Theme.colors.navy },
  caUnit: { fontSize: 12, fontWeight: '500', color: Theme.colors.textLight },
  caEncaisseContainer: { alignItems: 'flex-end' },
  caEncaisseSub: { fontSize: 10, color: Theme.colors.textLight },
  caEncaisseVal: { fontSize: 18, fontWeight: '800', color: Theme.colors.green },
  progressBg: { height: 8, backgroundColor: Theme.colors.grey1, borderRadius: 4, marginTop: 15, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Theme.colors.green, borderRadius: 4 },
  progressText: { fontSize: 10, color: Theme.colors.textLight, marginTop: 8, textAlign: 'center' },
  alertCard: { flexDirection: 'row', backgroundColor: Theme.colors.redPale, borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: Theme.colors.red + '20' },
  alertLeft: { flex: 1 },
  alertTitle: { fontSize: 13, fontWeight: '800', color: Theme.colors.text },
  alertSub: { fontSize: 11, color: Theme.colors.textMid, marginTop: 2 },
  link: { fontSize: 12, color: Theme.colors.teal, fontWeight: '700' },
  quickGrid: { marginTop: 10 },
  candRow: { flexDirection: 'row', backgroundColor: Theme.colors.white, padding: 12, borderRadius: 14, alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: Theme.colors.grey2 },
  candAvatar: { width: 36, height: 36, borderRadius: 10, backgroundColor: Theme.colors.navyPale, alignItems: 'center', justifyContent: 'center' },
  candName: { fontSize: 13, fontWeight: '800', color: Theme.colors.text },
  candSub: { fontSize: 10, color: Theme.colors.textLight, marginTop: 2 },
  chevron: { fontSize: 18, color: Theme.colors.grey3 },
  infoText: { fontSize: 11, color: Theme.colors.textLight, marginBottom: 15 },
  candCard: { backgroundColor: Theme.colors.white, borderRadius: 20, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: Theme.colors.grey2 },
  candCardTop: { flexDirection: 'row', alignItems: 'center' },
  candAvatarLarge: { width: 50, height: 50, borderRadius: 15, backgroundColor: Theme.colors.grey1, alignItems: 'center', justifyContent: 'center' },
  candCardName: { fontSize: 15, fontWeight: '900', color: Theme.colors.text },
  candCardSub: { fontSize: 11, color: Theme.colors.textLight, marginTop: 3 },
  scoreBox: { alignItems: 'center', padding: 8, backgroundColor: Theme.colors.greenPale, borderRadius: 12 },
  scoreVal: { fontSize: 22, fontWeight: '900', color: Theme.colors.green },
  scoreLabel: { fontSize: 7, fontWeight: '800', color: Theme.colors.green },
  lockedBox: { padding: 12, backgroundColor: Theme.colors.grey1, borderRadius: 12 },
  authContainer: { marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: Theme.colors.grey1 },
  authBtn: { backgroundColor: Theme.colors.navy, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  authBtnText: { color: Theme.colors.white, fontSize: 12, fontWeight: 'bold' },
  pendingBadge: { backgroundColor: Theme.colors.orangePale, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  pendingText: { color: Theme.colors.orange, fontSize: 11, fontWeight: '700' },
  bienCard: { flexDirection: 'row', backgroundColor: Theme.colors.white, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Theme.colors.grey2 },
  bienLeft: { flex: 1 },
  bienType: { fontSize: 9, fontWeight: '900', color: Theme.colors.textLight, letterSpacing: 1 },
  bienAddr: { fontSize: 13, fontWeight: '800', color: Theme.colors.text, marginTop: 4 },
  bienLoyer: { fontSize: 12, color: Theme.colors.navy, fontWeight: '700', marginTop: 6 },
  bienRight: { alignItems: 'flex-end', justifyContent: 'center' },
  bottomNav: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: Theme.colors.white, borderTopWidth: 1, borderTopColor: Theme.colors.grey2, flexDirection: 'row', paddingVertical: 10, paddingBottom: 25, justifyContent: 'space-around' },
  navItem: { alignItems: 'center' },
  navIcon: { fontSize: 20 },
  navLabel: { fontSize: 9, marginTop: 2, fontWeight: '700' },
  addBtn: { backgroundColor: Theme.colors.teal, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: Theme.colors.white, fontWeight: '700', fontSize: 12 },
  wizardOverlay: {
    position: 'absolute', top: 0, left: -16, right: -16, bottom: -100,
    backgroundColor: Theme.colors.white, zIndex: 100, padding: 20
  },
  wizardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  wizardTitle: { fontSize: 18, fontWeight: '900', color: Theme.colors.navy },
  wizardBody: { flex: 1 },
  wizardLabel: { fontSize: 13, fontWeight: '900', color: Theme.colors.teal, marginBottom: 15, marginTop: 10, textTransform: 'uppercase' },
  wizardItem: { padding: 16, borderRadius: 14, backgroundColor: Theme.colors.grey1, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: Theme.colors.teal },
  wizardItemActive: { backgroundColor: Theme.colors.teal },
  wizardItemText: { fontWeight: '700', color: Theme.colors.navy },
  nextBtn: { backgroundColor: Theme.colors.navy, borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 25 },
  nextText: { color: '#FFF', fontWeight: '800' },
  backBtn: { padding: 15, alignItems: 'center', marginTop: 10 },
  backText: { color: Theme.colors.textLight, fontWeight: '700' },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.grey1, padding: 15, borderRadius: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { color: Theme.colors.textLight, fontWeight: '700' },
  summaryVal: { color: Theme.colors.navy, fontWeight: '800' },
});
