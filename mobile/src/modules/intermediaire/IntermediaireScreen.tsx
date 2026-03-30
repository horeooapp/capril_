import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../theme/theme';
import { Badge } from '../../components/common/Badge';
import { Row } from '../../components/common/Row';
import { SectionTitle } from '../../components/common/SectionTitle';
import { BrandHeader } from '../../components/common/BrandHeader';
import { BottomNav } from '../../components/common/BottomNav';
import { BottomSheet } from '../../components/common/BottomSheet';
import { useIntermediaire, useIntermediaireActions } from '../../hooks/qapril-hooks';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

// Reference Data from qapril-intermediaire.jsx
const MANDATS_SPEC = [
  { id: "M-001", prop: "Kouassi Adama", type: "Gestion totale", com: 5 },
  { id: "M-002", prop: "Diallo Seydou", type: "Encaissement seul", com: 3 },
];

export default function IntermediaireScreen({ onBack }: { onBack?: () => void }) {
  const [tab, setTab] = useState("dash");
  const [showQCert, setShowQCert] = useState(false);
  const [showEDL, setShowEDL] = useState(false);
  const [showM07, setShowM07] = useState(false);
  const [edlStep, setEdlStep] = useState(1);
  const [m07Params, setM07Params] = useState({ type: 'DELAI', value: '14' });
  const [selectedPropId, setSelectedPropId] = useState<string | null>(null);

  const { data: profile, loading: profileLoading } = useIntermediaire();
  const { performAction, loading: actionLoading } = useIntermediaireActions();

  const fmt = (n: number) => (n || 0).toLocaleString("fr-FR");

  const changeTab = (t: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTab(t);
  };

  const handleCertify = async (mandateId: string) => {
    try {
      await performAction('quittance', { mandateId, period: '2026-04' });
      Alert.alert("Certification Réussie", "La quittance Q-Cert a été émise et archivée (DGI CI).");
      setShowQCert(false);
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    }
  };

  const handleM07Submit = async () => {
    try {
      await performAction('M07', m07Params);
      Alert.alert("Médiation Initiée", `La proposition d'${m07Params.type.toLowerCase()} (${m07Params.value}j) a été transmise.`);
      setShowM07(false);
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    }
  };

  if (profileLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Theme.colors.orange} />
      </View>
    );
  }

  const INTER = profile || { fullName: "Mandataire", commissionDue: 125000, activeMandates: 3, biisGeres: 5 };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView bounces={false} contentContainerStyle={styles.scrollContent}>
        
        <BrandHeader 
          title={INTER.fullName?.toUpperCase()}
          subtitle="Mandataire de gestion certifié"
          roleLabel="INTERMÉDIAIRE"
          roleColor={Theme.colors.orange}
          onNotifPress={() => Alert.alert("Mandats", "Aucune alerte urgente.")}
        />

        <View style={styles.kpiWrap}>
           <View style={styles.kpiBox}>
              <Text style={styles.kpiVal}>{fmt(INTER.commissionDue)} F</Text>
              <Text style={styles.kpiLabel}>COMMISSIONS DUES</Text>
           </View>
           <View style={[styles.kpiBox, { borderLeftWidth: 1, borderColor: '#EEE' }]}>
              <Text style={styles.kpiVal}>{INTER.activeMandates}</Text>
              <Text style={styles.kpiLabel}>MANDATS ACTIFS</Text>
           </View>
        </View>

        <View style={styles.body}>
          {tab === "dash" && (
            <>
              <SectionTitle label="Actions Métier" />
              <View style={styles.toolsGrid}>
                 <TouchableOpacity style={styles.toolBtn} onPress={() => setShowQCert(true)}>
                    <Text style={{ fontSize: 24 }}>🧾</Text>
                    <Text style={styles.toolText}>Q-Cert</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={styles.toolBtn} onPress={() => setShowEDL(true)}>
                    <Text style={{ fontSize: 24 }}>📸</Text>
                    <Text style={styles.toolText}>M-EDL</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={styles.toolBtn} onPress={() => setTab("biens")}>
                    <Text style={{ fontSize: 24 }}>🏘️</Text>
                    <Text style={styles.toolText}>Gestion</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={styles.toolBtn} onPress={() => setShowM07(true)}>
                    <Text style={{ fontSize: 24 }}>🤝</Text>
                    <Text style={styles.toolText}>Médiation</Text>
                 </TouchableOpacity>
              </View>

              <SectionTitle label="Alertes Recouvrement" />
              <TouchableOpacity style={styles.alertCard} onPress={() => setShowM07(true)}>
                 <View style={{ flex: 1 }}>
                    <Text style={styles.alertTitle}>Impayé J+12 — Appt 3B</Text>
                    <Text style={styles.alertSub}>M. Traoré Souleymane · 150.000 F</Text>
                 </View>
                 <Badge label="M07" color="#FFF" bg={Theme.colors.red} />
              </TouchableOpacity>

              <SectionTitle label="Mes Mandats Recents" />
              {MANDATS_SPEC.map(m => (
                 <TouchableOpacity key={m.id} style={styles.mandateStrip} onPress={() => setTab("biens")}>
                    <View style={{ flex: 1 }}>
                       <Text style={styles.mName}>{m.prop}</Text>
                       <Text style={styles.mSub}>{m.type} · Com {m.com}%</Text>
                    </View>
                    <Text style={{ color: Theme.colors.textLight }}>ID: {m.id}</Text>
                 </TouchableOpacity>
              ))}
            </>
          )}

          {tab === "biens" && (
            <View>
              <SectionTitle label="Portefeuille Sous Gestion" />
              {(INTER.biens || []).map((b: any) => (
                 <View key={b.id} style={styles.bienCard}>
                    <View style={styles.bienTop}>
                       <Text style={styles.bienName}>{b.name}</Text>
                       <Badge label={b.statut?.toUpperCase()} color={Theme.colors.navy} bg={Theme.colors.navyPale} />
                    </View>
                    <Text style={styles.bienAddr}>{b.address}</Text>
                    <Row label="Loyer" value={fmt(b.loyer) + " F"} />
                    <Row label="Locataire" value={b.locataire || "VACANT"} />
                    
                    <View style={styles.bienActions}>
                       <TouchableOpacity style={styles.bAction} onPress={() => { setSelectedPropId(b.id); setShowQCert(true); }}>
                          <Text style={styles.bActionText}>🧾 Q-CERT</Text>
                       </TouchableOpacity>
                       <TouchableOpacity style={[styles.bAction, { backgroundColor: Theme.colors.teal }]} onPress={() => Alert.alert("Encaisser", "Activation MM-Transfert...")}>
                          <Text style={styles.bActionText}>💸 ENCAISSER</Text>
                       </TouchableOpacity>
                    </View>
                 </View>
              ))}
              <Text style={styles.lockMsg}>⚠️ En tant qu'intermédiaire, vous ne pouvez pas modifier les loyers (MRL-01) ni résilier de bail.</Text>
            </View>
          )}

          {tab === "quittances" && (
             <View>
                <SectionTitle label="Revenus Mandataire" />
                <LinearGradient colors={[Theme.colors.orange, '#C05B00']} style={styles.walletHero}>
                   <Text style={[styles.heroLabel, { color: 'rgba(255,255,255,0.7)' }]}>SOLDE COMMISSIONS</Text>
                   <Text style={styles.heroVal}>{fmt(INTER.commissionDue)} FCFA</Text>
                   <TouchableOpacity style={styles.cashoutBtn} onPress={() => Alert.alert("Virement", "Commissions versées sur votre compte mandataire.")}>
                      <Text style={styles.cashoutText}>RETIRER LES FONDS</Text>
                   </TouchableOpacity>
                </LinearGradient>
                <Text style={styles.legalInfo}>Les commissions sont calculées sur les loyers certifiés. Archivage légal 10 ans actif.</Text>
             </View>
          )}

          {tab === "profil" && (
             <View>
                <SectionTitle label="Profil Certifié" />
                <View style={styles.profBox}>
                   <View style={styles.profAvatar}><Text style={{ fontSize: 32 }}>🤵</Text></View>
                   <Text style={styles.profName}>{INTER.fullName}</Text>
                   <Text style={styles.profSub}>{INTER.id || 'CDAIM-041'}</Text>
                </View>
                {onBack && (
                   <TouchableOpacity style={styles.logoutBtn} onPress={onBack}>
                      <Text style={styles.logoutText}>🚪 Retour Portail</Text>
                   </TouchableOpacity>
                )}
             </View>
          )}
        </View>

        <BottomSheet visible={showQCert} onClose={() => setShowQCert(false)} title="🧾 CERTIFIER Q-CERT">
           <Text style={styles.sheetSub}>L'émission d'une quittance QAPRIL-CERT engage votre mandat de gestion.</Text>
           <TouchableOpacity style={styles.submitBtn} onPress={() => handleCertify('DEMO')} disabled={actionLoading}>
              <Text style={styles.submitBtnText}>{actionLoading ? "CERTIFICATION..." : "CONFIRMER L'ÉMISSION"}</Text>
           </TouchableOpacity>
        </BottomSheet>

        <BottomSheet visible={showEDL} onClose={() => setShowEDL(false)} title="📸 M-EDL DIGITAL">
           <View style={styles.stepWrap}>
              {[1,2,3].map(s => <View key={s} style={[styles.stepDot, edlStep >= s && { backgroundColor: Theme.colors.orange }]} />)}
           </View>
           <View style={styles.uploadArea}>
              <Text style={{ fontSize: 50 }}>{edlStep === 3 ? "✍️" : "📷"}</Text>
              <Text style={styles.uploadText}>{edlStep === 1 ? "EXTÉRIEUR" : edlStep === 2 ? "INTÉRIEUR" : "SIGNATURE"}</Text>
           </View>
           <TouchableOpacity style={styles.submitBtn} onPress={() => edlStep < 3 ? setEdlStep(s => s+1) : setShowEDL(false)}>
              <Text style={styles.submitBtnText}>{edlStep < 3 ? "CONTINUER" : "VALIDER L'EDL"}</Text>
           </TouchableOpacity>
        </BottomSheet>

        <BottomSheet visible={showM07} onClose={() => setShowM07(false)} title="🤝 MÉDIATION M07">
           <Text style={styles.sheetSub}>Choisissez la mesure d'apaisement sociale proposée au locataire.</Text>
           <View style={styles.m07Row}>
              {['DELAI', 'ECHEANCIER'].map(t => (
                 <TouchableOpacity key={t} style={[styles.m07Btn, m07Params.type === t && styles.m07BtnActive]} onPress={() => setM07Params({...m07Params, type: t})}>
                    <Text style={[styles.m07Text, m07Params.type === t && { color: '#FFF' }]}>{t}</Text>
                 </TouchableOpacity>
              ))}
           </View>
           <View style={styles.valRow}>
              {['7', '14', '30'].map(v => (
                 <TouchableOpacity key={v} style={styles.valBtn} onPress={() => setM07Params({...m07Params, value: v})}>
                    <Text style={[styles.valText, m07Params.value === v && { color: Theme.colors.orange }]}>{v}j</Text>
                 </TouchableOpacity>
              ))}
           </View>
           <TouchableOpacity style={styles.submitBtn} onPress={handleM07Submit} disabled={actionLoading}>
              <Text style={styles.submitBtnText}>{actionLoading ? "ENVOI..." : "TRANSMETTRE LA MÉDIATION"}</Text>
           </TouchableOpacity>
        </BottomSheet>

      </ScrollView>

      <BottomNav
        tabs={[
          { id: "dash", icon: "📊", label: "Tableau" },
          { id: "biens", icon: "🏘️", label: "Gestion" },
          { id: "quittances", icon: "💰", label: "Comptes" },
          { id: "profil", icon: "👤", label: "Profil" },
        ]}
        activeTab={tab}
        onChange={changeTab}
        accentColor={Theme.colors.orange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingBottom: 100 },
  body: { padding: 20 },
  kpiWrap: { flexDirection: 'row', marginTop: -25, marginHorizontal: 20, backgroundColor: '#FFF', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  kpiBox: { flex: 1, alignItems: 'center' },
  kpiVal: { fontSize: 18, fontWeight: '900', color: Theme.colors.orange },
  kpiLabel: { fontSize: 8, fontWeight: '800', color: Theme.colors.textLight, marginTop: 4, letterSpacing: 1 },
  toolsGrid: { flexDirection: 'row', gap: 10, marginBottom: 25 },
  toolBtn: { flex: 1, backgroundColor: '#FFF', padding: 15, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#EDF2F7' },
  toolText: { fontSize: 10, fontWeight: '800', color: Theme.colors.navy, marginTop: 8 },
  alertCard: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 15, alignItems: 'center', borderLeftWidth: 4, borderLeftColor: Theme.colors.red, marginBottom: 25, borderWidth: 1, borderColor: '#EDF2F7' },
  alertTitle: { fontSize: 13, fontWeight: '800', color: Theme.colors.red },
  alertSub: { fontSize: 10, color: Theme.colors.textLight, marginTop: 2 },
  mandateStrip: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  mName: { fontSize: 14, fontWeight: '800', color: Theme.colors.navy },
  mSub: { fontSize: 10, color: Theme.colors.textLight, marginTop: 2 },
  bienCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 18, marginBottom: 15, borderWidth: 1, borderColor: '#EDF2F7' },
  bienTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  bienName: { fontSize: 15, fontWeight: '800', color: Theme.colors.navy },
  bienAddr: { fontSize: 11, color: Theme.colors.textLight, marginBottom: 15 },
  bienActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  bAction: { flex: 1, backgroundColor: Theme.colors.orange, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  bActionText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
  lockMsg: { fontSize: 10, color: Theme.colors.textLight, fontStyle: 'italic', textAlign: 'center', paddingHorizontal: 30, marginTop: 20 },
  walletHero: { borderRadius: 25, padding: 25, alignItems: 'center', marginBottom: 20 },
  heroLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  heroVal: { fontSize: 32, fontWeight: '900', color: '#FFF', marginVertical: 10 },
  cashoutBtn: { backgroundColor: '#FFF', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 15 },
  cashoutText: { color: Theme.colors.orange, fontSize: 12, fontWeight: '900' },
  legalInfo: { fontSize: 9, color: Theme.colors.textLight, textAlign: 'center', marginTop: 15 },
  profBox: { backgroundColor: '#FFF', borderRadius: 25, padding: 30, alignItems: 'center', marginBottom: 20 },
  profAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Theme.colors.orangePale, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  profName: { fontSize: 18, fontWeight: '900', color: Theme.colors.navy },
  profSub: { fontSize: 12, color: Theme.colors.textLight, marginTop: 4 },
  logoutBtn: { backgroundColor: '#F1F5F9', borderRadius: 15, paddingVertical: 15, alignItems: 'center' },
  logoutText: { color: Theme.colors.navy, fontWeight: '800', fontSize: 13 },
  sheetSub: { fontSize: 12, color: Theme.colors.textLight, textAlign: 'center', marginBottom: 25 },
  submitBtn: { backgroundColor: Theme.colors.navy, borderRadius: 15, paddingVertical: 18, alignItems: 'center', marginTop: 20 },
  submitBtnText: { color: '#FFF', fontSize: 14, fontWeight: '900' },
  stepWrap: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 25 },
  stepDot: { width: 30, height: 4, borderRadius: 2, backgroundColor: '#F1F5F9' },
  uploadArea: { height: 180, backgroundColor: '#F8FAFC', borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#CBD5E1' },
  uploadText: { fontSize: 12, fontWeight: '800', color: Theme.colors.textLight, marginTop: 15 },
  m07Row: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  m07Btn: { flex: 1, paddingVertical: 15, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center' },
  m07BtnActive: { backgroundColor: Theme.colors.orange },
  m07Text: { fontSize: 12, fontWeight: '900', color: Theme.colors.textLight },
  valRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  valBtn: { padding: 15 },
  valText: { fontSize: 20, fontWeight: '900', color: Theme.colors.textLight },
});
