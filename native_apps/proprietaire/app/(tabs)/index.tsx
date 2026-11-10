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
  Linking,
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
  { id: 'params', label: 'Paramètres de gestion', desc: 'Relances J+3/J+7/J+15, paiements partiels et Diaspora', icon: Wrench },
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
    'home' | 'biens' | 'baux' | 'newbail' | 'quit' | 'flux' | 'mandats' | 'cand' | 'params' | 'profil'
  >('home');
  const [eurMode, setEurMode] = useState(false);
  const [diasporaSubscribed, setDiasporaSubscribed] = useState(false);
  const [cashModal, setCashModal] = useState(false);
  const [dgiModalRef, setDgiModalRef] = useState<string | null>(null);
  const [mandatModal, setMandatModal] = useState(false);
  const [mType, setMType] = useState<'agree' | 'nonagree' | 'inter'>('agree');

  // Nouveaux états IC-01 Bailleur (Position du bien, Publier une offre, Paiement partiel, Paramètres)
  const [positionModalBien, setPositionModalBien] = useState<any>(null);
  const [offreModalBien, setOffreModalBien] = useState<any>(null);
  const [offreLoyer, setOffreLoyer] = useState('180000');
  const [offreNegociable, setOffreNegociable] = useState(true);
  const [partialModal, setPartialModal] = useState(false);
  const [relanceJ3, setRelanceJ3] = useState(true);
  const [relanceJ7, setRelanceJ7] = useState(true);
  const [relanceJ15, setRelanceJ15] = useState(true);
  const [partialPolicy, setPartialPolicy] = useState<'plan' | 'accepter' | 'refuser'>('plan');

  const [bBiens, setBBiens] = useState<any[]>([]);
  const [biensFilter, setBiensFilter] = useState<'all' | 'loue' | 'vacant'>('all');
  const [bBaux, setBBaux] = useState<any[]>([]);
  const [bReceipts, setBReceipts] = useState<any[]>([]);
  const [selectedReceiptModal, setSelectedReceiptModal] = useState<any>(null);
  const [selectedLeaseModal, setSelectedLeaseModal] = useState<any>(null);
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
          router.replace('/onboarding' as any);
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
              rooms: p.rooms || null,
              superficieM2: p.superficieM2 || null,
              loyer: p.currentRent || p.declaredRentFcfa || 0,
              loc: p.tenantName || '',
              icl: 'A',
              statut: (p.occupancyStatus === 'Occupé' || p.occupancyStatus === 'Loué') ? 'loue' : 'vacant',
              niv: p.isBienVerifie ? 3 : p.gpsLatitude ? 2 : 1,
              gpsStatut: p.gpsLatitude ? 'Confirmée' : 'Provisoire',
              offrePubliee: false,
              masque: false,
              mandat: null
            })));
          }
        }

        if (leasesRes.ok) {
          const lJson = await leasesRes.json();
          if (lJson.leases && Array.isArray(lJson.leases)) {
            setBBaux(lJson.leases.map((l: any) => ({
              id: l.id,
              ref: l.leaseReference,
              status: l.status || 'ACTIVE',
              typeBail: l.typeBail || l.leaseType || 'HABITATION',
              startDate: l.startDate,
              endDate: l.endDate,
              bien: l.property?.name || 'Bien',
              adresse: l.property?.address || '',
              commune: l.property?.commune || 'Abidjan',
              propertyCode: l.property?.propertyCode || '',
              loc: l.tenant ? `${l.tenant.firstName || ''} ${l.tenant.lastName || ''}`.trim() : 'Locataire',
              locPhone: l.tenant?.phone || '',
              locEmail: l.tenant?.email || '',
              loyer: l.rentAmount || 0,
              charges: l.chargesAmount || 0,
              caution: l.depositAmount || (l.rentAmount ? l.rentAmount * 2 : 0),
              avance: l.avanceLoyer || (l.rentAmount ? l.rentAmount * 2 : 0),
              duree: l.durationMonths || 12,
              dgi: true,
              sha: l.id ? l.id.substring(0, 12).toUpperCase() : 'SHA256-QAPRIL'
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
        {((isBailleur && bTab !== 'home') || (!isBailleur && aTab !== 'home')) && (
          <Pressable
            style={styles.headerNavIconBtn}
            onPress={() => {
              if (isBailleur) setBTab('home');
              else setATab('home');
            }}
            accessibilityLabel="Retour à l'accueil"
          >
            <ArrowLeft color="#FFFFFF" size={18} />
          </Pressable>
        )}
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
          {isBailleur && (dashData?.user?.diasporaAbonnement || diasporaSubscribed) && (
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
                      {isBailleur
                        ? dashData?.user?.isCertified || (dashData?.user?.kycLevel ?? 1) >= 2
                          ? 'NIVEAU 2 · VÉRIFIÉ'
                          : 'NIVEAU 1 · NUMÉRO VÉRIFIÉ'
                        : 'AGENCE AGRÉÉE'}
                    </Text>
                  </View>
                  <Text style={styles.drawerUserSub}>
                    {isBailleur ? `${bBiens.length} bien(s) · ${bBaux.length} bail(aux)` : agencyOfficialRef}
                  </Text>
                </View>
              </View>
            </View>

            {/* STATUT DU PROFIL ACTIF */}
            <View style={styles.drawerModeSection}>
              <Text style={styles.drawerSectionTitle}>PROFIL ACTIF</Text>
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
                      ? 'Gestion directe de votre patrimoine'
                      : 'Console de gestion de vos mandats'}
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
              {isBailleur && (dashData?.user?.diasporaAbonnement || diasporaSubscribed) && (
                <Pressable
                  style={styles.drawerItem}
                  onPress={() => setEurMode(!eurMode)}
                >
                  <View style={styles.drawerItemIconWrap}>
                    <Wallet color={primaryColor} size={18} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.drawerItemLabel}>Affichage devise : {eurMode ? 'Euros (€)' : 'FCFA (F)'}</Text>
                    <Text style={styles.drawerItemDesc}>Option Diaspora active (1 € = 655,957 F)</Text>
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
                  { (dashData?.user?.diasporaAbonnement || diasporaSubscribed) && (
                    <Pressable
                      style={styles.pillGold}
                      onPress={() => setEurMode(!eurMode)}
                    >
                      <Text style={styles.pillGoldText}>{eurMode ? 'Afficher en F' : 'Afficher en €'}</Text>
                    </Pressable>
                  )}
                </View>

                <View style={[styles.heroCard, { backgroundColor: '#1B4D3E' }]}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.heroSub}>LOYERS ENCAISSÉS CE MOIS</Text>
                    <Text style={styles.heroSub}>{dashData?.occupancyRate ?? 0} % occupation</Text>
                  </View>
                  <Text style={styles.heroBig}>
                    {fmt(dashData?.collectedRevenue || 0)} <Text style={{ fontSize: 15, fontWeight: '500' }}>/ {fmt(dashData?.monthlyRevenue || 0)}</Text>
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
                    <Pressable
                      onPress={() => {
                        setBiensFilter('loue');
                        setBTab('biens');
                      }}
                      style={{ backgroundColor: 'rgba(255,255,255,0.16)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}
                    >
                      <Text style={[styles.heroSub, { textDecorationLine: 'underline', color: '#FFFFFF' }]}>
                        {bBiens.filter((x) => x.statut === 'loue').length} bien(s) loué(s)
                      </Text>
                    </Pressable>
                    <Text style={styles.heroSub}>sur</Text>
                    <Pressable
                      onPress={() => {
                        setBiensFilter('all');
                        setBTab('biens');
                      }}
                      style={{ backgroundColor: 'rgba(255,255,255,0.16)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}
                    >
                      <Text style={[styles.heroSub, { textDecorationLine: 'underline', color: '#FFFFFF' }]}>
                        {bBiens.length} bien(s) au total →
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.kpiRow}>
                  <Pressable
                    style={[styles.kpiBox, { borderColor: '#1B4D3E', borderWidth: 1.2 }]}
                    onPress={() => {
                      setBiensFilter('all');
                      setBTab('biens');
                    }}
                  >
                    <View style={styles.rowBetween}>
                      <Text style={styles.kpiNum}>{bBiens.length}</Text>
                      <ChevronRight color="#1B4D3E" size={14} />
                    </View>
                    <Text style={[styles.subMuted, { color: '#1B4D3E', fontWeight: '600' }]}>Biens (Tous)</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.kpiBox, { borderColor: '#1E7E4E', borderWidth: 1.2 }]}
                    onPress={() => {
                      setBiensFilter('loue');
                      setBTab('biens');
                    }}
                  >
                    <View style={styles.rowBetween}>
                      <Text style={[styles.kpiNum, { color: '#1E7E4E' }]}>
                        {bBiens.filter((x) => x.statut === 'loue').length}
                      </Text>
                      <ChevronRight color="#1E7E4E" size={14} />
                    </View>
                    <Text style={[styles.subMuted, { color: '#1E7E4E', fontWeight: '600' }]}>Biens loués</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.kpiBox, { borderColor: '#C0392B', borderWidth: 1.2 }]}
                    onPress={() => {
                      setBiensFilter('vacant');
                      setBTab('biens');
                    }}
                  >
                    <View style={styles.rowBetween}>
                      <Text style={[styles.kpiNum, { color: '#C0392B' }]}>
                        {bBiens.filter((x) => x.statut === 'vacant').length}
                      </Text>
                      <ChevronRight color="#C0392B" size={14} />
                    </View>
                    <Text style={[styles.subMuted, { color: '#C0392B', fontWeight: '600' }]}>Vacants</Text>
                  </Pressable>
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
                  <Pressable style={styles.cardGrid} onPress={() => setBTab('params')}>
                    <Wrench color="#1B4D3E" size={20} />
                    <Text style={styles.boldText}>Paramètres</Text>
                    <Text style={styles.subMuted}>Relances & paiements partiels</Text>
                  </Pressable>
                  <Pressable style={styles.cardGrid} onPress={() => setPartialModal(true)}>
                    <Wallet color="#9A6500" size={20} />
                    <Text style={styles.boldText}>Paiement partiel</Text>
                    <Text style={styles.subMuted}>Gérer un acompte / plan</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {bTab === 'biens' && (
              <View style={styles.sectionGap}>
                <View style={styles.rowBetween}>
                  <Text style={styles.h1}>
                    {biensFilter === 'loue'
                      ? `Biens loués (${bBiens.filter((x) => x.statut === 'loue').length})`
                      : biensFilter === 'vacant'
                      ? `Biens vacants (${bBiens.filter((x) => x.statut === 'vacant').length})`
                      : `Mes biens (${bBiens.length})`}
                  </Text>
                  <Pressable
                    style={styles.pillGold}
                    onPress={() => router.push('/create-property')}
                  >
                    <Text style={styles.pillGoldText}>+ Ajouter un bien</Text>
                  </Pressable>
                </View>

                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { key: 'all', label: `Tous (${bBiens.length})` },
                    { key: 'loue', label: `Loués (${bBiens.filter((x) => x.statut === 'loue').length})` },
                    { key: 'vacant', label: `Vacants (${bBiens.filter((x) => x.statut === 'vacant').length})` },
                  ].map((tab) => {
                    const active = biensFilter === tab.key;
                    return (
                      <Pressable
                        key={tab.key}
                        onPress={() => setBiensFilter(tab.key as any)}
                        style={[
                          styles.pillGold,
                          active
                            ? { backgroundColor: '#1B4D3E' }
                            : { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E0D7' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.pillGoldText,
                            active ? { color: '#FFFFFF' } : { color: '#3A3F47' },
                          ]}
                        >
                          {tab.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {bBiens.filter((x) => (biensFilter === 'all' ? true : x.statut === biensFilter)).length === 0 ? (
                  <View style={[styles.card, { alignItems: 'center', paddingVertical: 32 }]}>
                    <Building2 color="#9CA3AF" size={36} />
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#64748B', marginTop: 10 }}>
                      {biensFilter === 'loue'
                        ? 'Aucun bien loué'
                        : biensFilter === 'vacant'
                        ? 'Aucun bien vacant'
                        : 'Aucun bien enregistré'}
                    </Text>
                    <Text style={[styles.subMuted, { textAlign: 'center', marginTop: 4 }]}>
                      Vos biens immobiliers apparaîtront ici avec leur niveau de conformité légale.
                    </Text>
                  </View>
                ) : (
                  bBiens
                    .filter((x) => (biensFilter === 'all' ? true : x.statut === biensFilter))
                    .map((b) => (
                  <View key={b.id} style={styles.card}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.boldText}>{b.name} · {b.type}</Text>
                      <Text style={[styles.boldText, { color: b.statut === 'vacant' ? '#C0392B' : '#1E7E4E' }]}>
                        {b.statut === 'vacant' ? 'Vacant' : fmt(b.loyer)}
                      </Text>
                    </View>
                    <Text style={styles.subMuted}>
                      {b.struct}
                      {b.rooms ? ` · ${b.rooms} pièce${b.rooms > 1 ? 's' : ''}` : ''}
                      {b.superficieM2 ? ` · ${b.superficieM2} m²` : ''}
                    </Text>
                    <Text style={styles.subMuted}>
                      {b.loc ? `Locataire : ${b.loc}` : b.offrePubliee ? 'Offre publiée dans le vivier' : 'Aucun locataire actif'} · Niveau {b.niv} · Position : {b.gpsStatut || 'Provisoire'}
                    </Text>
                    <View style={[styles.rowBetween, { marginTop: 6, flexWrap: 'wrap', gap: 6 }]}>
                      <Pressable
                        style={styles.pillGold}
                        onPress={() => setPositionModalBien(b)}
                      >
                        <Text style={styles.pillGoldText}>Position GPS ({b.gpsStatut || 'Provisoire'})</Text>
                      </Pressable>

                      {b.statut === 'vacant' && (
                        <Pressable
                          style={[styles.pillGold, { backgroundColor: '#E3F5EC' }]}
                          onPress={() => {
                            setOffreModalBien(b);
                            setOffreLoyer(String(b.loyer || 180000));
                          }}
                        >
                          <Text style={[styles.pillGoldText, { color: '#1E7E4E' }]}>
                            {b.offrePubliee ? 'Modifier l’offre' : 'Publier une offre'}
                          </Text>
                        </Pressable>
                      )}

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
                          {b.masque ? 'Nom masqué (Lever)' : 'Masquer mon nom'}
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
                  <Pressable
                    key={b.ref}
                    style={styles.card}
                    onPress={() => setSelectedLeaseModal(b)}
                  >
                    <View style={styles.rowBetween}>
                      <Text style={styles.boldText}>{b.bien} · {b.loc}</Text>
                      <Text style={[styles.boldText, { color: b.dgi ? '#1E7E4E' : '#B86E00' }]}>
                        {b.dgi ? 'Enregistré DGI' : 'À enregistrer DGI'}
                      </Text>
                    </View>
                    <Text style={styles.subMuted}>
                      {b.ref} · {fmt(b.loyer)} / mois · Certifié
                    </Text>
                    <View style={[styles.rowBetween, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F1EFEA' }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Eye color="#1B4D3E" size={15} />
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#1B4D3E' }}>
                          Afficher le contrat de bail
                        </Text>
                      </View>
                      <ChevronRight color="#1B4D3E" size={16} />
                    </View>
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
                  </Pressable>
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
                  bReceipts.map((r: any, i: number) => {
                    const propName = r.property || r.lease?.property?.name || 'Bien immobilier';
                    const tenantName =
                      r.tenant ||
                      (r.lease?.tenant
                        ? `${r.lease.tenant.firstName || ''} ${r.lease.tenant.lastName || ''}`.trim()
                        : 'Locataire');
                    return (
                      <Pressable
                        key={r.id || i}
                        style={styles.card}
                        onPress={() => setSelectedReceiptModal(r)}
                      >
                        <View style={styles.rowBetween}>
                          <Text style={styles.boldText}>{propName} · {r.periodMonth}</Text>
                          <Text style={[styles.boldText, { color: '#1E7E4E' }]}>{fmt(r.totalAmount || r.rentAmount || 0)}</Text>
                        </View>
                        <Text style={styles.subMuted}>Locataire : {tenantName}</Text>
                        <Text style={styles.subMuted}>Réf : {r.receiptRef} · Quittance officielle</Text>
                        <View style={[styles.rowBetween, { marginTop: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F1EFEA' }]}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Eye color="#1B4D3E" size={15} />
                            <Text style={{ fontSize: 12, fontWeight: '700', color: '#1B4D3E' }}>
                              Afficher la quittance
                            </Text>
                          </View>
                          <ChevronRight color="#1B4D3E" size={16} />
                        </View>
                      </Pressable>
                    );
                  })
                )}
              </View>
            )}

            {bTab === 'flux' && (
              <View style={styles.sectionGap}>
                <View style={styles.rowBetween}>
                  <Text style={styles.h1}>Mes encaissements</Text>
                  {(dashData?.user?.diasporaAbonnement || diasporaSubscribed) && (
                    <Pressable style={styles.pillGold} onPress={() => setEurMode(!eurMode)}>
                      <Text style={styles.pillGoldText}>
                        {eurMode ? 'En FCFA' : 'En € (1 € = 655,957 F)'}
                      </Text>
                    </Pressable>
                  )}
                </View>
                <View style={styles.card}>
                  <Text style={styles.subMuted}>ENCAISSÉ CE MOIS (FRAIS QAPRIL : 0 F)</Text>
                  <Text style={styles.h1}>{fmt(dashData?.collectedRevenue || 0)}</Text>
                  <Text style={styles.subMuted}>
                    Vos loyers arrivent directement sur vos comptes Wave, Orange Money, MTN ou bancaire.
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

            {bTab === 'params' && (
              <View style={styles.sectionGap}>
                <Text style={styles.h1}>Paramètres de gestion</Text>
                <Text style={styles.subMuted}>
                  Configurez vos relances automatiques et votre politique de paiements partiels
                </Text>

                <View style={styles.card}>
                  <Text style={styles.label}>RELANCES AUTOMATIQUES EN CAS D’IMPAYÉ</Text>
                  <Pressable style={styles.rowBetween} onPress={() => setRelanceJ3(!relanceJ3)}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.boldText}>J+3 · Rappel courtois par SMS / WhatsApp</Text>
                      <Text style={styles.subMuted}>Rappel automatique après la date d’échéance</Text>
                    </View>
                    <Text style={{ fontWeight: '700', color: relanceJ3 ? '#1E7E4E' : '#6E6E73' }}>
                      {relanceJ3 ? 'Actif' : 'Désactivé'}
                    </Text>
                  </Pressable>

                  <Pressable style={[styles.rowBetween, { marginTop: 8 }]} onPress={() => setRelanceJ7(!relanceJ7)}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.boldText}>J+7 · Relance formelle horodatée</Text>
                      <Text style={styles.subMuted}>Invitation à régulariser ou proposer un échéancier</Text>
                    </View>
                    <Text style={{ fontWeight: '700', color: relanceJ7 ? '#1E7E4E' : '#6E6E73' }}>
                      {relanceJ7 ? 'Actif' : 'Désactivé'}
                    </Text>
                  </Pressable>

                  <Pressable style={[styles.rowBetween, { marginTop: 8 }]} onPress={() => setRelanceJ15(!relanceJ15)}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.boldText}>J+15 · Préparation du dossier de mise en demeure</Text>
                      <Text style={styles.subMuted}>Alerte envoyée au bailleur avant envoi</Text>
                    </View>
                    <Text style={{ fontWeight: '700', color: relanceJ15 ? '#1E7E4E' : '#6E6E73' }}>
                      {relanceJ15 ? 'Actif' : 'Désactivé'}
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.card}>
                  <Text style={styles.label}>POLITIQUE SUR LES PAIEMENTS PARTIELS</Text>
                  {[
                    ['plan', 'Accepter avec plan d’apurement seulement (recommandé)'],
                    ['accepter', 'Accepter librement (reçu d’acompte émis)'],
                    ['refuser', 'Refuser les paiements partiels'],
                  ].map(([k, lbl]) => (
                    <Pressable
                      key={k}
                      onPress={() => setPartialPolicy(k as any)}
                      style={[styles.chip, partialPolicy === k && { backgroundColor: '#1B4D3E', borderColor: '#1B4D3E' }]}
                    >
                      <Text style={[styles.chipText, partialPolicy === k && { color: '#fff' }]}>{lbl}</Text>
                    </Pressable>
                  ))}
                  <Pressable
                    style={[styles.btnSecondary, { marginTop: 8 }]}
                    onPress={() => setPartialModal(true)}
                  >
                    <Text style={styles.btnSecondaryText}>Examiner une proposition de paiement partiel</Text>
                  </Pressable>
                </View>

                <View style={styles.card}>
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.boldText}>Je gère depuis l’étranger — 7 € par mois</Text>
                      <Text style={styles.subMuted}>
                        Active l’affichage double FCFA / € au taux officiel (1 € = 655,957 F) et les rapports mensuels PDF.
                      </Text>
                    </View>
                    <Pressable
                      style={[styles.pillGold, diasporaSubscribed && { backgroundColor: '#E3F5EC' }]}
                      onPress={() => {
                        const next = !diasporaSubscribed;
                        setDiasporaSubscribed(next);
                        if (!next) setEurMode(false);
                        Alert.alert(
                          next ? 'Option Diaspora activée' : 'Option désactivée',
                          next
                            ? 'Vous pouvez désormais basculer tous vos montants en Euros (€) depuis l’en-tête.'
                            : 'L’affichage est revenu uniquement en FCFA.'
                        );
                      }}
                    >
                      <Text style={[styles.pillGoldText, diasporaSubscribed && { color: '#1E7E4E' }]}>
                        {diasporaSubscribed ? 'Actif (7 €/mois)' : 'Activer'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}

            {bTab === 'profil' && (
              <View style={styles.sectionGap}>
                <Text style={styles.h1}>Votre niveau de confiance</Text>
                <View style={styles.card}>
                  <Text style={styles.boldText}>
                    Niveau de confiance : Niveau {dashData?.user?.kycLevel ?? 1} ({dashData?.user?.kycStatus === 'verified' || dashData?.user?.isCertified ? 'Identité vérifiée' : 'Téléphone validé'})
                  </Text>
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

            {aTab === 'baux' && (
              <View style={[styles.sectionGap, { marginTop: 12 }]}>
                <View style={styles.rowBetween}>
                  <Text style={styles.h1}>Baux sous gestion ({bBaux.length})</Text>
                  <Pressable
                    style={styles.btnSmallGreen}
                    onPress={() => router.push('/create-lease')}
                  >
                    <Plus size={14} color="#fff" />
                    <Text style={styles.btnSmallGreenText}>+ Bail</Text>
                  </Pressable>
                </View>
                {bBaux.length === 0 ? (
                  <View style={[styles.card, { alignItems: 'center', paddingVertical: 32 }]}>
                    <FileSpreadsheet color="#9CA3AF" size={36} />
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#64748B', marginTop: 8 }}>
                      Aucun bail sous gestion
                    </Text>
                    <Text style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 4 }}>
                      Les baux du portefeuille agence apparaîtront ici.
                    </Text>
                  </View>
                ) : (
                  bBaux.map((b) => (
                    <Pressable
                      key={b.ref}
                      style={styles.card}
                      onPress={() => setSelectedLeaseModal(b)}
                    >
                      <View style={styles.rowBetween}>
                        <Text style={styles.boldText}>{b.bien} · {b.loc}</Text>
                        <Text style={[styles.boldText, { color: '#1E7E4E' }]}>{b.ref}</Text>
                      </View>
                      <Text style={styles.subMuted}>{Number(b.loyer || 0).toLocaleString('fr-FR')} F / mois · Durée {b.duree} mois</Text>
                      <View style={[styles.rowBetween, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F1EFEA' }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Eye color="#1F2A44" size={15} />
                          <Text style={{ fontSize: 12, fontWeight: '700', color: '#1F2A44' }}>
                            Afficher le contrat de bail
                          </Text>
                        </View>
                        <ChevronRight color="#1F2A44" size={16} />
                      </View>
                    </Pressable>
                  ))
                )}
              </View>
            )}

            {aTab === 'team' && (
              <View style={[styles.sectionGap, { marginTop: 12 }]}>
                <Text style={styles.h1}>Équipe & Collaborateurs</Text>
                <Text style={styles.subMuted}>
                  Les gestionnaires affectés aux biens masqués ne voient que le code séquentiel BAI-NNN du bailleur mandant.
                </Text>
                <View style={styles.card}>
                  <View style={styles.rowBetween}>
                    <View>
                      <Text style={styles.boldText}>{userName}</Text>
                      <Text style={styles.subMuted}>Chef d’agence · Accès complet (identité bailleurs visible)</Text>
                    </View>
                    <View style={styles.pillGold}>
                      <Text style={styles.pillGoldText}>Admin</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.card}>
                  <View style={styles.rowBetween}>
                    <View>
                      <Text style={styles.boldText}>Collaborateur Gestionnaire</Text>
                      <Text style={styles.subMuted}>Gestionnaire · Identité bailleurs masquée (codes BAI-NNN)</Text>
                    </View>
                    <View style={[styles.pillGold, { backgroundColor: '#E7ECF6' }]}>
                      <Text style={[styles.pillGoldText, { color: '#1F2A44' }]}>Protégé</Text>
                    </View>
                  </View>
                </View>
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

      {/* MODALE : POSITION DU BIEN (IC-01 V.position) */}
      <Modal visible={!!positionModalBien} transparent animationType="slide" onRequestClose={() => setPositionModalBien(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.h2}>Position du bien · {positionModalBien?.name}</Text>
            <Text style={styles.subMuted}>
              Statut actuel : {positionModalBien?.gpsStatut || 'Provisoire'} (Provisoire → Confirmée sur place → Gelée une fois le bail actif).
            </Text>
            <View style={styles.recapBox}>
              <Text style={styles.boldText}>Comment confirmer la position ?</Text>
              <Text style={styles.subMuted}>
                Rendez-vous dans le logement et enregistrez la position GPS exacte depuis l’onglet « Biens ». Une fois le bail signé, la position est gelée pour garantir la sécurité du locataire et du propriétaire.
              </Text>
            </View>
            <Pressable
              style={[styles.btnPrimary, { backgroundColor: '#1B4D3E' }]}
              onPress={() => {
                setBBiens((prev) =>
                  prev.map((x) => (x.id === positionModalBien?.id ? { ...x, gpsStatut: 'Confirmée', niv: Math.max(x.niv, 2) } : x))
                );
                setPositionModalBien(null);
                Alert.alert('Position confirmée', 'La position GPS du logement a été marquée comme confirmée.');
              }}
            >
              <Text style={styles.btnPrimaryText}>Enregistrer ma position actuelle (sur place)</Text>
            </Pressable>
            <Pressable style={styles.btnGhost} onPress={() => setPositionModalBien(null)}>
              <Text style={styles.btnGhostText}>Fermer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* MODALE : PUBLIER UNE OFFRE (IC-01 V.offre) */}
      <Modal visible={!!offreModalBien} transparent animationType="slide" onRequestClose={() => setOffreModalBien(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.h2}>Publier une offre · {offreModalBien?.name}</Text>
            <Text style={styles.subMuted}>
              Rendez ce bien vacant visible dans le vivier QAPRIL pour recevoir des candidatures qualifiées.
            </Text>
            <Text style={[styles.label, { marginTop: 8 }]}>LOYER MENSUEL DEMANDÉ (FCFA)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={offreLoyer}
              onChangeText={setOffreLoyer}
            />
            <Pressable
              style={[styles.rowBetween, { marginVertical: 8 }]}
              onPress={() => setOffreNegociable(!offreNegociable)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.boldText}>Autoriser les propositions de loyer (80 % à 100 %)</Text>
                <Text style={styles.subMuted}>Les candidats pourront proposer jusqu’à -20 % maximum</Text>
              </View>
              <Text style={{ fontWeight: '700', color: offreNegociable ? '#1E7E4E' : '#6E6E73' }}>
                {offreNegociable ? 'Oui' : 'Non'}
              </Text>
            </Pressable>
            <View style={styles.recapBox}>
              <Text style={styles.subMuted}>• Dépôt de garantie légal : max. 2 mois ({fmt((Number(offreLoyer) || 0) * 2)})</Text>
              <Text style={styles.subMuted}>• Avance de loyer exigible : max. 2 mois ({fmt((Number(offreLoyer) || 0) * 2)})</Text>
            </View>
            <Pressable
              style={[styles.btnPrimary, { backgroundColor: '#1B4D3E' }]}
              onPress={() => {
                setBBiens((prev) =>
                  prev.map((x) =>
                    x.id === offreModalBien?.id
                      ? { ...x, loyer: Number(offreLoyer) || x.loyer, offrePubliee: true }
                      : x
                  )
                );
                setOffreModalBien(null);
                Alert.alert('Offre publiée !', 'Votre logement est désormais visible par les candidats vérifiés du vivier QAPRIL.');
              }}
            >
              <Text style={styles.btnPrimaryText}>Publier l’offre dans le vivier</Text>
            </Pressable>
            <Pressable style={styles.btnGhost} onPress={() => setOffreModalBien(null)}>
              <Text style={styles.btnGhostText}>Annuler</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* MODALE : PAIEMENT PARTIEL & PLAN D'APUREMENT CÔTÉ BAILLEUR (IC-01 V.partial) */}
      <Modal visible={partialModal} transparent animationType="slide" onRequestClose={() => setPartialModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.h2}>Proposition de paiement partiel</Text>
            <Text style={styles.subMuted}>
              Lorsqu’un locataire propose un règlement partiel, QAPRIL impute d’abord les échéances les plus anciennes :
            </Text>
            <View style={styles.recapBox}>
              <Text style={styles.boldText}>Règle d’imputation automatique</Text>
              <Text style={styles.subMuted}>• Mois complets couverts → Quittances officielles émises</Text>
              <Text style={styles.subMuted}>• Reliquat partiel → Reçu d’acompte émis (jamais une quittance complète)</Text>
              <Text style={styles.subMuted}>• Solde restant → Étalé selon le plan d’apurement accepté</Text>
            </View>
            <View style={{ gap: 8 }}>
              <Pressable
                style={[styles.btnPrimary, { backgroundColor: '#1E7E4E' }]}
                onPress={() => {
                  setPartialModal(false);
                  Alert.alert('Accepté avec plan', 'Le reçu d’acompte et l’échéancier d’apurement ont été envoyés au locataire.');
                }}
              >
                <Text style={styles.btnPrimaryText}>Accepter avec plan d’apurement</Text>
              </Pressable>
              <Pressable
                style={styles.btnSecondary}
                onPress={() => {
                  setPartialModal(false);
                  Alert.alert('Accepté sans plan', 'Le reçu d’acompte a été émis. Le solde reste exigible.');
                }}
              >
                <Text style={styles.btnSecondaryText}>Accepter sans plan (reçu d’acompte)</Text>
              </Pressable>
              <Pressable
                style={[styles.btnSecondary, { borderColor: '#DC2626' }]}
                onPress={() => {
                  setPartialModal(false);
                  Alert.alert('Proposition refusée', 'Le locataire a été notifié du refus du paiement partiel.');
                }}
              >
                <Text style={[styles.btnSecondaryText, { color: '#DC2626' }]}>Refuser le paiement partiel</Text>
              </Pressable>
            </View>
            <Pressable style={styles.btnGhost} onPress={() => setPartialModal(false)}>
              <Text style={styles.btnGhostText}>Fermer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* MODALE : VISUALISATION D'UNE QUITTANCE CERTIFIÉE */}
      <Modal
        visible={!!selectedReceiptModal}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedReceiptModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { maxHeight: '88%' }]}>
            {selectedReceiptModal && (() => {
              const r = selectedReceiptModal;
              const propName = r.property || r.lease?.property?.name || 'Bien immobilier';
              const tenantName =
                r.tenant ||
                (r.lease?.tenant
                  ? `${r.lease.tenant.firstName || ''} ${r.lease.tenant.lastName || ''}`.trim()
                  : 'Locataire');
              const rentAmt = Number(r.rentAmount || r.totalAmount || 0);
              const chargesAmt = Number(r.chargesAmount || 0);
              const totalAmt = Number(r.totalAmount || rentAmt + chargesAmt);
              const paidDateStr = r.paidAt
                ? new Date(r.paidAt).toLocaleDateString('fr-FR')
                : new Date().toLocaleDateString('fr-FR');
              return (
                <>
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.label, { color: '#1B4D3E', fontWeight: '800' }]}>
                        RÉPUBLIQUE DE CÔTE D’IVOIRE · QAPRIL
                      </Text>
                      <Text style={styles.h2}>Quittance de Loyer Certifiée</Text>
                    </View>
                    <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#166534' }}>ACQUITTÉE ✓</Text>
                    </View>
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false} style={{ marginVertical: 8 }}>
                    <View style={[styles.recapBox, { gap: 6 }]}>
                      <View style={styles.rowBetween}>
                        <Text style={styles.subMuted}>Référence Quittance</Text>
                        <Text style={styles.boldText}>{r.receiptRef || 'REC-QAPRIL'}</Text>
                      </View>
                      <View style={styles.rowBetween}>
                        <Text style={styles.subMuted}>Période couverte</Text>
                        <Text style={styles.boldText}>{r.periodMonth || 'Mois en cours'}</Text>
                      </View>
                      <View style={styles.rowBetween}>
                        <Text style={styles.subMuted}>Date d’acquittement</Text>
                        <Text style={styles.boldText}>{paidDateStr}</Text>
                      </View>
                      {r.leaseReference ? (
                        <View style={styles.rowBetween}>
                          <Text style={styles.subMuted}>Réf. Contrat de Bail</Text>
                          <Text style={styles.boldText}>{r.leaseReference}</Text>
                        </View>
                      ) : null}
                    </View>

                    <View style={[styles.card, { marginVertical: 6 }]}>
                      <Text style={styles.label}>PARTIES & LOGEMENT</Text>
                      <View style={styles.rowBetween}>
                        <Text style={styles.subMuted}>Bailleur / Émetteur</Text>
                        <Text style={styles.boldText}>{isBailleur ? userName : agencyOfficialName}</Text>
                      </View>
                      <View style={styles.rowBetween}>
                        <Text style={styles.subMuted}>Locataire</Text>
                        <Text style={styles.boldText}>{tenantName}</Text>
                      </View>
                      <View style={styles.rowBetween}>
                        <Text style={styles.subMuted}>Logement</Text>
                        <Text style={styles.boldText}>{propName}</Text>
                      </View>
                    </View>

                    <View style={[styles.card, { marginVertical: 6, backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                      <Text style={[styles.label, { color: '#166534' }]}>DÉTAIL DU RÈGLEMENT</Text>
                      <View style={styles.rowBetween}>
                        <Text style={styles.subMuted}>Loyer principal</Text>
                        <Text style={styles.boldText}>{fmt(rentAmt)}</Text>
                      </View>
                      <View style={styles.rowBetween}>
                        <Text style={styles.subMuted}>Charges locatives</Text>
                        <Text style={styles.boldText}>{fmt(chargesAmt)}</Text>
                      </View>
                      <View style={[styles.rowBetween, { paddingTop: 6, borderTopWidth: 1, borderTopColor: '#BBF7D0' }]}>
                        <Text style={[styles.boldText, { color: '#166534', fontSize: 15 }]}>Total quittancé</Text>
                        <Text style={[styles.boldText, { color: '#166534', fontSize: 17 }]}>{fmt(totalAmt)}</Text>
                      </View>
                      <View style={styles.rowBetween}>
                        <Text style={styles.subMuted}>Mode de paiement</Text>
                        <Text style={styles.boldText}>{r.paymentMethod || 'Mobile Money / Virement'}</Text>
                      </View>
                    </View>

                    <View style={styles.recapBox}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <ShieldCheck color="#1B4D3E" size={16} />
                        <Text style={[styles.boldText, { color: '#1B4D3E' }]}>Certification numérique SHA-256</Text>
                      </View>
                      <Text style={styles.subMuted}>
                        Dont quittance, sous réserve de tous droits. Ce document électronique horodaté constitue une preuve légale de paiement conforme au CCH ivoirien.
                      </Text>
                      {r.qrToken ? (
                        <Text style={[styles.subMuted, { fontSize: 10, marginTop: 4 }]}>
                          Jeton de vérification : {r.qrToken}
                        </Text>
                      ) : null}
                    </View>
                  </ScrollView>

                  <Pressable
                    style={[styles.btnPrimary, { backgroundColor: '#1B4D3E' }]}
                    onPress={() => setSelectedReceiptModal(null)}
                  >
                    <Text style={styles.btnPrimaryText}>Fermer la quittance</Text>
                  </Pressable>
                </>
              );
            })()}
          </View>
        </View>
      </Modal>

      {/* MODALE : VISUALISATION DU CONTRAT DE BAIL DANS L'APPLICATION */}
      <Modal
        visible={!!selectedLeaseModal}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedLeaseModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { maxHeight: '90%' }]}>
            {selectedLeaseModal && (() => {
              const b = selectedLeaseModal;
              const startStr = b.startDate
                ? new Date(b.startDate).toLocaleDateString('fr-FR')
                : new Date().toLocaleDateString('fr-FR');
              const endStr = b.endDate
                ? new Date(b.endDate).toLocaleDateString('fr-FR')
                : 'Tacite reconduction';
              return (
                <>
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.label, { color: primaryColor, fontWeight: '800' }]}>
                        CONTRAT OFFICIEL · LOI N° 2019-576 (CCH CI)
                      </Text>
                      <Text style={styles.h2}>Contrat de Bail ({b.ref})</Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: b.dgi ? '#DCFCE7' : '#FEF3C7',
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 999,
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '800', color: b.dgi ? '#166534' : '#B45309' }}>
                        {b.dgi ? 'ENREGISTRÉ DGI ✓' : 'À ENREGISTRER'}
                      </Text>
                    </View>
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false} style={{ marginVertical: 8 }}>
                    <View style={[styles.card, { marginBottom: 8 }]}>
                      <Text style={[styles.label, { color: primaryColor }]}>ARTICLE 1 — IDENTIFICATION DES PARTIES</Text>
                      <View style={styles.rowBetween}>
                        <Text style={styles.subMuted}>Bailleur / Mandataire</Text>
                        <Text style={styles.boldText}>{isBailleur ? userName : agencyOfficialName}</Text>
                      </View>
                      <View style={styles.rowBetween}>
                        <Text style={styles.subMuted}>Locataire (Preneur)</Text>
                        <Text style={styles.boldText}>{b.loc}</Text>
                      </View>
                      {b.locPhone ? (
                        <View style={styles.rowBetween}>
                          <Text style={styles.subMuted}>Contact locataire</Text>
                          <Text style={styles.boldText}>{b.locPhone}</Text>
                        </View>
                      ) : null}
                    </View>

                    <View style={[styles.card, { marginBottom: 8 }]}>
                      <Text style={[styles.label, { color: primaryColor }]}>ARTICLE 2 — DÉSIGNATION DU BIEN LOUÉ</Text>
                      <View style={styles.rowBetween}>
                        <Text style={styles.subMuted}>Logement</Text>
                        <Text style={styles.boldText}>{b.bien}</Text>
                      </View>
                      <View style={styles.rowBetween}>
                        <Text style={styles.subMuted}>Localité / Adresse</Text>
                        <Text style={styles.boldText}>
                          {[b.commune, b.adresse].filter(Boolean).join(' · ') || 'Abidjan'}
                        </Text>
                      </View>
                      <View style={styles.rowBetween}>
                        <Text style={styles.subMuted}>Usage du bail</Text>
                        <Text style={styles.boldText}>{b.typeBail || 'Habitation principale'}</Text>
                      </View>
                    </View>

                    <View style={[styles.card, { marginBottom: 8 }]}>
                      <Text style={[styles.label, { color: primaryColor }]}>ARTICLE 3 — DURÉE ET PRISE D’EFFET</Text>
                      <View style={styles.rowBetween}>
                        <Text style={styles.subMuted}>Date de prise d’effet</Text>
                        <Text style={styles.boldText}>{startStr}</Text>
                      </View>
                      <View style={styles.rowBetween}>
                        <Text style={styles.subMuted}>Échéance / Reconduction</Text>
                        <Text style={styles.boldText}>{endStr}</Text>
                      </View>
                      <View style={styles.rowBetween}>
                        <Text style={styles.subMuted}>Durée contractuelle</Text>
                        <Text style={styles.boldText}>{b.duree || 12} mois</Text>
                      </View>
                    </View>

                    <View style={[styles.card, { marginBottom: 8, backgroundColor: '#F5F2EC' }]}>
                      <Text style={[styles.label, { color: primaryColor }]}>ARTICLE 4 — CONDITIONS FINANCIÈRES</Text>
                      <View style={styles.rowBetween}>
                        <Text style={styles.subMuted}>Loyer mensuel</Text>
                        <Text style={[styles.boldText, { fontSize: 15, color: primaryColor }]}>{fmt(b.loyer || 0)}</Text>
                      </View>
                      <View style={styles.rowBetween}>
                        <Text style={styles.subMuted}>Charges mensuelles</Text>
                        <Text style={styles.boldText}>{fmt(b.charges || 0)}</Text>
                      </View>
                      <View style={styles.rowBetween}>
                        <Text style={styles.subMuted}>Dépôt de garantie (Caution · max 2 mois)</Text>
                        <Text style={styles.boldText}>{fmt(b.caution || (b.loyer || 0) * 2)}</Text>
                      </View>
                      <View style={styles.rowBetween}>
                        <Text style={styles.subMuted}>Avance de loyer (max 2 mois)</Text>
                        <Text style={styles.boldText}>{fmt(b.avance || (b.loyer || 0) * 2)}</Text>
                      </View>
                    </View>

                    <View style={styles.recapBox}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <ShieldCheck color={primaryColor} size={16} />
                        <Text style={[styles.boldText, { color: primaryColor }]}>
                          ARTICLE 5 — CONFORMITÉ DGI & CERTIFICATION QAPRIL
                        </Text>
                      </View>
                      <Text style={styles.subMuted}>
                        Contrat rédigé conformément aux articles 414 et suivants du Code de la Construction et de l’Habitation de Côte d’Ivoire.
                      </Text>
                      <Text style={[styles.subMuted, { marginTop: 4 }]}>
                        Empreinte SHA-256 : {b.sha} · Droits DGI : {fmt(calcDroitsDgi(b.loyer || 0, b.duree || 12))}
                      </Text>
                    </View>
                  </ScrollView>

                  {!b.dgi && (
                    <Pressable
                      style={[styles.btnPrimary, { backgroundColor: primaryColor }]}
                      onPress={() => {
                        const refToReg = b.ref;
                        setSelectedLeaseModal(null);
                        setDgiModalRef(refToReg);
                      }}
                    >
                      <Text style={styles.btnPrimaryText}>
                        Enregistrer à la DGI ({fmt(calcDroitsDgi(b.loyer, b.duree) + FRAIS_QAPRIL)})
                      </Text>
                    </Pressable>
                  )}

                  <Pressable
                    style={[styles.btnPrimary, { backgroundColor: primaryColor }]}
                    onPress={() => setSelectedLeaseModal(null)}
                  >
                    <Text style={styles.btnPrimaryText}>Fermer le contrat</Text>
                  </Pressable>
                </>
              );
            })()}
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
