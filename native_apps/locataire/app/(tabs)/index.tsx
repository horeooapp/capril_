import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchWithAuth, removeStoredToken, clearAppSessionAndCache } from '../../lib/api';
import { useRouter } from 'expo-router';
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
  Sparkles,
} from 'lucide-react-native';

type LocScreen =
  | 'accueil'
  | 'payer'
  | 'quittances'
  | 'caution'
  | 'bail'
  | 'documents'
  | 'passeport'
  | 'recherche';

const MENU_ITEMS = [
  { id: 'accueil' as LocScreen, label: 'Accueil', desc: 'Statut du bail, loyer et alertes CDC-CI', icon: Home },
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

  const router = useRouter();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await fetchWithAuth('/locataire/dashboard');
        const json = await response.json();
        if (response.ok) {
          setData(json);
        }
      } catch (e) {
        // Fallback to prototype data if offline or dev
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const loyer = data?.currentRentAmount || 150000;
  const propName = data?.propertyName || 'Appartement A1 · Résidence Émeraude, Cocody';
  const bailRef = data?.leaseReference || 'BAIL-2025-0417';
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
                <Text style={styles.drawerUser}>Adjoua Kouamé</Text>
                <Text style={styles.drawerUserSub}>Bail {bailRef} · Cocody</Text>
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
                onPress={async () => {
                  setMenuOpen(false);
                  await clearAppSessionAndCache();
                  if (typeof window !== 'undefined') {
                    window.location.replace('/');
                  } else {
                    router.replace('/');
                  }
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

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* =========================================================
            ÉCRAN 1 · ACCUEIL LOCATAIRE
           ========================================================= */}
        {screen === 'accueil' && (
          <View style={styles.sectionGap}>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.subMuted}>QAPRIL · Espace locataire</Text>
                <Text style={styles.h1}>Adjoua Kouamé</Text>
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
                <Text style={styles.heroSub}>LOYER DE NOVEMBRE 2026</Text>
                <View style={styles.pillOk}>
                  <Text style={styles.pillOkText}>À jour · 12/12 à l’heure</Text>
                </View>
              </View>
              <Text style={styles.heroBig}>{fmt(loyer)}</Text>
              <Text style={styles.heroSub}>
                Prochaine échéance : le 5 décembre 2026 · Frais QAPRIL : 0 F
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

            {/* GRILLE DE NAVIGATION RAPIDE VERS LES 8 ÉCRANS */}
            <Text style={styles.label}>MON DOSSIER LOCATIF</Text>
            <View style={styles.grid2}>
              <Pressable style={styles.cardGrid} onPress={() => setScreen('quittances')}>
                <FileText color="#2C3E6B" size={20} />
                <Text style={styles.cardTitle}>Quittances</Text>
                <Text style={styles.cardSub}>12 quittances SHA-256</Text>
              </Pressable>
              <Pressable style={styles.cardGrid} onPress={() => setScreen('caution')}>
                <Lock color="#1E7E4E" size={20} />
                <Text style={styles.cardTitle}>Ma caution</Text>
                <Text style={styles.cardSub}>{fmt(loyer * 2)} consignés</Text>
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
                <Text style={styles.cardSub}>Tranche ICL A · confidentiel</Text>
              </Pressable>
              <Pressable style={styles.cardGrid} onPress={() => setScreen('recherche')}>
                <Search color="#2C3E6B" size={20} />
                <Text style={styles.cardTitle}>Ma recherche</Text>
                <Text style={styles.cardSub}>3 offres compatibles</Text>
              </Pressable>
            </View>
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
                <Text style={styles.boldText}>12 loyers payés à l’heure sur 12</Text>
                <View style={styles.pillOk}>
                  <Text style={styles.pillOkText}>100 % régularité</Text>
                </View>
              </View>
              <Pressable
                style={[styles.btnGhost, { marginTop: 10 }]}
                onPress={() =>
                  Alert.alert(
                    'Dossier PDF généré',
                    'Pack de vos 12 dernières quittances certifiées SHA-256 prêt à être partagé.'
                  )
                }
              >
                <Text style={styles.btnGhostText}>Télécharger les 12 derniers mois (PDF unique)</Text>
              </Pressable>
            </View>

            {[
              { m: 'Novembre 2026', d: '3 nov. 2026', via: 'Wave', sha: '9f3a…c17e' },
              { m: 'Octobre 2026', d: '4 oct. 2026', via: 'Wave', sha: '8b2c…e04a' },
              { m: 'Septembre 2026', d: '2 sept. 2026', via: 'Orange Money', sha: '71d9…33f1' },
              { m: 'Août 2026', d: '3 août 2026', via: 'Wave', sha: '4e01…99b2' },
            ].map((q, i) => (
              <View key={i} style={styles.cardRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.boldText}>{q.m} · {fmt(loyer)}</Text>
                  <Text style={styles.subMuted}>Payé le {q.d} via {q.via} · SHA-256 {q.sha}</Text>
                </View>
                <Pressable
                  style={styles.pillTint}
                  onPress={() => Alert.alert('Quittance PDF', `Quittance ${q.m} (${q.sha}) ouverte.`)}
                >
                  <Text style={styles.pillTintText}>PDF</Text>
                </Pressable>
              </View>
            ))}
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
              <Text style={styles.heroBig}>{fmt(loyer * 2)}</Text>
              <Text style={styles.heroSub}>
                2 mois de loyer · Restitution légale sous 30 jours maximum après remise des clés (art. 416 CCH)
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
              <Text style={styles.label}>PRINCIPE DES DEUX HORLOGES</Text>
              <View style={[styles.rowBetween, { marginTop: 8 }]}>
                <Text style={styles.subMuted}>Horloge contractuelle (entrée)</Text>
                <Text style={styles.boldText}>1 juil. 2025 → 30 juin 2027</Text>
              </View>
              <View style={[styles.rowBetween, { marginTop: 6 }]}>
                <Text style={styles.subMuted}>Prochaine révision légale (3 ans)</Text>
                <Text style={styles.boldText}>Pas avant le 1 juil. 2028</Text>
              </View>
              <View style={[styles.rowBetween, { marginTop: 6 }]}>
                <Text style={styles.subMuted}>Préavis contractuel</Text>
                <Text style={styles.boldText}>3 mois</Text>
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

            {[
              { t: 'Contrat de bail signé + Reçu DGI', s: `${bailRef} · art. 414 CCH · SHA-256` },
              { t: 'État des lieux d’entrée contradictoire', s: '14 photos horodatées · compteurs relevés' },
              { t: 'Attestation de dépôt de garantie', s: `${fmt(loyer * 2)} · 2 mois consignés` },
            ].map((doc, i) => (
              <Pressable
                key={i}
                style={styles.cardRow}
                onPress={() => Alert.alert(doc.t, 'Document PDF certifié SHA-256 ouvert.')}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.boldText}>{doc.t}</Text>
                  <Text style={styles.subMuted}>{doc.s}</Text>
                </View>
                <ChevronRight color="#6B7280" size={18} />
              </Pressable>
            ))}
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
              <Text style={styles.heroBig}>12 / 12 à l’heure</Text>
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
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.h1}>Ma recherche</Text>
                <Text style={styles.subMuted}>
                  Recevez les offres vérifiées compatibles avec votre profil (sans frais d’annonce illégaux)
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

            {[
              {
                title: 'Appartement 3P · Cocody Angré 8e Tranche',
                loyer: 165000,
                compat: 92,
                niv: 'Bien vérifié · Niveau 3 (Titre contrôlé)',
              },
              {
                title: 'Appartement 3P · Marcory Résidentiel',
                loyer: 200000,
                compat: 86,
                niv: 'Bien vérifié · Niveau 4 (Visite CPRAIMA-CI)',
              },
            ].map((off, i) => (
              <View key={i} style={styles.card}>
                <View style={styles.rowBetween}>
                  <Text style={styles.boldText}>{off.title}</Text>
                  <View style={styles.pillTint}>
                    <Text style={styles.pillTintText}>Compat. {off.compat}/100</Text>
                  </View>
                </View>
                <Text style={[styles.h2, { color: '#2C3E6B', marginTop: 4 }]}>
                  {fmt(off.loyer)} / mois
                </Text>
                <Text style={[styles.subMuted, { marginTop: 2 }]}>
                  {off.niv} · Dépôt max 2 mois · Avance max 2 mois
                </Text>
                <Pressable
                  style={[styles.btnPrimary, { marginTop: 10 }]}
                  onPress={() =>
                    Alert.alert(
                      'Candidature envoyée',
                      'Votre Passeport Locatif (Tranche A, sans pièces sensibles) a été transmis au bailleur.'
                    )
                  }
                >
                  <Text style={styles.btnPrimaryText}>Candidater en 1 clic avec mon Passeport</Text>
                </Pressable>
              </View>
            ))}
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
              <Text style={styles.boldText}>https://pay.qapril.ci/p/BAIL-2025-0417-NOV</Text>
              <Text style={styles.subMuted}>Montant : {fmt(loyer)} · Bénéficiaire quittance : Adjoua Kouamé</Text>
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
              <Text style={styles.boldText}>Titulaire : Adjoua Kouamé</Text>
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
              <Text style={styles.boldText}>Adjoua K. · Tranche ICL A</Text>
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
    fontWeight: '900',
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
    fontWeight: '800',
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
    fontWeight: '900',
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
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  drawerUser: {
    fontSize: 18,
    fontWeight: '800',
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
    fontWeight: '900',
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
    fontWeight: '800',
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
  h1: { fontSize: 22, fontWeight: '800', color: '#1A1D26', letterSpacing: -0.4 },
  h2: { fontSize: 17, fontWeight: '800', color: '#1A1D26' },
  subMuted: { fontSize: 12, color: '#6B7280', lineHeight: 17 },
  boldText: { fontSize: 13, fontWeight: '700', color: '#1A1D26' },
  label: { fontSize: 11, fontWeight: '800', color: '#6B7280', letterSpacing: 0.6 },
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
  heroBig: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.6 },
  heroActions: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  btnWhite: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnWhiteText: { color: '#2C3E6B', fontSize: 12, fontWeight: '800' },
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
  pillOk: { backgroundColor: '#E3F5EC', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 },
  pillOkText: { color: '#1E7E4E', fontSize: 11, fontWeight: '700' },
  pillTint: { backgroundColor: '#E8ECF6', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
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
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#1A1D26', marginTop: 4 },
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
  btnPrimaryText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
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
});
