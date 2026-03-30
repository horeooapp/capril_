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
  ActivityIndicator,
  TextInput,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../theme/theme';
import { Badge } from '../../components/common/Badge';
import { Row } from '../../components/common/Row';
import { SectionTitle } from '../../components/common/SectionTitle';
import { WalletCard } from '../../components/common/WalletCard';
import { BrandHeader } from '../../components/common/BrandHeader';
import { BottomNav } from '../../components/common/BottomNav';
import { BottomSheet } from '../../components/common/BottomSheet';
import { 
  useProprio, 
  usePatrimoine, 
  useProprioMutations,
  useLeaseActions
} from '../../hooks/qapril-hooks';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

export default function ProprioScreen({ onBack }: { onBack?: () => void }) {
  const [tab, setTab] = useState("dash");
  const [view, setView] = useState("list"); // list, entity, unit
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [showMRL, setShowMRL] = useState(false);
  const [showRetrait, setShowRetrait] = useState(false);
  const [showWalletConfig, setShowWalletConfig] = useState(false);
  const [mrlData, setMrlData] = useState({ rent: '', date: '' });
  const [walletData, setWalletData] = useState({ operator: 'WAVE', phone: '' });

  const { data: proprioData, loading: proprioLoading, refetch: refetchProprio } = useProprio();
  const { data: patrimoineData, loading: patrimoineLoading, refetch: refetchPatrimoine } = usePatrimoine();
  const { addEntity, removeEntity, updateWalletConfig, requestDisbursement, loading: mutationLoading } = useProprioMutations();
  const { requestMRL, loading: leaseLoading } = useLeaseActions();

  const fmt = (n: number) => (n || 0).toLocaleString("fr-FR");

  const changeTab = (t: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTab(t);
    setView("list");
    setSelectedEntity(null);
    setSelectedUnit(null);
  };

  const handleUnitPress = (unit: any) => {
    setSelectedUnit(unit);
    setView("unit");
  };

  const submitMRL = async () => {
    if (!selectedUnit?.leaseReference) {
      Alert.alert("Erreur", "Référence de bail introuvable.");
      return;
    }
    try {
      await requestMRL(selectedUnit.leaseReference, parseInt(mrlData.rent), mrlData.date);
      Alert.alert("Demande Envoyée", "La proposition MRL-01 a été transmise au locataire. Conformément à la loi, il a 5 jours pour répondre sans quoi la demande expire.");
      setShowMRL(false);
      refetchPatrimoine();
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    }
  };

  const handleWalletSave = async () => {
    try {
      await updateWalletConfig({ payoutOperator: walletData.operator, payoutNumber: walletData.phone });
      Alert.alert("Config Sauvegardée", "Vos coordonnées de versement ont été mises à jour sur le réseau QAPRIL.");
      setShowWalletConfig(false);
      refetchProprio();
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    }
  };

  if (proprioLoading || patrimoineLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Theme.colors.navy} />
      </View>
    );
  }

  const PROPRIO = proprioData || { fullName: 'Bailleur', solde: 0, theorique: 0, encaissent: 0 };
  const PATRIMOINE = patrimoineData || [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView bounces={false} contentContainerStyle={styles.scrollContent}>
        
        <BrandHeader 
          title={PROPRIO.fullName || "Bailleur"}
          subtitle="Compte Certifié Bailleur"
          roleLabel="PROPRIÉTAIRE V4"
          roleColor={Theme.colors.navy}
          onNotifPress={() => Alert.alert("Notifications", "Aucune notification urgente.")}
        />

        <View style={styles.wealthStripWrap}>
           <View style={styles.wealthBox}>
              <Text style={styles.wealthVal}>{fmt(PROPRIO.solde || 0)} <Text style={{ fontSize: 10 }}>F</Text></Text>
              <Text style={styles.wealthLabel}>SOLDE WALLET</Text>
           </View>
           <View style={[styles.wealthBox, { borderLeftWidth: 1, borderColor: '#EEE' }]}>
              <Text style={styles.wealthVal}>{PATRIMOINE.length}</Text>
              <Text style={styles.wealthLabel}>ENTITÉS</Text>
           </View>
        </View>

        <View style={styles.body}>
          {tab === "dash" && (
            <>
              <SectionTitle label="Suivi des Encaissements" />
              <TouchableOpacity style={styles.performanceCard} onPress={() => setTab("quittances")}>
                 <View style={styles.perfHeader}>
                    <Text style={styles.perfTitle}>Collecte ce mois (Avril 2026)</Text>
                    <Badge label={`${Math.round(((PROPRIO.encaissent || 0) / (PROPRIO.theorique || 1)) * 100)}%`} color={Theme.colors.green} bg={Theme.colors.greenPale} />
                 </View>
                 <View style={styles.dualKpi}>
                    <View>
                       <Text style={styles.kpiLabel}>THÉORIQUE</Text>
                       <Text style={styles.kpiVal}>{fmt(PROPRIO.theorique || 0)} F</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                       <Text style={styles.kpiLabel}>ENCAISSÉ</Text>
                       <Text style={[styles.kpiVal, { color: Theme.colors.green }]}>{fmt(PROPRIO.encaissent || 0)} F</Text>
                    </View>
                 </View>
              </TouchableOpacity>

              <SectionTitle label="Gestion & Patrimoine" />
              <View style={styles.actionGrid}>
                 <TouchableOpacity style={styles.actionBox} onPress={() => setTab("patrimoine")}>
                    <Text style={{ fontSize: 24 }}>🏠</Text>
                    <Text style={styles.actionLabel}>Patrimoine</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={styles.actionBox} onPress={() => setTab("profil")}>
                    <Text style={{ fontSize: 24 }}>⚙️</Text>
                    <Text style={styles.actionLabel}>Profil</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={styles.actionBox} onPress={() => setTab("quittances")}>
                    <Text style={{ fontSize: 24 }}>💰</Text>
                    <Text style={styles.actionLabel}>Wallet</Text>
                 </TouchableOpacity>
              </View>
            </>
          )}

          {tab === "patrimoine" && (
            <View>
              {view === "list" ? (
                <>
                  <SectionTitle label="Portefeuille Immobilier" />
                  {PATRIMOINE.map((e: any) => (
                    <TouchableOpacity key={e.id} style={styles.entityCard} onPress={() => { setSelectedEntity(e); setView("entity"); }}>
                       <View style={styles.entityTop}>
                          <Text style={styles.entityName}>{e.name || e.nom}</Text>
                          <Badge label={e.type?.toUpperCase()} color={Theme.colors.navy} bg={Theme.colors.navyPale} />
                       </View>
                       <Text style={styles.entityAddr}>{e.address || e.commune}</Text>
                       <View style={styles.entityStats}>
                          <Text style={styles.statLine}>{e.unitsCount || e.unites?.length || 0} unitée(s) · {fmt(e.loyerTotal || 0)} F/mois</Text>
                       </View>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity style={styles.addFullBtn} onPress={() => setShowAddProperty(true)}>
                     <Text style={styles.addFullBtnText}>+ AJOUTER UNE ENTITÉ</Text>
                  </TouchableOpacity>
                </>
              ) : view === "entity" && selectedEntity ? (
                <View>
                  <TouchableOpacity onPress={() => setView("list")} style={styles.backBtn}><Text style={styles.backBtnText}>← Retour à la liste</Text></TouchableOpacity>
                  <View style={styles.entityHero}>
                     <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.heroNom}>{selectedEntity.name || selectedEntity.nom}</Text>
                        <Badge label={selectedEntity.type?.toUpperCase()} color={Theme.colors.navy} bg={Theme.colors.navyPale} />
                     </View>
                     <Text style={styles.heroAddr}>{selectedEntity.address || selectedEntity.commune}</Text>
                     <Text style={styles.heroSub}>ID: {selectedEntity.id}</Text>
                  </View>
                  
                  <SectionTitle label="Unités Locatives" />
                  {selectedEntity.unites?.map((u: any) => (
                    <TouchableOpacity key={u.id} style={styles.unitCard} onPress={() => handleUnitPress(u)}>
                       <View style={{ flex: 1 }}>
                          <Text style={styles.unitName}>{u.label || u.name}</Text>
                          <Text style={styles.unitSub}>{fmt(u.loyer || u.rentAmount)} F · {u.statut}</Text>
                       </View>
                       <Text style={{ color: Theme.colors.textLight }}>›</Text>
                    </TouchableOpacity>
                  ))}
                  
                  <TouchableOpacity style={[styles.addFullBtn, { backgroundColor: Theme.colors.red, marginTop: 40 }]} onPress={() => setShowRetrait(true)}>
                     <Text style={styles.addFullBtnText}>✕ RETIRER DU PORTEFEUILLE</Text>
                  </TouchableOpacity>
                </View>
              ) : view === "unit" && selectedUnit && (
                 <View>
                    <TouchableOpacity onPress={() => setView("entity")} style={styles.backBtn}><Text style={styles.backBtnText}>← Retour à l'entité</Text></TouchableOpacity>
                    <View style={styles.unitHero}>
                       <Text style={styles.unitHeroName}>{selectedUnit.label || selectedUnit.name}</Text>
                       <Badge label={selectedUnit.statut?.toUpperCase()} color={selectedUnit.statut === 'occupé' ? Theme.colors.green : Theme.colors.orange} bg={selectedUnit.statut === 'occupé' ? Theme.colors.greenPale : Theme.colors.orangePale} />
                    </View>
                    
                    <SectionTitle label="Information Location" />
                    <View style={styles.infoCard}>
                       <Row label="Loyer" value={fmt(selectedUnit.loyer) + " F"} color={Theme.colors.navy} />
                       <Row label="Locataire" value={selectedUnit.locataire || "—"} />
                       <Row label="Paiement" value={selectedUnit.paiement || "—"} color={selectedUnit.paiement === 'À jour' ? Theme.colors.green : Theme.colors.red} />
                       <Row label="Référence Bail" value={selectedUnit.leaseReference || "—"} />
                    </View>

                    {selectedUnit.statut === 'occupé' && (
                       <>
                          <SectionTitle label="Actions" />
                          <TouchableOpacity style={styles.actionRow} onPress={() => setShowMRL(true)}>
                             <Text style={{ fontSize: 20 }}>⚖️</Text>
                             <View style={{ flex: 1, marginLeft: 15 }}>
                                <Text style={styles.actionRowTitle}>Réviser le loyer (MRL-01)</Text>
                                <Text style={styles.actionRowSub}>Proposition officielle au locataire</Text>
                             </View>
                          </TouchableOpacity>
                       </>
                    )}
                 </View>
              )}
            </View>
          )}

          {tab === "quittances" && (
             <View>
                <SectionTitle label="Solde & Versements" />
                <LinearGradient colors={[Theme.colors.navy, '#334155']} style={styles.walletHero}>
                   <Text style={styles.walletHeroLabel}>DISPONIBLE SUR QAPRIL WALLET</Text>
                   <Text style={styles.walletHeroVal}>{fmt(PROPRIO.solde)} FCFA</Text>
                   <TouchableOpacity 
                      style={styles.virementBtn} 
                      disabled={mutationLoading || PROPRIO.solde <= 0}
                      onPress={async () => {
                        try {
                          await requestDisbursement(PROPRIO.solde);
                          Alert.alert("Succès", "Virement initié vers votre compte Mobile Money par défaut.");
                          refetchProprio();
                        } catch (e: any) { Alert.alert("Erreur", e.message); }
                      }}
                   >
                      <Text style={styles.virementBtnText}>{mutationLoading ? "EN COURS..." : "VIREMENT INSTANTANÉ"}</Text>
                   </TouchableOpacity>
                </LinearGradient>
                <Text style={styles.payoutHint}>Les fonds proviennent des règlements certifiés de vos locataires.</Text>
             </View>
          )}

          {tab === "profil" && (
            <View>
               <SectionTitle label="Paramètres du Compte" />
               <TouchableOpacity style={styles.settingCard} onPress={() => setShowWalletConfig(true)}>
                  <Text style={{ fontSize: 24 }}>📱</Text>
                  <View style={{ flex: 1, marginLeft: 15 }}>
                     <Text style={styles.settingTitle}>Coordonnées de versement</Text>
                     <Text style={styles.settingSub}>Mobile Money par défaut</Text>
                  </View>
               </TouchableOpacity>
               
               <SectionTitle label="Sessions" />
               {onBack && (
                  <TouchableOpacity style={styles.logoutBtn} onPress={onBack}>
                    <Text style={styles.logoutText}>🚪 Changer de Portail</Text>
                  </TouchableOpacity>
               )}
            </View>
          )}
        </View>

        <BottomSheet visible={showMRL} onClose={() => setShowMRL(false)} title="⚖️ PROPOSITION MRL-01">
            <Text style={styles.modalSub}>Note : Le locataire dispose de 5 jours pour accepter ou refuser cette proposition de révision.</Text>
            <Text style={styles.inputLabel}>Nouveau Loyer Proposé (FCFA)</Text>
            <TextInput style={styles.input} keyboardType="numeric" placeholder="Ex: 350000" onChangeText={t => setMrlData({...mrlData, rent: t})} />
            <Text style={styles.inputLabel}>Date d'effet (YYYY-MM-DD)</Text>
            <TextInput style={styles.input} placeholder="2026-05-01" onChangeText={t => setMrlData({...mrlData, date: t})} />
            <TouchableOpacity style={styles.submitBtn} onPress={submitMRL} disabled={leaseLoading}>
               <View style={[styles.gradientBtn, { backgroundColor: Theme.colors.gold }]}><Text style={styles.submitBtnText}>{leaseLoading ? "ENVOI..." : "TRANSMETTRE LA PROPOSITION"}</Text></View>
            </TouchableOpacity>
         </BottomSheet>

         <BottomSheet visible={showRetrait} onClose={() => setShowRetrait(false)} title="✕ CONFIRMATION DE RETRAIT">
            <View style={styles.warningBox}>
               <Text style={styles.warningText}>ATTENTION : Conformément aux exigences de la DGI Côte d'Ivoire, les données de ce bien seront archivées pendant 10 ans.</Text>
            </View>
            <Text style={styles.modalSub}>Les locataires et partenaires tiers seront notifiés par SMS et WhatsApp de la fin de gestion QAPRIL.</Text>
            <TouchableOpacity 
               style={[styles.submitBtn, { backgroundColor: Theme.colors.red }]} 
               disabled={mutationLoading}
               onPress={async () => {
                  try {
                    await removeEntity(selectedEntity.id);
                    setShowRetrait(false);
                    setView("list");
                    refetchPatrimoine();
                    Alert.alert("Bien Retiré", "Le bien a été retiré de votre portefeuille actif.");
                  } catch (e: any) { Alert.alert("Erreur", e.message); }
               }}
            >
               <View style={styles.gradientBtn}><Text style={styles.submitBtnText}>{mutationLoading ? "TRAITEMENT..." : "CONFIRMER L'ARCHIVAGE ET LE RETRAIT"}</Text></View>
            </TouchableOpacity>
         </BottomSheet>

         <BottomSheet visible={showWalletConfig} onClose={() => setShowWalletConfig(false)} title="📱 CONFIGURATION PAYOUT">
            <Text style={styles.modalSub}>Choisissez l'opérateur pour vos virements automatiques.</Text>
            <View style={styles.operatorRow}>
               {['WAVE', 'ORANGE', 'MTN'].map(op => (
                  <TouchableOpacity key={op} style={[styles.opBtn, walletData.operator === op && styles.opBtnActive]} onPress={() => setWalletData({...walletData, operator: op})}>
                     <Text style={[styles.opText, walletData.operator === op && { color: '#FFF' }]}>{op}</Text>
                  </TouchableOpacity>
               ))}
            </View>
            <Text style={styles.inputLabel}>Numéro Mobile Money (sans indicatif)</Text>
            <TextInput style={styles.input} placeholder="0700000000" keyboardType="numeric" onChangeText={t => setWalletData({...walletData, phone: t})} />
            <TouchableOpacity style={styles.submitBtn} onPress={handleWalletSave}>
               <View style={[styles.gradientBtn, { backgroundColor: Theme.colors.navy }]}><Text style={styles.submitBtnText}>METTRE À JOUR LE RÉSEAU</Text></View>
            </TouchableOpacity>
         </BottomSheet>

         <BottomSheet visible={showAddProperty} onClose={() => setShowAddProperty(false)} title="🏠 NOUVELLE ENTITÉ">
            <Text style={styles.inputLabel}>Nom ou Libellé du Bien</Text>
            <TextInput style={styles.input} placeholder="Ex: Résidence Harmony" />
            <Text style={styles.inputLabel}>Type de Bien</Text>
            <View style={styles.operatorRow}>
               {['immeuble', 'cour', 'standalone'].map(t => (
                  <TouchableOpacity key={t} style={styles.opBtn} onPress={() => {}}>
                     <Text style={styles.opText}>{t.toUpperCase()}</Text>
                  </TouchableOpacity>
               ))}
            </View>
            <TouchableOpacity 
               style={styles.submitBtn}
               onPress={async () => {
                  try {
                    await addEntity({ name: 'Nouveau Bien', type: 'immeuble' });
                    setShowAddProperty(false);
                    refetchPatrimoine();
                  } catch (e: any) { Alert.alert("Erreur", e.message); }
               }}
            >
               <View style={[styles.gradientBtn, { backgroundColor: Theme.colors.teal }]}><Text style={styles.submitBtnText}>ENREGISTRER AU PATRIMOINE</Text></View>
            </TouchableOpacity>
         </BottomSheet>

      </ScrollView>

      <BottomNav
        tabs={[
          { id: "dash", icon: "📊", label: "Dashboard" },
          { id: "patrimoine", icon: "🏢", label: "Patrimoine" },
          { id: "quittances", icon: "💰", label: "Wallet" },
          { id: "profil", icon: "👤", label: "Compte" },
        ]}
        activeTab={tab}
        onChange={changeTab}
        accentColor={Theme.colors.navy}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingBottom: 100 },
  body: { padding: 20 },
  wealthStripWrap: { flexDirection: 'row', marginTop: -25, marginHorizontal: 20, backgroundColor: '#FFF', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  wealthBox: { flex: 1, alignItems: 'center' },
  wealthVal: { fontSize: 20, fontWeight: '900', color: Theme.colors.navy },
  wealthLabel: { fontSize: 8, fontWeight: '800', color: Theme.colors.textLight, marginTop: 4, letterSpacing: 1 },
  performanceCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 15, borderWidth: 1, borderColor: '#EDF2F7', marginBottom: 15 },
  perfHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  perfTitle: { fontSize: 12, fontWeight: '800', color: Theme.colors.navy },
  dualKpi: { flexDirection: 'row', justifyContent: 'space-between' },
  kpiLabel: { fontSize: 9, color: Theme.colors.textLight, fontWeight: '800' },
  kpiVal: { fontSize: 16, fontWeight: '900', color: Theme.colors.navy, marginTop: 2 },
  actionGrid: { flexDirection: 'row', gap: 10 },
  actionBox: { flex: 1, backgroundColor: '#FFF', borderRadius: 15, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EDF2F7' },
  actionLabel: { fontSize: 9, fontWeight: '800', color: Theme.colors.navy, marginTop: 5 },
  entityCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#EDF2F7' },
  entityTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  entityName: { fontSize: 14, fontWeight: '800', color: Theme.colors.navy },
  entityAddr: { fontSize: 11, color: Theme.colors.textLight, marginTop: 4 },
  entityStats: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 8 },
  statLine: { fontSize: 10, fontWeight: '700', color: Theme.colors.textMid },
  addFullBtn: { backgroundColor: Theme.colors.navy, borderRadius: 15, paddingVertical: 18, alignItems: 'center', marginTop: 10 },
  addFullBtnText: { color: '#FFF', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  entityHero: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#EDF2F7' },
  heroNom: { fontSize: 20, fontWeight: '900', color: Theme.colors.navy },
  heroAddr: { fontSize: 12, color: Theme.colors.textLight, marginTop: 4 },
  heroSub: { fontSize: 10, color: Theme.colors.textLight, marginTop: 8 },
  unitCard: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginBottom: 8, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  unitName: { fontSize: 13, fontWeight: '800', color: Theme.colors.navy },
  unitSub: { fontSize: 11, color: Theme.colors.textLight, marginTop: 2 },
  unitHero: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginBottom: 20 },
  unitHeroName: { fontSize: 18, fontWeight: '900', color: Theme.colors.navy },
  infoCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 15 },
  actionRow: { flexDirection: 'row', backgroundColor: '#FFF', padding: 20, borderRadius: 20, alignItems: 'center', marginBottom: 15 },
  actionRowTitle: { fontSize: 14, fontWeight: '800', color: Theme.colors.navy },
  actionRowSub: { fontSize: 11, color: Theme.colors.textLight, marginTop: 2 },
  walletHero: { borderRadius: 25, padding: 25, alignItems: 'center', marginBottom: 20 },
  walletHeroLabel: { fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.6)', letterSpacing: 1 },
  walletHeroVal: { fontSize: 32, fontWeight: '900', color: '#FFF', marginVertical: 10 },
  payoutHint: { fontSize: 10, color: Theme.colors.textLight, textAlign: 'center', paddingHorizontal: 40 },
  virementBtn: { backgroundColor: Theme.colors.green, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 15 },
  virementBtnText: { color: '#FFF', fontSize: 11, fontWeight: '900' },
  settingCard: { flexDirection: 'row', backgroundColor: '#FFF', padding: 20, borderRadius: 20, alignItems: 'center', marginBottom: 15 },
  settingTitle: { fontSize: 14, fontWeight: '800', color: Theme.colors.navy },
  settingSub: { fontSize: 11, color: Theme.colors.textLight, marginTop: 2 },
  logoutBtn: { backgroundColor: '#F1F5F9', borderRadius: 15, paddingVertical: 15, alignItems: 'center', marginTop: 20 },
  logoutText: { color: Theme.colors.navy, fontWeight: '800', fontSize: 13 },
  inputLabel: { fontSize: 10, fontWeight: '800', color: Theme.colors.textLight, marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 15, fontSize: 14, color: Theme.colors.navy, borderWidth: 1, borderColor: '#EDF2F7', fontWeight: '700' },
  submitBtn: { borderRadius: 15, marginTop: 20, overflow: 'hidden' },
  gradientBtn: { paddingVertical: 15, alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontSize: 12, fontWeight: '900' },
  modalSub: { fontSize: 12, color: Theme.colors.textLight, marginBottom: 20, lineHeight: 18 },
  operatorRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  opBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#F1F5F9', alignItems: 'center' },
  opBtnActive: { backgroundColor: Theme.colors.navy },
  opText: { fontSize: 10, fontWeight: '900', color: Theme.colors.textLight },
  backBtn: { marginBottom: 15 },
  backBtnText: { fontSize: 12, color: Theme.colors.navy, fontWeight: '800' },
  warningBox: { backgroundColor: Theme.colors.redPale, padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: Theme.colors.red + '20' },
  warningText: { color: Theme.colors.red, fontSize: 11, fontWeight: '800', lineHeight: 16 },
});
