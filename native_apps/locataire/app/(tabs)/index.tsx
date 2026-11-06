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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchWithAuth, removeStoredToken, clearAppSessionAndCache } from '../../lib/api';
import { useRouter } from 'expo-router';
import { UpdateNotificationBanner } from '../../components/UpdateNotificationBanner';
import { VersionUpdateModal } from '../../components/VersionUpdateModal';
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
  | 'recherche';

const MENU_ITEMS = [
  { id: 'accueil' as LocScreen, label: 'Accueil', desc: 'Statut du bail, loyer et alertes CDC-CI', icon: Home },
  { id: 'factures' as LocScreen, label: 'Régler mes factures', desc: 'Eau (SODECI), Élec (CIE), Téléphone, Internet', icon: Zap },
  { id: 'payer' as LocScreen, label: 'Payer mon loyer', desc: 'Wave, Orange, MTN, Moov et Carte bancaire', icon: CreditCard },
  { id: 'quittances' as LocScreen, label: 'Mes quittances', desc: 'Historique certifié et téléchargement PDF', icon: FileText },
  { id: 'caution' as LocScreen, label: 'Ma caution', desc: 'Séquestre CDC-CI et conformité légale', icon: ShieldCheck },
  { id: 'bail' as LocScreen, label: 'Mon contrat de bail', desc: 'Clauses, reconduction et état des lieux', icon: FileSpreadsheet },
  { id: 'documents' as LocScreen, label: 'Mes documents', desc: 'Attestations, pièces et quittances', icon: Folder },
  { id: 'passeport' as LocScreen, label: 'Passeport locatif', desc: 'Score de solvabilité et ponctualité', icon: UserCheck },
  { id: 'recherche' as LocScreen, label: 'Trouver un logement', desc: 'Biens certifiés QAPRIL et conformes', icon: Search },
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
                  Alert.alert(
                    'Déconnexion',
                    'Voulez-vous fermer votre session mobile locataire ?',
                    [
                      { text: 'Annuler', style: 'cancel' },
                      {
                        text: 'Se déconnecter',
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            await clearAppSessionAndCache();
                          } catch (err) {
                            console.warn('Erreur clearAppSessionAndCache:', err);
                          }
                          if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
                            window.location.href = '/';
                          } else {
                            try {
                              if (router.canDismiss()) {
                                router.dismissAll();
                              }
                            } catch {}
                            router.replace('/');
                          }
                        },
                      },
                    ]
                  );
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

            {/* HERO LOYER */}
            <View style={styles.heroBlue}>
              <View style={styles.rowBetween}>
                <Text style={styles.heroSub}>LOYER DU MOIS EN COURS</Text>
                <View style={data?.rentStatus === 'PAID' ? styles.pillOk : [styles.pillOk, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={[styles.pillOkText, data?.rentStatus !== 'PAID' && { color: '#B45309' }]}>
                    {data?.rentStatus === 'PAID' ? 'À jour · Loyer réglé' : 'À régler'}
                  </Text>
                </View>
              </View>
              <Text style={styles.heroBig}>{fmt(loyer)}</Text>
              <Text style={styles.heroSub}>
                {data?.hasLease ? `Bail ${bailRef} · Prochaine échéance le ${data?.lease?.paymentDay || 5} du mois · Frais : 0 F` : 'Aucun contrat de bail actif'}
              </Text>
              <View style={styles.heroActions}>
                <Pressable style={styles.btnWhite} onPress={() => setScreen('payer')}>
                  <Text style={styles.btnWhiteText}>Payer maintenant</Text>
                </Pressable>
                <Pressable style={styles.btnOutlineWhite} onPress={() => setProcheModal(true)}>
                  <Text style={styles.btnOutlineWhiteText}>Faire payer par un proche</Text>
                </Pressable>
              </View>
            </View>

            
            {/* HERO FACTURES & FLUIDES (Eau, Électricité, Téléphone, Internet) */}
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
                Réglez vos factures d'eau, d'électricité, recharges mobiles et box fibre.
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
                  <Text style={[styles.factureQuickLabel, { color: '#B45309' }]}>Élec</Text>
                  <Text style={styles.factureQuickSub}>CIE / Carte</Text>
                </Pressable>

                <Pressable
                  style={[styles.factureQuickBtn, { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' }]}
                  onPress={() => { setFactureCat('TEL'); setScreen('factures'); }}
                >
                  <Smartphone color="#16A34A" size={20} />
                  <Text style={[styles.factureQuickLabel, { color: '#15803D' }]}>Mobile</Text>
                  <Text style={styles.factureQuickSub}>Crédit/Pass</Text>
                </Pressable>

                <Pressable
                  style={[styles.factureQuickBtn, { backgroundColor: '#EEF2FF', borderColor: '#E0E7FF' }]}
                  onPress={() => { setFactureCat('NET'); setScreen('factures'); }}
                >
                  <Wifi color="#4F46E5" size={20} />
                  <Text style={[styles.factureQuickLabel, { color: '#4338CA' }]}>Internet</Text>
                  <Text style={styles.factureQuickSub}>Fibre / 4G</Text>
                </Pressable>
              </View>
            </View>

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
              Quittance officielle SHA-256 émise automatiquement dès confirmation (RG-QUI-04)
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
                    `Redirection vers ${payOp} pour ${fmt(loyer * payPeriod)}. Votre quittance SHA-256 sera émise instantanément.`
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
              Historique infalsifiable SHA-256 · opposable aux tiers et aux banques
            </Text>

            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.boldText}>{receiptsList.length} quittance(s) enregistrée(s)</Text>
                <View style={styles.pillOk}>
                  <Text style={styles.pillOkText}>CDC-CI Conforme</Text>
                </View>
              </View>
            </View>

            {receiptsList.length === 0 ? (
              <View style={[styles.card, { alignItems: 'center', paddingVertical: 32 }]}>
                <FileText color="#9CA3AF" size={36} />
                <Text style={[styles.boldText, { marginTop: 10, color: '#64748B' }]}>Aucune quittance émise</Text>
                <Text style={[styles.subMuted, { textAlign: 'center', marginTop: 4 }]}>
                  Vos quittances infalsifiables avec signature SHA-256 apparaîtront ici dès le règlement validé.
                </Text>
              </View>
            ) : (
              receiptsList.map((q: any, i: number) => (
                <View key={q.id || i} style={styles.cardRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.boldText}>{q.period || q.periodMonth} · {fmt(q.amount)}</Text>
                    <Text style={styles.subMuted}>
                      {q.date ? `Payé le ${q.date}` : ''} {q.paymentMethod ? `via ${q.paymentMethod}` : ''} {q.receiptHash ? `· SHA-256 ${q.receiptHash.substring(0, 8)}...` : ''}
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
                Générée en 10 s · signée SHA-256 · acceptée pour banque, école, consulat, CIE/SODECI
              </Text>
            </Pressable>

            {data?.hasLease ? (
              [
                { t: `Contrat de bail certifié (${bailRef})`, s: `${propName} · Enregistré · SHA-256` },
                { t: 'Attestation de dépôt de garantie', s: `${fmt(depositAmount)} consignés CDC-CI` },
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
            ÉCRAN 7 · MON PASSEPORT LOCATIF (ADD-21)
           ========================================================= */}
        {screen === 'passeport' && (
          <View style={styles.sectionGap}>
            <Text style={styles.h1}>Mon Passeport Locatif</Text>
            <Text style={styles.subMuted}>
              Vous contrôlez exactement ce qu’un futur bailleur peut voir (ADD-21)
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
                  <Text style={styles.subMuted}>Réservés par défaut (ADD-21)</Text>
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
                      <View style={styles.pillTint}>
                        <Text style={styles.pillTintText}>{commune}</Text>
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
                      onPress={() =>
                        Alert.alert(
                          'Candidature envoyée',
                          `Votre Passeport Locatif a été transmis pour "${title}" au bailleur en toute sécurité.`
                        )
                      }
                    >
                      <Text style={styles.btnPrimaryText}>Candidater avec mon Passeport</Text>
                    </Pressable>
                  </View>
                );
              })
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
              Partagez ce lien sécurisé sur WhatsApp : votre proche règle via Wave, Orange Money, MTN ou carte, et la quittance SHA-256 est émise directement à votre nom.
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

      {/* MODALE : ATTESTATION DE RÉSIDENCE QR EN 10 SECONDES */}
      <Modal visible={attestationModal} transparent animationType="slide" onRequestClose={() => setAttestationModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.h2}>Attestation de résidence QR</Text>
            <Text style={[styles.subMuted, { marginTop: 4 }]}>
              Certifiée par QAPRIL · bail enregistré DGI et loyer à jour
            </Text>
            <View style={styles.recapBox}>
              <Text style={styles.boldText}>Titulaire : {userName}</Text>
              <Text style={styles.subMuted}>Logement : {propName}</Text>
              <Text style={styles.subMuted}>Bail : {bailRef} (Enregistré DGI · art. 414 CCH)</Text>
              <Text style={[styles.subMuted, { marginTop: 6, fontWeight: '700', color: '#1E7E4E' }]}>
                ✓ Empreinte SHA-256 vérifiable par QR Code
              </Text>
            </View>
            <Pressable
              style={styles.btnPrimary}
              onPress={() => {
                setAttestationModal(false);
                Alert.alert('Attestation téléchargée', 'Votre attestation PDF avec QR Code est prête.');
              }}
            >
              <Text style={styles.btnPrimaryText}>Télécharger le PDF signé</Text>
            </Pressable>
            <Pressable style={styles.btnGhost} onPress={() => setAttestationModal(false)}>
              <Text style={styles.btnGhostText}>Fermer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* MODALE : VUE BAILLEUR DU PASSEPORT LOCATIF */}
      <Modal visible={vueBailleurModal} transparent animationType="slide" onRequestClose={() => setVueBailleurModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.h2}>Ce que voit un bailleur (ADD-21)</Text>
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
