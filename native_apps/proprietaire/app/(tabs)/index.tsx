import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  Platform,
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
  Modal,
  TextInput,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchWithAuth, removeStoredToken, getStoredProfile, removeStoredProfile, clearAppSessionAndCache, logoutAndRedirect } from '../../lib/api';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { UpdateNotificationBanner } from '../../components/UpdateNotificationBanner';
import { VersionUpdateModal } from '../../components/VersionUpdateModal';
import { VoiceAssistantFAB } from '../../components/VoiceAssistantFAB';
import { confirmExitApp } from '../../components/TopNavHeader';
import {
  Building2,
  FileText,
  Wallet,
  Users,
  ShieldCheck,
  Camera,
  Eye,
  EyeOff,
  Upload,
  CheckCircle2,
  AlertCircle,
  Plus,
  Menu,
  ArrowLeft,
  X,
  ChevronDown,
  ChevronRight,
  Home,
  Briefcase,
  FileSpreadsheet,
  LogOut,
  User,
  Bell,
  Wrench,
  Check,
  Edit3,
  BookOpen,
  Download,
} from 'lucide-react-native';

const EUR_RATE = 655.957;
const FRAIS_QAPRIL = 2000;
const PAGES_STD = 4;
const HON = 0.08;

function calcDroitsDgi(loyer: number, duree: number, pages = PAGES_STD) {
  return Math.round(0.025 * loyer * duree) + 500 * pages;
}

const BAILLEUR_MENU_ITEMS = [
  { id: 'home', label: 'Accueil & Synthèse', desc: 'Encaissements, loyers perçus et alertes', icon: Home },
  { id: 'biens', label: 'Mes biens & Lots', desc: 'Gestion du patrimoine et taux d’occupation', icon: Building2 },
  { id: 'baux', label: 'Mes baux & DGI', desc: 'Enregistrement fiscal et contrats certifiés', icon: FileSpreadsheet },
  { id: 'quit', label: 'Quittances certifiées', desc: 'Émission et historique mensuel', icon: FileText },
  { id: 'flux', label: 'Flux financiers (FCFA/€)', desc: 'Reversements Wave, Orange et virements diaspora', icon: Wallet },
  { id: 'mandats', label: 'Mandats de gestion', desc: 'Agences agréées et intermédiaires', icon: Briefcase },
  { id: 'cand', label: 'Vivier de candidats', desc: 'Demandes de location et dossiers vérifiés', icon: Users },
  { id: 'profil', label: 'Profil & Conformité Niv. 1–4', desc: 'Identité bailleur et labels légaux', icon: ShieldCheck },
  { id: 'manuel', label: 'Manuel d’utilisation', desc: 'Guide officiel complet v2.0 certifié', icon: BookOpen },
];

const AGENCE_MENU_ITEMS = [
  { id: 'home', label: 'Vue d’ensemble agence', desc: 'Tableau de bord mandats et collecte globale', icon: Home },
  { id: 'biens', label: 'Portefeuille multi-bailleurs', desc: 'Biens et lots sous gestion agence', icon: Building2 },
  { id: 'mandants', label: 'Bailleurs mandants', desc: 'Contrats de mandat et reversements', icon: Users },
  { id: 'baux', label: 'Baux sous gestion', desc: 'Baux rédigés, actifs et enregistrés DGI', icon: FileSpreadsheet },
  { id: 'ext', label: 'Extraction & Migration', desc: 'Numérisation et conformité des anciens baux', icon: FileText },
  { id: 'flux', label: 'Rétrocessions & Honoraires', desc: 'Commissions agence et règlements bailleurs', icon: Wallet },
  { id: 'verif', label: 'Vérifications & Constats', desc: 'Inspections, états des lieux et rapports', icon: CheckCircle2 },
  { id: 'team', label: 'Équipe & Collaborateurs', desc: 'Rôles chef d’agence et gestionnaires', icon: ShieldCheck },
  { id: 'manuel', label: 'Manuel d’utilisation', desc: 'Guide officiel complet v2.0 certifié', icon: BookOpen },
];

export default function BailleurAndAgencePrototypeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ profile?: string }>();
  const [loading, setLoading] = useState(true);
  const [appMode, setAppMode] = useState<'bailleur' | 'agence'>('bailleur');
  const isBailleur = appMode === 'bailleur';
  const [menuOpen, setMenuOpen] = useState(false);

  // --- ÉTATS PROTOTYPE BAILLEUR ---
  const [bTab, setBTab] = useState<
    'home' | 'biens' | 'baux' | 'newbail' | 'quit' | 'flux' | 'mandats' | 'cand' | 'profil'
  >('home');
  const [eurMode, setEurMode] = useState(false);
  const [cashModal, setCashModal] = useState(false);
  const [dgiModalRef, setDgiModalRef] = useState<string | null>(null);
  const [mandatModal, setMandatModal] = useState(false);
  const [mType, setMType] = useState<'agree' | 'nonagree' | 'inter'>('agree');

  const [bBiens, setBBiens] = useState<any[]>([]);
  const [bBaux, setBBaux] = useState<any[]>([]);
  const [bReceipts, setBReceipts] = useState<any[]>([]);
  const [dashData, setDashData] = useState<any>(null);

  // --- ÉTATS AGENCE AGRÉÉE ---
  const [aTab, setATab] = useState<
    'home' | 'biens' | 'mandants' | 'baux' | 'ext' | 'flux' | 'verif' | 'team'
  >('home');
  const [roleView, setRoleView] = useState<'chef' | 'collab'>('chef');

  const [mandants, setMandants] = useState<any[]>([]);
  const [verifs, setVerifs] = useState<any[]>([]);

  const [exLoyer, setExLoyer] = useState('180000');
  const [exDuree, setExDuree] = useState('24');

  // --- ÉTATS DÉCLARATIONS & ACTIONS IC-01 (P0-03 & P0-05) ---
  const [updateRentModal, setUpdateRentModal] = useState(false);
  const [selectedDeclId, setSelectedDeclId] = useState('');
  const [newRentAmount, setNewRentAmount] = useState('');
  const [submittingDeclAction, setSubmittingDeclAction] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const reloadData = () => setRefreshTrigger((prev) => prev + 1);

  const handleConfirmTenantDeclaration = (id: string) => {
    Alert.alert(
      'Confirmer le locataire',
      'Confirmez-vous que cette personne est votre locataire ? Le bail officiel sera validé et activé.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Oui, confirmer',
          onPress: async () => {
            try {
              const res = await fetchWithAuth(`/proprietaire/declarations/${id}/action`, {
                method: 'POST',
                body: JSON.stringify({ action: 'CONFIRM' }),
              });
              const d = await res.json();
              if (res.ok && d.success) {
                Alert.alert('Bail Validé !', d.message || 'Le bail a été créé et activé.');
                reloadData();
              } else {
                Alert.alert('Erreur', d.error || 'Impossible de confirmer.');
              }
            } catch (e) {
              Alert.alert('Erreur réseau', 'Vérifiez votre connexion internet.');
            }
          },
        },
      ]
    );
  };

  const handlePromptUpdateRent = (id: string, currentRent: number) => {
    setSelectedDeclId(id);
    setNewRentAmount(String(currentRent || ''));
    setUpdateRentModal(true);
  };

  const handleRejectTenantDeclaration = (id: string) => {
    Alert.alert(
      'Rejeter la déclaration',
      'Confirmez-vous que vous ne connaissez pas cette personne ? La déclaration sera définitivement rejetée.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Je ne connais pas',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetchWithAuth(`/proprietaire/declarations/${id}/action`, {
                method: 'POST',
                body: JSON.stringify({ action: 'REJECT' }),
              });
              const d = await res.json();
              if (res.ok && d.success) {
                Alert.alert('Déclaration rejetée', d.message);
                reloadData();
              } else {
                Alert.alert('Erreur', d.error || 'Impossible de rejeter.');
              }
            } catch (e) {
              Alert.alert('Erreur réseau', 'Vérifiez votre connexion internet.');
            }
          },
        },
      ]
    );
  };

  const handleConfirmPayment = (id: string) => {
    Alert.alert(
      'Confirmer la réception',
      'Confirmez-vous avoir reçu ce règlement ? La quittance officielle sera immédiatement émise et remise au locataire.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Oui, émettre la quittance',
          onPress: async () => {
            try {
              const res = await fetchWithAuth(`/proprietaire/declarations-paiement/${id}/action`, {
                method: 'POST',
                body: JSON.stringify({ action: 'CONFIRM' }),
              });
              const d = await res.json();
              if (res.ok && d.success) {
                Alert.alert('Quittance Officielle Émise !', d.message || 'La quittance a été transmise au locataire.');
                reloadData();
              } else {
                Alert.alert('Erreur', d.error || 'Impossible de valider.');
              }
            } catch (e) {
              Alert.alert('Erreur réseau', 'Vérifiez votre connexion internet.');
            }
          },
        },
      ]
    );
  };

  const handleRejectPayment = (id: string) => {
    Alert.alert(
      'Rejeter le paiement',
      'Confirmez-vous ne pas avoir reçu ce paiement ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Non, pas reçu',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetchWithAuth(`/proprietaire/declarations-paiement/${id}/action`, {
                method: 'POST',
                body: JSON.stringify({ action: 'REJECT' }),
              });
              const d = await res.json();
              if (res.ok && d.success) {
                Alert.alert('Paiement rejeté', d.message);
                reloadData();
              } else {
                Alert.alert('Erreur', d.error || 'Impossible de rejeter.');
              }
            } catch (e) {
              Alert.alert('Erreur réseau', 'Vérifiez votre connexion internet.');
            }
          },
        },
      ]
    );
  };


  // Gestion du retour physique Android et confirmation de sortie
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const onBackPress = () => {
      if (menuOpen) {
        setMenuOpen(false);
        return true;
      }
      if (isBailleur && bTab !== 'home') {
        setBTab('home');
        return true;
      }
      if (!isBailleur && aTab !== 'home') {
        setATab('home');
        return true;
      }
      confirmExitApp();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [menuOpen, bTab, aTab, isBailleur]);

  // Synchronisation dynamique : actualise toutes les données dès que l'écran reprend le focus
  useFocusEffect(
    useCallback(() => {
      const init = async () => {
      try {
        let activeProfile: string | undefined = params.profile;
        if (!activeProfile) {
          activeProfile = (await getStoredProfile()) || undefined;
        }

        if (activeProfile === 'agence') {
          setAppMode('agence');
        } else if (activeProfile === 'proprietaire' || activeProfile === 'bailleur') {
          setAppMode('bailleur');
        } else {
          router.replace('/');
          return;
        }

        const [dashRes, propsRes, leasesRes, recRes] = await Promise.all([
          fetchWithAuth('/proprietaire/dashboard'),
          fetchWithAuth('/proprietaire/properties'),
          fetchWithAuth('/proprietaire/leases'),
          fetchWithAuth('/proprietaire/receipts')
        ]);

        if (dashRes.ok) {
          const dJson = await dashRes.json();
          setDashData(dJson);
        }

        if (propsRes.ok) {
          const propsJson = await propsRes.json();
          if (propsJson.properties && Array.isArray(propsJson.properties)) {
            setBBiens(propsJson.properties.map((p: any) => ({
              id: p.id,
              struct: p.commune || p.address || 'Abidjan',
              type: p.propertyType || 'Bien',
              name: p.name,
              loyer: p.currentRent || p.declaredRentFcfa || 0,
              loc: p.tenantName || 'Aucun locataire',
              icl: 'A',
              statut: (p.occupancyStatus === 'Occupé' || p.occupancyStatus === 'Loué') ? 'loue' : 'vacant',
              niv: 3,
              masque: false,
              mandat: null
            })));
          }
        }

        if (leasesRes.ok) {
          const lJson = await leasesRes.json();
          if (lJson.leases && Array.isArray(lJson.leases)) {
            setBBaux(lJson.leases.map((l: any) => ({
              ref: l.leaseReference,
              bien: l.property?.name || 'Bien',
              loc: l.tenant ? `${l.tenant.firstName || ''} ${l.tenant.lastName || ''}`.trim() : 'Locataire',
              loyer: l.rentAmount || 0,
              duree: l.durationMonths || 12,
              dgi: true,
              sha: l.id.substring(0, 8) + '...'
            })));
          }
        }

        if (recRes.ok) {
          const rJson = await recRes.json();
          if (rJson.receipts && Array.isArray(rJson.receipts)) {
            setBReceipts(rJson.receipts);
          }
        }
      } catch (e) {
        console.error("Erreur chargement dashboard propriétaire", e);
      } finally {
        setLoading(false);
      }
    };
    init();
    }, [params.profile])
  );

  const userName = dashData?.user
    ? (`${dashData.user.firstName || ''} ${dashData.user.lastName || ''}`.trim() || dashData.user.email || 'Propriétaire')
    : 'Propriétaire';

  // Calculs en direct pour le mode Agence
  const agencyOfficialName = dashData?.user?.nomAgence || dashData?.user?.agencyName || userName || 'Mon Agence';
  const agencyOfficialRef = dashData?.user?.numeroAgrement ? `AGR-${dashData.user.numeroAgrement}` : 'Agence Agréée QAPRIL';
  const totalLoyerAgence = bBiens.reduce((sum, b) => sum + (Number(b.loyer) || 0), 0);
  const totalEncaisseAgence = bReceipts.filter(r => (r.status || '').toLowerCase() === 'paid').reduce((sum, r) => sum + (Number(r.totalAmount) || 0), 0);
  const txRecouvrementAgence = totalLoyerAgence > 0 ? Math.round((totalEncaisseAgence / totalLoyerAgence) * 100) : 0;
  const aReverserAgence = Math.round(totalEncaisseAgence * (1 - HON));
  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2) || 'PR';

  const fmt = (n: number) =>
    eurMode && appMode === 'bailleur'
      ? Math.round(n / EUR_RATE).toLocaleString('fr-FR') + ' €'
      : n.toLocaleString('fr-FR') + ' F';

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#1B4D3E" />
      </SafeAreaView>
    );
  }

  const primaryColor = isBailleur ? '#1B4D3E' : '#1F2A44';
  const bgColor = isBailleur ? '#F5F2EC' : '#F3F4F8';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* HEADER MOBILE NOUVELLE GÉNÉRATION */}
      <View style={[styles.mobileHeader, { backgroundColor: primaryColor }]}>
        {/* BOUTONS RETOUR & ACCUEIL */}
        <Pressable
          style={styles.headerNavIconBtn}
          onPress={() => {
            if (isBailleur && bTab !== 'home') {
              setBTab('home');
            } else if (!isBailleur && aTab !== 'home') {
              setATab('home');
            } else {
              confirmExitApp();
            }
          }}
          accessibilityLabel="Retour en arrière"
        >
          <ArrowLeft color="#FFFFFF" size={18} />
        </Pressable>

        <Pressable
          style={styles.headerNavIconBtn}
          onPress={() => {
            if (isBailleur) setBTab('home');
            else setATab('home');
          }}
          accessibilityLabel="Accueil"
        >
          <Home color="#FFFFFF" size={18} />
        </Pressable>
        <Pressable
          style={styles.menuBurgerBtn}
          onPress={() => setMenuOpen(true)}
          accessibilityLabel="Ouvrir le menu mobile"
        >
          <Menu color="#FFFFFF" size={22} />
        </Pressable>

        <Pressable 
          style={styles.headerTitleContainer}
          onPress={() => setMenuOpen(true)}
        >
          <Text style={[styles.headerAppBadge, { color: isBailleur ? '#E8A020' : '#F0774B' }]}>
            {isBailleur ? 'QAPRIL · BAILLEUR' : 'QAPRIL · AGENCE AGRÉÉE'}
          </Text>
          <View style={styles.headerCurrentScreenRow}>
            <Text style={styles.headerScreenName} numberOfLines={1}>
              {isBailleur
                ? BAILLEUR_MENU_ITEMS.find((m) => m.id === bTab)?.label || 'Accueil'
                : AGENCE_MENU_ITEMS.find((m) => m.id === aTab)?.label || 'Vue d’ensemble'}
            </Text>
            <ChevronDown color={isBailleur ? '#E8A020' : '#F0774B'} size={15} />
          </View>
        </Pressable>

        <View style={styles.headerActionsRight}>
          {isBailleur && (
            <Pressable
              style={styles.headerCurrencyPill}
              onPress={() => setEurMode(!eurMode)}
            >
              <Text style={styles.headerCurrencyText}>{eurMode ? 'EUR €' : 'FCFA'}</Text>
            </Pressable>
          )}

          <Pressable
            style={styles.headerIconBtn}
            onPress={() => router.push('/(tabs)/profile' as any)}
          >
            <User color="#FFFFFF" size={18} />
          </Pressable>
          <Pressable
            style={styles.headerExitBtn}
            onPress={confirmExitApp}
            accessibilityLabel="Quitter l'application"
          >
            <LogOut color="#FCA5A5" size={17} />
          </Pressable>

        </View>
      </View>

      {/* BANNIÈRE MISE À JOUR DISPONIBLE */}
      <UpdateNotificationBanner />
      <VersionUpdateModal />

      {/* MENU MOBILE DÉROULANT / TIROIR DE GAUCHE */}
      <Modal
        visible={menuOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setMenuOpen(false)}
      >
        <View style={styles.drawerBackdrop}>
          {/* CONTENU DU TIROIR À GAUCHE */}
          <View style={styles.drawerContent}>
            {/* EN-TÊTE ÉLÉGANT DU MENU MOBILE */}
            <View style={styles.drawerHeader}>
              <View style={styles.drawerHeaderTop}>
                <View style={[styles.drawerAvatarBox, { backgroundColor: primaryColor }]}>
                  <Text style={styles.drawerAvatarText}>
                    {isBailleur ? userInitials : 'AR'}
                  </Text>
                </View>
                <Pressable
                  style={styles.drawerCloseBtn}
                  onPress={() => setMenuOpen(false)}
                >
                  <X color="#1C1C1E" size={20} />
                </Pressable>
              </View>

              <View style={{ marginTop: 12 }}>
                <Text style={styles.drawerUser}>
                  {isBailleur ? userName : agencyOfficialName}
                </Text>
                <View style={styles.drawerBadgeRow}>
                  <View style={[styles.certifBadge, { backgroundColor: isBailleur ? '#FEF3C7' : '#EFF6FF' }]}>
                    <ShieldCheck color={isBailleur ? '#D97706' : '#2563EB'} size={12} />
                    <Text style={[styles.certifBadgeText, { color: isBailleur ? '#92400E' : '#1D4ED8' }]}>
                      {isBailleur ? 'BAILLEUR CERTIFIÉ' : 'AGENCE AGRÉÉE CPRAIMA'}
                    </Text>
                  </View>
                  <Text style={styles.drawerUserSub}>
                    {isBailleur ? `${bBiens.length} bien(s) · ${bBaux.length} bail(aux)` : 'AGR-2021-0133'}
                  </Text>
                </View>
              </View>
            </View>

            {/* STATUT DU PROFIL STRICTEMENT CHARGÉ */}
            <View style={styles.drawerModeSection}>
              <Text style={styles.drawerSectionTitle}>PROFIL STRICTEMENT ACTIF</Text>
              <View
                style={[
                  styles.activeProfileBadgeBox,
                  {
                    backgroundColor: isBailleur ? 'rgba(27, 77, 62, 0.08)' : 'rgba(31, 42, 68, 0.08)',
                    borderColor: isBailleur ? '#1B4D3E' : '#1F2A44',
                  },
                ]}
              >
                <View
                  style={[
                    styles.activeProfileIconCircle,
                    { backgroundColor: primaryColor },
                  ]}
                >
                  {isBailleur ? (
                    <Home color="#FFFFFF" size={16} />
                  ) : (
                    <Briefcase color="#FFFFFF" size={16} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.activeProfileBadgeTitle,
                      { color: primaryColor },
                    ]}
                  >
                    {isBailleur ? 'PROPRIÉTAIRE BAILLEUR' : 'AGENCE IMMOBILIÈRE'}
                  </Text>
                  <Text style={styles.activeProfileBadgeDesc}>
                    {isBailleur
                      ? 'Dashboard patrimoine strictement chargé'
                      : 'Console gestion d’agence strictement chargée'}
                  </Text>
                </View>
              </View>
            </View>

            {/* LISTE DES MODULES DU MENU MOBILE */}
            <ScrollView style={styles.drawerScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.drawerSectionTitle}>
                {isBailleur ? 'MODULES BAILLEUR' : 'MODULES GESTION AGENCE'}
              </Text>
              
              {(isBailleur ? BAILLEUR_MENU_ITEMS : AGENCE_MENU_ITEMS).map((item) => {
                const IconComponent = item.icon;
                const active = isBailleur ? bTab === item.id : aTab === item.id;
                return (
                  <Pressable
                    key={item.id}
                    style={[styles.drawerItem, active && (isBailleur ? styles.drawerItemActiveBailleur : styles.drawerItemActiveAgence)]}
                    onPress={() => {
                      if (item.id === 'manuel') {
                        setMenuOpen(false);
                        Linking.openURL('https://qapril.net/manuel');
                        return;
                      }
                      if (isBailleur) {
                        setBTab(item.id as any);
                      } else {
                        setATab(item.id as any);
                      }
                      setMenuOpen(false);
                    }}
                  >
                    <View style={[styles.drawerItemIconWrap, active && (isBailleur ? styles.drawerItemIconActiveBailleur : styles.drawerItemIconActiveAgence)]}>
                      <IconComponent color={active ? '#FFFFFF' : primaryColor} size={18} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.drawerItemLabel, active && { color: primaryColor, fontWeight: '600' }]}>
                        {item.label}
                      </Text>
                      <Text style={styles.drawerItemDesc} numberOfLines={1}>
                        {item.desc}
                      </Text>
                    </View>
                    <ChevronRight color={active ? primaryColor : '#9CA3AF'} size={16} />
                  </Pressable>
                );
              })}

              {isBailleur && (
                <>
                  <View style={styles.drawerDivider} />
                  <Text style={styles.drawerSectionTitle}>INCIDENTS & TRAVAUX</Text>
                  <Pressable
                    style={styles.drawerItem}
                    onPress={() => {
                      setMenuOpen(false);
                      router.push('/(tabs)/maintenance' as any);
                    }}
                  >
                    <View style={[styles.drawerItemIconWrap, { backgroundColor: '#FEE2E2' }]}>
                      <Wrench color="#DC2626" size={18} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.rowBetween}>
                        <Text style={[styles.drawerItemLabel, { color: '#DC2626' }]}>
                          Signalements reçus
                        </Text>
                        <View style={styles.incidentCountBadge}>
                          <Text style={styles.incidentCountText}>{dashData?.incidentsCount ?? 0}</Text>
                        </View>
                      </View>
                      <Text style={styles.drawerItemDesc}>Déclarations émises par les locataires</Text>
                    </View>
                    <ChevronRight color="#DC2626" size={16} />
                  </Pressable>
                </>
              )}

              <View style={styles.drawerDivider} />

              <Text style={styles.drawerSectionTitle}>RÉGLAGES & COMPTE</Text>
              {isBailleur && (
                <Pressable
                  style={styles.drawerItem}
                  onPress={() => setEurMode(!eurMode)}
                >
                  <View style={styles.drawerItemIconWrap}>
                    <Wallet color={primaryColor} size={18} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.drawerItemLabel}>Affichage devise : {eurMode ? 'Euros (€)' : 'FCFA (F)'}</Text>
                    <Text style={styles.drawerItemDesc}>Bascule instantanée des montants</Text>
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: primaryColor }}>
                    {eurMode ? '€' : 'F'}
                  </Text>
                </Pressable>
              )}

              <Pressable
                style={styles.drawerItem}
                onPress={() => {
                  setMenuOpen(false);
                  router.push('/(tabs)/profile' as any);
                }}
              >
                <View style={styles.drawerItemIconWrap}>
                  <User color={primaryColor} size={18} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.drawerItemLabel}>Mon profil & Sécurité</Text>
                  <Text style={styles.drawerItemDesc}>Coordonnées et compte bancaire</Text>
                </View>
                <ChevronRight color="#9CA3AF" size={16} />
              </Pressable>

              <Pressable
                style={[styles.drawerItem, styles.drawerLogoutItem]}
                onPress={() => {
                  setMenuOpen(false);
                  setTimeout(() => {
                    Alert.alert(
                      'Changer de profil / Déconnexion',
                      'Voulez-vous fermer cette session pour changer de profil (Propriétaire ou Agence) ou vous reconnecter ?',
                      [
                        { text: 'Annuler', style: 'cancel' },
                        {
                          text: 'Déconnexion',
                          style: 'destructive',
                          onPress: async () => {
                            await logoutAndRedirect(router);
                          },
                        },
                      ]
                    );
                  }, 150);
                }}
              >
                <View style={[styles.drawerItemIconWrap, { backgroundColor: '#FEE2E2' }]}>
                  <LogOut color="#DC2626" size={18} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.drawerItemLabel, { color: '#DC2626' }]}>Changer de profil / Déconnexion</Text>
                  <Text style={styles.drawerItemDesc}>Retourner au choix Propriétaire / Agence</Text>
                </View>
                <ChevronRight color="#DC2626" size={16} />
              </Pressable>
            </ScrollView>
          </View>

          {/* ZONE DE FERMETURE EN ARRIÈRE-PLAN SUR LA DROITE */}
          <Pressable 
            style={styles.drawerDismissArea} 
            onPress={() => setMenuOpen(false)} 
          />
        </View>
      </Modal>

      {/* ===================================================================
          MODE 1 : QAPRIL BAILLEUR — PROTOTYPE (#F5F2EC / #1B4D3E / #E8A020)
         =================================================================== */}
      {isBailleur ? (
        <>
          <ScrollView contentContainerStyle={styles.scroll}>
            {bTab === 'home' && (
              <View style={styles.sectionGap}>
                <View style={styles.rowBetween}>
                  <View>
                    <Text style={styles.subMuted}>Espace Propriétaire Bailleur</Text>
                    <Text style={styles.h1}>{userName}</Text>
                  </View>
                  <Pressable
                    style={styles.pillGold}
                    onPress={() => setEurMode(!eurMode)}
                  >
                    <Text style={styles.pillGoldText}>{eurMode ? 'Afficher en F' : 'Afficher en €'}</Text>
                  </Pressable>
                </View>

                <View style={[styles.heroCard, { backgroundColor: '#1B4D3E' }]}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.heroSub}>LOYERS ENCAISSÉS CE MOIS</Text>
                    <Text style={styles.heroSub}>{dashData?.occupancyRate ?? 0} % occupation</Text>
                  </View>
                  <Text style={styles.heroBig}>
                    {fmt(dashData?.collectedRevenue || 0)} <Text style={{ fontSize: 15, fontWeight: '500' }}>/ {fmt(dashData?.monthlyRevenue || 0)}</Text>
                  </Text>
                  <Text style={styles.heroSub}>
                    {bBiens.filter((x) => x.statut === 'loue').length} bien(s) loué(s) sur {bBiens.length}
                  </Text>
                </View>

                <View style={styles.kpiRow}>
                  <View style={styles.kpiBox}>
                    <Text style={styles.kpiNum}>{bBiens.length}</Text>
                    <Text style={styles.subMuted}>Portes</Text>
                  </View>
                  <View style={styles.kpiBox}>
                    <Text style={[styles.kpiNum, { color: '#1E7E4E' }]}>
                      {bBiens.filter((x) => x.statut === 'loue').length}
                    </Text>
                    <Text style={styles.subMuted}>Louées</Text>
                  </View>
                  <View style={styles.kpiBox}>
                    <Text style={[styles.kpiNum, { color: '#C0392B' }]}>
                      {bBiens.filter((x) => x.statut === 'vacant').length}
                    </Text>
                    <Text style={styles.subMuted}>Vacantes</Text>
                  </View>
                </View>

                {/* P0-03: DÉCLARATIONS LOCATAIRES À CONFIRMER */}
                {dashData?.pendingTenantDeclarations && dashData.pendingTenantDeclarations.length > 0 && (
                  <View style={{ marginTop: 12, marginBottom: 8 }}>
                    <Text style={[styles.label, { color: '#B45309', fontWeight: '800' }]}>
                      À CONFIRMER · DÉCLARATION LOCATAIRE ({dashData.pendingTenantDeclarations.length})
                    </Text>
                    {dashData.pendingTenantDeclarations.map((decl: any) => (
                      <View key={decl.id} style={[styles.card, { borderColor: '#FCD34D', backgroundColor: '#FFFDF5', padding: 16, marginBottom: 10 }]}>
                        <View style={styles.rowBetween}>
                          <Text style={[styles.boldText, { fontSize: 16, color: '#1A1D26' }]}>{decl.tenantName}</Text>
                          <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: '#B45309' }}>Nouveau locataire</Text>
                          </View>
                        </View>
                        <Text style={[styles.subMuted, { marginTop: 4 }]}>
                          Contact : {decl.tenantPhone || 'Numéro fourni'}
                        </Text>
                        <Text style={[styles.subMuted, { marginTop: 2 }]}>
                          Logement déclaré : {decl.housingDesc}
                        </Text>
                        <Text style={[styles.boldText, { marginTop: 6, color: '#1B4D3E', fontSize: 15 }]}>
                          Loyer mensuel : {fmt(decl.rentAmount)}
                        </Text>

                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                          <Pressable
                            style={[styles.btnPrimary, { flex: 1, minWidth: 120, backgroundColor: '#1E7E4E', paddingVertical: 10 }]}
                            onPress={() => handleConfirmTenantDeclaration(decl.id)}
                          >
                            <Check color="#fff" size={15} />
                            <Text style={[styles.btnPrimaryText, { fontSize: 12 }]}>C’est mon locataire</Text>
                          </Pressable>
                          <Pressable
                            style={[styles.btnSecondary, { flex: 1, minWidth: 110, paddingVertical: 10, borderColor: '#D97706' }]}
                            onPress={() => handlePromptUpdateRent(decl.id, decl.rentAmount)}
                          >
                            <Edit3 color="#D97706" size={15} />
                            <Text style={[styles.btnSecondaryText, { color: '#D97706', fontSize: 12 }]}>Corriger le loyer</Text>
                          </Pressable>
                          <Pressable
                            style={[styles.btnSecondary, { flex: 1, minWidth: 110, paddingVertical: 10, borderColor: '#EF4444' }]}
                            onPress={() => handleRejectTenantDeclaration(decl.id)}
                          >
                            <X color="#EF4444" size={15} />
                            <Text style={[styles.btnSecondaryText, { color: '#EF4444', fontSize: 12 }]}>Je ne connais pas</Text>
                          </Pressable>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* P0-05: PAIEMENTS À CONFIRMER */}
                {dashData?.pendingPaymentDeclarations && dashData.pendingPaymentDeclarations.length > 0 && (
                  <View style={{ marginTop: 12, marginBottom: 8 }}>
                    <Text style={[styles.label, { color: '#1E7E4E', fontWeight: '800' }]}>
                      PAIEMENTS À CONFIRMER ({dashData.pendingPaymentDeclarations.length})
                    </Text>
                    {dashData.pendingPaymentDeclarations.map((pay: any) => (
                      <View key={pay.id} style={[styles.card, { borderColor: '#86EFAC', backgroundColor: '#F0FDF4', padding: 16, marginBottom: 10 }]}>
                        <View style={styles.rowBetween}>
                          <Text style={[styles.boldText, { fontSize: 16, color: '#1A1D26' }]}>{pay.tenantName}</Text>
                          <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: '#166534' }}>{pay.paymentMethod}</Text>
                          </View>
                        </View>
                        <Text style={[styles.subMuted, { marginTop: 4 }]}>
                          Bien : {pay.propertyName} · Période : {pay.month}
                        </Text>
                        <Text style={[styles.boldText, { marginTop: 4, color: '#166534', fontSize: 16 }]}>
                          Montant reçu : {fmt(pay.amount)}
                        </Text>
                        <Text style={[styles.subMuted, { fontSize: 11, marginTop: 2 }]}>
                          Déclaré le {new Date(pay.date).toLocaleDateString('fr-FR')}
                        </Text>

                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                          <Pressable
                            style={[styles.btnPrimary, { flex: 2, backgroundColor: '#1E7E4E', paddingVertical: 10 }]}
                            onPress={() => handleConfirmPayment(pay.id)}
                          >
                            <Check color="#fff" size={16} />
                            <Text style={[styles.btnPrimaryText, { fontSize: 13 }]}>Oui, j'ai reçu</Text>
                          </Pressable>
                          <Pressable
                            style={[styles.btnSecondary, { flex: 1, paddingVertical: 10, borderColor: '#EF4444' }]}
                            onPress={() => handleRejectPayment(pay.id)}
                          >
                            <X color="#EF4444" size={16} />
                            <Text style={[styles.btnSecondaryText, { color: '#EF4444', fontSize: 13 }]}>Non</Text>
                          </Pressable>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                <Text style={styles.label}>ACTIONS RAPIDES</Text>
                <View style={styles.grid2}>
                  <Pressable
                    style={[styles.cardGrid, { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' }]}
                    onPress={() => router.push('/create-property')}
                  >
                    <Building2 color="#166534" size={20} />
                    <Text style={[styles.boldText, { color: '#166534' }]}>+ Nouveau Bien</Text>
                    <Text style={styles.subMuted}>Ajouter un bien</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.cardGrid, { backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }]}
                    onPress={() => router.push('/create-lease')}
                  >
                    <FileSpreadsheet color="#92400E" size={20} />
                    <Text style={[styles.boldText, { color: '#92400E' }]}>+ Nouveau Bail</Text>
                    <Text style={styles.subMuted}>Bail conforme à la loi, signé par code SMS</Text>
                  </Pressable>
                  <Pressable style={styles.cardGrid} onPress={() => setBTab('baux')}>
                    <FileText color="#1B4D3E" size={20} />
                    <Text style={styles.boldText}>Baux & DGI</Text>
                    <Text style={styles.subMuted}>Enregistrement fiscal</Text>
                  </Pressable>
                  <Pressable style={styles.cardGrid} onPress={() => setCashModal(true)}>
                    <Camera color="#9A6500" size={20} />
                    <Text style={styles.boldText}>Encaisser espèces</Text>
                    <Text style={styles.subMuted}>Avec photo du reçu</Text>
                  </Pressable>
                  <Pressable style={styles.cardGrid} onPress={() => setMandatModal(true)}>
                    <Users color="#1B4D3E" size={20} />
                    <Text style={styles.boldText}>Confier un bien</Text>
                    <Text style={styles.subMuted}>Agence ou gérant</Text>
                  </Pressable>
                  <Pressable style={styles.cardGrid} onPress={() => setBTab('cand')}>
                    <ShieldCheck color="#1E7E4E" size={20} />
                    <Text style={styles.boldText}>Vivier qualifié</Text>
                    <Text style={styles.subMuted}>Dossiers locataires</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {bTab === 'biens' && (
              <View style={styles.sectionGap}>
                <View style={styles.rowBetween}>
                  <Text style={styles.h1}>Mes biens ({bBiens.length})</Text>
                  <Pressable
                    style={styles.pillGold}
                    onPress={() => router.push('/create-property')}
                  >
                    <Text style={styles.pillGoldText}>+ Ajouter un bien</Text>
                  </Pressable>
                </View>
                {bBiens.length === 0 ? (
                  <View style={[styles.card, { alignItems: 'center', paddingVertical: 32 }]}>
                    <Building2 color="#9CA3AF" size={36} />
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#64748B', marginTop: 10 }}>Aucun bien enregistré</Text>
                    <Text style={[styles.subMuted, { textAlign: 'center', marginTop: 4 }]}>
                      Vos biens immobiliers apparaîtront ici avec leur niveau de conformité légale.
                    </Text>
                  </View>
                ) : (
                  bBiens.map((b) => (
                  <View key={b.id} style={styles.card}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.boldText}>{b.name} · {b.type}</Text>
                      <Text style={[styles.boldText, { color: b.statut === 'vacant' ? '#C0392B' : '#1E7E4E' }]}>
                        {b.statut === 'vacant' ? 'Vacant' : fmt(b.loyer)}
                      </Text>
                    </View>
                    <Text style={styles.subMuted}>{b.struct}</Text>
                    <Text style={styles.subMuted}>
                      {b.loc ? `Locataire : ${b.loc}` : 'Offre publiée dans le vivier · 4 candidats'} · Vérif. niv. {b.niv}
                    </Text>
                    <View style={[styles.rowBetween, { marginTop: 6 }]}>
                      <Text style={styles.subMuted}>
                        Identité bailleur : {b.masque ? 'Masquée (protégée)' : 'Visible'}
                      </Text>
                      <Pressable
                        style={styles.pillGold}
                        onPress={() => {
                          if (b.mandat?.type === 'agree') {
                            Alert.alert('Lecture seule', 'Toujours masqué sous mandat d’agence agréée.');
                            return;
                          }
                          setBBiens((prev) =>
                            prev.map((x) => (x.id === b.id ? { ...x, masque: !x.masque } : x))
                          );
                        }}
                      >
                        <Text style={styles.pillGoldText}>
                          {b.masque ? 'Lever masquage' : 'Masquer mon nom'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )))}
              </View>
            )}

            {bTab === 'baux' && (
              <View style={styles.sectionGap}>
                <View style={styles.rowBetween}>
                  <Text style={styles.h1}>Mes baux ({bBaux.length})</Text>
                  <Pressable
                    style={styles.pillGold}
                    onPress={() => router.push('/create-lease')}
                  >
                    <Text style={styles.pillGoldText}>+ Rédiger un bail</Text>
                  </Pressable>
                </View>
                {bBaux.length === 0 ? (
                  <View style={[styles.card, { alignItems: 'center', paddingVertical: 32 }]}>
                    <FileSpreadsheet color="#9CA3AF" size={36} />
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#64748B', marginTop: 10 }}>Aucun bail actif</Text>
                    <Text style={[styles.subMuted, { textAlign: 'center', marginTop: 4 }]}>
                      Vos contrats de baux enregistrés à la DGI apparaîtront ici.
                    </Text>
                  </View>
                ) : (
                  bBaux.map((b) => (
                  <View key={b.ref} style={styles.card}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.boldText}>{b.bien} · {b.loc}</Text>
                      <Text style={[styles.boldText, { color: b.dgi ? '#1E7E4E' : '#B86E00' }]}>
                        {b.dgi ? 'Enregistré DGI' : 'À enregistrer DGI'}
                      </Text>
                    </View>
                    <Text style={styles.subMuted}>
                      {b.ref} · {fmt(b.loyer)} / mois · Certifié
                    </Text>
                    {!b.dgi && (
                      <Pressable
                        style={[styles.btnPrimary, { backgroundColor: '#1B4D3E', marginTop: 8 }]}
                        onPress={() => setDgiModalRef(b.ref)}
                      >
                        <Text style={styles.btnPrimaryText}>
                          Enregistrer à la DGI ({fmt(calcDroitsDgi(b.loyer, b.duree) + FRAIS_QAPRIL)})
                        </Text>
                      </Pressable>
                    )}
                  </View>
                )))}
              </View>
            )}

            {bTab === 'quit' && (
              <View style={styles.sectionGap}>
                <View style={styles.rowBetween}>
                  <Text style={styles.h1}>Quittances ({bReceipts.length})</Text>
                  <Pressable style={styles.pillGold} onPress={() => setCashModal(true)}>
                    <Text style={styles.pillGoldText}>+ Espèces</Text>
                  </Pressable>
                </View>
                {bReceipts.length === 0 ? (
                  <View style={[styles.card, { alignItems: 'center', paddingVertical: 32 }]}>
                    <FileText color="#9CA3AF" size={36} />
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#64748B', marginTop: 10 }}>Aucune quittance émise</Text>
                    <Text style={[styles.subMuted, { textAlign: 'center', marginTop: 4 }]}>
                      Vos quittances — la preuve de vos paiements, acceptée par les banques et les administrations.
                    </Text>
                  </View>
                ) : (
                  bReceipts.map((r: any, i: number) => (
                    <View key={r.id || i} style={styles.card}>
                      <View style={styles.rowBetween}>
                        <Text style={styles.boldText}>{r.lease?.property?.name || 'Bien'} · {r.periodMonth}</Text>
                        <Text style={[styles.boldText, { color: '#1E7E4E' }]}>{fmt(r.totalAmount || r.rentAmount || 0)}</Text>
                      </View>
                      <Text style={styles.subMuted}>Locataire : {r.lease?.tenant ? `${r.lease.tenant.firstName || ''} ${r.lease.tenant.lastName || ''}`.trim() : 'Locataire'}</Text>
                      <Text style={styles.subMuted}>Réf : {r.receiptRef} · Conforme Loi 2019-576</Text>
                    </View>
                  ))
                )}
              </View>
            )}

            {bTab === 'flux' && (
              <View style={styles.sectionGap}>
                <View style={styles.rowBetween}>
                  <Text style={styles.h1}>Tableau des flux</Text>
                  <Pressable style={styles.pillGold} onPress={() => setEurMode(!eurMode)}>
                    <Text style={styles.pillGoldText}>
                      {eurMode ? 'En FCFA' : 'En € (BCE 655,957)'}
                    </Text>
                  </Pressable>
                </View>
                <View style={styles.card}>
                  <Text style={styles.subMuted}>ENCAISSÉ CE MOIS (FRAIS DE SERVICE : 0 F)</Text>
                  <Text style={styles.h1}>{fmt(dashData?.collectedRevenue || 0)}</Text>
                  <Text style={styles.subMuted}>
                    Vos loyers confirmés sont automatiquement réconciliés et disponibles sans commission cachée.
                  </Text>
                </View>
              </View>
            )}

            {bTab === 'mandats' && (
              <View style={styles.sectionGap}>
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.h1}>Mes Mandats de Gestion</Text>
                    <Text style={styles.subMuted}>Biens confiés en gestion locative aux agences agréées (Mandats donnés)</Text>
                  </View>
                  <Pressable style={styles.pillGold} onPress={() => setMandatModal(true)}>
                    <Text style={styles.pillGoldText}>+ Confier un bien</Text>
                  </Pressable>
                </View>
                <View style={[styles.card, { alignItems: 'center', paddingVertical: 32 }]}>
                  <Users color="#9CA3AF" size={36} />
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#64748B', marginTop: 10 }}>Aucun mandat délégué</Text>
                  <Text style={[styles.subMuted, { textAlign: 'center', marginTop: 4, paddingHorizontal: 12 }]}>
                    Vous gérez vos biens en direct. Utilisez le bouton « + Confier un bien » pour mandater une agence agréée ou un gérant.
                  </Text>
                </View>
              </View>
            )}

            {bTab === 'cand' && (
              <View style={styles.sectionGap}>
                <Text style={styles.h1}>Vivier & Candidatures</Text>
                <Text style={styles.subMuted}>
                  Vous voyez la tranche ICL et les badges, jamais le score chiffré ni les pièces réservées.
                </Text>
                <View style={[styles.card, { alignItems: 'center', paddingVertical: 32 }]}>
                  <Users color="#9CA3AF" size={36} />
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#64748B', marginTop: 10 }}>Aucune candidature en attente</Text>
                  <Text style={[styles.subMuted, { textAlign: 'center', marginTop: 4, paddingHorizontal: 12 }]}>
                    Dès qu’un candidat postule à l’un de vos biens avec son Passeport Locatif, son dossier apparaîtra ici.
                  </Text>
                </View>
              </View>
            )}

            {bTab === 'profil' && (
              <View style={styles.sectionGap}>
                <Text style={styles.h1}>Votre niveau de confiance</Text>
                <View style={styles.card}>
                  <Text style={styles.boldText}>Niveau KYC actuel : Niveau {dashData?.user?.kycLevel ?? 1} ({dashData?.user?.kycStatus ?? 'Validé'})</Text>
                  <Text style={[styles.subMuted, { marginTop: 4 }]}>Patrimoine déclaré : {bBiens.length} bien(s)</Text>
                  <Text style={[styles.subMuted, { marginTop: 2 }]}>Baux en cours : {bBaux.length} bail(aux)</Text>
                </View>
              </View>
            )}
          </ScrollView>
        </>
      ) : (
        /* ===================================================================
           MODE 2 : QAPRIL AGENCE AGRÉÉE — PROTOTYPE (#F3F4F8 / #1F2A44 / #F0774B)
           =================================================================== */
        <>
          <ScrollView contentContainerStyle={styles.scroll}>
            {/* BASCULE VUE CHEF / VUE COLLABORATEUR (Confidentialité) */}
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.subMuted}>{agencyOfficialName} · {agencyOfficialRef}</Text>
                <Text style={styles.h1}>
                  {roleView === 'chef' ? 'Chef d’agence' : 'Gestionnaire'}
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  const next = roleView === 'chef' ? 'collab' : 'chef';
                  setRoleView(next);
                  Alert.alert(
                    next === 'collab' ? 'Vue collaborateur (Données protégées)' : 'Vue chef d’agence',
                    next === 'collab'
                      ? 'Sur les biens masqués, le bailleur apparaît uniquement sous son code séquentiel BAI-NNN.'
                      : 'Vous voyez tous les noms réels des bailleurs mandants.'
                  );
                }}
                style={[
                  styles.pillGold,
                  { backgroundColor: roleView === 'collab' ? '#F0774B' : '#E7ECF6' },
                ]}
              >
                <Text style={[styles.pillGoldText, { color: '#141824' }]}>
                  {roleView === 'chef' ? 'Basculer : Vue collaborateur' : 'Vue collaborateur (BAI actif)'}
                </Text>
              </Pressable>
            </View>

            {aTab === 'home' && (
              <View style={[styles.sectionGap, { marginTop: 12 }]}>
                <View style={[styles.heroCard, { backgroundColor: '#1F2A44' }]}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.heroSub}>LOYERS DU PORTEFEUILLE · {new Date().toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }).toUpperCase()}</Text>
                    <Text style={styles.heroSub}>{txRecouvrementAgence} %</Text>
                  </View>
                  <Text style={styles.heroBig}>
                    {totalEncaisseAgence.toLocaleString('fr-FR')} F <Text style={{ fontSize: 15, fontWeight: '500' }}>/ {totalLoyerAgence.toLocaleString('fr-FR')} F</Text>
                  </Text>
                  <Text style={styles.heroSub}>
                    À reverser aux bailleurs (net − 8 % d’honoraires) : {aReverserAgence.toLocaleString('fr-FR')} F
                  </Text>
                </View>

                <View style={styles.grid2}>
                  <Pressable style={styles.cardGrid} onPress={() => setATab('ext')}>
                    <Upload color="#F0774B" size={20} />
                    <Text style={styles.boldText}>Bail externe → DGI</Text>
                    <Text style={styles.subMuted}>Enregistrement officiel du bail</Text>
                  </Pressable>
                  <Pressable style={styles.cardGrid} onPress={() => setATab('verif')}>
                    <ShieldCheck color="#1E7E4E" size={20} />
                    <Text style={styles.boldText}>Visites Niveau 4</Text>
                    <Text style={styles.subMuted}>15 000 F / visite</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {aTab === 'biens' && (
              <View style={[styles.sectionGap, { marginTop: 12 }]}>
                <View style={styles.rowBetween}>
                  <Text style={styles.h1}>Portefeuille de l'agence ({bBiens.length})</Text>
                  <Pressable 
                    style={styles.btnSmallGreen} 
                    onPress={() => router.push('/create-property')}
                  >
                    <Plus size={14} color="#fff" />
                    <Text style={styles.btnSmallGreenText}>+ Bien</Text>
                  </Pressable>
                </View>
                {bBiens.length === 0 ? (
                  <View style={[styles.card, { alignItems: 'center', paddingVertical: 32 }]}>
                    <Building2 color="#9CA3AF" size={36} />
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#64748B', marginTop: 8 }}>
                      Aucun bien sous gestion
                    </Text>
                    <Text style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 4, paddingHorizontal: 20 }}>
                      Votre agence n'a pas encore de bien enregistré. Utilisez le bouton + Bien pour en créer un.
                    </Text>
                    <Pressable
                      style={[styles.btnPrimary, { marginTop: 16 }]}
                      onPress={() => router.push('/create-property')}
                    >
                      <Text style={styles.btnPrimaryText}>Créer un bien</Text>
                    </Pressable>
                  </View>
                ) : (
                  bBiens.map((b) => (
                    <View key={b.id} style={styles.card}>
                      <View style={styles.rowBetween}>
                        <Text style={styles.boldText}>{b.name || b.struct || 'Bien immobilier'}</Text>
                        <Text style={[styles.badge, b.statut === 'loue' ? styles.badgeGreen : styles.badgeGrey]}>
                          {b.statut === 'loue' ? 'Loué' : 'Vacant'}
                        </Text>
                      </View>
                      <Text style={styles.subMuted}>
                        {b.struct} · {b.type} · Loyer : {Number(b.loyer || 0).toLocaleString('fr-FR')} XOF
                      </Text>
                      <Text style={[styles.subMuted, { marginTop: 4 }]}>
                        Locataire : {roleView === 'collab' && b.masque ? 'Locataire Masqué (Identité protégée)' : b.loc}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            )}

            {aTab === 'mandants' && (
              <View style={[styles.sectionGap, { marginTop: 12 }]}>
                <Text style={styles.h1}>Bailleurs mandants ({bBiens.length > 0 ? bBiens.length : 0})</Text>
                {bBiens.length === 0 ? (
                  <View style={[styles.card, { alignItems: 'center', paddingVertical: 32 }]}>
                    <Users color="#9CA3AF" size={36} />
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#64748B', marginTop: 8 }}>
                      Aucun mandat enregistré
                    </Text>
                    <Text style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 4, paddingHorizontal: 20 }}>
                      Les mandats de gestion confiés par vos bailleurs apparaîtront automatiquement ici.
                    </Text>
                  </View>
                ) : (
                  bBiens.map((b, idx) => {
                    const baiCode = `BAI-${String(idx + 1).padStart(4, '0')}`;
                    return (
                      <View key={b.id} style={styles.card}>
                        <View style={styles.rowBetween}>
                          <Text style={styles.boldText}>
                            {roleView === 'chef' ? (b.bailleurNom || userName) : baiCode}
                          </Text>
                          <Text style={styles.subMuted}>Mandat ACTIF</Text>
                        </View>
                        <Text style={styles.subMuted}>
                          {roleView === 'collab' ? 'Identité protégée (Confidentialité)' : `Code collaborateur : ${baiCode}`} · Bien : {b.name}
                        </Text>
                      </View>
                    );
                  })
                )}
              </View>
            )}

            {aTab === 'ext' && (
              <View style={[styles.sectionGap, { marginTop: 12 }]}>
                <Text style={styles.h1}>Enregistrer un bail externe auprès de la DGI</Text>
                <Text style={styles.subMuted}>
                  Importez un bail papier non généré par QAPRIL pour calculer et régler les droits DGI (2,5 % × loyer × durée + 500 F × pages + 2 000 F).
                </Text>
                <View style={styles.card}>
                  <Text style={styles.label}>LOYER MENSUEL (FCFA)</Text>
                  <TextInput
                    value={exLoyer}
                    onChangeText={setExLoyer}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                  <Text style={styles.label}>DURÉE (MOIS)</Text>
                  <TextInput
                    value={exDuree}
                    onChangeText={setExDuree}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                  <View style={styles.recapBox}>
                    <Text style={styles.boldText}>
                      Total DGI + Timbres + Service QAPRIL :{' '}
                      {(
                        calcDroitsDgi(Number(exLoyer) || 0, Number(exDuree) || 12) + FRAIS_QAPRIL
                      ).toLocaleString('fr-FR')}{' '}
                      F
                    </Text>
                  </View>
                  <Pressable
                    style={[styles.btnPrimary, { backgroundColor: '#1F2A44' }]}
                    onPress={() =>
                      Alert.alert(
                        'Bail externe déposé à la DGI',
                        'Reçu officiel DGI généré et envoyé par SMS au bailleur et au locataire (art. 414 CCH).'
                      )
                    }
                  >
                    <Text style={styles.btnPrimaryText}>Payer et déposer à la DGI</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {aTab === 'flux' && (
              <View style={[styles.sectionGap, { marginTop: 12 }]}>
                <Text style={styles.h1}>Reversements aux bailleurs (− 8 %)</Text>
                {mandants.map((m) => {
                  const net = Math.round(m.enc * (1 - HON));
                  return (
                    <View key={m.id} style={styles.card}>
                      <View style={styles.rowBetween}>
                        <Text style={styles.boldText}>
                          {roleView === 'chef' || !m.mask ? m.nom : m.bai}
                        </Text>
                        <Text style={styles.boldText}>Net : {net.toLocaleString('fr-FR')} F</Text>
                      </View>
                      {m.rev === 'du' ? (
                        <Pressable
                          style={[styles.btnPrimary, { backgroundColor: '#1F2A44', marginTop: 8 }]}
                          onPress={() => {
                            setMandants((prev) =>
                              prev.map((x) => (x.id === m.id ? { ...x, rev: 'fait' } : x))
                            );
                            Alert.alert('Reversement exécuté', 'Relevé certifié envoyé au bailleur.');
                          }}
                        >
                          <Text style={styles.btnPrimaryText}>
                            Reverser {net.toLocaleString('fr-FR')} F
                          </Text>
                        </Pressable>
                      ) : (
                        <Text style={{ color: '#1E7E4E', fontWeight: '700', fontSize: 12 }}>
                          ✓ Reversé le 10
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {aTab === 'verif' && (
              <View style={[styles.sectionGap, { marginTop: 12 }]}>
                <Text style={styles.h1}>Visites de vérification certifiée</Text>
                <Text style={styles.subMuted}>
                  Réseau d’agences agréées · Honoraires agence : 15 000 F / visite
                </Text>
                {verifs.map((v, i) => (
                  <View key={i} style={styles.card}>
                    <Text style={styles.boldText}>{v.bien}</Text>
                    <Text style={styles.subMuted}>Demandeur : {v.dem} · Statut : {v.st}</Text>
                    {v.st !== 'faite' && (
                      <Pressable
                        style={[styles.btnPrimary, { backgroundColor: '#1F2A44', marginTop: 8 }]}
                        onPress={() => {
                          setVerifs((prev) =>
                            prev.map((x, idx) => (idx === i ? { ...x, st: 'faite' } : x))
                          );
                          Alert.alert(
                            'Niveau 4 validé',
                            'Rapport signé · le bien passe au niveau 4 · 15 000 F encaissés.'
                          );
                        }}
                      >
                        <Text style={styles.btnPrimaryText}>
                          Signer le rapport · Bien → Niveau 4
                        </Text>
                      </Pressable>
                    )}
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </>
      )}

      {/* MODALE : ENCAISSER EN ESPÈCES */}
      <Modal visible={cashModal} transparent animationType="slide" onRequestClose={() => setCashModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.h2}>Encaisser en espèces</Text>
            <Text style={styles.subMuted}>
              Photo obligatoire du reçu manuscrit · émission immédiate de la quittance officielle
            </Text>
            <Pressable
              style={[styles.btnPrimary, { backgroundColor: '#1B4D3E', marginTop: 10 }]}
              onPress={() => {
                setCashModal(false);
                Alert.alert('Encaissement enregistré', 'Quittance officielle émise et envoyée par SMS.');
              }}
            >
              <Text style={styles.btnPrimaryText}>Photographier le reçu et émettre la quittance</Text>
            </Pressable>
            <Pressable style={styles.btnGhost} onPress={() => setCashModal(false)}>
              <Text style={styles.btnGhostText}>Annuler</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* MODALE : ENREGISTRER BAIL À LA DGI */}
      <Modal visible={!!dgiModalRef} transparent animationType="slide" onRequestClose={() => setDgiModalRef(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.h2}>Enregistrer le bail à la DGI ({dgiModalRef})</Text>
            <Text style={styles.subMuted}>
              Droits DGI (2,5 %) + Timbres (500 F/page) + Frais de service QAPRIL (2 000 F)
            </Text>
            <Pressable
              style={[styles.btnPrimary, { backgroundColor: '#1B4D3E', marginTop: 10 }]}
              onPress={() => {
                setBBaux((prev) =>
                  prev.map((b) => (b.ref === dgiModalRef ? { ...b, dgi: true, st: 'actif' } : b))
                );
                setDgiModalRef(null);
                Alert.alert('Bail enregistré à la DGI', 'Reçu DGI joint au bail et remis au locataire (art. 414 CCH).');
              }}
            >
              <Text style={styles.btnPrimaryText}>Payer et enregistrer à la DGI</Text>
            </Pressable>
            <Pressable style={styles.btnGhost} onPress={() => setDgiModalRef(null)}>
              <Text style={styles.btnGhostText}>Plus tard</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* MODALE : CONFIER UN BIEN */}
      <Modal visible={mandatModal} transparent animationType="slide" onRequestClose={() => setMandatModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.h2}>Confier un bien</Text>
            <View style={{ gap: 8, marginVertical: 8 }}>
              {[
                ['agree', 'Agence immobilière agréée (Substitution totale)'],
                ['nonagree', 'Agence non agréée (Délégation partielle)'],
                ['inter', 'Intermédiaire de gestion (Délégation partielle)'],
              ].map(([t, lbl]) => (
                <Pressable
                  key={t}
                  onPress={() => setMType(t as any)}
                  style={[styles.chip, mType === t && { backgroundColor: '#1B4D3E', borderColor: '#1B4D3E' }]}
                >
                  <Text style={[styles.chipText, mType === t && { color: '#fff' }]}>{lbl}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              style={[styles.btnPrimary, { backgroundColor: '#1B4D3E' }]}
              onPress={() => {
                setMandatModal(false);
                Alert.alert(
                  'Mandat activé',
                  mType === 'agree'
                    ? 'Substitution totale activée · votre identité est masquée (code BAI-NNN).'
                    : 'Délégation partielle activée bien par bien.'
                );
              }}
            >
              <Text style={styles.btnPrimaryText}>Activer</Text>
            </Pressable>
            <Pressable style={styles.btnGhost} onPress={() => setMandatModal(false)}>
              <Text style={styles.btnGhostText}>Annuler</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* MODALE : CORRIGER LE LOYER DÉCLARÉ (IC-01 P0-03) */}
      <Modal visible={updateRentModal} transparent animationType="slide" onRequestClose={() => setUpdateRentModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { maxHeight: '90%' }]}>
            <Text style={styles.h2}>Corriger le loyer</Text>
            <Text style={[styles.subMuted, { marginTop: 4, marginBottom: 12 }]}>
              Ajustez le montant du loyer mensuel si le locataire a fait une erreur dans sa déclaration.
            </Text>

            <View style={{ width: '100%', gap: 10 }}>
              <Text style={styles.label}>NOUVEAU MONTANT DU LOYER (FCFA) *</Text>
              <TextInput
                style={[styles.input, { marginTop: 4 }]}
                placeholder="Ex : 160000"
                keyboardType="numeric"
                value={newRentAmount}
                onChangeText={setNewRentAmount}
              />

              <Pressable
                style={[styles.btnPrimary, { backgroundColor: '#1E7E4E', marginTop: 10 }]}
                disabled={submittingDeclAction}
                onPress={async () => {
                  const val = parseFloat(newRentAmount.replace(/\s/g, '')) || 0;
                  if (val <= 0) {
                    Alert.alert('Montant invalide', 'Veuillez saisir un loyer supérieur à 0.');
                    return;
                  }
                  setSubmittingDeclAction(true);
                  try {
                    const res = await fetchWithAuth(`/proprietaire/declarations/${selectedDeclId}/action`, {
                      method: 'POST',
                      body: JSON.stringify({ action: 'UPDATE_RENT', newRent: val }),
                    });
                    const d = await res.json();
                    if (res.ok && d.success) {
                      Alert.alert('Loyer Corrigé !', d.message);
                      setUpdateRentModal(false);
                      reloadData();
                    } else {
                      Alert.alert('Erreur', d.error || 'Impossible de mettre à jour le loyer.');
                    }
                  } catch (e) {
                    Alert.alert('Erreur réseau', 'Vérifiez votre connexion internet.');
                  } finally {
                    setSubmittingDeclAction(false);
                  }
                }}
              >
                {submittingDeclAction ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.btnPrimaryText}>Valider le montant corrigé</Text>
                )}
              </Pressable>

              <Pressable style={styles.btnGhost} onPress={() => setUpdateRentModal(false)}>
                <Text style={styles.btnGhostText}>Annuler</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Assistant Vocal QAPRIL (ADD-27) */}
      <VoiceAssistantFAB moduleName={isBailleur ? 'BAILLEUR' : 'AGENCE'} primaryColor={primaryColor} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  btnSmallGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnSmallGreenText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: '600',
    overflow: 'hidden',
  },
  badgeGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#059669',
  },
  badgeGrey: {
    backgroundColor: 'rgba(156, 163, 175, 0.15)',
    color: '#4B5563',
  },

  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  mobileHeader: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerNavIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  headerExitBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  menuBurgerBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: 12,
    alignItems: 'flex-start',
  },
  headerAppBadge: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  headerCurrentScreenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  headerScreenName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerCurrencyPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  headerCurrencyText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    flexDirection: 'row',
  },
  drawerContent: {
    width: '84%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    height: '100%',
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 20,
  },
  drawerDismissArea: {
    flex: 1,
    height: '100%',
  },
  drawerHeader: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F9',
  },
  drawerHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drawerAvatarBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  drawerAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  incidentCountBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  incidentCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  drawerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  drawerBrand: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  certifBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  certifBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  drawerUser: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1D26',
  },
  drawerUserSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  drawerCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F2EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerModeSection: {
    marginTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F9',
  },
  activeProfileBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 6,
  },
  activeProfileIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeProfileBadgeTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  activeProfileBadgeDesc: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  drawerLogoutItem: {
    marginTop: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  drawerModeToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  drawerModeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F5F2EC',
  },
  drawerModeBtnActiveBailleur: {
    backgroundColor: '#1B4D3E',
  },
  drawerModeBtnActiveAgence: {
    backgroundColor: '#1F2A44',
  },
  drawerModeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  drawerModeBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  drawerScroll: {
    marginTop: 14,
  },
  drawerSectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginTop: 6,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 4,
    backgroundColor: '#FFFFFF',
  },
  drawerItemActiveBailleur: {
    backgroundColor: '#F0F7F4',
    borderWidth: 1,
    borderColor: '#C7E4D7',
  },
  drawerItemActiveAgence: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  drawerItemIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F5F2EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerItemIconActiveBailleur: {
    backgroundColor: '#1B4D3E',
  },
  drawerItemIconActiveAgence: {
    backgroundColor: '#1F2A44',
  },
  drawerItemLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1D26',
  },
  drawerItemDesc: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  drawerDivider: {
    height: 1,
    backgroundColor: '#F1F3F9',
    marginVertical: 12,
  },
  scroll: { padding: 16, paddingBottom: 40 },
  sectionGap: { gap: 12 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  h1: { fontSize: 21, fontWeight: '600', color: '#1C1C1E', letterSpacing: -0.4 },
  h2: { fontSize: 17, fontWeight: '600', color: '#1C1C1E' },
  subMuted: { fontSize: 12, color: '#6E6E73', lineHeight: 17 },
  boldText: { fontSize: 13, fontWeight: '700', color: '#1C1C1E' },
  label: { fontSize: 11, fontWeight: '600', color: '#6E6E73', letterSpacing: 0.6 },
  heroCard: { borderRadius: 22, padding: 18, gap: 6 },
  heroSub: { fontSize: 11, color: 'rgba(255,255,255,0.82)', fontWeight: '600' },
  heroBig: { fontSize: 27, fontWeight: '600', color: '#FFFFFF', letterSpacing: -0.5 },
  kpiRow: { flexDirection: 'row', gap: 8 },
  kpiBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E4E0D7',
  },
  kpiNum: { fontSize: 20, fontWeight: '600', color: '#1C1C1E' },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cardGrid: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E4E0D7',
    gap: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E4E0D7',
    gap: 6,
  },
  pillGold: {
    backgroundColor: '#FDF3DF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pillGoldText: { fontSize: 11, fontWeight: '600', color: '#9A6500' },
  input: {
    borderWidth: 1,
    borderColor: '#E4E0D7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '700',
    backgroundColor: '#FFFFFF',
  },
  recapBox: {
    backgroundColor: '#F5F2EC',
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
  },
  btnPrimary: {
    borderRadius: 14,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  btnSecondary: {
    borderRadius: 14,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    gap: 6,
  },
  btnSecondaryText: { color: '#334155', fontSize: 13, fontWeight: '700' },
  btnGhost: {
    borderRadius: 14,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E4E0D7',
    marginTop: 6,
  },
  btnGhostText: { color: '#1C1C1E', fontSize: 12, fontWeight: '700' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(20,24,36,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E0D7',
    backgroundColor: '#FFFFFF',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3A3F47',
  },
});
