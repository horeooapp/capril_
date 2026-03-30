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
  UIManager,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../theme/theme';
import { Badge } from '../../components/common/Badge';
import { Row } from '../../components/common/Row';
import { SectionTitle } from '../../components/common/SectionTitle';
import { WalletCard } from '../../components/common/WalletCard';
import { BrandHeader } from '../../components/common/BrandHeader';
import { BottomNav } from '../../components/common/BottomNav';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

import { 
  useProprio, 
  usePatrimoine, 
  useProprioMutations,
  useLeaseActions,
  setAuthToken, 
  useAuth 
} from '../../hooks/qapril-hooks';
import { BottomSheet } from '../../components/common/BottomSheet';
import { TextInput, Alert } from 'react-native';

const { width } = Dimensions.get('window');

const QUICK_ACTIONS = [
  { icon: '✍️', label: 'Nouveau bail', color: Theme.colors.navy, bg: Theme.colors.navyPale },
  { icon: '🧾', label: 'Émettre quittance', color: Theme.colors.teal, bg: Theme.colors.tealPale },
  { icon: '📤', label: 'Export historique', color: Theme.colors.green, bg: Theme.colors.greenPale },
  { icon: '⚖️', label: 'Droits & litiges', color: Theme.colors.purple, bg: Theme.colors.purplePale },
];

export default function ProprioScreen({ onBack }: { onBack?: () => void }) {
  const [tab, setTab] = useState("dash");
  const [view, setView] = useState("list"); // list, entity, unit
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  
  // Modals
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [showCreateLease, setShowCreateLease] = useState(false);
  const [showMRL, setShowMRL] = useState(false);
  const [showRetrait, setShowRetrait] = useState(false);

  // Form states
  const [formData, setFormData] = useState<any>({});

  const { data: proprio, loading: loadProprio, refetch: refetchProprio } = useProprio();
  const { data: patrimoine, loading: loadPatrimoine, refetch: refetchPatrimoine } = usePatrimoine();
  const { addEntity, removeEntity, addUnit, loading: mutationLoading } = useProprioMutations();
  const { createLease, requestMRL, loading: leaseLoading } = useLeaseActions();
  const { verifyOTP } = useAuth();

  const fmt = (n: number) => n?.toLocaleString("fr-FR") || "0";

  const changeTab = (t: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTab(t);
    setView("list");
  };

  const PROPRIO_DATA = proprio || { nom: 'Bailleur', formulaire: '...', biens: 0, wallet: { solde: 0 } };
  const PATRIMOINE_DATA = patrimoine || [];

  const handleAddProperty = async () => {
    try {
      await addEntity(formData);
      setShowAddProperty(false);
      setFormData({});
      refetchPatrimoine();
      Alert.alert("Succès", "Le bien a été ajouté à votre portefeuille.");
    } catch (e: any) {
       Alert.alert("Erreur", e.message);
    }
  };

  const handleRetrait = async () => {
    try {
      await removeEntity(selectedEntity.id);
      setShowRetrait(false);
      setView("list");
      refetchPatrimoine();
      Alert.alert("Retrait effectué", "Les locataires et l'agence ont été notifiés.");
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    }
  };

  // If loading, show spinner
  if (loadProprio || loadPatrimoine || mutationLoading || leaseLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Theme.colors.navy} />
        {(mutationLoading || leaseLoading) && <Text style={{ marginTop: 10, color: Theme.colors.navy, fontWeight: 'bold' }}>Synchronisation QAPRIL...</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView bounces={false} contentContainerStyle={styles.scrollContent}>
        
        <BrandHeader 
          title={PROPRIO_DATA.nom}
          subtitle="Compte Certifié Bailleur"
          roleLabel="PROPRIÉTAIRE"
          roleColor={Theme.colors.navy}
          onNotifPress={() => alert("Notifications Bailleur")}
        />

        <View style={{ marginTop: -25, zIndex: 10 }}>
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
                  <TouchableOpacity onPress={() => { setView("list"); setTab("patrimoine"); setShowAddProperty(true); }} style={[styles.quickBox, { backgroundColor: Theme.colors.navyPale }]}>
                    <Text style={styles.quickIcon}>🏠</Text>
                    <Text style={[styles.quickLabel, { color: Theme.colors.navy }]}>Nouveau bien</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setTab("quittances"); }} style={[styles.quickBox, { backgroundColor: Theme.colors.tealPale }]}>
                    <Text style={styles.quickIcon}>🧾</Text>
                    <Text style={[styles.quickLabel, { color: Theme.colors.teal }]}>Finances</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setTab("profil"); }} style={[styles.quickBox, { backgroundColor: Theme.colors.greenPale }]}>
                    <Text style={styles.quickIcon}>👤</Text>
                    <Text style={[styles.quickLabel, { color: Theme.colors.green }]}>Mon compte</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setTab("patrimoine"); }} style={[styles.quickBox, { backgroundColor: Theme.colors.purplePale }]}>
                    <Text style={styles.quickIcon}>⚖️</Text>
                    <Text style={[styles.quickLabel, { color: Theme.colors.purple }]}>Gestion</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          {/* ══ PATRIMOINE ══ */}
          {tab === "patrimoine" && view === "list" && (
            <View style={styles.section}>
              <View style={styles.patrimoineHeader}>
                 <Text style={styles.patrimoineTitle}>Mon patrimoine</Text>
                 <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddProperty(true)}>
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
                  <TouchableOpacity 
                    key={e.id} 
                    style={styles.entiteCard}
                    onPress={() => { setSelectedEntity(e); setView("entity"); }}
                  >
                    <View style={styles.entiteCardHeader}>
                      <View>
                        <Text style={styles.entiteCardNom}>{e.nom}</Text>
                        <Text style={styles.entiteCardSub}>{e.adresse}</Text>
                      </View>
                      <Badge label={e.type.toUpperCase()} color={Theme.colors.navy} bg={Theme.colors.navyPale} />
                    </View>
                    <View style={styles.entiteStats}>
                      <View style={styles.statPill}>
                         <Text style={styles.statVal}>{e.unites || 0}</Text>
                         <Text style={styles.statLabel}>UNITÉS</Text>
                      </View>
                      <View style={styles.statPill}>
                         <Text style={[styles.statVal, { color: Theme.colors.green }]}>{e.occupes || 0}</Text>
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

          {/* ══ FICHE ENTITÉ ══ */}
          {tab === "patrimoine" && view === "entity" && selectedEntity && (
            <View style={styles.section}>
              <View style={styles.backHeader}>
                <TouchableOpacity onPress={() => setView("list")} style={styles.backBtnSmall}>
                  <Text style={styles.backBtnTextSmall}>← Retour</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowRetrait(true)}>
                  <Text style={{ color: Theme.colors.red, fontSize: 12, fontWeight: '700' }}>Retirer x</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.heroSummary}>
                 <Text style={{ fontSize: 32, marginBottom: 10 }}>{selectedEntity.type === 'immeuble' ? '🏢' : '🏡'}</Text>
                 <Text style={styles.heroName}>{selectedEntity.nom}</Text>
                 <Text style={styles.heroSub}>{selectedEntity.adresse} · Abidjan</Text>
                 <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                    <Badge label={selectedEntity.code} color={Theme.colors.textLight} bg={Theme.colors.grey1} />
                    {selectedEntity.agence && <Badge label="Gestion Mandatée" color={Theme.colors.teal} bg={Theme.colors.tealPale} />}
                 </View>
              </View>

              <SectionTitle 
                label="Unités" 
                right={<TouchableOpacity onPress={() => setShowAddUnit(true)}><Text style={styles.sectionLink}>+ Ajouter</Text></TouchableOpacity>}
              />
              
              {!selectedEntity.unites_list || selectedEntity.unites_list.length === 0 ? (
                <View style={styles.emptyUnit}>
                  <Text style={styles.emptyUnitText}>Aucune unité (appart/porte) pour ce bien.</Text>
                </View>
              ) : (
                selectedEntity.unites_list.map((u: any) => (
                  <TouchableOpacity 
                    key={u.id} 
                    style={styles.uniteRow}
                    onPress={() => { setSelectedUnit(u); setView("unit"); }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.uniteLabel}>{u.label}</Text>
                      <Text style={styles.uniteSubInfo}>{u.type} · {fmt(u.loyer)} F</Text>
                    </View>
                    <Badge 
                      label={u.statut === 'occupé' ? 'OCCUPÉ' : 'VACANT'} 
                      color={u.statut === 'occupé' ? Theme.colors.green : Theme.colors.orange} 
                      bg={u.statut === 'occupé' ? Theme.colors.greenPale : Theme.colors.orangePale} 
                    />
                    <Text style={styles.chevron}>›</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {/* ══ FICHE UNITÉ ══ */}
          {tab === "patrimoine" && view === "unit" && selectedUnit && (
             <View style={styles.section}>
                <TouchableOpacity onPress={() => setView("entity")} style={styles.backBtnSmall}>
                  <Text style={styles.backBtnTextSmall}>← {selectedEntity.nom}</Text>
                </TouchableOpacity>

                <View style={styles.unitHero}>
                   <Text style={styles.unitHeroTitle}>{selectedUnit.label}</Text>
                   <Text style={styles.unitHeroPrice}>{fmt(selectedUnit.loyer)} FCFA / MOIS</Text>
                </View>

                {selectedUnit.statut === 'occupé' ? (
                  <>
                    <SectionTitle label="Locataire" />
                    <View style={styles.tenantCard}>
                      <View style={styles.avatarMini}><Text>👤</Text></View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.tenantName}>{selectedUnit.locataire?.nom || 'Locataire'}</Text>
                        <Text style={styles.tenantTel}>{selectedUnit.locataire?.tel}</Text>
                      </View>
                      <TouchableOpacity style={styles.relanceBtn}>
                         <Text style={styles.relanceBtnText}>Relancer</Text>
                      </TouchableOpacity>
                    </View>

                    <SectionTitle label="Contrat & Bail" />
                    <WalletCard 
                      icon="📜" 
                      label={selectedUnit.bail?.ref || "BAIL-CI-2026-X"} 
                      sub={`Fin le ${selectedUnit.bail?.fin || '—'}`} 
                      color={Theme.colors.navy} 
                      bg={Theme.colors.navyPale} 
                    />

                    <SectionTitle label="Actions" />
                    <View style={styles.actionGrid}>
                       <TouchableOpacity style={styles.actionBox} onPress={() => setShowMRL(true)}>
                          <Text style={{ fontSize: 20 }}>✏️</Text>
                          <Text style={styles.actionLabel}>Changer loyer</Text>
                       </TouchableOpacity>
                       <TouchableOpacity style={styles.actionBox} onPress={() => alert("Émission de quittance...")}>
                          <Text style={{ fontSize: 20 }}>🧾</Text>
                          <Text style={styles.actionLabel}>Quittance</Text>
                       </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={{ fontSize: 40, marginBottom: 15 }}>📭</Text>
                    <Text style={styles.emptyTitle}>Bien vacant</Text>
                    <TouchableOpacity style={[styles.addBtn, { marginTop: 15 }]} onPress={() => setShowCreateLease(true)}>
                       <Text style={styles.addBtnText}>+ Enregistrer un bail</Text>
                    </TouchableOpacity>
                  </View>
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

      {/* ══ MODALS / BOTTOM SHEETS ══ */}
      
      {/* Ajouter un bien */}
      <BottomSheet visible={showAddProperty} onClose={() => setShowAddProperty(false)} title="🏘 Ajouter un bien">
        <Text style={styles.inputLabel}>Type de bien</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
           {['immeuble', 'cour', 'standalone'].map(t => (
             <TouchableOpacity 
               key={t} 
               style={[styles.typePill, formData.type === t && styles.typePillActive]}
               onPress={() => setFormData({...formData, type: t})}
             >
               <Text style={[styles.typePillText, formData.type === t && styles.typePillTextActive]}>{t.toUpperCase()}</Text>
             </TouchableOpacity>
           ))}
        </View>
        <Text style={styles.inputLabel}>Nom de l'entité</Text>
        <TextInput style={styles.input} onChangeText={t => setFormData({...formData, nom: t})} placeholder="ex: Résidence Palmier" />
        <Text style={styles.inputLabel}>Commune</Text>
        <TextInput style={styles.input} onChangeText={t => setFormData({...formData, commune: t})} placeholder="ex: Cocody" />
        <TouchableOpacity style={styles.submitBtn} onPress={handleAddProperty}>
           <Text style={styles.submitBtnText}>Enregistrer le bien</Text>
        </TouchableOpacity>
      </BottomSheet>

      {/* Retrait Portefeuille */}
      <BottomSheet visible={showRetrait} onClose={() => setShowRetrait(false)} title="x Retirer du portefeuille" titleColor={Theme.colors.red}>
         <View style={{ backgroundColor: Theme.colors.redPale, padding: 15, borderRadius: 12, marginBottom: 20 }}>
            <Text style={{ color: Theme.colors.red, fontWeight: 'bold', marginBottom: 5 }}>Attention — Action Irréversible</Text>
            <Text style={{ fontSize: 11, color: Theme.colors.red, opacity: 0.8 }}>
               Le retrait signifie que vous ne gérez plus ce bien via QAPRIL. Vos locataires seront notifiés immédiatement par SMS et WhatsApp.
            </Text>
         </View>
         <TouchableOpacity style={[styles.submitBtn, { backgroundColor: Theme.colors.red }]} onPress={handleRetrait}>
           <Text style={styles.submitBtnText}>Confirmer le retrait et notifier</Text>
        </TouchableOpacity>
      </BottomSheet>

      {/* MRL-01 (Changement loyer) */}
      <BottomSheet visible={showMRL} onClose={() => setShowMRL(false)} title="✏️ Modifier le loyer">
         <View style={{ backgroundColor: Theme.colors.goldPale, padding: 15, borderRadius: 12, marginBottom: 20 }}>
            <Text style={{ color: Theme.colors.orange, fontWeight: 'bold', marginBottom: 5 }}>Règle QAPRIL MRL-01</Text>
            <Text style={{ fontSize: 11, color: Theme.colors.orange, opacity: 0.8 }}>
               Le locataire a 5 jours pour accepter. Sans réponse, la modification est suspendue.
            </Text>
         </View>
         <Text style={styles.inputLabel}>Nouveau loyer mensuel (FCFA)</Text>
         <TextInput style={styles.input} keyboardType="numeric" placeholder="ex: 350000" />
         <TouchableOpacity style={[styles.submitBtn, { backgroundColor: Theme.colors.navy }]} onPress={() => { setShowMRL(false); Alert.alert("Demande envoyée", "Le locataire a été notifié."); }}>
           <Text style={styles.submitBtnText}>Envoyer la demande →</Text>
        </TouchableOpacity>
      </BottomSheet>

      {/* BOTTOM NAV BAR */}
      <BottomNav 
        tabs={[
          { id: "dash", icon: "📊", label: "Dashboard" },
          { id: "patrimoine", icon: "🏘", label: "Patrimoine" },
          { id: "quittances", icon: "🧾", label: "Quittances" },
          { id: "profil", icon: "👤", label: "Profil" },
        ]}
        activeTab={tab}
        onChange={changeTab}
        accentColor={Theme.colors.navy}
      />
    </View>
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
  kpiStrip: {
    paddingHorizontal: 16,
  },
  kpiContainer: {
    gap: 12,
    paddingRight: 20,
  },
  kpiCard: {
    backgroundColor: Theme.colors.navy,
    borderRadius: 18,
    padding: 14,
    width: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
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
  alertCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
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
  entiteCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
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
  entiteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
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
  backHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  backBtnSmall: {
    paddingVertical: 4,
  },
  backBtnTextSmall: {
    fontSize: 12,
    color: Theme.colors.textLight,
    fontWeight: '600',
  },
  heroSummary: {
    alignItems: 'center',
    marginBottom: 25,
    backgroundColor: Theme.colors.white,
    padding: 24,
    borderRadius: 24,
  },
  heroName: {
    fontSize: 18,
    fontWeight: '900',
    color: Theme.colors.text,
  },
  heroSub: {
    fontSize: 12,
    color: Theme.colors.textLight,
    marginTop: 4,
  },
  uniteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  uniteLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  uniteSubInfo: {
    fontSize: 11,
    color: Theme.colors.textLight,
    marginTop: 2,
  },
  unitHero: {
    backgroundColor: Theme.colors.navy,
    padding: 24,
    borderRadius: 24,
    marginBottom: 20,
    marginTop: 10,
  },
  unitHeroTitle: {
    color: Theme.colors.white,
    fontSize: 22,
    fontWeight: '900',
  },
  unitHeroPrice: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 8,
    letterSpacing: 1,
  },
  tenantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    padding: 16,
    borderRadius: 16,
  },
  avatarMini: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.grey1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tenantName: {
    fontSize: 14,
    fontWeight: '800',
  },
  tenantTel: {
    fontSize: 11,
    color: Theme.colors.textLight,
  },
  relanceBtn: {
    backgroundColor: Theme.colors.redPale,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  relanceBtnText: {
    color: Theme.colors.red,
    fontSize: 11,
    fontWeight: '800',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBox: {
    flex: 1,
    backgroundColor: Theme.colors.white,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
    color: Theme.colors.textMid,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: Theme.colors.textMid,
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: Theme.colors.grey1,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: Theme.colors.text,
  },
  typePill: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Theme.colors.grey2,
  },
  typePillActive: {
    backgroundColor: Theme.colors.navy,
    borderColor: Theme.colors.navy,
  },
  typePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: Theme.colors.textLight,
  },
  typePillTextActive: {
    color: Theme.colors.white,
  },
  submitBtn: {
    backgroundColor: Theme.colors.green,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 25,
  },
  submitBtnText: {
    color: Theme.colors.white,
    fontWeight: '900',
    fontSize: 14,
  },
  chevron: {
    fontSize: 18,
    color: Theme.colors.grey3,
    marginLeft: 10,
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
  emptyUnit: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: Theme.colors.grey1,
    borderRadius: 16,
  },
  emptyUnitText: {
     fontSize: 12,
     color: Theme.colors.textLight,
     fontStyle: 'italic',
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Theme.colors.navy },
  breakdownLabelBold: { fontSize: 11, fontWeight: '800', color: Theme.colors.navy },
  breakdownValBold: { fontSize: 12, fontWeight: '900', color: Theme.colors.green },
  walletCard: { backgroundColor: '#' + Math.floor(Math.random()*16777215).toString(16), borderRadius: 28, padding: 25, marginBottom: 20 },
  walletLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '800' },
  walletVal: { color: '#FFF', fontSize: 32, fontWeight: '900' },
  profileCard: { alignItems: 'center', backgroundColor: '#FFF', borderRadius: 24, padding: 24, marginBottom: 20 },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#F0F4FB', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  profileName: { fontSize: 18, fontWeight: '900' },
  profileTel: { fontSize: 12, color: '#6A7D9E', marginBottom: 12 },
  quittanceLine: { backgroundColor: '#FFF', borderRadius: 20, padding: 18, marginBottom: 14 },
  quittanceLineHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  quittanceLineRef: { fontSize: 13, fontWeight: '800' },
  quittanceLineLoc: { fontSize: 11, color: '#6A7D9E' },
  breakdown: { backgroundColor: '#F0F4FB', borderRadius: 10, padding: 12, marginTop: 12 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between' },
  breakdownLabel: { fontSize: 10, color: '#6A7D9E' },
  breakdownVal: { fontSize: 10, fontWeight: '700' },
  payoutBtn: { backgroundColor: '#FFF', borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginTop: 15 },
  payoutText: { color: '#0D2B6E', fontWeight: '900', fontSize: 12 },
  logoutBtn: { backgroundColor: '#F0F4FB', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 15 },
  logoutText: { color: '#0D2B6E', fontWeight: '800', fontSize: 13 },
});
