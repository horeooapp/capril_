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
  UIManager,
  Alert, 
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../theme/theme';
import { Badge } from '../../components/common/Badge';
import { SectionTitle } from '../../components/common/SectionTitle';
import { BrandHeader } from '../../components/common/BrandHeader';
import { BottomNav } from '../../components/common/BottomNav';
import { 
  useAgency, 
  useAgencyPortfolio, 
  useCandidates, 
  useLeaseActions, 
  useAgencyMutations 
} from '../../hooks/qapril-hooks';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

export default function AgencyScreen({ onBack }: { onBack?: () => void }) {
  const [tab, setTab] = useState("dash");
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [clemenceLease, setClemenceLease] = useState<any>(null);

  const { data: agency, loading: loadAgency } = useAgency();
  const { data: portfolio, loading: loadPort, refetch: refetchPort } = useAgencyPortfolio();
  const { data: candidates, loading: loadCand, refetch: refetchCand } = useCandidates();
  const { createLease, nudgeArrears, loading: actionLoading } = useLeaseActions();
  const { updateMasking, requestScore, applyClemence, loading: mutationLoading } = useAgencyMutations();

  const handleNudge = async (leaseId: string) => {
    try {
      await nudgeArrears(leaseId);
      Alert.alert("Relance envoyée", "Le locataire a été notifié par SMS et WhatsApp.");
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    }
  };

  const handleScoreRequest = async (candidateId: string) => {
    try {
      await requestScore(candidateId);
      Alert.alert("Demande envoyée", "Le locataire a reçu un SMS pour autoriser la consultation de son score ICL.");
      refetchCand();
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    }
  };

  const handleClemence = async (leaseId: string, type: string) => {
    try {
      await applyClemence(leaseId, type, { date: new Date().toISOString() });
      Alert.alert("Clémence activée", "La mesure de clémence a été enregistrée et le bailleur notifié.");
      setClemenceLease(null);
      refetchPort();
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    }
  };

  const toggleMasking = async (propertyId: string, currentMasked: boolean) => {
    try {
      await updateMasking(propertyId, !currentMasked);
      Alert.alert("Confidentialité", `Le nom du propriétaire est maintenant ${currentMasked ? 'visible' : 'masqué (BAI-XXX)'}.`);
      refetchPort();
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    }
  };

  const changeTab = (t: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTab(t);
  };

  const fmt = (n: number) => (n || 0).toLocaleString("fr-FR");
  const fmtK = (n: number) => n >= 1000000 ? (n/1000000).toFixed(1)+"M" : (n/1000).toFixed(0)+"K";

  if (loadAgency || loadPort || loadCand) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Theme.colors.teal} />
      </View>
    );
  }

  const AGENCY_DATA = agency || { nom: 'AGENCE', code: '...', caTheorique: 0, caEncaisse: 0, biens: 0 };
  const PORTFOLIO_DATA = portfolio || [];
  const CANDIDATES_DATA = candidates || [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView bounces={false} contentContainerStyle={styles.scrollContent}>
        
        <BrandHeader 
          title={AGENCY_DATA.nom}
          subtitle={`${AGENCY_DATA.code} · ${AGENCY_DATA.commune || 'Côte d\'Ivoire'}`}
          roleLabel="AGENCE AGRÉÉE"
          roleColor={Theme.colors.teal}
          onNotifPress={() => Alert.alert("Notifications", "Aucune alerte critique.")}
        />

        {/* Dash Summary Strip */}
        <View style={styles.kpiStripWrap}>
           {[
             { l: "Biens", v: PORTFOLIO_DATA.length.toString(), icon: "🏘" },
             { l: "Impayés", v: PORTFOLIO_DATA.filter((b: any) => b.isImpaye).length.toString(), icon: "⚠️", color: Theme.colors.red },
             { l: "Vacants", v: PORTFOLIO_DATA.filter((b: any) => b.statut === 'vacant').length.toString(), icon: "🔓" },
           ].map((k, i) => (
             <View key={i} style={styles.kpiMiniCard}>
               <Text style={styles.kpiMiniVal}>{k.v}</Text>
               <Text style={[styles.kpiMiniLabel, k.color ? { color: k.color } : {}]}>{k.l}</Text>
             </View>
           ))}
        </View>

        <View style={styles.body}>
          {/* ══ DASHBOARD ══ */}
          {tab === "dash" && (
            <>
              <View style={styles.caCard}>
                <Text style={styles.caTitle}>LOIERS THÉORIQUES — AVRIL 2026</Text>
                <View style={styles.caRow}>
                  <Text style={styles.caVal}>{fmtK(AGENCY_DATA.totalTheoreticalRent || 0)} <Text style={styles.caUnit}>FCFA</Text></Text>
                  <View style={{ alignItems: 'flex-end' }}>
                     <Text style={styles.caEncaisseSub}>Encaissé</Text>
                     <Text style={styles.caEncaisseVal}>{fmtK(AGENCY_DATA.totalCollectedRent || 0)}</Text>
                  </View>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${(AGENCY_DATA.totalCollectedRent / (AGENCY_DATA.totalTheoreticalRent || 1)) * 100}%` }]} />
                </View>
              </View>

              <SectionTitle label="🚨 Alertes Recouvrement" />
              {PORTFOLIO_DATA.filter((b: any) => b.isImpaye).map((b: any) => (
                <View key={b.id} style={styles.alertCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.alertTitle}>{b.name || b.address}</Text>
                    <Text style={styles.alertSub}>{b.tenantName} · J+{b.arrearsDays || 0}</Text>
                  </View>
                  <TouchableOpacity style={styles.nudgeBtn} onPress={() => handleNudge(b.leaseId)}>
                    <Text style={styles.nudgeBtnText}>RELANCER</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <SectionTitle label="Module Clémence M07" />
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>La phase 5 permet d'accorder des délais ou échéanciers pour éviter le contentieux CACI.</Text>
              </View>
              {PORTFOLIO_DATA.filter((b: any) => b.isImpaye && !b.isClemenceActive).slice(0, 1).map((b: any) => (
                 <TouchableOpacity key={b.id} style={styles.clemenceCard} onPress={() => setClemenceLease(b)}>
                    <Text style={styles.clemenceBtnText}>ACTIVER LA MÉDIATION POUR {b.tenantName.toUpperCase()}</Text>
                 </TouchableOpacity>
              ))}
            </>
          )}

          {/* ══ M-CAND ══ */}
          {tab === "candidats" && (
            <View>
              <SectionTitle label="Base Candidatures (M-CAND)" />
              {CANDIDATES_DATA.map((c: any) => (
                <View key={c.id} style={styles.candCard}>
                  <View style={styles.candTop}>
                    <View style={styles.avatar}><Text style={{ fontWeight: 'bold' }}>{c.fullName.charAt(0)}</Text></View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.candName}>{c.fullName}</Text>
                      <Text style={styles.candSub}>{c.employment} · Max {fmt(c.maxRent)}F</Text>
                    </View>
                    {c.isScoreAuthorized ? (
                      <View style={styles.scoreBox}>
                         <Text style={styles.scoreVal}>{c.iclScore || '???'}</Text>
                         <Text style={styles.scoreLabel}>SCORE ICL</Text>
                      </View>
                    ) : (
                      <TouchableOpacity style={styles.requestScoreBtn} onPress={() => handleScoreRequest(c.id)}>
                         <Text style={styles.requestScoreText}>SCORE 🔒</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ══ BIENS ══ */}
          {tab === "portefeuille" && (
            <View>
              <SectionTitle label="Portefeuille & Confidentialité" />
              {PORTFOLIO_DATA.map((b: any) => (
                <View key={b.id} style={styles.propCard}>
                  <View style={styles.propTop}>
                    <View style={{ flex: 1 }}>
                       <Text style={styles.propName}>{b.name || b.address}</Text>
                       <Text style={styles.propSub}>{b.ownerName} · {b.propertyCode}</Text>
                    </View>
                    <TouchableOpacity 
                      style={[styles.maskBtn, b.isMasked && { backgroundColor: Theme.colors.goldPale }]} 
                      onPress={() => toggleMasking(b.id, b.isMasked)}
                    >
                      <Text style={[styles.maskBtnText, b.isMasked && { color: Theme.colors.gold }]}>{b.isMasked ? '🔒 MASQUÉ' : '🔓 PUBLIC'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ══ PROFIL ══ */}
          {tab === "profil" && (
            <View>
               <SectionTitle label="Mon Agence" />
               <View style={styles.agencyCard}>
                  <Text style={styles.agencyName}>{AGENCY_DATA.nom}</Text>
                  <Text style={styles.agencyCode}>{AGENCY_DATA.code}</Text>
               </View>
               {onBack && (
                  <TouchableOpacity style={styles.logoutBtn} onPress={onBack}>
                    <Text style={styles.logoutText}>🚪 Changer de portail</Text>
                  </TouchableOpacity>
               )}
            </View>
          )}
        </View>

        {/* MODAL CLEMENCE */}
        {clemenceLease && (
          <View style={styles.modalBackdrop}>
             <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>🤝 MESURE DE CLÉMENCE</Text>
                <Text style={styles.modalSub}>Locataire : {clemenceLease.tenantName}</Text>
                
                <TouchableOpacity style={styles.modalOption} onPress={() => handleClemence(clemenceLease.leaseId, 'DELAY')}>
                   <Text style={styles.modalOptionTitle}>Accorder un délai (7 jours)</Text>
                   <Text style={styles.modalOptionSub}>Suspendre les relances temporairement.</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalOption} onPress={() => handleClemence(clemenceLease.leaseId, 'PLAN')}>
                   <Text style={styles.modalOptionTitle}>Proposer un échéancier</Text>
                   <Text style={styles.modalOptionSub}>Diviser la dette en 3 mensualités.</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.modalOption, { borderBottomWidth: 0 }]} onPress={() => setClemenceLease(null)}>
                   <Text style={[styles.modalOptionTitle, { color: Theme.colors.red }]}>Annuler</Text>
                </TouchableOpacity>
             </View>
          </View>
        )}
      </ScrollView>

      <BottomNav
        tabs={[
          { id: "dash", icon: "📊", label: "Dashboard" },
          { id: "portefeuille", icon: "🏘", label: "Biens" },
          { id: "candidats", icon: "🔍", label: "M-CAND" },
          { id: "profil", icon: "👤", label: "Agence" },
        ]}
        activeTab={tab}
        onChange={changeTab}
        accentColor={Theme.colors.teal}
        actionTabs={onBack ? [{ id: "quitter", icon: "🚪", label: "Quitter", onPress: onBack }] : []}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingBottom: 100 },
  body: { padding: 20 },
  kpiStripWrap: { flexDirection: 'row', justifyContent: 'space-around', marginTop: -25, marginHorizontal: 20, backgroundColor: '#FFF', borderRadius: 20, padding: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  kpiMiniCard: { alignItems: 'center' },
  kpiMiniVal: { fontSize: 18, fontWeight: '900', color: Theme.colors.navy },
  kpiMiniLabel: { fontSize: 9, fontWeight: '800', color: Theme.colors.textLight, marginTop: 2 },
  
  caCard: { backgroundColor: Theme.colors.navy, borderRadius: 25, padding: 20, marginBottom: 20 },
  caTitle: { fontSize: 9, fontWeight: '900', color: 'rgba(255,255,255,0.6)', letterSpacing: 1 },
  caRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 15 },
  caVal: { fontSize: 26, fontWeight: '900', color: '#FFF' },
  caUnit: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.6)' },
  caEncaisseSub: { fontSize: 10, color: 'rgba(255,255,255,0.6)' },
  caEncaisseVal: { fontSize: 18, fontWeight: '900', color: Theme.colors.teal },
  progressBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, marginTop: 15 },
  progressFill: { height: '100%', backgroundColor: Theme.colors.teal, borderRadius: 3 },

  alertCard: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 15, padding: 15, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#EDF2F7' },
  alertTitle: { fontSize: 13, fontWeight: '800', color: Theme.colors.navy },
  alertSub: { fontSize: 11, color: Theme.colors.textLight, marginTop: 2 },
  nudgeBtn: { backgroundColor: Theme.colors.red, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  nudgeBtnText: { color: '#FFF', fontSize: 10, fontWeight: '900' },

  infoBox: { backgroundColor: Theme.colors.tealPale, padding: 12, borderRadius: 12, marginBottom: 10 },
  infoText: { fontSize: 11, color: Theme.colors.teal, lineHeight: 16 },
  clemenceCard: { backgroundColor: Theme.colors.gold, borderRadius: 12, padding: 15, alignItems: 'center' },
  clemenceBtnText: { color: '#FFF', fontSize: 11, fontWeight: '900' },

  candCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#EDF2F7' },
  candTop: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  candName: { fontSize: 14, fontWeight: '800', color: Theme.colors.navy },
  candSub: { fontSize: 11, color: Theme.colors.textLight, marginTop: 2 },
  scoreBox: { backgroundColor: Theme.colors.greenPale, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, alignItems: 'center' },
  scoreVal: { fontSize: 16, fontWeight: '900', color: Theme.colors.green },
  scoreLabel: { fontSize: 7, fontWeight: '900', color: Theme.colors.green },
  requestScoreBtn: { backgroundColor: Theme.colors.navy, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 },
  requestScoreText: { color: '#FFF', fontSize: 10, fontWeight: '900' },

  propCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#EDF2F7' },
  propTop: { flexDirection: 'row', alignItems: 'center' },
  propName: { fontSize: 14, fontWeight: '800', color: Theme.colors.navy },
  propSub: { fontSize: 11, color: Theme.colors.textLight, marginTop: 2 },
  maskBtn: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  maskBtnText: { fontSize: 10, fontWeight: '900', color: Theme.colors.textLight },

  agencyCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 25, alignItems: 'center', marginBottom: 20 },
  agencyName: { fontSize: 18, fontWeight: '900', color: Theme.colors.navy },
  agencyCode: { fontSize: 13, color: Theme.colors.textLight, marginTop: 5 },
  logoutBtn: { backgroundColor: '#F1F5F9', borderRadius: 15, paddingVertical: 15, alignItems: 'center' },
  logoutText: { color: Theme.colors.navy, fontWeight: '800', fontSize: 13 },

  modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', zIndex: 1000 },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 40 },
  modalTitle: { fontSize: 16, fontWeight: '900', color: Theme.colors.gold, marginBottom: 5 },
  modalSub: { fontSize: 13, color: Theme.colors.textLight, marginBottom: 20 },
  modalOption: { paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalOptionTitle: { fontSize: 14, fontWeight: '800', color: Theme.colors.navy },
  modalOptionSub: { fontSize: 12, color: Theme.colors.textLight, marginTop: 5 },
});
