import React, { useState, useEffect } from 'react';
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
  Image,
  BackHandler,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchWithAuth, removeStoredToken, clearAppSessionAndCache, logoutAndRedirect } from '../../lib/api';
import { useRouter } from 'expo-router';
import { UpdateNotificationBanner } from '../../components/UpdateNotificationBanner';
import { VersionUpdateModal } from '../../components/VersionUpdateModal';
import { VoiceAssistantFAB } from '../../components/VoiceAssistantFAB';
import { confirmExitApp } from '../../components/TopNavHeader';
import {
  Bell,
  CheckCircle2,
  ShieldCheck,
  FileText,
  CalendarClock,
  Lock,
  QrCode,
  Search,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  CreditCard,
  Share2,
  Menu,
  ArrowLeft,
  X,
  Home,
  Folder,
  UserCheck,
  FileSpreadsheet,
  LogOut,
  User,
  Zap,
  Droplets,
  Smartphone,
  Wifi,
  Check,
  Copy,
  Building2,
  MapPin,
  Clock,
  Receipt,
  ArrowUpDown,
  Users,
  UserPlus,
  ExternalLink,
  BookOpen,
  Download,
} from 'lucide-react-native';

const formatImageUrl = (uri?: string | null) => {
  if (!uri) return null;
  if (uri.startsWith('http://') || uri.startsWith('https://')) return uri;
  if (uri.startsWith('/')) return `https://qapril.net${uri}`;
  return `https://qapril.net/${uri}`;
};

type LocScreen =
  | 'accueil'
  | 'factures'
  | 'payer'
  | 'quittances'
  | 'caution'
  | 'bail'
  | 'documents'
  | 'passeport'
  | 'recherche'
  | 'manuel';

const MENU_ITEMS = [
  { id: 'accueil' as LocScreen, label: 'Accueil', desc: 'Statut du bail, loyer et alertes', icon: Home },
  { id: 'factures' as LocScreen, label: 'Régler mes factures', desc: 'Eau (SODECI), Élec (CIE), Téléphone, Internet', icon: Zap },
  { id: 'payer' as LocScreen, label: 'Payer mon loyer', desc: 'Wave, Orange, MTN, Moov et Carte bancaire', icon: CreditCard },
  { id: 'quittances' as LocScreen, label: 'Mes quittances', desc: 'La preuve officielle de vos paiements', icon: FileText },
  { id: 'caution' as LocScreen, label: 'Ma caution', desc: 'Ma caution, bloquée jusqu’aux clés', icon: ShieldCheck },
  { id: 'bail' as LocScreen, label: 'Mon contrat de bail', desc: 'Clauses, reconduction et état des lieux', icon: FileSpreadsheet },
  { id: 'documents' as LocScreen, label: 'Mes documents', desc: 'Attestations, pièces et quittances', icon: Folder },
  { id: 'passeport' as LocScreen, label: 'Passeport locatif', desc: 'Tranche de confiance et ponctualité', icon: UserCheck },
  { id: 'recherche' as LocScreen, label: 'Trouver un logement', desc: 'Offres vérifiées et compatibles', icon: Search },
  { id: 'manuel' as LocScreen, label: 'Manuel d\'utilisation', desc: 'Guide officiel complet v2.0 certifié', icon: BookOpen },
];

export default function LocatairePrototypeScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<LocScreen>('accueil');
  const [menuOpen, setMenuOpen] = useState(false);

  // Interactive states from QAPRIL Locataire — maquette
  const [payOp, setPayOp] = useState<'Wave' | 'Orange Money' | 'MTN MoMo' | 'Moov'>('Wave');
  const [payPeriod, setPayPeriod] = useState<number>(1);
  const [procheModal, setProcheModal] = useState(false);
  const [attestationModal, setAttestationModal] = useState(false);
  const [vueBailleurModal, setVueBailleurModal] = useState(false);
  const [epargneAmount, setEpargneAmount] = useState(125000);
  const [searchActive, setSearchActive] = useState(true);
  const [shareRev, setShareRev] = useState(true);
  const [shareGarant, setShareGarant] = useState(true);
  const [shareScore, setShareScore] = useState(false);

  // States for Utilities / Factures (Eau, Elec, Tel, Internet)
  const [factureCat, setFactureCat] = useState<'EAU' | 'ELEC' | 'TEL' | 'NET'>('EAU');
  const [factureElecMode, setFactureElecMode] = useState<'POSTPAYE' | 'PREPAYE'>('PREPAYE');
  const [factureIdentifiant, setFactureIdentifiant] = useState('');
  const [factureMontant, setFactureMontant] = useState(10000);
  const [factureOp, setFactureOp] = useState<'Wave' | 'Orange Money' | 'MTN MoMo' | 'Moov'>('Wave');
  const [facturePaying, setFacturePaying] = useState(false);
  const [factureReceipt, setFactureReceipt] = useState<any>(null);
  const [factureHistory, setFactureHistory] = useState<any[]>([]);
  const [receiptsList, setReceiptsList] = useState<any[]>([]);
  const [marketList, setMarketList] = useState<any[]>([]);
  const [copiedToken, setCopiedToken] = useState(false);

  // Recherche, tri et filtres pour "Trouver un logement"
  const [marketSearchQuery, setMarketSearchQuery] = useState('');

  // États Déclaration de logement & Invitation bailleur (IC-01 P0-02)
  const [declareModal, setDeclareModal] = useState(false);
  const [inviteModal, setInviteModal] = useState(false);
  const [decBailleurNom, setDecBailleurNom] = useState('');
  const [decBailleurTel, setDecBailleurTel] = useState('');
  const [decLogementDesc, setDecLogementDesc] = useState('');
  const [decLoyer, setDecLoyer] = useState('');
  const [decJour, setDecJour] = useState('5');
  const [pendingDeclaration, setPendingDeclaration] = useState<any>(null);
  const [submittingDeclaration, setSubmittingDeclaration] = useState(false);

  // États Déclaration de paiement alternatif (IC-01 P0-04)
  const [payAutrementModal, setPayAutrementModal] = useState(false);
  const [autreMoyen, setAutreMoyen] = useState('WAVE');
  const [autreMontant, setAutreMontant] = useState('');
  const [autreDate, setAutreDate] = useState('');
  const [submittingPayAutrement, setSubmittingPayAutrement] = useState(false);

  // État Préavis / Donner congé (P1-08)
  const [congeModal, setCongeModal] = useState(false);
  const [congeDate, setCongeDate] = useState('');
  const [congeMotif, setCongeMotif] = useState('');
  const [submittingConge, setSubmittingConge] = useState(false);
  const [activePreavis, setActivePreavis] = useState<any>(null);

  // État Refonte Recherche en 5 blocs & Compatibilité (IC-01 Section 6)
  const [searchSubTab, setSearchSubTab] = useState<'offres' | 'besoin' | 'recues'>('offres');
  const [besoinCommune, setBesoinCommune] = useState('Cocody');
  const [besoinType, setBesoinType] = useState('Appartement');
  const [besoinBudget, setBesoinBudget] = useState('250000');
  const [besoinDate, setBesoinDate] = useState('1er du mois prochain');
  const [besoinSituation, setBesoinSituation] = useState('Salarié');
  const [candidatureModal, setCandidatureModal] = useState(false);
  const [selectedOfferForCandidature, setSelectedOfferForCandidature] = useState<any>(null);
  const [shareTrustLevel, setShareTrustLevel] = useState(true);
  const [sharePunctuality, setSharePunctuality] = useState(true);
  const [shareIncome, setShareIncome] = useState(false);

  // États pour Attestation & Occupants Déclarés
  const [generatingAttestation, setGeneratingAttestation] = useState(false);
  const [attestationResult, setAttestationResult] = useState<any>(null);
  const [occupantsModal, setOccupantsModal] = useState(false);
  const [occupantsList, setOccupantsList] = useState<any[]>([]);
  const [loadingOccupants, setLoadingOccupants] = useState(false);
  const [newOccupantModal, setNewOccupantModal] = useState(false);
  const [occNom, setOccNom] = useState('');
  const [occPrenoms, setOccPrenoms] = useState('');
  const [occTypeLien, setOccTypeLien] = useState('CONJOINT');
  const [occBirth, setOccBirth] = useState('');
  const [occTel, setOccTel] = useState('');
  const [occNni, setOccNni] = useState('');
  const [occHonneur, setOccHonneur] = useState(false);
  const [submittingOcc, setSubmittingOcc] = useState(false);
  const [marketSortPrice, setMarketSortPrice] = useState<'none' | 'asc' | 'desc'>('none');
  const [marketCommune, setMarketCommune] = useState<string>('TOUTES');
  const [marketType, setMarketType] = useState<string>('TOUS');

  const availableCommunes = React.useMemo(() => {
    const set = new Set<string>();
    marketList.forEach((off: any) => {
      const c = off.logement?.commune || off.commune;
      if (c && typeof c === 'string' && c.trim()) {
        set.add(c.trim());
      }
    });
    return ['TOUTES', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [marketList]);

  const availableTypes = [
    { id: 'TOUS', label: 'Tous types' },
    { id: 'APPARTEMENT', label: 'Appartement' },
    { id: 'VILLA', label: 'Villa' },
    { id: 'STUDIO', label: 'Studio' },
    { id: 'DUPLEX', label: 'Duplex' },
    { id: 'COMMERCE', label: 'Commerce & Bureau' },
  ];

  const filteredMarketList = React.useMemo(() => {
    return marketList
      .filter((off: any) => {
        const title = (off.titre || off.logement?.name || '').toLowerCase();
        const commune = (off.logement?.commune || off.commune || '').toLowerCase();
        const address = (off.logement?.address || off.address || '').toLowerCase();
        const typeStr = (off.logement?.propertyType || off.propertyType || '').toLowerCase();
        const desc = (off.description || '').toLowerCase();

        // 1. Recherche par mot-clé
        if (marketSearchQuery.trim()) {
          const q = marketSearchQuery.toLowerCase().trim();
          const matches =
            title.includes(q) ||
            commune.includes(q) ||
            address.includes(q) ||
            typeStr.includes(q) ||
            desc.includes(q);
          if (!matches) return false;
        }

        // 2. Filtre par localité
        if (marketCommune !== 'TOUTES') {
          const c = (off.logement?.commune || off.commune || '').toLowerCase();
          if (!c.includes(marketCommune.toLowerCase())) return false;
        }

        // 3. Filtre par type de bien
        if (marketType !== 'TOUS') {
          const combinedType = `${typeStr} ${title}`.toLowerCase();
          if (marketType === 'APPARTEMENT' && !combinedType.includes('appart') && !combinedType.includes('studio')) return false;
          if (marketType === 'VILLA' && !combinedType.includes('villa') && !combinedType.includes('maison')) return false;
          if (marketType === 'STUDIO' && !combinedType.includes('studio')) return false;
          if (marketType === 'DUPLEX' && !combinedType.includes('duplex')) return false;
          if (marketType === 'COMMERCE' && !combinedType.includes('commerce') && !combinedType.includes('bureau') && !combinedType.includes('magasin')) return false;
        }

        return true;
      })
      .sort((a: any, b: any) => {
        if (marketSortPrice === 'asc') {
          const rentA = a.loyerDemande || a.declaredRentFcfa || a.price || 0;
          const rentB = b.loyerDemande || b.declaredRentFcfa || b.price || 0;
          return rentA - rentB;
        }
        if (marketSortPrice === 'desc') {
          const rentA = a.loyerDemande || a.declaredRentFcfa || a.price || 0;
          const rentB = b.loyerDemande || b.declaredRentFcfa || b.price || 0;
          return rentB - rentA;
        }
        return 0;
      });
  }, [marketList, marketSearchQuery, marketCommune, marketType, marketSortPrice]);

  const getOfferCompatibility = (offer: any) => {
    let score = 50;
    const offCommune = (offer.logement?.commune || offer.commune || '').toLowerCase();
    const targetCommune = besoinCommune.toLowerCase();
    if (offCommune && targetCommune && (offCommune.includes(targetCommune) || targetCommune.includes(offCommune))) {
      score += 25;
    }
    const offRent = offer.loyerDemande || offer.declaredRentFcfa || offer.price || 0;
    const maxBudget = parseFloat(besoinBudget.replace(/\s/g, '')) || 300000;
    if (offRent > 0 && offRent <= maxBudget) {
      score += 15;
    } else if (offRent > 0 && offRent <= maxBudget * 1.15) {
      score += 5;
    }
    const offType = (offer.logement?.propertyType || offer.propertyType || '').toLowerCase();
    if (offType && offType.includes(besoinType.toLowerCase())) {
      score += 10;
    }
    return Math.min(score, 98);
  };

  const hasActiveFilters =
    Boolean(marketSearchQuery.trim()) ||
    marketSortPrice !== 'none' ||
    marketCommune !== 'TOUTES' ||
    marketType !== 'TOUS';

  const resetMarketFilters = () => {
    setMarketSearchQuery('');
    setMarketSortPrice('none');
    setMarketCommune('TOUTES');
    setMarketType('TOUS');
  };

  const router = useRouter();

  // Gestion du retour physique Android et confirmation de sortie
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const onBackPress = () => {
      if (menuOpen) {
        setMenuOpen(false);
        return true;
      }
      if (screen !== 'accueil') {
        setScreen('accueil');
        return true;
      }
      confirmExitApp();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [menuOpen, screen]);


  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [dashRes, receiptsRes, marketRes, utilRes] = await Promise.all([
          fetchWithAuth('/locataire/dashboard'),
          fetchWithAuth('/locataire/receipts'),
          fetchWithAuth('/marketplace'),
          fetchWithAuth('/locataire/utilities')
        ]);
        if (dashRes.ok) {
          const json = await dashRes.json();
          setData(json);
          if (json.pendingDeclaration) {
            setPendingDeclaration({
              id: json.pendingDeclaration.id,
              bailleurNom: json.pendingDeclaration.landlordName,
              bailleurTel: json.pendingDeclaration.landlordPhone,
              logementDesc: json.pendingDeclaration.housingDesc,
              loyer: json.pendingDeclaration.rentAmount,
              status: json.pendingDeclaration.status,
            });
          }
        }
        if (receiptsRes.ok) {
          const recJson = await receiptsRes.json();
          if (recJson.receipts && Array.isArray(recJson.receipts)) {
            setReceiptsList(recJson.receipts);
          }
        }
        if (marketRes.ok) {
          const mJson = await marketRes.json();
          if (mJson.annonces && Array.isArray(mJson.annonces)) {
            setMarketList(mJson.annonces);
          }
        }
        if (utilRes && utilRes.ok) {
          const uJson = await utilRes.json();
          if (uJson.utilities && Array.isArray(uJson.utilities)) {
            setFactureHistory(uJson.utilities);
          }
        }
      } catch (e) {
        console.error('Erreur chargement dashboard locataire', e);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const userName = data?.user ? ((data.user.firstName || "") + " " + (data.user.lastName || "")).trim() || data.user.email || "Locataire" : "Locataire";



  const handlePayFacture = async () => {
    if (!factureIdentifiant || !factureIdentifiant.trim()) {
      Alert.alert('Numéro requis', 'Veuillez saisir votre numéro de compteur ou référence client.');
      return;
    }
    if (!factureMontant || Number(factureMontant) <= 0) {
      Alert.alert('Montant invalide', 'Veuillez sélectionner ou saisir un montant valide.');
      return;
    }

    setFacturePaying(true);
    try {
      let category = 'EAU';
      let serviceName = 'SODECI';
      let subType: string | undefined = undefined;

      if (factureCat === 'EAU') {
        category = 'EAU';
        serviceName = 'SODECI';
      } else if (factureCat === 'ELEC') {
        category = 'ELECTRICITE';
        serviceName = 'CIE';
        subType = factureElecMode;
      } else if (factureCat === 'TEL') {
        category = 'TELEPHONE';
        serviceName = factureOp.includes('Orange') ? 'ORANGE' : factureOp.includes('MTN') ? 'MTN' : 'MOOV';
      } else if (factureCat === 'NET') {
        category = 'INTERNET';
        serviceName = 'CANALBOX';
      }

      const res = await fetchWithAuth('/locataire/utilities', {
        method: 'POST',
        body: JSON.stringify({
          category,
          serviceName,
          identifiant: factureIdentifiant.trim(),
          montant: Number(factureMontant),
          subType,
          paymentMethod: factureOp,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setFactureReceipt(json);
        if (json.facture) {
          setFactureHistory((prev) => [json.facture, ...prev]);
        }
        Alert.alert(
          'Paiement réussi !',
          `Votre règlement de ${fmt(Number(factureMontant))} pour ${serviceName} a été validé.`
        );
      } else {
        Alert.alert('Information', json.error || 'Règlement validé.');
      }
    } catch (e: any) {
      Alert.alert('Erreur', 'Impossible de contacter le service de règlement.');
    } finally {
      setFacturePaying(false);
    }
  };

  const handleGenerateAttestation = async () => {
    if (!data?.lease?.id || !data?.user?.id) {
      Alert.alert('Information', 'Aucun contrat de bail actif associé à votre compte.');
      return;
    }
    setGeneratingAttestation(true);
    try {
      const res = await fetchWithAuth(`/api/v1/users/${data.user.id}/attestations`, {
        method: 'POST',
        body: JSON.stringify({
          bailId: data.lease.id,
          raisonUsage: 'ADMINISTRATIF',
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setAttestationResult(json.attestation);
      } else {
        Alert.alert('Erreur', json.error || 'Impossible de générer l’attestation.');
      }
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Erreur réseau');
    } finally {
      setGeneratingAttestation(false);
    }
  };

  const loadOccupants = async () => {
    if (!data?.lease?.id) return;
    setLoadingOccupants(true);
    try {
      const res = await fetchWithAuth(`/api/v1/bails/${data.lease.id}/occupants`);
      const json = await res.json();
      if (res.ok && json.occupants) {
        setOccupantsList(json.occupants);
      }
    } catch (e) {
      console.warn('Erreur chargement occupants:', e);
    } finally {
      setLoadingOccupants(false);
    }
  };

  const handleAddOccupant = async () => {
    if (!data?.lease?.id) return;
    if (!occNom.trim() || !occPrenoms.trim()) {
      Alert.alert('Champs requis', 'Veuillez saisir le nom et les prénoms de l’occupant.');
      return;
    }
    if (!occHonneur) {
      Alert.alert('Engagement requis', 'Veuillez cocher la déclaration sur l’honneur (Art. 14 Loi 2013-546).');
      return;
    }
    setSubmittingOcc(true);
    try {
      const res = await fetchWithAuth(`/api/v1/bails/${data.lease.id}/occupants`, {
        method: 'POST',
        body: JSON.stringify({
          nom: occNom.trim(),
          prenoms: occPrenoms.trim(),
          typeLien: occTypeLien,
          dateNaissance: occBirth.trim() || undefined,
          telephone: occTel.trim() || undefined,
          numeroPiece: occNni.trim() || undefined,
          declarationHonneurSignee: true,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        Alert.alert('Occupant déclaré', 'L’occupant a été enregistré avec succès.');
        setNewOccupantModal(false);
        setOccNom('');
        setOccPrenoms('');
        setOccTel('');
        setOccNni('');
        setOccHonneur(false);
        loadOccupants();
      } else {
        Alert.alert('Erreur', json.error || 'Impossible de déclarer cet occupant.');
      }
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Erreur réseau');
    } finally {
      setSubmittingOcc(false);
    }
  };

  const loyer = data?.currentRentAmount || 0;
  const depositAmount = data?.depositAmount || (loyer * 2);
  const propName = data?.propertyName || (data?.hasLease === false ? 'Aucun bail actif' : 'Votre logement');
  const propCommune = data?.propertyCommune || '';
  const bailRef = data?.lease?.leaseReference || data?.leaseReference || (data?.hasLease === false ? 'Aucun contrat' : 'BAIL EN COURS');
  const fmt = (n: number) => n.toLocaleString('fr-FR') + ' F';

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#2C3E6B" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER NOUVELLE GÉNÉRATION AVEC BOUTON MENU MOBILE */}
      <View style={styles.mobileHeader}>
        {/* BOUTONS RETOUR & ACCUEIL */}
        <Pressable
          style={styles.headerNavIconBtn}
          onPress={() => {
            if (screen !== 'accueil') {
              setScreen('accueil');
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
          onPress={() => setScreen('accueil')}
          accessibilityLabel="Accueil"
        >
          <Home color="#FFFFFF" size={18} />
        </Pressable>
        <Pressable
          style={styles.menuBurgerBtn}
          onPress={() => setMenuOpen(true)}
          accessibilityLabel="Ouvrir le menu mobile"
        >
          <Menu color="#1A1D26" size={22} />
        </Pressable>

        <Pressable 
          style={styles.headerTitleContainer}
          onPress={() => setMenuOpen(true)}
        >
          <Text style={styles.headerAppBadge}>QAPRIL · ESPACE LOCATAIRE</Text>
          <View style={styles.headerCurrentScreenRow}>
            <Text style={styles.headerScreenName} numberOfLines={1}>
              {MENU_ITEMS.find((m) => m.id === screen)?.label || 'Accueil'}
            </Text>
            <ChevronDown color="#2C3E6B" size={15} />
          </View>
        </Pressable>

        <Pressable
          style={styles.iconBtn}
          onPress={() => router.push('/notifications' as any)}
        >
          <Bell color="#1A1D26" size={18} />
        </Pressable>
      </View>

      {/* MENU MOBILE DÉROULANT / TIROIR */}
      <Modal
        visible={menuOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setMenuOpen(false)}
      >
        <View style={styles.drawerBackdrop}>
          <Pressable 
            style={styles.drawerDismissArea} 
            onPress={() => setMenuOpen(false)} 
          />
          <View style={styles.drawerContent}>
            {/* EN-TÊTE DU MENU MOBILE */}
            <View style={styles.drawerHeader}>
              <View>
                <View style={styles.drawerBadgeRow}>
                  <Text style={styles.drawerBrand}>QAPRIL</Text>
                  <View style={styles.certifBadge}>
                    <ShieldCheck color="#10B981" size={12} />
                    <Text style={styles.certifBadgeText}>LOCATAIRE CERTIFIÉ</Text>
                  </View>
                </View>
                <Text style={styles.drawerUser}>{userName}</Text>
                <Text style={styles.drawerUserSub}>Bail {bailRef}{propCommune ? ` · ${propCommune}` : ''}</Text>
              </View>
              <Pressable
                style={styles.drawerCloseBtn}
                onPress={() => setMenuOpen(false)}
              >
                <X color="#1A1D26" size={20} />
              </Pressable>
            </View>

            {/* SECTIONS & ÉCRANS DE L'APPLICATION */}
            <ScrollView style={styles.drawerScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.drawerSectionTitle}>ÉCRANS & SERVICES LOCATAIRE</Text>
              
              {MENU_ITEMS.map((item) => {
                const IconComponent = item.icon;
                const active = screen === item.id;
                return (
                  <Pressable
                    key={item.id}
                    style={[styles.drawerItem, active && styles.drawerItemActive]}
                    onPress={() => {
                      if (item.id === 'manuel') {
                        setMenuOpen(false);
                        Linking.openURL('https://qapril.net/manuel');
                        return;
                      }
                      setScreen(item.id);
                      setMenuOpen(false);
                    }}
                  >
                    <View style={[styles.drawerItemIconWrap, active && styles.drawerItemIconActive]}>
                      <IconComponent color={active ? '#FFFFFF' : '#2C3E6B'} size={18} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.drawerItemLabel, active && styles.drawerItemLabelActive]}>
                        {item.label}
                      </Text>
                      <Text style={[styles.drawerItemDesc, active && styles.drawerItemDescActive]} numberOfLines={1}>
                        {item.desc}
                      </Text>
                    </View>
                    <ChevronRight color={active ? '#2C3E6B' : '#9CA3AF'} size={16} />
                  </Pressable>
                );
              })}

              <View style={styles.drawerDivider} />

              <Text style={styles.drawerSectionTitle}>ESPACE PERSONNEL</Text>
              <Pressable
                style={styles.drawerItem}
                onPress={() => {
                  setMenuOpen(false);
                  router.push('/(tabs)/profile' as any);
                }}
              >
                <View style={styles.drawerItemIconWrap}>
                  <User color="#2C3E6B" size={18} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.drawerItemLabel}>Mon profil & Sécurité</Text>
                  <Text style={styles.drawerItemDesc}>Paramètres du compte et identifiants</Text>
                </View>
                <ChevronRight color="#9CA3AF" size={16} />
              </Pressable>

              <Pressable
                style={[styles.drawerItem, { marginTop: 8 }]}
                onPress={() => {
                  setMenuOpen(false);
                  setTimeout(() => {
                    Alert.alert(
                      'Déconnexion',
                      'Voulez-vous fermer votre session mobile locataire ?',
                      [
                        { text: 'Annuler', style: 'cancel' },
                        {
                          text: 'Se déconnecter',
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
                  <LogOut color="#EF4444" size={18} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.drawerItemLabel, { color: '#EF4444' }]}>Se déconnecter</Text>
                  <Text style={styles.drawerItemDesc}>Fermer la session mobile</Text>
                </View>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* =========================================================
            ÉCRAN 1 · ACCUEIL LOCATAIRE
           ========================================================= */}
        {screen === 'accueil' && (
          <View style={styles.sectionGap}>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.subMuted}>QAPRIL · Espace locataire</Text>
                <Text style={styles.h1}>{userName}</Text>
                <Text style={styles.subMuted}>{propName}</Text>
              </View>
              <Pressable
                style={styles.iconBtn}
                onPress={() => router.push('/notifications' as any)}
              >
                <Bell color="#1A1D26" size={20} />
              </Pressable>
            </View>

            {/* HERO LOYER OU ÉTAT SANS BAIL (P0-02 & P0-04) */}
            {data?.hasLease && loyer > 0 ? (
              <View style={styles.heroBlue}>
                <View style={styles.rowBetween}>
                  <Text style={styles.heroSub}>LOYER DU MOIS EN COURS</Text>
                  <View style={
                    data?.rentStatus === 'PAID'
                      ? styles.pillOk
                      : data?.rentStatus === 'DECLARED_PENDING'
                      ? [styles.pillOk, { backgroundColor: '#FEF3C7' }]
                      : [styles.pillOk, { backgroundColor: '#FEE2E2' }]
                  }>
                    <Text style={[
                      styles.pillOkText,
                      data?.rentStatus === 'DECLARED_PENDING' && { color: '#B45309' },
                      data?.rentStatus !== 'PAID' && data?.rentStatus !== 'DECLARED_PENDING' && { color: '#B91C1C' },
                    ]}>
                      {data?.rentStatus === 'PAID'
                        ? 'À jour · Loyer réglé'
                        : data?.rentStatus === 'DECLARED_PENDING'
                        ? 'En attente de confirmation'
                        : 'À régler'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.heroBig}>{fmt(loyer)}</Text>
                <Text style={styles.heroSub}>
                  Bail {bailRef} · Prochaine échéance le {data?.lease?.paymentDay || 5} du mois · Frais : 0 F
                </Text>

                {data?.rentStatus === 'DECLARED_PENDING' ? (
                  <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: 12, borderRadius: 10, marginTop: 10 }}>
                    <Text style={{ color: '#fff', fontSize: 13, lineHeight: 18 }}>
                      Paiement de {fmt(data?.pendingPayment?.amount || loyer)} déclaré via {data?.pendingPayment?.paymentMethod || 'autre moyen'}. En attente de confirmation par votre bailleur pour l'émission de la quittance officielle.
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.heroActions, { flexWrap: 'wrap', gap: 8 }]}>
                    <Pressable style={styles.btnWhite} onPress={() => setScreen('payer')}>
                      <Text style={styles.btnWhiteText}>Payer maintenant</Text>
                    </Pressable>
                    <Pressable
                      style={styles.btnOutlineWhite}
                      onPress={() => {
                        setAutreMontant(String(loyer));
                        setPayAutrementModal(true);
                      }}
                    >
                      <Text style={styles.btnOutlineWhiteText}>J’ai payé autrement</Text>
                    </Pressable>
                    <Pressable style={styles.btnOutlineWhite} onPress={() => setProcheModal(true)}>
                      <Text style={styles.btnOutlineWhiteText}>Faire payer par un proche</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            ) : pendingDeclaration ? (
              <View style={[styles.card, { borderColor: '#FCD34D', backgroundColor: '#FFFDF5', padding: 20 }]}>
                <View style={styles.rowBetween}>
                  <Text style={[styles.label, { color: '#92400E', fontWeight: '800' }]}>DÉCLARATION EN COURS</Text>
                  <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#B45309' }}>En attente du bailleur</Text>
                  </View>
                </View>
                <Text style={[styles.h2, { color: '#1A1D26', marginTop: 6 }]}>
                  {pendingDeclaration.logementDesc || 'Logement déclaré'}
                </Text>
                <Text style={[styles.subMuted, { marginTop: 2 }]}>
                  Bailleur : {pendingDeclaration.bailleurNom} ({pendingDeclaration.bailleurTel}) · Loyer : {fmt(Number(pendingDeclaration.loyer) || 0)}
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 8, lineHeight: 17 }}>
                  Votre déclaration a été enregistrée. Dès que votre propriétaire ou agence valide son compte, votre bail sera activé et vos quittances débloquées.
                </Text>
                <Pressable
                  style={[styles.btnPrimary, { backgroundColor: '#1E7E4E', marginTop: 12 }]}
                  onPress={() => setInviteModal(true)}
                >
                  <Share2 color="#fff" size={16} />
                  <Text style={styles.btnPrimaryText}>Relancer l'invitation au bailleur</Text>
                </Pressable>
              </View>
            ) : (
              <View style={[styles.card, { borderColor: '#CBD5E1', backgroundColor: '#FFFFFF', padding: 22, alignItems: 'center' }]}>
                <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                  <Home color="#2C3E6B" size={28} />
                </View>
                <Text style={[styles.h1, { fontSize: 20, textAlign: 'center', color: '#1A1D26' }]}>
                  Aucun logement déclaré
                </Text>
                <Text style={[styles.subMuted, { textAlign: 'center', marginTop: 6, marginBottom: 16, maxWidth: 300 }]}>
                  Déclarez votre logement pour inviter votre bailleur, activer votre bail officiel et recevoir vos quittances numériques.
                </Text>
                <View style={{ flexDirection: 'row', gap: 10, width: '100%', flexWrap: 'wrap' }}>
                  <Pressable
                    style={[styles.btnPrimary, { flex: 1, minWidth: 140, backgroundColor: '#2C3E6B' }]}
                    onPress={() => setDeclareModal(true)}
                  >
                    <Text style={styles.btnPrimaryText}>Déclarer mon logement</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.btnSecondary, { flex: 1, minWidth: 140 }]}
                    onPress={() => setInviteModal(true)}
                  >
                    <Text style={styles.btnSecondaryText}>Inviter mon bailleur</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* HERO FACTURES & FLUIDES (Eau, Électricité) — Réservé aux baux actifs */}
            {data?.hasLease && (
              <View style={[styles.card, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', borderWidth: 1.5 }]}>
                <View style={styles.rowBetween}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Zap color="#E67E22" size={16} />
                    <Text style={[styles.label, { marginBottom: 0 }]}>RÈGLEMENT FACTURES & FLUIDES</Text>
                  </View>
                  <Pressable onPress={() => { setFactureCat('EAU'); setScreen('factures'); }}>
                    <Text style={[styles.cardSub, { color: '#2C3E6B', fontWeight: '700' }]}>Tout régler ›</Text>
                  </Pressable>
                </View>

                <Text style={[styles.subMuted, { marginTop: 4, marginBottom: 12 }]}>
                  Réglez vos charges et factures de compteurs individuels (SODECI, CIE).
                </Text>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Pressable
                    style={[styles.factureQuickBtn, { backgroundColor: '#E0F2FE', borderColor: '#BAE6FD' }]}
                    onPress={() => { setFactureCat('EAU'); setScreen('factures'); }}
                  >
                    <Droplets color="#0284C7" size={20} />
                    <Text style={[styles.factureQuickLabel, { color: '#0369A1' }]}>Eau</Text>
                    <Text style={styles.factureQuickSub}>SODECI</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.factureQuickBtn, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}
                    onPress={() => { setFactureCat('ELEC'); setScreen('factures'); }}
                  >
                    <Zap color="#D97706" size={20} />
                    <Text style={[styles.factureQuickLabel, { color: '#B45309' }]}>Électricité</Text>
                    <Text style={styles.factureQuickSub}>CIE</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* GRILLE DE NAVIGATION RAPIDE VERS LES 8 ÉCRANS */}
            <Text style={styles.label}>MON DOSSIER LOCATIF</Text>
            <View style={styles.grid2}>
              <Pressable style={styles.cardGrid} onPress={() => setScreen('quittances')}>
                <FileText color="#2C3E6B" size={20} />
                <Text style={styles.cardTitle}>Quittances</Text>
                <Text style={styles.cardSub}>{receiptsList.length} quittance(s) certifiée(s)</Text>
              </Pressable>
              <Pressable style={styles.cardGrid} onPress={() => setScreen('caution')}>
                <Lock color="#1E7E4E" size={20} />
                <Text style={styles.cardTitle}>Ma caution</Text>
                <Text style={styles.cardSub}>{fmt(depositAmount)} consignés</Text>
              </Pressable>
              <Pressable style={styles.cardGrid} onPress={() => setScreen('bail')}>
                <CalendarClock color="#2C3E6B" size={20} />
                <Text style={styles.cardTitle}>Mon bail</Text>
                <Text style={styles.cardSub}>Calendrier légal · DGI</Text>
              </Pressable>
              <Pressable style={styles.cardGrid} onPress={() => setScreen('documents')}>
                <QrCode color="#D4912A" size={20} />
                <Text style={styles.cardTitle}>Attestation QR</Text>
                <Text style={styles.cardSub}>Résidence en 10 s</Text>
              </Pressable>
              <Pressable style={styles.cardGrid} onPress={() => setScreen('passeport')}>
                <ShieldCheck color="#1E7E4E" size={20} />
                <Text style={styles.cardTitle}>Mon passeport</Text>
                <Text style={styles.cardSub}>Niveau KYC {data?.user?.kycLevel ?? 1} · vérifié</Text>
              </Pressable>
              <Pressable style={styles.cardGrid} onPress={() => setScreen('recherche')}>
                <Search color="#2C3E6B" size={20} />
                <Text style={styles.cardTitle}>Ma recherche</Text>
                <Text style={styles.cardSub}>{marketList.length} offre(s) vérifiée(s)</Text>
              </Pressable>
            </View>
          </View>
        )}


        {/* =========================================================
            ÉCRAN FACTURES & FLUIDES (SODECI, CIE, MOBILE, INTERNET)
           ========================================================= */}
        {screen === 'factures' && (
          <View style={styles.sectionGap}>
            <Pressable onPress={() => setScreen('accueil')} style={styles.backRow}>
              <ChevronLeft color="#2C3E6B" size={18} />
              <Text style={styles.backText}>Retour à l’accueil</Text>
            </Pressable>
            <Text style={styles.h1}>Régler mes factures</Text>
            <Text style={styles.subMuted}>
              Règlement certifié et instantané de vos fluides, recharges CIE et abonnements en Côte d'Ivoire.
            </Text>

            {/* SÉLECTEUR DE CATÉGORIES (EAU, ÉLEC, MOBILE, NET) */}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              {[
                { id: 'EAU', label: 'Eau', sub: 'SODECI', icon: Droplets, color: '#0284C7' },
                { id: 'ELEC', label: 'Élec', sub: 'CIE / Carte', icon: Zap, color: '#D97706' },
                { id: 'TEL', label: 'Mobile', sub: 'Pass / Crédit', icon: Smartphone, color: '#16A34A' },
                { id: 'NET', label: 'Internet', sub: 'Fibre / 4G', icon: Wifi, color: '#4F46E5' },
              ].map((catItem) => {
                const IconC = catItem.icon;
                const active = factureCat === catItem.id;
                return (
                  <Pressable
                    key={catItem.id}
                    style={[styles.factureCatBtn, active && styles.factureCatBtnActive]}
                    onPress={() => {
                      setFactureCat(catItem.id as any);
                      setFactureReceipt(null);
                    }}
                  >
                    <IconC color={active ? '#FFFFFF' : catItem.color} size={18} />
                    <Text style={[styles.factureCatLabel, active && styles.factureCatLabelActive]}>
                      {catItem.label}
                    </Text>
                    <Text style={[styles.factureCatSub, active && styles.factureCatSubActive]}>
                      {catItem.sub}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* FORMULAIRE DE RÈGLEMENT */}
            <View style={styles.card}>
              {/* SOUS-TYPE POUR CIE : PRÉPAYÉ OU POSTPAYÉ */}
              {factureCat === 'ELEC' && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={styles.label}>TYPE DE COMPTEUR CIE</Text>
                  <View style={styles.segRow}>
                    {[
                      { id: 'PREPAYE', label: 'Compteur à Carte (Recharge)' },
                      { id: 'POSTPAYE', label: 'Facture Mensuelle CIE' },
                    ].map((m) => (
                      <Pressable
                        key={m.id}
                        onPress={() => setFactureElecMode(m.id as any)}
                        style={[styles.segBtn, factureElecMode === m.id && styles.segBtnOn]}
                      >
                        <Text style={[styles.segText, factureElecMode === m.id && styles.segTextOn]}>
                          {m.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {/* IDENTIFIANT (COMPTEUR / RÉFÉRENCE / TÉLÉPHONE) */}
              <Text style={styles.label}>
                {factureCat === 'EAU'
                  ? "NUMÉRO D'ABONNÉ / COMPTEUR SODECI"
                  : factureCat === 'ELEC'
                  ? 'NUMÉRO DU COMPTEUR CIE'
                  : factureCat === 'TEL'
                  ? 'NUMÉRO DE TÉLÉPHONE DU DESTINATAIRE'
                  : 'RÉFÉRENCE CONTRAT / BOX INTERNET'}
              </Text>
              <TextInput
                style={styles.factureInput}
                placeholder={
                  factureCat === 'EAU'
                    ? 'Ex: 0145892301'
                    : factureCat === 'ELEC'
                    ? 'Ex: 0145892341'
                    : factureCat === 'TEL'
                    ? 'Ex: 0707070707'
                    : 'Ex: FIB-45892'
                }
                placeholderTextColor="#9CA3AF"
                value={factureIdentifiant}
                onChangeText={setFactureIdentifiant}
                keyboardType={factureCat === 'NET' ? 'default' : 'numeric'}
              />

              {/* SÉLECTEUR DE MONTANTS RAPIDES */}
              <Text style={[styles.label, { marginTop: 14 }]}>MONTANT DE LA RECHARGE / FACTURE</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                {[2000, 5000, 10000, 20000, 50000].map((amt) => (
                  <Pressable
                    key={amt}
                    onPress={() => setFactureMontant(amt)}
                    style={[
                      styles.segBtn,
                      { paddingHorizontal: 12, paddingVertical: 8 },
                      factureMontant === amt && styles.segBtnOn,
                    ]}
                  >
                    <Text style={[styles.segText, factureMontant === amt && styles.segTextOn]}>
                      {fmt(amt)}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <TextInput
                style={[styles.factureInput, { marginTop: 8 }]}
                placeholder="Autre montant libre (FCFA)"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={factureMontant ? String(factureMontant) : ''}
                onChangeText={(val) => setFactureMontant(Number(val.replace(/[^0-9]/g, '')) || 0)}
              />

              {/* OPÉRATEUR MOBILE MONEY */}
              <Text style={[styles.label, { marginTop: 14 }]}>OPÉRATEUR DE PAIEMENT</Text>
              <View style={styles.segRow}>
                {(['Wave', 'Orange Money', 'MTN MoMo', 'Moov'] as const).map((op) => (
                  <Pressable
                    key={op}
                    onPress={() => setFactureOp(op)}
                    style={[styles.segBtn, factureOp === op && styles.segBtnOn]}
                  >
                    <Text style={[styles.segText, factureOp === op && styles.segTextOn]}>{op}</Text>
                  </Pressable>
                ))}
              </View>

              {/* BOUTON D'ACTION PRINCIPAL */}
              <Pressable
                style={[styles.btnPrimary, { marginTop: 16 }]}
                onPress={handlePayFacture}
                disabled={facturePaying}
              >
                {facturePaying ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Zap color="#fff" size={18} />
                    <Text style={styles.btnPrimaryText}>
                      Régler {fmt(factureMontant)} via {factureOp}
                    </Text>
                  </>
                )}
              </Pressable>
            </View>

            {/* REÇU / CODE DE RECHARGE TOKEN APRÈS PAIEMENT */}
            {factureReceipt && (
              <View style={[styles.card, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 color="#16A34A" size={22} />
                  <Text style={[styles.boldText, { color: '#15803D', fontSize: 16 }]}>
                    Règlement confirmé avec succès !
                  </Text>
                </View>
                <Text style={[styles.subMuted, { marginTop: 4 }]}>
                  Référence : {factureReceipt.facture?.id || 'FAC-2026-VAL'} · Montant : {fmt(factureMontant)}
                </Text>

                {factureReceipt.token && (
                  <View style={{ marginTop: 12, padding: 14, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#86EFAC', alignItems: 'center' }}>
                    <Text style={[styles.label, { color: '#166534', marginBottom: 4 }]}>
                      CODE TOKEN DE RECHARGE CIE (À SAISIR SUR VOTRE COMPTEUR)
                    </Text>
                    <Text style={{ fontSize: 20, fontWeight: '600', color: '#15803D', letterSpacing: 2, fontFamily: 'monospace' }}>
                      {factureReceipt.token}
                    </Text>
                    <Pressable
                      style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#DCFCE7', borderRadius: 8 }}
                      onPress={() => {
                        Alert.alert('Code copié', `Le code ${factureReceipt.token} est copié dans le presse-papier.`);
                        setCopiedToken(true);
                      }}
                    >
                      <Copy color="#15803D" size={14} />
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#15803D' }}>
                        {copiedToken ? 'Code copié !' : 'Copier le code'}
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            )}

            {/* HISTORIQUE DES RÈGLEMENTS DE FLUIDES */}
            <Text style={styles.label}>HISTORIQUE DES RÈGLEMENTS</Text>
            {factureHistory.length === 0 ? (
              <View style={[styles.card, { alignItems: 'center', paddingVertical: 24 }]}>
                <Receipt color="#9CA3AF" size={28} />
                <Text style={[styles.subMuted, { textAlign: 'center', marginTop: 6 }]}>
                  Aucun règlement de fluide enregistré pour le moment.
                </Text>
              </View>
            ) : (
              factureHistory.slice(0, 8).map((fac: any, idx: number) => (
                <View key={fac.id || idx} style={styles.card}>
                  <View style={styles.rowBetween}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' }}>
                        <Zap color="#2C3E6B" size={16} />
                      </View>
                      <View>
                        <Text style={styles.boldText}>{fac.typeUtility || 'Fluide'}</Text>
                        <Text style={styles.subMuted}>{fac.identifiant || 'Compteur'}</Text>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.boldText, { color: '#2C3E6B' }]}>{fmt(fac.montant || 0)}</Text>
                      <Text style={[styles.subMuted, { color: '#16A34A', fontSize: 10, fontWeight: '700' }]}>RÉGLÉ</Text>
                    </View>
                  </View>
                  {fac.token && (
                    <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
                      <Text style={{ fontSize: 11, color: '#15803D', fontFamily: 'monospace', fontWeight: '600' }}>
                        Token: {fac.token}
                      </Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* =========================================================
            ÉCRAN 2 · PAYER LE LOYER
           ========================================================= */}
        {screen === 'payer' && (
          <View style={styles.sectionGap}>
            <Pressable onPress={() => setScreen('accueil')} style={styles.backRow}>
              <ChevronLeft color="#2C3E6B" size={18} />
              <Text style={styles.backText}>Retour à l’accueil</Text>
            </Pressable>
            <Text style={styles.h1}>Payer mon loyer</Text>
            <Text style={styles.subMuted}>
              Quittance officielle émise automatiquement dès confirmation du règlement
            </Text>

            <View style={styles.card}>
              <Text style={styles.label}>PÉRIODE À RÉGLER (PLAFOND LÉGAL 2 MOIS D’AVANCE · ART. 416 CCH)</Text>
              <View style={styles.segRow}>
                {[
                  [1, '1 mois (Déc.)'],
                  [2, '2 mois (Déc. + Janv.)'],
                ].map(([m, lbl]) => (
                  <Pressable
                    key={m}
                    onPress={() => setPayPeriod(Number(m))}
                    style={[styles.segBtn, payPeriod === m && styles.segBtnOn]}
                  >
                    <Text style={[styles.segText, payPeriod === m && styles.segTextOn]}>{lbl}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[styles.label, { marginTop: 14 }]}>OPÉRATEUR MOBILE MONEY</Text>
              <View style={styles.segRow}>
                {(['Wave', 'Orange Money', 'MTN MoMo', 'Moov'] as const).map((op) => (
                  <Pressable
                    key={op}
                    onPress={() => setPayOp(op)}
                    style={[styles.segBtn, payOp === op && styles.segBtnOn]}
                  >
                    <Text style={[styles.segText, payOp === op && styles.segTextOn]}>{op}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.recapBox}>
                <View style={styles.rowBetween}>
                  <Text style={styles.subMuted}>Montant du loyer ({payPeriod} mois)</Text>
                  <Text style={styles.boldText}>{fmt(loyer * payPeriod)}</Text>
                </View>
                <View style={styles.rowBetween}>
                  <Text style={styles.subMuted}>Frais QAPRIL locataire</Text>
                  <Text style={[styles.boldText, { color: '#1E7E4E' }]}>0 F (Gratuit)</Text>
                </View>
                <View style={[styles.rowBetween, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E5E7EF' }]}>
                  <Text style={styles.boldText}>Total à payer</Text>
                  <Text style={[styles.h2, { color: '#2C3E6B' }]}>{fmt(loyer * payPeriod)}</Text>
                </View>
              </View>

              <Pressable
                style={styles.btnPrimary}
                onPress={() =>
                  Alert.alert(
                    'Paiement initié',
                    `Redirection vers ${payOp} pour ${fmt(loyer * payPeriod)}. Votre quittance officielle sera émise instantanément.`
                  )
                }
              >
                <CreditCard color="#fff" size={18} />
                <Text style={styles.btnPrimaryText}>Payer {fmt(loyer * payPeriod)} avec {payOp}</Text>
              </Pressable>

              <Pressable style={styles.btnGhost} onPress={() => setProcheModal(true)}>
                <Share2 color="#2C3E6B" size={16} />
                <Text style={styles.btnGhostText}>Faire payer par un proche (lien de paiement tiers)</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* =========================================================
            ÉCRAN 3 · QUITTANCES
           ========================================================= */}
        {screen === 'quittances' && (
          <View style={styles.sectionGap}>
            <Text style={styles.h1}>Mes quittances</Text>
            <Text style={styles.subMuted}>
              Mes quittances — la preuve de vos paiements, acceptée par les banques et les administrations
            </Text>

            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.boldText}>{receiptsList.length} quittance(s) enregistrée(s)</Text>
                <View style={styles.pillOk}>
                  <Text style={styles.pillOkText}>Conforme Loi 2019-576</Text>
                </View>
              </View>
            </View>

            {receiptsList.length === 0 ? (
              <View style={[styles.card, { alignItems: 'center', paddingVertical: 32 }]}>
                <FileText color="#9CA3AF" size={36} />
                <Text style={[styles.boldText, { marginTop: 10, color: '#64748B' }]}>Aucune quittance émise</Text>
                <Text style={[styles.subMuted, { textAlign: 'center', marginTop: 4 }]}>
                  Vos quittances apparaîtront ici dès le règlement validé.
                </Text>
              </View>
            ) : (
              receiptsList.map((q: any, i: number) => (
                <View key={q.id || i} style={styles.cardRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.boldText}>{q.period || q.periodMonth} · {fmt(q.amount)}</Text>
                    <Text style={styles.subMuted}>
                      {q.date ? `Payé le ${q.date}` : ''} {q.paymentMethod ? `via ${q.paymentMethod}` : ''} {q.receiptRef ? `· Réf. ${q.receiptRef}` : ''}
                    </Text>
                  </View>
                  <Pressable
                    style={styles.pillTint}
                    onPress={() => Alert.alert('Quittance PDF', `Quittance certifiée ${q.receiptRef || q.period} horodatée.`)}
                  >
                    <Text style={styles.pillTintText}>PDF</Text>
                  </Pressable>
                </View>
              ))
            )}
          </View>
        )}

        {/* =========================================================
            ÉCRAN 4 · MA CAUTION
           ========================================================= */}
        {screen === 'caution' && (
          <View style={styles.sectionGap}>
            <Text style={styles.h1}>Ma caution</Text>
            <Text style={styles.subMuted}>
              Plafonnée à 2 mois de loyer (art. 415 CCH) · protégée par l’état des lieux contradictoire
            </Text>

            <View style={styles.heroBlue}>
              <Text style={styles.heroSub}>DÉPÔT DE GARANTIE CONSIGNÉ</Text>
              <Text style={styles.heroBig}>{fmt(depositAmount)}</Text>
              <Text style={styles.heroSub}>
                {data?.hasLease ? 'Restitution légale sous 30 jours maximum après remise des clés (art. 416 CCH)' : 'Aucun dépôt consigné actuellement'}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.boldText}>Règles de protection de votre caution</Text>
              <Text style={[styles.subMuted, { marginTop: 6 }]}>
                • Aucune retenue ne peut être effectuée sans comparaison entre l’état des lieux d’entrée et de sortie signé des deux parties (M-EDL).{'\n'}
                • L’usure normale du logement n’est jamais imputable au locataire.
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.boldText}>Tirelire « Ma prochaine caution »</Text>
                <Text style={[styles.boldText, { color: '#1E7E4E' }]}>{fmt(epargneAmount)} / {fmt(300000)}</Text>
              </View>
              <Text style={[styles.subMuted, { marginTop: 4 }]}>
                Épargnez à votre rythme pour votre futur déménagement. Vos fonds restent disponibles à tout moment.
              </Text>
              <Pressable
                style={[styles.btnPrimary, { marginTop: 12 }]}
                onPress={() => {
                  setEpargneAmount((prev) => prev + 25000);
                  Alert.alert('Épargne créditée', '+25 000 F ajoutés à votre tirelire caution.');
                }}
              >
                <Text style={styles.btnPrimaryText}>Ajouter 25 000 F à ma tirelire</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* =========================================================
            ÉCRAN 5 · MON BAIL — CALENDRIER LÉGAL & DEUX HORLOGES
           ========================================================= */}
        {screen === 'bail' && (
          <View style={styles.sectionGap}>
            <Text style={styles.h1}>Mon bail · {bailRef}</Text>
            <Text style={styles.subMuted}>
              Enregistré à la DGI (art. 414 CCH) · Principe des Deux Horloges actif
            </Text>

            <View style={styles.card}>
              <Text style={styles.label}>INFORMATIONS CONTRACTUELLES</Text>
              <View style={[styles.rowBetween, { marginTop: 8 }]}>
                <Text style={styles.subMuted}>Période du contrat</Text>
                <Text style={styles.boldText}>
                  {data?.lease?.startDate ? new Date(data.lease.startDate).toLocaleDateString('fr-FR') : 'Date non renseignée'} → {data?.lease?.endDate ? new Date(data.lease.endDate).toLocaleDateString('fr-FR') : 'Durée indéterminée'}
                </Text>
              </View>
              <View style={[styles.rowBetween, { marginTop: 6 }]}>
                <Text style={styles.subMuted}>Loyer mensuel contractuel</Text>
                <Text style={styles.boldText}>{fmt(loyer)}</Text>
              </View>
              <View style={[styles.rowBetween, { marginTop: 6 }]}>
                <Text style={styles.subMuted}>Jour d’échéance</Text>
                <Text style={styles.boldText}>Le {data?.lease?.paymentDay || 5} du mois</Text>
              </View>
              <View style={[styles.rowBetween, { marginTop: 6 }]}>
                <Text style={styles.subMuted}>Dépôt de garantie consigné</Text>
                <Text style={styles.boldText}>{fmt(depositAmount)}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.boldText}>Droits légaux garantis par QAPRIL</Text>
              <Text style={[styles.subMuted, { marginTop: 6 }]}>
                • Révision de loyer interdite avant 3 ans et préavis de 3 mois.{'\n'}
                • Toute clause contraire au Code de la Construction et de l’Habitat est réputée non écrite (art. 420 CCH).
              </Text>
            </View>

            {/* P1-08: DONNER CONGÉ (PRÉAVIS DE DÉPART) */}
            <View style={[styles.card, { borderColor: '#CBD5E1', backgroundColor: '#F8FAFC' }]}>
              <View style={styles.rowBetween}>
                <Text style={[styles.boldText, { fontSize: 16, color: '#1A1D26' }]}>Fin de bail & Déménagement</Text>
                <View style={{ backgroundColor: '#E2E8F0', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#475569' }}>Art. 434 CCH</Text>
                </View>
              </View>
              <Text style={[styles.subMuted, { marginTop: 4, lineHeight: 18 }]}>
                Vous souhaitez quitter votre logement ? Générez votre notification formelle de préavis de départ conforme à la loi (délai légal de 30 jours minimum).
              </Text>
              <Pressable
                style={[styles.btnSecondary, { marginTop: 12, borderColor: '#2C3E6B' }]}
                onPress={() => setCongeModal(true)}
              >
                <FileText color="#2C3E6B" size={16} />
                <Text style={[styles.btnSecondaryText, { color: '#2C3E6B' }]}>Donner congé (Préavis officiel)</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* =========================================================
            ÉCRAN 6 · MES DOCUMENTS & ATTESTATION DE RÉSIDENCE QR
           ========================================================= */}
        {screen === 'documents' && (
          <View style={styles.sectionGap}>
            <Text style={styles.h1}>Mes documents</Text>
            <Text style={styles.subMuted}>
              Coffre-fort numérique · Attestation de résidence générée en 10 secondes
            </Text>

            <Pressable style={styles.heroBlue} onPress={() => setAttestationModal(true)}>
              <View style={styles.rowBetween}>
                <Text style={styles.heroSub}>JUSTIFICATIF DE DOMICILE OFFICIEL</Text>
                <QrCode color="#fff" size={22} />
              </View>
              <Text style={[styles.heroBig, { fontSize: 20, marginTop: 6 }]}>
                Générer mon attestation de résidence QR
              </Text>
              <Text style={styles.heroSub}>
                Générée en 10 s · acceptée pour banque, école, consulat et administrations
              </Text>
            </Pressable>

            {data?.hasLease && (
              <Pressable
                style={[styles.cardRow, { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1' }]}
                onPress={() => {
                  loadOccupants();
                  setOccupantsModal(true);
                }}
              >
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' }}>
                  <Users color="#1B4D3E" size={20} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.boldText, { color: '#0F172A' }]}>Occupants déclarés du logement</Text>
                  <Text style={styles.subMuted}>Déclarer conjoint, enfants majeurs ou co-résidents</Text>
                </View>
                <ChevronRight color="#64748B" size={18} />
              </Pressable>
            )}

            {data?.hasLease ? (
              [
                { t: `Contrat de bail certifié (${bailRef})`, s: `${propName} · Enregistré et certifié` },
                { t: 'Attestation de dépôt de garantie', s: `${fmt(depositAmount)} séquestrés conformes` },
              ].map((doc, i) => (
                <Pressable
                  key={i}
                  style={styles.cardRow}
                  onPress={() => Alert.alert(doc.t, 'Document contractuel certifié.')}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.boldText}>{doc.t}</Text>
                    <Text style={styles.subMuted}>{doc.s}</Text>
                  </View>
                  <ChevronRight color="#6B7280" size={18} />
                </Pressable>
              ))
            ) : (
              <View style={[styles.card, { alignItems: 'center', paddingVertical: 28 }]}>
                <Folder color="#9CA3AF" size={32} />
                <Text style={[styles.boldText, { marginTop: 8, color: '#64748B' }]}>Aucun document actif</Text>
                <Text style={[styles.subMuted, { textAlign: 'center', marginTop: 4 }]}>
                  Vos pièces contractuelles apparaîtront dès l’activation de votre bail.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* =========================================================
            ÉCRAN 7 · MON PASSEPORT LOCATIF
           ========================================================= */}
        {screen === 'passeport' && (
          <View style={styles.sectionGap}>
            <Text style={styles.h1}>Mon Passeport Locatif</Text>
            <Text style={styles.subMuted}>
              Vous contrôlez exactement ce qu’un futur bailleur peut voir
            </Text>

            <View style={styles.heroBlue}>
              <View style={styles.rowBetween}>
                <Text style={styles.heroSub}>INDICE DE CONFIANCE LOCATIVE</Text>
                <View style={styles.pillOk}>
                  <Text style={styles.pillOkText}>Tranche A · Excellente</Text>
                </View>
              </View>
              <Text style={styles.heroBig}>{data?.paidReceiptsCount ?? 0} loyer(s) à l’heure</Text>
              <Text style={styles.heroSub}>
                Votre score chiffré exact vous appartient : un bailleur ne voit que votre tranche (A, B ou C)
              </Text>
              <Pressable
                style={[styles.btnWhite, { marginTop: 12 }]}
                onPress={() => setVueBailleurModal(true)}
              >
                <Text style={styles.btnWhiteText}>Aperçu : « Voir ce que voit un bailleur »</Text>
              </Pressable>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>CE QUE JE PARTAGE LORS D’UNE CANDIDATURE</Text>
              <Pressable style={styles.toggleRow} onPress={() => setShareRev(!shareRev)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.boldText}>Badge « Revenus ≥ 3 × loyer »</Text>
                  <Text style={styles.subMuted}>Sans jamais révéler le montant de votre salaire</Text>
                </View>
                <Text style={[styles.boldText, { color: shareRev ? '#1E7E4E' : '#6B7280' }]}>
                  {shareRev ? 'Partagé' : 'Masqué'}
                </Text>
              </Pressable>

              <Pressable style={styles.toggleRow} onPress={() => setShareGarant(!shareGarant)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.boldText}>Badge « Garant engagé »</Text>
                  <Text style={styles.subMuted}>Indique la présence d’une caution solidaire vérifiée</Text>
                </View>
                <Text style={[styles.boldText, { color: shareGarant ? '#1E7E4E' : '#6B7280' }]}>
                  {shareGarant ? 'Partagé' : 'Masqué'}
                </Text>
              </Pressable>

              <Pressable style={styles.toggleRow} onPress={() => setShareScore(!shareScore)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.boldText}>Score chiffré détaillé & pièces CNI</Text>
                  <Text style={styles.subMuted}>Protégés par défaut</Text>
                </View>
                <Text style={[styles.boldText, { color: shareScore ? '#D4912A' : '#1E7E4E' }]}>
                  {shareScore ? 'Ouvert' : 'Protégé'}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* =========================================================
            ÉCRAN 8 · MA RECHERCHE (VIVIER QAPRIL)
           ========================================================= */}
        {screen === 'recherche' && (
          <View style={styles.sectionGap}>
            <Pressable onPress={() => setScreen('accueil')} style={styles.backRow}>
              <ChevronLeft color="#2C3E6B" size={18} />
              <Text style={styles.backText}>Retour à l’accueil</Text>
            </Pressable>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.h1}>Trouver un logement</Text>
                <Text style={styles.subMuted}>
                  Biens certifiés QAPRIL conformes et vérifiés avec contrat officiel
                </Text>
              </View>
              <Pressable
                onPress={() => setSearchActive(!searchActive)}
                style={[styles.pillOk, !searchActive && { backgroundColor: '#E5E7EF' }]}
              >
                <Text style={[styles.pillOkText, !searchActive && { color: '#6B7280' }]}>
                  {searchActive ? 'Veille active' : 'En pause'}
                </Text>
              </Pressable>
            </View>

            {/* 3 SOUS-ONGLETS RECHERCHE (IC-01 Section 6) */}
            <View style={{ flexDirection: 'row', gap: 6, marginVertical: 6 }}>
              {[
                { id: 'offres', label: 'Offres vérifiées' },
                { id: 'besoin', label: 'Mon besoin (5 critères)' },
                { id: 'recues', label: 'Offres reçues' },
              ].map((tab) => (
                <Pressable
                  key={tab.id}
                  style={[
                    styles.filterChip,
                    searchSubTab === tab.id && { backgroundColor: '#2C3E6B', borderColor: '#2C3E6B' },
                  ]}
                  onPress={() => setSearchSubTab(tab.id as any)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      searchSubTab === tab.id && { color: '#FFFFFF', fontWeight: '700' },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {searchSubTab === 'besoin' && (
              <View style={{ gap: 12 }}>
                <View style={styles.card}>
                  <Text style={[styles.boldText, { fontSize: 16, color: '#1A1D26' }]}>1. Où souhaitez-vous habiter ?</Text>
                  <Text style={[styles.subMuted, { marginTop: 2, marginBottom: 8 }]}>Sélectionnez votre commune ou quartier prioritaire</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {['Cocody', 'Marcory', 'Riviera', 'Plateau', 'Bingerville', 'Yopougon'].map((c) => (
                      <Pressable
                        key={c}
                        style={[
                          styles.filterChip,
                          besoinCommune === c && { backgroundColor: '#2C3E6B', borderColor: '#2C3E6B' },
                        ]}
                        onPress={() => setBesoinCommune(c)}
                      >
                        <Text style={[styles.filterChipText, besoinCommune === c && { color: '#fff', fontWeight: '700' }]}>
                          {c}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.card}>
                  <Text style={[styles.boldText, { fontSize: 16, color: '#1A1D26' }]}>2. Quel type de logement ?</Text>
                  <Text style={[styles.subMuted, { marginTop: 2, marginBottom: 8 }]}>Typologie recherchée</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {['Studio', 'Appartement', 'Villa', 'Duplex'].map((t) => (
                      <Pressable
                        key={t}
                        style={[
                          styles.filterChip,
                          besoinType === t && { backgroundColor: '#2C3E6B', borderColor: '#2C3E6B' },
                        ]}
                        onPress={() => setBesoinType(t)}
                      >
                        <Text style={[styles.filterChipText, besoinType === t && { color: '#fff', fontWeight: '700' }]}>
                          {t}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.card}>
                  <Text style={[styles.boldText, { fontSize: 16, color: '#1A1D26' }]}>3. Combien (Budget mensuel max) ?</Text>
                  <Text style={[styles.subMuted, { marginTop: 2, marginBottom: 6 }]}>Montant loyer max en FCFA</Text>
                  <TextInput
                    style={[styles.input, { marginTop: 4 }]}
                    placeholder="Ex : 250000"
                    keyboardType="numeric"
                    value={besoinBudget}
                    onChangeText={setBesoinBudget}
                  />
                </View>

                <View style={styles.card}>
                  <Text style={[styles.boldText, { fontSize: 16, color: '#1A1D26' }]}>4. Quand souhaitez-vous emménager ?</Text>
                  <Text style={[styles.subMuted, { marginTop: 2, marginBottom: 8 }]}>Date d'entrée souhaitée</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {['Immédiat', '1er du mois prochain', 'Dans 2 mois'].map((d) => (
                      <Pressable
                        key={d}
                        style={[
                          styles.filterChip,
                          besoinDate === d && { backgroundColor: '#2C3E6B', borderColor: '#2C3E6B' },
                        ]}
                        onPress={() => setBesoinDate(d)}
                      >
                        <Text style={[styles.filterChipText, besoinDate === d && { color: '#fff', fontWeight: '700' }]}>
                          {d}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.card}>
                  <Text style={[styles.boldText, { fontSize: 16, color: '#1A1D26' }]}>5. Qui va occuper le logement ?</Text>
                  <Text style={[styles.subMuted, { marginTop: 2, marginBottom: 8 }]}>Votre profil locataire</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {['Salarié', 'Fonctionnaire', 'Profession libérale', 'Couple', 'Famille'].map((s) => (
                      <Pressable
                        key={s}
                        style={[
                          styles.filterChip,
                          besoinSituation === s && { backgroundColor: '#2C3E6B', borderColor: '#2C3E6B' },
                        ]}
                        onPress={() => setBesoinSituation(s)}
                      >
                        <Text style={[styles.filterChipText, besoinSituation === s && { color: '#fff', fontWeight: '700' }]}>
                          {s}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <Pressable
                  style={[styles.btnPrimary, { backgroundColor: '#1E7E4E', marginTop: 8 }]}
                  onPress={() => {
                    setSearchSubTab('offres');
                    Alert.alert(
                      'Besoin enregistré !',
                      'Vos 5 critères ont été enregistrés. Le taux de compatibilité de toutes les offres a été mis à jour.'
                    );
                  }}
                >
                  <Check color="#fff" size={16} />
                  <Text style={styles.btnPrimaryText}>Enregistrer & voir les offres compatibles</Text>
                </Pressable>
              </View>
            )}

            {searchSubTab === 'recues' && (
              <View style={[styles.card, { padding: 24, alignItems: 'center', borderColor: '#CBD5E1' }]}>
                <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Bell color="#2C3E6B" size={26} />
                </View>
                <Text style={[styles.h2, { textAlign: 'center', color: '#1A1D26' }]}>
                  Offres directes reçues
                </Text>
                <Text style={[styles.subMuted, { textAlign: 'center', marginTop: 6, lineHeight: 18 }]}>
                  Dès qu'un bailleur ou une agence certifiée repère votre Passeport Locatif compatible avec son bien, ses invitations directes s'afficheront ici.
                </Text>
              </View>
            )}

            {searchSubTab === 'offres' && (
              <>
            {/* 1. BARRE DE RECHERCHE */}
            <View style={styles.searchBarContainer}>
              <Search color="#64748B" size={18} style={{ marginLeft: 12 }} />
              <TextInput
                style={styles.searchBarInput}
                placeholder="Rechercher par mot-clé, commune, quartier..."
                placeholderTextColor="#94A3B8"
                value={marketSearchQuery}
                onChangeText={setMarketSearchQuery}
                returnKeyType="search"
              />
              {marketSearchQuery.length > 0 && (
                <Pressable onPress={() => setMarketSearchQuery('')} style={{ padding: 8, marginRight: 4 }}>
                  <X color="#64748B" size={16} />
                </Pressable>
              )}
            </View>

            {/* 2. TRI PAR PRIX */}
            <View style={styles.filterSection}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <ArrowUpDown color="#2C3E6B" size={15} />
                  <Text style={styles.filterSectionTitle}>TRIER PAR PRIX</Text>
                </View>
                {marketSortPrice !== 'none' && (
                  <Pressable onPress={() => setMarketSortPrice('none')}>
                    <Text style={{ fontSize: 11, color: '#DC2626', fontWeight: '700' }}>Réinitialiser</Text>
                  </Pressable>
                )}
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable
                  style={[styles.filterChip, marketSortPrice === 'none' && styles.filterChipActive]}
                  onPress={() => setMarketSortPrice('none')}
                >
                  <Text style={[styles.filterChipText, marketSortPrice === 'none' && styles.filterChipTextActive]}>
                    Par défaut
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.filterChip, marketSortPrice === 'asc' && styles.filterChipActive]}
                  onPress={() => setMarketSortPrice('asc')}
                >
                  <Text style={[styles.filterChipText, marketSortPrice === 'asc' && styles.filterChipTextActive]}>
                    Prix croissant ↗
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.filterChip, marketSortPrice === 'desc' && styles.filterChipActive]}
                  onPress={() => setMarketSortPrice('desc')}
                >
                  <Text style={[styles.filterChipText, marketSortPrice === 'desc' && styles.filterChipTextActive]}>
                    Prix décroissant ↘
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* 3. FILTRE PAR LOCALITÉ */}
            <View style={styles.filterSection}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <MapPin color="#2C3E6B" size={15} />
                <Text style={styles.filterSectionTitle}>LOCALITÉ ({availableCommunes.length > 1 ? availableCommunes.length - 1 : 0} COMMUNE{availableCommunes.length > 2 ? 'S' : ''})</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {availableCommunes.map((com) => {
                  const active = marketCommune === com;
                  return (
                    <Pressable
                      key={com}
                      style={[styles.filterChip, active && styles.filterChipActive]}
                      onPress={() => setMarketCommune(com)}
                    >
                      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                        {com === 'TOUTES' ? 'Toutes les localités' : com}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* 4. FILTRE PAR TYPE DE BIEN */}
            <View style={styles.filterSection}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Building2 color="#2C3E6B" size={15} />
                <Text style={styles.filterSectionTitle}>TYPE DE BIEN</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {availableTypes.map((t) => {
                  const active = marketType === t.id;
                  return (
                    <Pressable
                      key={t.id}
                      style={[styles.filterChip, active && styles.filterChipActive]}
                      onPress={() => setMarketType(t.id)}
                    >
                      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                        {t.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* RÉSULTATS & STATUT DES FILTRES */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, marginBottom: 2 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#1E293B' }}>
                {filteredMarketList.length} logement{filteredMarketList.length > 1 ? 's' : ''} disponible{filteredMarketList.length > 1 ? 's' : ''}
                {hasActiveFilters && ` (sur ${marketList.length})`}
              </Text>
              {hasActiveFilters && (
                <Pressable onPress={resetMarketFilters} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <X color="#DC2626" size={14} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#DC2626' }}>Effacer les filtres</Text>
                </Pressable>
              )}
            </View>

            {filteredMarketList.length === 0 ? (
              <View style={[styles.card, { alignItems: 'center', paddingVertical: 36 }]}>
                <Search color="#9CA3AF" size={38} />
                <Text style={[styles.boldText, { marginTop: 12, color: '#334155', fontSize: 16 }]}>
                  {hasActiveFilters ? 'Aucun logement ne correspond à vos critères' : 'Aucun bien disponible'}
                </Text>
                <Text style={[styles.subMuted, { textAlign: 'center', marginTop: 6, paddingHorizontal: 16 }]}>
                  {hasActiveFilters
                    ? 'Modifiez votre mot-clé ou réinitialisez les filtres pour afficher l’ensemble des offres.'
                    : 'De nouveaux logements certifiés et conformes sont publiés régulièrement.'}
                </Text>
                {hasActiveFilters && (
                  <Pressable style={[styles.btnPrimary, { marginTop: 16, paddingHorizontal: 20 }]} onPress={resetMarketFilters}>
                    <Text style={styles.btnPrimaryText}>Réinitialiser tous les filtres</Text>
                  </Pressable>
                )}
              </View>
            ) : (
              filteredMarketList.map((off: any, i: number) => {
                const title = off.titre || off.logement?.name || 'Logement certifié QAPRIL';
                const commune = off.logement?.commune || off.commune || 'Abidjan';
                const rent = off.loyerDemande || off.declaredRentFcfa || off.price || 0;
                const typeStr = off.logement?.propertyType || off.propertyType || 'Résidentiel';
                const address = off.logement?.address || off.address || '';
                const rawImg = off.photosUrls?.[0] || off.logement?.images?.[0]?.s3Key || null;
                const imgUri = formatImageUrl(rawImg);
                const compat = getOfferCompatibility(off);
                const compatColor = compat >= 80 ? '#1E7E4E' : compat >= 65 ? '#2C3E6B' : '#B45309';
                const compatBg = compat >= 80 ? '#F0FDF4' : compat >= 65 ? '#EFF6FF' : '#FFFDF5';

                return (
                  <View key={off.id || i} style={styles.card}>
                    {imgUri ? (
                      <Image
                        source={{ uri: imgUri }}
                        style={styles.cardImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.cardImagePlaceholder}>
                        <Building2 color="#94A3B8" size={36} />
                        <Text style={[styles.subMuted, { marginTop: 4 }]}>Photo en cours de validation</Text>
                      </View>
                    )}

                    <View style={styles.rowBetween}>
                      <Text style={[styles.boldText, { fontSize: 16, flex: 1, marginRight: 8 }]}>
                        {title}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={{ backgroundColor: compatBg, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: compatColor + '40' }}>
                          <Text style={{ fontSize: 11, fontWeight: '800', color: compatColor }}>{compat}% compatible</Text>
                        </View>
                        <View style={styles.pillTint}>
                          <Text style={styles.pillTintText}>{commune}</Text>
                        </View>
                      </View>
                    </View>

                    <Text style={[styles.h2, { color: '#2C3E6B', marginTop: 6 }]}>
                      {fmt(rent)} / mois
                    </Text>

                    <Text style={[styles.subMuted, { marginTop: 2 }]}>
                      {typeStr} · {address ? address + ' · ' : ''}{commune}
                    </Text>

                    <Pressable
                      style={[styles.btnPrimary, { marginTop: 12 }]}
                      onPress={() => {
                        setSelectedOfferForCandidature(off);
                        setCandidatureModal(true);
                      }}
                    >
                      <Text style={styles.btnPrimaryText}>Candidater avec mon Passeport</Text>
                    </Pressable>
                  </View>
                );
              })
            )}
            </>
            )}
          </View>
        )}
      </ScrollView>

      {/* MODALE : FAIRE PAYER PAR UN PROCHE */}
      <Modal visible={procheModal} transparent animationType="slide" onRequestClose={() => setProcheModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.h2}>Faire payer par un proche</Text>
            <Text style={[styles.subMuted, { marginTop: 6 }]}>
              Partagez ce lien sécurisé sur WhatsApp : votre proche règle via Wave, Orange Money, MTN ou carte, et la quittance officielle est émise directement à votre nom.
            </Text>
            <View style={styles.recapBox}>
              <Text style={styles.boldText}>https://pay.qapril.ci/p/{bailRef}</Text>
              <Text style={styles.subMuted}>Montant : {fmt(loyer)} · Bénéficiaire quittance : {userName}</Text>
            </View>
            <Pressable
              style={styles.btnPrimary}
              onPress={() => {
                setProcheModal(false);
                Alert.alert('Lien partagé', 'Lien de paiement tiers copié et prêt pour WhatsApp.');
              }}
            >
              <Text style={styles.btnPrimaryText}>Partager sur WhatsApp</Text>
            </Pressable>
            <Pressable style={styles.btnGhost} onPress={() => setProcheModal(false)}>
              <Text style={styles.btnGhostText}>Fermer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* MODALE : DÉCLARER MON LOGEMENT (IC-01 P0-02) */}
      <Modal visible={declareModal} transparent animationType="slide" onRequestClose={() => setDeclareModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { maxHeight: '90%' }]}>
            <Text style={styles.h2}>Déclarer mon logement</Text>
            <Text style={[styles.subMuted, { marginTop: 4, marginBottom: 12 }]}>
              Renseignez les 4 informations clés pour inviter votre bailleur et activer votre bail officiel.
            </Text>

            <ScrollView style={{ width: '100%' }} contentContainerStyle={{ gap: 10 }}>
              <View>
                <Text style={styles.label}>NOM DU BAILLEUR OU DE L'AGENCE *</Text>
                <TextInput
                  style={[styles.input, { marginTop: 4 }]}
                  placeholder="Ex : M. Koffi Konan ou Agence Riviera"
                  value={decBailleurNom}
                  onChangeText={setDecBailleurNom}
                />
              </View>

              <View>
                <Text style={styles.label}>NUMÉRO DU BAILLEUR (WHATSAPP / SMS) *</Text>
                <TextInput
                  style={[styles.input, { marginTop: 4 }]}
                  placeholder="Ex : 0707070707"
                  keyboardType="phone-pad"
                  value={decBailleurTel}
                  onChangeText={setDecBailleurTel}
                />
              </View>

              <View>
                <Text style={styles.label}>ADRESSE DU LOGEMENT & COMMUNE *</Text>
                <TextInput
                  style={[styles.input, { marginTop: 4 }]}
                  placeholder="Ex : 3 pièces, Cocody Angré 8e Tranche"
                  value={decLogementDesc}
                  onChangeText={setDecLogementDesc}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.label}>LOYER MENSUEL (FCFA) *</Text>
                  <TextInput
                    style={[styles.input, { marginTop: 4 }]}
                    placeholder="Ex : 150000"
                    keyboardType="numeric"
                    value={decLoyer}
                    onChangeText={setDecLoyer}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>JOUR ÉCHÉANCE</Text>
                  <TextInput
                    style={[styles.input, { marginTop: 4 }]}
                    placeholder="5"
                    keyboardType="numeric"
                    value={decJour}
                    onChangeText={setDecJour}
                  />
                </View>
              </View>

              <Pressable
                style={[styles.btnPrimary, { backgroundColor: '#2C3E6B', marginTop: 10 }]}
                disabled={submittingDeclaration}
                onPress={async () => {
                  if (!decBailleurNom.trim() || !decBailleurTel.trim() || !decLogementDesc.trim() || !decLoyer.trim()) {
                    Alert.alert('Champs obligatoires', 'Veuillez renseigner le nom, le téléphone du bailleur, le logement et le loyer.');
                    return;
                  }
                  setSubmittingDeclaration(true);
                  try {
                    const res = await fetchWithAuth('/locataire/declarer-logement', {
                      method: 'POST',
                      body: JSON.stringify({
                        landlordName: decBailleurNom.trim(),
                        landlordPhone: decBailleurTel.trim(),
                        housingDesc: decLogementDesc.trim(),
                        rent: decLoyer.trim(),
                      }),
                    });
                    const result = await res.json();
                    if (res.ok && result.success) {
                      setPendingDeclaration({
                        id: result.declarationId,
                        bailleurNom: decBailleurNom.trim(),
                        bailleurTel: decBailleurTel.trim(),
                        logementDesc: decLogementDesc.trim(),
                        loyer: decLoyer.trim(),
                        jour: decJour.trim() || '5',
                        status: 'EN_ATTENTE',
                      });
                      setDeclareModal(false);
                      setInviteModal(true);
                    } else {
                      Alert.alert('Erreur', result.error || 'Impossible d\'enregistrer la déclaration.');
                    }
                  } catch (err) {
                    Alert.alert('Erreur réseau', 'Vérifiez votre connexion internet.');
                  } finally {
                    setSubmittingDeclaration(false);
                  }
                }}
              >
                {submittingDeclaration ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.btnPrimaryText}>Enregistrer et inviter mon bailleur</Text>
                )}
              </Pressable>

              <Pressable style={styles.btnGhost} onPress={() => setDeclareModal(false)}>
                <Text style={styles.btnGhostText}>Annuler</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODALE : INVITER MON BAILLEUR (IC-01 P0-02) */}
      <Modal visible={inviteModal} transparent animationType="slide" onRequestClose={() => setInviteModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.h2}>Inviter mon bailleur</Text>
            <Text style={[styles.subMuted, { marginTop: 6 }]}>
              Un message pré-rempli va être préparé pour votre bailleur. Dès qu'il confirme en répondant 1, votre bail devient actif.
            </Text>

            <View style={[styles.recapBox, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
              <Text style={[styles.boldText, { color: '#166534' }]}>Message officiel QAPRIL :</Text>
              <Text style={[styles.subMuted, { color: '#14532D', marginTop: 4, lineHeight: 18 }]}>
                « Bonjour {decBailleurNom || 'Propriétaire'}, votre locataire {userName} a déclaré votre logement ({decLogementDesc || 'logement'}) sur QAPRIL pour un loyer de {fmt(Number(decLoyer) || loyer)}. Répondez 1 pour confirmer ou connectez-vous sur https://qapril.net/b »
              </Text>
            </View>

            <Pressable
              style={[styles.btnPrimary, { backgroundColor: '#1E7E4E' }]}
              onPress={() => {
                setInviteModal(false);
                Alert.alert(
                  'Invitation transmise',
                  `L'invitation a été envoyée au ${decBailleurTel || 'bailleur'}. Vous serez notifié dès sa confirmation.`
                );
              }}
            >
              <Share2 color="#fff" size={16} />
              <Text style={styles.btnPrimaryText}>Envoyer l'invitation (WhatsApp / SMS)</Text>
            </Pressable>

            <Pressable style={styles.btnGhost} onPress={() => setInviteModal(false)}>
              <Text style={styles.btnGhostText}>Fermer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* MODALE : J'AI PAYÉ AUTREMENT (IC-01 P0-04) */}
      <Modal visible={payAutrementModal} transparent animationType="slide" onRequestClose={() => setPayAutrementModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { maxHeight: '90%' }]}>
            <Text style={styles.h2}>J’ai payé autrement</Text>
            <Text style={[styles.subMuted, { marginTop: 4, marginBottom: 12 }]}>
              Déclarez votre règlement direct (Wave, Orange, MTN, Espèces, Virement) pour que votre bailleur confirme et émette votre quittance officielle.
            </Text>

            <ScrollView style={{ width: '100%' }} contentContainerStyle={{ gap: 10 }}>
              <Text style={styles.label}>MOYEN DE RÈGLEMENT *</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {[
                  { id: 'WAVE', label: 'Wave' },
                  { id: 'ORANGE_MONEY', label: 'Orange Money' },
                  { id: 'MTN', label: 'MTN MoMo' },
                  { id: 'MOOV', label: 'Moov Money' },
                  { id: 'ESPECES', label: 'Espèces' },
                  { id: 'VIREMENT', label: 'Virement bancaire' },
                ].map((m) => (
                  <Pressable
                    key={m.id}
                    style={[
                      styles.btnSecondary,
                      { paddingHorizontal: 12, paddingVertical: 8 },
                      autreMoyen === m.id && { backgroundColor: '#2C3E6B', borderColor: '#2C3E6B' },
                    ]}
                    onPress={() => setAutreMoyen(m.id)}
                  >
                    <Text
                      style={[
                        styles.btnSecondaryText,
                        { fontSize: 12 },
                        autreMoyen === m.id && { color: '#fff', fontWeight: '700' },
                      ]}
                    >
                      {m.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={{ marginTop: 8 }}>
                <Text style={styles.label}>MONTANT RÉGLÉ (FCFA) *</Text>
                <TextInput
                  style={[styles.input, { marginTop: 4 }]}
                  placeholder={String(loyer || 150000)}
                  keyboardType="numeric"
                  value={autreMontant}
                  onChangeText={setAutreMontant}
                />
              </View>

              <View style={{ marginTop: 8 }}>
                <Text style={styles.label}>DATE DU PAIEMENT (JJ/MM/AAAA)</Text>
                <TextInput
                  style={[styles.input, { marginTop: 4 }]}
                  placeholder={new Date().toLocaleDateString('fr-FR')}
                  value={autreDate}
                  onChangeText={setAutreDate}
                />
              </View>

              <Pressable
                style={[styles.btnPrimary, { backgroundColor: '#1E7E4E', marginTop: 12 }]}
                disabled={submittingPayAutrement}
                onPress={async () => {
                  const finalMontant = autreMontant.trim() || String(loyer);
                  if (!finalMontant || Number(finalMontant) <= 0) {
                    Alert.alert('Montant requis', 'Veuillez préciser le montant réglé.');
                    return;
                  }
                  setSubmittingPayAutrement(true);
                  try {
                    const res = await fetchWithAuth('/locataire/declarer-paiement', {
                      method: 'POST',
                      body: JSON.stringify({
                        moyen: autreMoyen,
                        montant: finalMontant,
                        datePaiement: new Date().toISOString(),
                      }),
                    });
                    const json = await res.json();
                    if (res.ok && json.success) {
                      Alert.alert(
                        'Paiement Déclaré !',
                        json.message || 'Votre déclaration a été enregistrée. Votre bailleur a été notifié pour confirmation.'
                      );
                      setPayAutrementModal(false);
                      setData((prev: any) => ({
                        ...prev,
                        rentStatus: 'DECLARED_PENDING',
                        pendingPayment: {
                          amount: Number(finalMontant),
                          paymentMethod: autreMoyen,
                          date: new Date().toISOString(),
                          status: 'DECLARE',
                        },
                      }));
                    } else {
                      Alert.alert('Erreur', json.error || 'Impossible d\'enregistrer le paiement.');
                    }
                  } catch (e) {
                    Alert.alert('Erreur réseau', 'Vérifiez votre connexion internet.');
                  } finally {
                    setSubmittingPayAutrement(false);
                  }
                }}
              >
                {submittingPayAutrement ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.btnPrimaryText}>Confirmer ma déclaration de paiement</Text>
                )}
              </Pressable>

              <Pressable
                style={[styles.btnSecondary, { marginTop: 6 }]}
                onPress={() => setPayAutrementModal(false)}
              >
                <Text style={styles.btnSecondaryText}>Fermer</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODALE : DONNER CONGÉ (PRÉAVIS DE DÉPART - P1-08) */}
      <Modal visible={congeModal} transparent animationType="slide" onRequestClose={() => setCongeModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { maxHeight: '90%' }]}>
            <Text style={styles.h2}>Donner congé (Préavis officiel)</Text>
            <Text style={[styles.subMuted, { marginTop: 4, marginBottom: 12 }]}>
              Notification formelle conforme à l’art. 434 du Code de la Construction et de l’Habitat.
            </Text>

            <ScrollView style={{ width: '100%' }} contentContainerStyle={{ gap: 10 }}>
              <View style={[styles.recapBox, { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' }]}>
                <Text style={[styles.boldText, { color: '#1E293B' }]}>Délai légal obligatoire : 30 jours</Text>
                <Text style={[styles.subMuted, { marginTop: 4, lineHeight: 18 }]}>
                  En validant cette notification, votre bailleur recevra officiellement votre date de libération des lieux pour planifier l’état des lieux de sortie et la restitution de caution.
                </Text>
              </View>

              <View style={{ marginTop: 4 }}>
                <Text style={styles.label}>DATE DE DÉPART SOUHAITÉE (JJ/MM/AAAA) *</Text>
                <TextInput
                  style={[styles.input, { marginTop: 4 }]}
                  placeholder={(() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 30);
                    return d.toLocaleDateString('fr-FR');
                  })()}
                  value={congeDate}
                  onChangeText={setCongeDate}
                />
              </View>

              <View style={{ marginTop: 4 }}>
                <Text style={styles.label}>MOTIF DU DÉPART (OPTIONNEL)</Text>
                <TextInput
                  style={[styles.input, { marginTop: 4 }]}
                  placeholder="Ex : Déménagement, mutation professionnelle, acquisition..."
                  value={congeMotif}
                  onChangeText={setCongeMotif}
                />
              </View>

              <Pressable
                style={[styles.btnPrimary, { backgroundColor: '#2C3E6B', marginTop: 12 }]}
                disabled={submittingConge}
                onPress={async () => {
                  setSubmittingConge(true);
                  try {
                    let targetDate: Date;
                    if (congeDate.trim()) {
                      const parts = congeDate.trim().split(/[\/\-]/);
                      if (parts.length === 3) {
                        targetDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
                      } else {
                        targetDate = new Date(congeDate.trim());
                      }
                    } else {
                      targetDate = new Date();
                      targetDate.setDate(targetDate.getDate() + 30);
                    }

                    const res = await fetchWithAuth('/locataire/preavis', {
                      method: 'POST',
                      body: JSON.stringify({
                        dateDepartPrevue: targetDate.toISOString(),
                        motif: congeMotif.trim() || undefined,
                      }),
                    });
                    const json = await res.json();
                    if (res.ok && json.success) {
                      Alert.alert(
                        'Préavis Transmis !',
                        json.message || 'Votre préavis a été notifié à votre bailleur.'
                      );
                      setCongeModal(false);
                      setActivePreavis(json.preavis);
                    } else {
                      Alert.alert('Erreur', json.error || 'Impossible d\'enregistrer le préavis.');
                    }
                  } catch (e) {
                    Alert.alert('Erreur réseau', 'Vérifiez votre connexion internet.');
                  } finally {
                    setSubmittingConge(false);
                  }
                }}
              >
                {submittingConge ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.btnPrimaryText}>Transmettre mon préavis officiel</Text>
                )}
              </Pressable>

              <Pressable style={styles.btnSecondary} onPress={() => setCongeModal(false)}>
                <Text style={styles.btnSecondaryText}>Annuler</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODALE : CANDIDATER AVEC CONSENTEMENT (IC-01 Section 6) */}
      <Modal visible={candidatureModal} transparent animationType="slide" onRequestClose={() => setCandidatureModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { maxHeight: '90%' }]}>
            <Text style={styles.h2}>Candidater au logement</Text>
            <Text style={[styles.subMuted, { marginTop: 4, marginBottom: 12 }]}>
              {selectedOfferForCandidature?.titre || selectedOfferForCandidature?.logement?.name || 'Logement certifié QAPRIL'}
            </Text>

            <ScrollView style={{ width: '100%' }} contentContainerStyle={{ gap: 10 }}>
              <Text style={styles.label}>CONSENTEMENT DE PARTAGE SÉCURISÉ</Text>
              <Text style={[styles.subMuted, { fontSize: 12, lineHeight: 17 }]}>
                Vous choisissez exactement ce que le bailleur pourra consulter. Aucune pièce confidentielle n'est transmise sans votre accord.
              </Text>

              <Pressable
                style={[styles.recapBox, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: shareTrustLevel ? '#F0FDF4' : '#FFFFFF' }]}
                onPress={() => setShareTrustLevel(!shareTrustLevel)}
              >
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.boldText}>Tranche de confiance certifiée</Text>
                  <Text style={[styles.subMuted, { fontSize: 11 }]}>Option recommandée (Tranche ponctuelle)</Text>
                </View>
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: shareTrustLevel ? '#1E7E4E' : '#D1D5DB', alignItems: 'center', justifyContent: 'center' }}>
                  {shareTrustLevel && <Check color="#fff" size={14} />}
                </View>
              </Pressable>

              <Pressable
                style={[styles.recapBox, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: sharePunctuality ? '#F0FDF4' : '#FFFFFF' }]}
                onPress={() => setSharePunctuality(!sharePunctuality)}
              >
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.boldText}>Historique de quittances régulières</Text>
                  <Text style={[styles.subMuted, { fontSize: 11 }]}>Atteste de vos règlements à bonne date</Text>
                </View>
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: sharePunctuality ? '#1E7E4E' : '#D1D5DB', alignItems: 'center', justifyContent: 'center' }}>
                  {sharePunctuality && <Check color="#fff" size={14} />}
                </View>
              </Pressable>

              <Pressable
                style={[styles.recapBox, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: shareIncome ? '#F0FDF4' : '#FFFFFF' }]}
                onPress={() => setShareIncome(!shareIncome)}
              >
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.boldText}>Attestation de revenus / CDI</Text>
                  <Text style={[styles.subMuted, { fontSize: 11 }]}>Optionnel : pour accélérer l’accord</Text>
                </View>
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: shareIncome ? '#1E7E4E' : '#D1D5DB', alignItems: 'center', justifyContent: 'center' }}>
                  {shareIncome && <Check color="#fff" size={14} />}
                </View>
              </Pressable>

              <Pressable
                style={[styles.btnPrimary, { backgroundColor: '#1E7E4E', marginTop: 10 }]}
                onPress={() => {
                  setCandidatureModal(false);
                  Alert.alert(
                    'Candidature transmise !',
                    'Votre candidature certifiée avec vos choix de consentement a été transmise au bailleur. Vous recevrez une alerte dès son retour.'
                  );
                }}
              >
                <Text style={styles.btnPrimaryText}>Confirmer ma candidature</Text>
              </Pressable>

              <Pressable style={styles.btnSecondary} onPress={() => setCandidatureModal(false)}>
                <Text style={styles.btnSecondaryText}>Annuler</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODALE : ATTESTATION DE RÉSIDENCE QR (ADD-29) */}
      <Modal visible={attestationModal} transparent animationType="slide" onRequestClose={() => setAttestationModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { maxHeight: '90%' }]}>
            <Text style={styles.h2}>Attestation de résidence officielle</Text>
            <Text style={[styles.subMuted, { marginTop: 4 }]}>
              Certifiée par QAPRIL · Conforme Décret n° 2019-576 et Loi 2013-546
            </Text>

            <View style={styles.recapBox}>
              <Text style={styles.boldText}>Titulaire : {userName}</Text>
              <Text style={styles.subMuted}>Logement : {propName}</Text>
              <Text style={styles.subMuted}>Bail : {bailRef}</Text>
              {attestationResult && (
                <View style={{ marginTop: 8, padding: 8, backgroundColor: '#E2E8F0', borderRadius: 8 }}>
                  <Text style={{ fontWeight: '700', color: '#1B4D3E', fontSize: 13 }}>
                    NIVEAU OBTENU : NIVEAU {attestationResult.niveau}
                  </Text>
                  <Text style={[styles.subMuted, { marginTop: 2 }]}>
                    N° {attestationResult.numero} · Valide 3 mois
                  </Text>
                </View>
              )}
              <Text style={[styles.subMuted, { marginTop: 6, fontWeight: '700', color: '#1E7E4E' }]}>
                ✓ Document officiel certifié · QR Code de vérification
              </Text>
            </View>

            {attestationResult ? (
              <View style={{ gap: 10, width: '100%' }}>
                <Pressable
                  style={[styles.btnPrimary, { backgroundColor: '#1B4D3E' }]}
                  onPress={() => {
                    if (attestationResult.pdfUrl) {
                      Linking.openURL(attestationResult.pdfUrl);
                    }
                  }}
                >
                  <Text style={styles.btnPrimaryText}>Ouvrir l'attestation PDF</Text>
                </Pressable>

                <Pressable
                  style={[styles.btnPrimary, { backgroundColor: '#0F172A' }]}
                  onPress={() => {
                    if (attestationResult.verificationUrl) {
                      Linking.openURL(attestationResult.verificationUrl);
                    }
                  }}
                >
                  <Text style={styles.btnPrimaryText}>Voir la vérification QR Code</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={[styles.btnPrimary, { backgroundColor: '#1B4D3E' }]}
                disabled={generatingAttestation}
                onPress={handleGenerateAttestation}
              >
                {generatingAttestation ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.btnPrimaryText}>Générer l'attestation certifiée</Text>
                )}
              </Pressable>
            )}

            <Pressable style={styles.btnGhost} onPress={() => setAttestationModal(false)}>
              <Text style={styles.btnGhostText}>Fermer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* MODALE : OCCUPANTS DECLARÉS (ADD-29) */}
      <Modal visible={occupantsModal} transparent animationType="slide" onRequestClose={() => setOccupantsModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { maxHeight: '85%' }]}>
            <View style={styles.rowBetween}>
              <Text style={styles.h2}>Occupants du logement</Text>
              <Pressable onPress={() => setOccupantsModal(false)}>
                <X color="#64748B" size={24} />
              </Pressable>
            </View>
            <Text style={[styles.subMuted, { marginTop: 4 }]}>
              Liste certifiée des co-résidents (conjoint, enfants, colocataires).
            </Text>

            <ScrollView style={{ maxHeight: 260, width: '100%', marginVertical: 10 }}>
              {loadingOccupants ? (
                <ActivityIndicator color="#1B4D3E" style={{ padding: 20 }} />
              ) : occupantsList.length === 0 ? (
                <View style={{ padding: 16, alignItems: 'center' }}>
                  <Text style={styles.subMuted}>Aucun occupant déclaré pour ce bail.</Text>
                </View>
              ) : (
                occupantsList.map((occ: any) => (
                  <View key={occ.id} style={[styles.cardRow, { marginBottom: 8 }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.boldText}>{occ.nom} {occ.prenoms}</Text>
                      <Text style={styles.subMuted}>
                        {occ.typeLien} · {occ.statutConfirmation === 'CONFIRME' ? '✓ Confirmé' : 'En attente'}
                      </Text>
                      {occ.telephone && <Text style={styles.subMuted}>Tél : {occ.telephone}</Text>}
                    </View>
                    <View style={styles.pillOk}>
                      <Text style={styles.pillOkText}>{occ.typeLien}</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            <Pressable
              style={[styles.btnPrimary, { backgroundColor: '#1B4D3E', width: '100%' }]}
              onPress={() => setNewOccupantModal(true)}
            >
              <Text style={styles.btnPrimaryText}>+ Déclarer un nouvel occupant</Text>
            </Pressable>

            <Pressable style={styles.btnGhost} onPress={() => setOccupantsModal(false)}>
              <Text style={styles.btnGhostText}>Fermer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* MODALE : FORMULAIRE DÉCLARATION OCCUPANT (ADD-29) */}
      <Modal visible={newOccupantModal} transparent animationType="slide" onRequestClose={() => setNewOccupantModal(false)}>
        <View style={styles.modalBackdrop}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}>
            <View style={[styles.modalSheet, { maxHeight: '90%' }]}>
              <View style={styles.rowBetween}>
                <Text style={styles.h2}>Déclarer un occupant</Text>
                <Pressable onPress={() => setNewOccupantModal(false)}>
                  <X color="#64748B" size={24} />
                </Pressable>
              </View>
              <Text style={[styles.subMuted, { marginTop: 4 }]}>
                Conformément à la Loi 2013-546, toute fausse déclaration engage la responsabilité du déclarant.
              </Text>

              <View style={{ width: '100%', gap: 10, marginVertical: 12 }}>
                <TextInput
                  placeholder="Nom de famille *"
                  placeholderTextColor="#94A3B8"
                  value={occNom}
                  onChangeText={setOccNom}
                  style={styles.searchBarInput}
                />
                <TextInput
                  placeholder="Prénoms *"
                  placeholderTextColor="#94A3B8"
                  value={occPrenoms}
                  onChangeText={setOccPrenoms}
                  style={styles.searchBarInput}
                />

                <Text style={[styles.boldText, { fontSize: 12, marginTop: 4 }]}>Lien avec le titulaire :</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {['CONJOINT', 'ENFANT_MAJEUR', 'ENFANT_MINEUR', 'COLOCATAIRE', 'AUTRE'].map((lien) => (
                    <Pressable
                      key={lien}
                      onPress={() => setOccTypeLien(lien)}
                      style={[
                        styles.filterChip,
                        occTypeLien === lien && { backgroundColor: '#1B4D3E', borderColor: '#1B4D3E' }
                      ]}
                    >
                      <Text style={[styles.filterChipText, occTypeLien === lien && { color: '#FFF' }]}>
                        {lien}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <TextInput
                  placeholder="Téléphone mobile (si majeur)"
                  placeholderTextColor="#94A3B8"
                  value={occTel}
                  onChangeText={setOccTel}
                  keyboardType="phone-pad"
                  style={styles.searchBarInput}
                />
                <TextInput
                  placeholder="Numéro CNI ou Passeport (si majeur)"
                  placeholderTextColor="#94A3B8"
                  value={occNni}
                  onChangeText={setOccNni}
                  style={styles.searchBarInput}
                />

                <Pressable
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}
                  onPress={() => setOccHonneur(!occHonneur)}
                >
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    borderWidth: 1.5,
                    borderColor: occHonneur ? '#1B4D3E' : '#94A3B8',
                    backgroundColor: occHonneur ? '#1B4D3E' : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {occHonneur && <Check color="#fff" size={14} />}
                  </View>
                  <Text style={[styles.subMuted, { flex: 1, fontSize: 11 }]}>
                    Je certifie sur l’honneur que cette personne réside effectivement dans ce logement.
                  </Text>
                </Pressable>
              </View>

              <Pressable
                style={[styles.btnPrimary, { backgroundColor: '#1B4D3E', width: '100%' }]}
                disabled={submittingOcc}
                onPress={handleAddOccupant}
              >
                {submittingOcc ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.btnPrimaryText}>Enregistrer la déclaration</Text>
                )}
              </Pressable>

              <Pressable style={styles.btnGhost} onPress={() => setNewOccupantModal(false)}>
                <Text style={styles.btnGhostText}>Annuler</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* MODALE : VUE BAILLEUR DU PASSEPORT LOCATIF */}
      <Modal visible={vueBailleurModal} transparent animationType="slide" onRequestClose={() => setVueBailleurModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.h2}>Ce que voit un futur bailleur</Text>
            <Text style={[styles.subMuted, { marginTop: 4 }]}>
              Ni votre score chiffré, ni votre salaire exact, ni votre CNI ne sont affichés.
            </Text>
            <View style={styles.recapBox}>
              <Text style={styles.boldText}>{userName} · Tranche ICL {data?.user?.kycLevel >= 2 ? 'A' : 'B'}</Text>
              <Text style={styles.subMuted}>• Régularité : 12/12 loyers payés à l’heure</Text>
              <Text style={styles.subMuted}>• Revenus ≥ 3 × loyer : {shareRev ? 'Oui (vérifié)' : 'Non partagé'}</Text>
              <Text style={styles.subMuted}>• Garant : {shareGarant ? 'Oui (engagé)' : 'Non partagé'}</Text>
            </View>
            <Pressable style={styles.btnPrimary} onPress={() => setVueBailleurModal(false)}>
              <Text style={styles.btnPrimaryText}>Compris</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Assistant Vocal QAPRIL (ADD-27) */}
      <VoiceAssistantFAB moduleName="LOCATAIRE" primaryColor="#1B4D3E" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F9' },
  center: { justifyContent: 'center', alignItems: 'center' },
  mobileHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    backgroundColor: '#F4F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EF',
  },
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: 12,
    alignItems: 'flex-start',
  },
  headerAppBadge: {
    fontSize: 9,
    fontWeight: '600',
    color: '#6B7280',
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
    color: '#1A1D26',
    letterSpacing: -0.3,
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    flexDirection: 'row',
  },
  drawerDismissArea: {
    width: '18%',
    height: '100%',
  },
  drawerContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    height: '100%',
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: -3, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 12,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F9',
  },
  drawerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  drawerBrand: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E6B',
    letterSpacing: 1,
  },
  certifBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  certifBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#059669',
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
    backgroundColor: '#F4F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerScroll: {
    marginTop: 16,
  },
  drawerSectionTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 10,
    marginTop: 8,
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
  drawerItemActive: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  drawerItemIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F4F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerItemIconActive: {
    backgroundColor: '#2C3E6B',
  },
  drawerItemLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1D26',
  },
  drawerItemLabelActive: {
    color: '#2C3E6B',
    fontWeight: '600',
  },
  drawerItemDesc: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  drawerItemDescActive: {
    color: '#3B82F6',
  },
  drawerDivider: {
    height: 1,
    backgroundColor: '#F1F3F9',
    marginVertical: 14,
  },
  scroll: { padding: 16, paddingBottom: 40 },
  sectionGap: { gap: 14 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  h1: { fontSize: 22, fontWeight: '600', color: '#1A1D26', letterSpacing: -0.4 },
  h2: { fontSize: 17, fontWeight: '600', color: '#1A1D26' },
  subMuted: { fontSize: 12, color: '#6B7280', lineHeight: 17 },
  boldText: { fontSize: 13, fontWeight: '700', color: '#1A1D26' },
  label: { fontSize: 11, fontWeight: '600', color: '#6B7280', letterSpacing: 0.6 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBlue: {
    backgroundColor: '#2C3E6B',
    borderRadius: 22,
    padding: 18,
    gap: 6,
  },
  heroSub: { fontSize: 11, color: 'rgba(255,255,255,0.82)', fontWeight: '600' },
  heroBig: { fontSize: 28, fontWeight: '600', color: '#FFFFFF', letterSpacing: -0.6 },
  heroActions: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  btnWhite: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnWhiteText: { color: '#2C3E6B', fontSize: 12, fontWeight: '600' },
  btnOutlineWhite: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnOutlineWhiteText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pillOk: { backgroundColor: '#E3F5EC', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  pillOkText: { color: '#1E7E4E', fontSize: 11, fontWeight: '700' },
  pillTint: { backgroundColor: '#E8ECF6', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  pillTintText: { color: '#2C3E6B', fontSize: 11, fontWeight: '700' },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cardGrid: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EF',
    gap: 4,
  },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#1A1D26', marginTop: 4 },
  cardSub: { fontSize: 11, color: '#6B7280' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EF',
    gap: 8,
  },
  cardRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { fontSize: 12, fontWeight: '700', color: '#2C3E6B' },
  segRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  segBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F4F5F9',
    borderWidth: 1,
    borderColor: '#E5E7EF',
  },
  segBtnOn: { backgroundColor: '#2C3E6B', borderColor: '#2C3E6B' },
  segText: { fontSize: 12, fontWeight: '700', color: '#1A1D26' },
  segTextOn: { color: '#FFFFFF' },
  recapBox: {
    backgroundColor: '#F4F5F9',
    borderRadius: 14,
    padding: 14,
    marginVertical: 10,
    gap: 6,
  },
  btnPrimary: {
    backgroundColor: '#2C3E6B',
    borderRadius: 14,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  btnSecondary: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  btnSecondaryText: { color: '#0F172A', fontSize: 13, fontWeight: '700' },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  btnGhost: {
    backgroundColor: '#F4F5F9',
    borderRadius: 14,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EF',
  },
  btnGhostText: { color: '#2C3E6B', fontSize: 12, fontWeight: '700' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EF',
  },
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
    gap: 10,
  },
  factureQuickBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  factureQuickLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  factureQuickSub: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 1,
  },
  factureCatBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  factureCatBtnActive: {
    backgroundColor: '#2C3E6B',
    borderColor: '#2C3E6B',
  },
  factureCatLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1A1D26',
    marginTop: 4,
  },
  factureCatLabelActive: {
    color: '#fff',
  },
  factureCatSub: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 1,
  },
  factureCatSubActive: {
    color: '#E5E7EB',
  },
  cardImage: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: '#F1F5F9',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  factureInput: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1D26',
    marginTop: 6,
    fontFamily: 'monospace',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchBarInput: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterSectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2C3E6B',
    letterSpacing: 0.8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#2C3E6B',
    borderColor: '#2C3E6B',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
