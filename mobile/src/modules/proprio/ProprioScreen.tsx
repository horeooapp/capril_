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
import { Home, Settings, Wallet, PenSquare, Scale, Handshake, ScrollText, BriefcaseBusiness, ShieldAlert, Smartphone } from 'lucide-react-native';
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
  const [newEntity, setNewEntity] = useState({ name: '', type: 'RESIDENTIAL', commune: '' });

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
                    <Home size={28} color={Theme.colors.navy} strokeWidth={2} />
                    <Text style={styles.actionLabel}>Patrimoine</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={styles.actionBox} onPress={() => setTab("profil")}>
                    <Settings size={28} color={Theme.colors.teal} strokeWidth={2} />
                    <Text style={styles.actionLabel}>Profil</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={styles.actionBox} onPress={() => setTab("quittances")}>
                    <Wallet size={28} color={Theme.colors.orange} strokeWidth={2} />
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
                    <TouchableOpacity style={[styles.actionRow, {marginTop: 15, marginBottom: 5}]} onPress={() => Alert.alert("Génération de Bail Numérique", "La signature du bail standard sera facturée 3 000 FCFA (10 000 FCFA pour Cour Entière) directement sur votre Wallet. Continuer ?")}>
                       <PenSquare size={24} color={Theme.colors.orange} />
                       <View style={{ flex: 1, marginLeft: 15 }}>
                          <Text style={styles.actionRowTitle}>Générer Sousing/Bail Numérique</Text>
                          <Text style={styles.actionRowSub}>Facturation Wallet automatique</Text>
                       </View>
                    </TouchableOpacity>

                    {selectedUnit.statut === 'occupé' && (
                       <>
                          <SectionTitle label="Actions" />
                          <TouchableOpacity style={styles.actionRow} onPress={() => setShowMRL(true)}>
                             <Scale size={24} color={Theme.colors.navy} />
                             <View style={{ flex: 1, marginLeft: 15 }}>
                                <Text style={styles.actionRowTitle}>Réviser le loyer (MRL-01)</Text>
                                <Text style={styles.actionRowSub}>Proposition officielle au locataire</Text>
                             </View>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.actionRow} onPress={() => Alert.alert("Clémence M07", "Souhaitez-vous accorder un délai ou un échéancier à ce locataire ?")}>
                             <Handshake size={24} color={Theme.colors.green} />
                             <View style={{ flex: 1, marginLeft: 15 }}>
                                <Text style={styles.actionRowTitle}>Clémence Exceptionnelle (M07)</Text>
                                <Text style={styles.actionRowSub}>Délai 7-30j / Échéancier amiable</Text>
                             </View>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.actionRow} onPress={() => Alert.alert("Émission", "L'émission de cette quittance SHA-256 débitera automatiquement 90 FCFA de votre Wallet QAPRIL. Continuer ?")}>
                             <ScrollText size={24} color={Theme.colors.teal} />
                             <View style={{ flex: 1, marginLeft: 15 }}>
                                <Text style={styles.actionRowTitle}>Émettre Quittance SHA-256</Text>
                                <Text style={styles.actionRowSub}>Coût: 90 FCFA (Prélèvement automatique)</Text>
                             </View>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.actionRow} onPress={() => Alert.alert("Délégation", "Générez un mandat partiel pour confier l'encaissement ou les relances à un gestionnaire.")}>
                             <BriefcaseBusiness size={24} color={Theme.colors.purple} />
                             <View style={{ flex: 1, marginLeft: 15 }}>
                                <Text style={styles.actionRowTitle}>Mandater un Gestionnaire</Text>
                                <Text style={styles.actionRowSub}>Délégation (AGENCE NON AGRÉÉE / ACT-05)</Text>
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
               <SectionTitle label="Score SLA & Confidentialité" />
               <View style={[styles.infoCard, {backgroundColor: '#FFF5F5', borderColor: '#FED7D7', marginBottom: 15}]}>
                  <Text style={{fontSize: 12, fontWeight: '800', color: Theme.colors.red, marginBottom: 5}}>⚠️ Score QAPRIL Avertissement</Text>
                  <Text style={{fontSize: 10, color: Theme.colors.textLight}}>Vous risquez une pénalité de <Text style={{fontWeight:'800', color:Theme.colors.red}}>-2 pts</Text> si vous laissez un ticket de réclamation locataire (RCL) expirer le <Text style={{fontWeight:'800'}}>délai SLA de 144 heures !</Text></Text>
               </View>

               <TouchableOpacity style={[styles.settingCard, { backgroundColor: Theme.colors.navy, borderColor: Theme.colors.navy }]} onPress={() => Alert.alert("Mode Confidentiel", "Activer ou désactiver l'anonymisation BAI-NNN ?", [
                   { text: "Annuler", style: "cancel" },
                   { text: "Confirmer Activation", onPress: async () => {
                       try {
                           const { apiFetch } = require('../../hooks/qapril-hooks');
                           const res = await apiFetch('/proprietaires/me/confidentiel', { method: 'PATCH', body: { isConfidential: true } });
                           Alert.alert("Sécurité", res.message);
                       } catch(e: any) { Alert.alert("Erreur", e.message); }
                   }}
               ])}>
                  <ShieldAlert size={26} color="#FFF" />
                  <View style={{ flex: 1, marginLeft: 15 }}>
                     <Text style={[styles.settingTitle, { color: '#FFF' }]}>Mode Confidentiel (BAI-NNN)</Text>
                     <Text style={[styles.settingSub, { color: 'rgba(255,255,255,0.7)' }]}>Masque identité bailleur (Cliquez pour activer)</Text>
                  </View>
               </TouchableOpacity>

               <SectionTitle label="Paramètres Financiers" />
               <TouchableOpacity style={styles.settingCard} onPress={() => setShowWalletConfig(true)}>
                  <Smartphone size={26} color={Theme.colors.navy} />
                  <View style={{ flex: 1, marginLeft: 15 }}>
                     <Text style={styles.settingTitle}>Coordonnées de versement</Text>
                     <Text style={styles.settingSub}>Mobile Money par défaut</Text>
                  </View>
               </TouchableOpacity>
               
               <SectionTitle label="Mes Informations Personnelles" />
                 <View style={styles.kycForm}>
                    <Text style={styles.inputLabel}>Nom & Prénom exacts</Text>
                    <View style={styles.inputVal}><Text style={styles.inputText}>{PROPRIO.fullName || "Bailleur"}</Text></View>
                    <Text style={styles.inputLabel}>Numéro de Téléphone principal</Text>
                    <View style={styles.inputVal}><Text style={styles.inputText}>+225 07 XX XX XX XX</Text></View>
                    <Text style={styles.inputLabel}>Numéro Pièce d'Identité (CNI/Passeport)</Text>
                    <View style={styles.inputVal}><Text style={styles.inputText}>CIXXXXXXXXXXX</Text></View>
                    
                    <TouchableOpacity style={[styles.submitBtn, { backgroundColor: Theme.colors.orange, marginTop: 25, marginBottom: 20 }]} onPress={() => Alert.alert("Sécurité", "La modification de votre identité nécessite une nouvelle validation KYC. Continuer ?")}>
                       <View style={styles.gradientBtn}><Text style={styles.submitBtnText}>METTRE À JOUR MES DONNÉES</Text></View>
                    </TouchableOpacity>
                 </View>

                 <SectionTitle label="Sessions" />
                 {onBack && (
                    <TouchableOpacity style={styles.logoutBtn} onPress={onBack}>
                      <Text style={styles.logoutText}>🚪 Changer de Portail</Text>
                    </TouchableOpacity>
                 )}
            </View>
          )}
        </View>

        <BottomSheet visible={showMRL} onClose={() => setShowMRL(false)} title="PROPOSITION MRL-01">
            <Text style={styles.modalSub}>Note : Le locataire dispose de 5 jours pour accepter ou refuser cette proposition de révision.</Text>
            <Text style={styles.inputLabel}>Nouveau Loyer Proposé (FCFA)</Text>
            <TextInput style={styles.input} keyboardType="numeric" placeholder="Ex: 350000" onChangeText={t => setMrlData({...mrlData, rent: t})} />
            <Text style={styles.inputLabel}>Date d'effet (YYYY-MM-DD)</Text>
            <TextInput style={styles.input} placeholder="2026-05-01" onChangeText={t => setMrlData({...mrlData, date: t})} />
            <TouchableOpacity style={styles.submitBtn} onPress={submitMRL} disabled={leaseLoading}>
               <View style={[styles.gradientBtn, { backgroundColor: Theme.colors.gold }]}><Text style={styles.submitBtnText}>{leaseLoading ? "ENVOI..." : "TRANSMETTRE LA PROPOSITION"}</Text></View>
            </TouchableOpacity>
         </BottomSheet>

         <BottomSheet visible={showRetrait} onClose={() => setShowRetrait(false)} title="CONFIRMATION DE RETRAIT">
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

         <BottomSheet visible={showWalletConfig} onClose={() => setShowWalletConfig(false)} title="CONFIGURATION PAYOUT">
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

         <BottomSheet visible={showAddProperty} onClose={() => setShowAddProperty(false)} title="NOUVELLE ENTITÉ">
            <Text style={styles.inputLabel}>Nom ou Libellé du Bien</Text>
            <TextInput style={styles.input} placeholder="Ex: Résidence Harmony" value={newEntity.name} onChangeText={t => setNewEntity({...newEntity, name: t})} />
            
            <Text style={styles.inputLabel}>Type d'Exploitation</Text>
            <View style={styles.operatorRow}>
               {['RESIDENTIAL', 'COMMERCIAL'].map(t => (
                  <TouchableOpacity key={t} style={[styles.opBtn, newEntity.type === t && {borderColor: Theme.colors.teal, backgroundColor: Theme.colors.tealPale}]} onPress={() => setNewEntity({...newEntity, type: t})}>
                     <Text style={[styles.opText, newEntity.type === t && {color: Theme.colors.teal}]}>{t}</Text>
                  </TouchableOpacity>
               ))}
            </View>

            <Text style={styles.inputLabel}>Commune (Sélection)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 15, paddingBottom: 5}}>
                {['Abobo', 'Cocody', 'Plateau', 'Yopougon', 'Marcory', 'Treichville', 'Koumassi', 'Adjamé', 'Bingerville', 'Anyama', 'Port-Bouët', 'Autre'].map(c => (
                    <TouchableOpacity key={c} style={[styles.opBtn, {marginRight: 6}, newEntity.commune === c && {borderColor: Theme.colors.teal, backgroundColor: Theme.colors.tealPale}]} onPress={() => setNewEntity({...newEntity, commune: c})}>
                       <Text style={[styles.opText, newEntity.commune === c && {color: Theme.colors.teal}]}>{c}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <TouchableOpacity 
               style={[styles.submitBtn, (!newEntity.name || !newEntity.commune) && {opacity: 0.5}]}
               disabled={!newEntity.name || !newEntity.commune || mutationLoading}
               onPress={async () => {
                  try {
                    await addEntity({ 
                        name: newEntity.name, 
                        leaseType: newEntity.type.toLowerCase(), 
                        propertyType: newEntity.type === 'COMMERCIAL' ? 'COMMERCE' : 'APARTMENT',
                        commune: newEntity.commune,
                        address: `${newEntity.name}, ${newEntity.commune}`,
                        declaredRentFcfa: 0
                    });
                    setShowAddProperty(false);
                    setNewEntity({ name: '', type: 'RESIDENTIAL', commune: '' });
                    refetchPatrimoine();
                  } catch (e: any) { Alert.alert("Erreur", e.message); }
               }}
            >
               <View style={[styles.gradientBtn, { backgroundColor: Theme.colors.teal }]}><Text style={styles.submitBtnText}>{mutationLoading ? "ENREGISTREMENT..." : "ENREGISTRER AU PATRIMOINE"}</Text></View>
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
  actionBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 20, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: '#EDF2F7', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 3 },
  actionLabel: { fontSize: 10, fontWeight: '800', color: Theme.colors.navy, marginTop: 8 },
  entityCard: { backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 20, padding: 18, marginBottom: 15, borderWidth: 1, borderColor: '#EDF2F7', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  entityTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  entityName: { fontSize: 15, fontWeight: '900', color: Theme.colors.navy },
  entityAddr: { fontSize: 11, color: Theme.colors.textLight, marginTop: 4 },
  entityStats: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10 },
  statLine: { fontSize: 11, fontWeight: '800', color: Theme.colors.textMid },
  addFullBtn: { backgroundColor: Theme.colors.navy, borderRadius: 18, paddingVertical: 18, alignItems: 'center', marginTop: 15, shadowColor: Theme.colors.navy, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
  addFullBtnText: { color: '#FFF', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  entityHero: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, padding: 22, marginBottom: 20, borderWidth: 1, borderColor: '#EDF2F7', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, elevation: 4 },
  heroNom: { fontSize: 22, fontWeight: '900', color: Theme.colors.navy },
  heroAddr: { fontSize: 12, color: Theme.colors.textLight, marginTop: 6 },
  heroSub: { fontSize: 10, color: Theme.colors.textLight, marginTop: 10 },
  unitCard: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.85)', padding: 16, borderRadius: 18, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: '#EDF2F7', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  unitName: { fontSize: 14, fontWeight: '900', color: Theme.colors.navy },
  unitSub: { fontSize: 11, color: Theme.colors.textLight, marginTop: 4 },
  unitHero: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 22, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: '#EDF2F7', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  unitHeroName: { fontSize: 20, fontWeight: '900', color: Theme.colors.navy },
  infoCard: { backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 20, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#EDF2F7', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8 },
  actionRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.9)', padding: 18, borderRadius: 18, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#EDF2F7', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  actionRowTitle: { fontSize: 13, fontWeight: '900', color: Theme.colors.navy },
  actionRowSub: { fontSize: 11, color: Theme.colors.textLight, marginTop: 4 },
  walletHero: { borderRadius: 25, padding: 30, alignItems: 'center', marginBottom: 20, shadowColor: Theme.colors.navy, shadowOpacity: 0.3, shadowRadius: 15, elevation: 6 },
  walletHeroLabel: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5 },
  walletHeroVal: { fontSize: 36, fontWeight: '900', color: '#FFF', marginVertical: 15 },
  payoutHint: { fontSize: 11, color: Theme.colors.textMid, textAlign: 'center', paddingHorizontal: 30, lineHeight: 18 },
  virementBtn: { backgroundColor: Theme.colors.green, paddingHorizontal: 25, paddingVertical: 14, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
  virementBtnText: { color: '#FFF', fontSize: 12, fontWeight: '900', letterSpacing: 0.5 },
  settingCard: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.85)', padding: 18, borderRadius: 18, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#EDF2F7', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
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
  kycForm: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 15 },
  inputVal: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#EDF2F7', flexDirection: 'row', alignItems: 'center' },
  inputText: { fontSize: 13, color: Theme.colors.navy, fontWeight: '700', flex: 1 },
});
