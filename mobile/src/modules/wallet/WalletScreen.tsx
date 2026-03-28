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
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../theme/theme';
import { Badge } from '../../components/common/Badge';
import { Row } from '../../components/common/Row';
import { SectionTitle } from '../../components/common/SectionTitle';
import { WalletCard } from '../../components/common/WalletCard';
import { BrandHeader } from '../../components/common/BrandHeader';
import { 
  useLocataire, 
  useBail, 
  useQuittances, 
  useAbonnementsEnergie, 
  useAuth,
  usePaymentActions,
  setAuthToken 
} from '../../hooks/qapril-hooks';

const { width } = Dimensions.get('window');

// --- Mock Data from Reference JSX ---
const BAIL = {
  ref: "BAIL-CI-2026-0042",
  type: "BDQ",
  logement: "Appt 3B — Résid. Lagune",
  adresse: "Résid. Lagune · Plateau",
  loyer: 150000,
  debut: "01/01/2026",
  fin: "31/12/2026",
  statut: "Impayé",
  retard: 12,
  typeGestion: "agreee",
  agence: "Immobilière du Golfe",
  bailleurCode: "BAI-042",
};

const LOC = {
  nom: "Traoré Souleymane",
  score: 794,
};

const QUITTANCES = [
  { ref: "QIT-2026-0155", mois: "Fév. 2026", montant: 150000, statut: "Certifiée", date: "02/02/2026" },
  { ref: "QIT-MANQ-044", mois: "Mars 2026", montant: 150000, statut: "Impayée", date: "—" },
];

const ABOS = [
  { id: "cie", icon: "⚡", label: "Électricité — CIE", color: Theme.colors.orange, bg: Theme.colors.orangePale, montant: 28500, status: "Payée", mois: "Fév. 2026" },
  { id: "sodeci", icon: "💧", label: "Eau — SODECI", color: Theme.colors.teal, bg: Theme.colors.tealPale, montant: 9200, status: "Payée", mois: "Fév. 2026" },
];

export default function WalletScreen({ onBack }: { onBack?: () => void }) {
  const [tab, setTab] = useState("dash");
  const [email, setEmail] = useState("tenant@qapril.ci"); // Default for testing

  const { data: locData, loading: locLoading } = useLocataire();
  const { data: bailData, loading: bailLoading } = useBail();
  const { data: quittData, loading: quittLoading } = useQuittances();
  const { data: abosData, loading: abosLoading } = useAbonnementsEnergie();
  const { verifyOTP, loading: authLoading } = useAuth();
  const { payReceipt, loading: paying } = usePaymentActions();

  const handlePay = async (receiptId: string) => {
    try {
      await payReceipt(receiptId);
      alert("Paiement réussi ! Votre quittance est désormais certifiée.");
      // In a real app, we would revalidate. For simulation, alert is enough.
    } catch (e: any) {
      alert("Erreur de paiement: " + e.message);
    }
  };

  // Use real data or fallback to MOCK if not loaded
  const LOC = locData || { nom: "Chargement...", score: 750 };
  const BAIL = bailData || { 
    ref: "...", logement: "Chargement...", adresse: "...", loyer: 0, 
    debut: "...", fin: "...", statut: "...", retard: 0, 
    typeGestion: "...", agence: "...", bailleurCode: "..." 
  };
  const QUITTANCES = quittData || [];
  const ABOS = abosData || [];

  const handleDebugLogin = async () => {
    try {
      // Simulate real OTP verification for development
      const res = await verifyOTP(email, "1234");
      alert("Authentifié ! Token reçu.");
    } catch (e: any) {
      alert("Erreur: " + e.message);
    }
  };

  const changeTab = (t: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTab(t);
  };

  const fmt = (n: number) => n.toLocaleString("fr-FR");
  const scColor = LOC.score >= 850 ? Theme.colors.green : LOC.score >= 700 ? Theme.colors.teal : Theme.colors.orange;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView bounces={false} contentContainerStyle={styles.scrollContent}>
        
        <BrandHeader 
          title={LOC.nom}
          subtitle={`Occupant du ${BAIL.logement}`}
          roleLabel="LOCATAIRE"
          roleColor={Theme.colors.teal}
          onNotifPress={() => alert("Notifications Locataire")}
        />

        {/* KPI Row - Floating */}
        <View style={{ marginTop: -25, paddingHorizontal: 16 }}>
          <View style={styles.kpiRow}>
            {[
               { l: "Loyer/mois", v: fmt(BAIL.loyer) + "F", icon: "💰", tab: null },
               { l: "Quittances", v: QUITTANCES.length.toString(), icon: "🧾", tab: "quitt" },
               { l: "Score ICL", v: LOC.score, icon: "⭐", tab: "profil" },
               { l: "Caution", v: "—", icon: "🔒", tab: null },
            ].map((k, i) => (
              <TouchableOpacity 
                key={i} 
                onPress={() => k.tab && changeTab(k.tab)}
                style={styles.kpiCard}
              >
                <Text style={{ fontSize: 13 }}>{k.icon}</Text>
                <Text style={styles.kpiValue}>{k.v}</Text>
                <Text style={styles.kpiLabel}>{k.l}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.body}>
          {/* ══ ACCUEIL ══ */}
          {tab === "dash" && (
            <>
              {/* Alerte Impayé */}
              {BAIL.statut === "Impayé" && (
                <View style={styles.alertCard}>
                  <Text style={styles.alertTitle}>⚠ Loyer Mars 2026 — J+{BAIL.retard}</Text>
                  <Text style={styles.alertSub}>{fmt(BAIL.loyer)} FCFA non encaissé. Si vous avez payé, soumettez votre justificatif.</Text>
                  <View style={styles.alertActions}>
                    <TouchableOpacity style={styles.alertBtnPrimary}>
                      <Text style={styles.alertBtnText}>Signaler un problème</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.alertBtnSecondary} onPress={() => setTab("quitt")}>
                      <Text style={styles.alertBtnTextSecondary}>Mes quittances</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Mon Logement */}
              <View style={styles.section}>
                <SectionTitle label="Mon logement" />
                <TouchableOpacity style={styles.logementCard} onPress={() => setTab("bail")}>
                  <Text style={styles.logementTitle}>{BAIL.logement}</Text>
                  <View style={styles.badgeRow}>
                    <Badge label={BAIL.type} color={Theme.colors.teal} bg={Theme.colors.tealPale} />
                    <Badge label={`Fin : ${BAIL.fin}`} color={Theme.colors.textLight} bg={Theme.colors.grey1} />
                  </View>
                  <View style={styles.gestionInfo}>
                    <View style={styles.gestionTop}>
                      <View>
                        <Text style={styles.gestionLabel}>AGENCE</Text>
                        <Text style={styles.gestionValue}>{BAIL.agence}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.gestionLabel}>RÉF. BAILLEUR</Text>
                        <Text style={styles.roleValue}>{BAIL.bailleurCode}</Text>
                      </View>
                    </View>
                    <Text style={styles.gestionMention}>🔐 Agence agréée — substitution totale exclusive</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Dernière quittance */}
              <View style={styles.section}>
                <SectionTitle 
                  label="Dernière quittance" 
                  right={<TouchableOpacity onPress={() => setTab("quitt")}><Text style={styles.sectionLink}>Tout voir →</Text></TouchableOpacity>} 
                />
                <TouchableOpacity style={styles.quittanceCard} onPress={() => setTab("quitt")}>
                  <View style={styles.quittanceLeft}>
                    <Text style={styles.quittanceMois}>Fév. 2026 — {fmt(150000)} FCFA</Text>
                    <Text style={styles.quittanceRef}>QIT-2026-0155</Text>
                  </View>
                  <Badge label="✓ Certifiée" color={Theme.colors.green} bg={Theme.colors.white} />
                </TouchableOpacity>
              </View>

              {/* CIE / SODECI */}
              <View style={styles.section}>
                <SectionTitle label="⚡ CIE / SODECI" right={<TouchableOpacity onPress={() => setTab("util")}><Text style={styles.sectionLink}>Voir →</Text></TouchableOpacity>} />
                <View style={styles.aboRow}>
                  {ABOS.map((a: any) => (
                    <TouchableOpacity key={a.id} onPress={() => setTab("util")} style={[styles.aboCard, { backgroundColor: a.bg || Theme.colors.grey1, borderColor: `${a.color || Theme.colors.teal}33` }]}>
                      <Text style={{ fontSize: 18, marginBottom: 2 }}>{a.icon || '⚡'}</Text>
                      <Text style={[styles.aboType, { color: a.color || Theme.colors.teal }]}>{a.type ? a.type.toUpperCase() : a.id.toUpperCase()}</Text>
                      <Text style={styles.aboAmount}>{fmt(a.montant || a.derniereFacture?.montant || 0)}</Text>
                      <Text style={styles.aboSub}>FCFA · {a.mois || a.derniereFacture?.mois}</Text>
                      <View style={{ marginTop: 4 }}>
                        <Badge label={a.status || a.derniereFacture?.statut} color={Theme.colors.green} bg={Theme.colors.greenPale} size={8} />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Accès Rapides */}
              <View style={styles.section}>
                <SectionTitle label="⚡ Accès rapides" />
                <View style={styles.quickActionsGrid}>
                  {[
                    { icon: "📤", label: "Export certifié", sub: "36 mois · banque", color: Theme.colors.navy, bg: Theme.colors.navyPale },
                    { icon: "⚖️", label: "Mes droits", sub: "Réclamation", color: Theme.colors.purple, bg: Theme.colors.purplePale },
                    { icon: "🔒", label: "Ma caution", sub: "Statut CDC", color: Theme.colors.teal, bg: Theme.colors.tealPale },
                    { icon: "📲", label: "USSD", sub: "*144*QAPRIL#", color: Theme.colors.green, bg: Theme.colors.greenPale },
                  ].map((a, i) => (
                    <TouchableOpacity key={i} style={[styles.quickActionBox, { backgroundColor: a.bg, borderColor: `${a.color}2e` }]}>
                      <Text style={{ fontSize: 18, marginBottom: 3 }}>{a.icon}</Text>
                      <Text style={[styles.quickActionLabel, { color: a.color }]}>{a.label}</Text>
                      <Text style={styles.quickActionSub}>{a.sub}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* ══ MON BAIL ══ */}
          {tab === "bail" && (
            <View style={styles.section}>
              <TouchableOpacity style={styles.logementCard}>
                <Text style={styles.logementTitle}>{BAIL.logement}</Text>
                <Text style={styles.logementSub}>{BAIL.adresse}</Text>
                <View style={[styles.badgeRow, { marginTop: 8 }]}>
                  <Badge label={BAIL.type} color={Theme.colors.teal} bg={Theme.colors.tealPale} />
                  <Badge label={BAIL.ref} color={Theme.colors.textLight} bg={Theme.colors.grey1} size={9} />
                  {BAIL.statut === "Impayé" ? <Badge label={`J+${BAIL.retard}`} color={Theme.colors.white} bg={Theme.colors.red} /> : <Badge label="À jour" color={Theme.colors.green} bg={Theme.colors.greenPale} />}
                </View>
                <View style={styles.bailKpiRow}>
                  {[{ l: "Loyer", v: fmt(BAIL.loyer) + " F" }, { l: "Début", v: BAIL.debut }, { l: "Fin", v: BAIL.fin }].map((k, i) => (
                    <View key={i} style={styles.bailKpiItem}>
                      <Text style={styles.bailKpiLabel}>{k.l}</Text>
                      <Text style={styles.bailKpiValue}>{k.v}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
              
              <View style={{ marginTop: 15 }}>
                <Row label="Référence" value={BAIL.ref} />
                <Row label="Type de bail" value={BAIL.type} color={Theme.colors.teal} />
                <Row label="Loyer mensuel" value={fmt(BAIL.loyer) + " FCFA"} color={Theme.colors.navy} />
                <Row label="Échéance" value="Le 1er de chaque mois" />
                <Row label="Fin de bail" value={BAIL.fin} />
              </View>

              <View style={styles.gestionSection}>
                <SectionTitle label="Bailleur & Gestion" />
                <Row label="Agence" value={BAIL.agence} color={Theme.colors.teal} />
                <Row label="Réf. bailleur" value={BAIL.bailleurCode} color={Theme.colors.grey3} />
                <View style={styles.gestionNotice}>
                  <Text style={styles.gestionNoticeText}>🔐 Agence agréée — substitution totale exclusive. Votre interlocuteur est uniquement l'agence.</Text>
                </View>
              </View>

              <View style={styles.actionSection}>
                <SectionTitle label="Actions" />
                <WalletCard icon="📄" label="Télécharger mon bail PDF" sub="SHA-256 certifié" color={Theme.colors.navy} bg={Theme.colors.navyPale} />
                <WalletCard icon="🚪" label="Initier un préavis de sortie" sub="1 mois de délai légal" color={Theme.colors.orange} bg={Theme.colors.orangePale} />
              </View>
            </View>
          )}

          {/* ══ QUITTANCES ══ */}
          {tab === "quitt" && (
            <View style={styles.section}>
              <View style={styles.quittanceSummaryRow}>
                {[{ l: "Certifiées", v: "1", c: Theme.colors.green, bg: Theme.colors.greenPale }, { l: "Impayées", v: "1", c: Theme.colors.red, bg: Theme.colors.redPale }, { l: "Total", v: "150K", c: Theme.colors.navy, bg: Theme.colors.navyPale }].map((k, i) => (
                  <View key={i} style={[styles.quittanceSummaryCard, { backgroundColor: k.bg, borderColor: `${k.c}33` }]}>
                    <Text style={[styles.quittanceSummaryValue, { color: k.c }]}>{k.v}</Text>
                    <Text style={styles.quittanceSummaryLabel}>{k.l}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.securityNotice}>
                <Text style={styles.securityNoticeText}>🔐 SHA-256 · QR Code · Opposables juridiquement</Text>
              </View>
              {QUITTANCES.map((q: any, i: number) => (
                <TouchableOpacity key={i} style={[styles.quittanceListItem, { borderLeftColor: q.statut === "Certifiée" ? Theme.colors.green : Theme.colors.red }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.quittanceListTitle}>{q.mois} — {fmt(q.montant)} FCFA</Text>
                    <Text style={styles.quittanceListSub}>{q.ref} · {q.date}</Text>
                    {q.statut === "Impayée" && (
                      <TouchableOpacity 
                        style={styles.payNowBtn} 
                        onPress={() => handlePay(q.id || "SIM-ID")}
                        disabled={paying}
                      >
                         <Text style={styles.payNowText}>{paying ? "TRAITEMENT..." : "💳 PAYER MAINTENANT"}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Badge label={q.statut} color={q.statut === "Certifiée" ? Theme.colors.green : Theme.colors.red} bg={q.statut === "Certifiée" ? Theme.colors.greenPale : Theme.colors.redPale} />
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.exportBtn}>
                <Text style={styles.exportBtnText}>📤 Exporter l'historique certifié (36 mois)</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ══ CIE / SODECI ══ */}
          {tab === "util" && (
            <View style={styles.section}>
              <View style={styles.utilityNotice}>
                <Text style={styles.utilityNoticeText}>⚡ Suivi de vos abonnements CIE et SODECI liés à votre logement.</Text>
              </View>
              {ABOS.map((a: any) => (
                <TouchableOpacity key={a.id} style={[styles.utilityCard, { borderLeftColor: a.color || Theme.colors.teal }]}>
                  <View style={styles.utilityTop}>
                    <View style={styles.utilityIconContainer}>
                      <View style={[styles.utilityIconBg, { backgroundColor: a.bg || Theme.colors.grey1 }]}>
                        <Text style={{ fontSize: 22 }}>{a.icon || '⚡'}</Text>
                      </View>
                      <View>
                        <Text style={styles.utilityLabel}>{a.label || (a.type + ' — ' + a.contrat)}</Text>
                        <Text style={styles.utilitySub}>N° {a.compteur || '...'}</Text>
                        <View style={styles.utilityBadgeRow}>
                          <Badge label={a.status || a.derniereFacture?.statut} color={Theme.colors.green} bg={Theme.colors.greenPale} />
                          <Badge label={a.mois || a.derniereFacture?.mois} color={Theme.colors.textLight} bg={Theme.colors.grey1} />
                        </View>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.utilityAmount, { color: a.color || Theme.colors.teal }]}>{fmt(a.montant || a.derniereFacture?.montant || 0)}</Text>
                      <Text style={styles.utilityCurrency}>FCFA</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
              <View style={{ marginTop: 15 }}>
                <WalletCard icon="📲" label="Payer en ligne" sub="Orange · Wave · MTN" color={Theme.colors.green} bg={Theme.colors.greenPale} />
                <WalletCard icon="🔔" label="Activer les rappels" sub="SMS + WhatsApp" color={Theme.colors.navy} bg={Theme.colors.navyPale} />
              </View>
            </View>
          )}

          {/* ══ PROFIL ══ */}
          {tab === "profil" && (
            <View style={styles.section}>
              <LinearGradient
                colors={[Theme.colors.navy, Theme.colors.teal]}
                style={styles.profileHeader}
              >
                <View style={styles.avatar}>
                  <Text style={{ fontSize: 26 }}>👤</Text>
                </View>
                <Text style={styles.profileName}>{LOC.nom}</Text>
                <Text style={styles.profileTel}>+225 05 44 55 66</Text>
                <View style={styles.profileBadgeRow}>
                  <Badge label="KYC Validé" color={Theme.colors.white} bg={Theme.colors.green} />
                  <Badge label="Locataire actif" color={Theme.colors.white} bg={Theme.colors.teal} />
                </View>
              </LinearGradient>

              {/* Score ICL */}
              <TouchableOpacity style={[styles.scoreCard, { backgroundColor: `${scColor}15`, borderColor: `${scColor}33` }]}>
                <View style={styles.scoreTop}>
                  <View>
                    <Text style={styles.scoreLabel}>MON SCORE ICL</Text>
                    <Text style={[styles.scoreValue, { color: scColor }]}>{LOC.score}</Text>
                    <Text style={[styles.scoreStatus, { color: scColor }]}>Confiance {LOC.score >= 700 ? "satisfaisante" : "modérée"}</Text>
                  </View>
                  <View style={[styles.scoreCircle, { borderColor: scColor }]}>
                    <Text style={[styles.scorePercent, { color: scColor }]}>{Math.round((LOC.score - 300) / 700 * 100)}%</Text>
                  </View>
                </View>
                <View style={styles.scoreBarContainer}>
                  <View style={[styles.scoreBar, { width: `${Math.round((LOC.score - 300) / 700 * 100)}%`, backgroundColor: scColor }]} />
                </View>
                <View style={styles.scoreNotice}>
                  <Text style={styles.scoreNoticeText}>🔐 Visible librement · Partageable sur votre autorisation — Règle ICL-CONSENT-01</Text>
                </View>
              </TouchableOpacity>

              <SectionTitle label="Inclusion financière" />
              <WalletCard icon="📄" label="Export certifié SHA-256" sub="Format banque · 36 mois" color={Theme.colors.navy} bg={Theme.colors.navyPale} />
              <WalletCard icon="📊" label="Export CSV" color={Theme.colors.teal} bg={Theme.colors.tealPale} />
            </View>
          )}
        </View>
      </ScrollView>

      {/* BOTTOM NAV BAR */}
      <View style={styles.bottomNav}>
        {[
          { id: "dash", icon: "🏠", label: "Accueil" },
          { id: "bail", icon: "📋", label: "Bail" },
          { id: "quitt", icon: "🧾", label: "Recus" },
          { id: "util", icon: "⚡", label: "Util" },
          { id: "profil", icon: "👤", label: "Profil" },
        ].map(n => (
          <TouchableOpacity key={n.id} onPress={() => changeTab(n.id)} style={styles.navItem}>
            <Text style={[styles.navIcon, { opacity: tab === n.id ? 1 : 0.4 }]}>{n.icon}</Text>
            <Text style={[styles.navLabel, { color: tab === n.id ? Theme.colors.navy : Theme.colors.textLight }]}>{n.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.bg,
  },
  debugBar: {
    backgroundColor: Theme.colors.navy,
    padding: 8,
    alignItems: 'center',
  },
  debugText: {
    color: Theme.colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingTop: 14,
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  roleBadge: {
    backgroundColor: Theme.colors.teal,
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 2,
    marginRight: 7,
  },
  roleText: {
    fontSize: 9,
    fontWeight: '900',
    color: Theme.colors.white,
    letterSpacing: 1.5,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#5EE7B7',
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: Theme.colors.white,
  },
  userSub: {
    fontSize: 11,
    color: Theme.colors.white,
    opacity: 0.6,
    marginTop: 2,
  },
  notifBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute',
    bottom: -5,
    backgroundColor: Theme.colors.red,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  notifBadgeText: {
    color: Theme.colors.white,
    fontSize: 9,
    fontWeight: '700',
  },
  kpiRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 7,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 12,
    fontWeight: '800',
    color: Theme.colors.white,
    marginTop: 2,
  },
  kpiLabel: {
    fontSize: 8,
    color: Theme.colors.white,
    opacity: 0.55,
  },
  body: {
    paddingHorizontal: 16,
  },
  alertCard: {
    marginTop: 14,
    backgroundColor: Theme.colors.redPale,
    borderWidth: 1,
    borderColor: 'rgba(160,0,0,0.25)',
    borderRadius: 13,
    padding: 12,
  },
  alertTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Theme.colors.red,
    marginBottom: 4,
  },
  alertSub: {
    fontSize: 10,
    color: Theme.colors.textMid,
    marginBottom: 10,
  },
  alertActions: {
    flexDirection: 'row',
    gap: 7,
  },
  alertBtnPrimary: {
    flex: 1,
    backgroundColor: Theme.colors.red,
    borderRadius: 9,
    paddingVertical: 7,
    alignItems: 'center',
  },
  alertBtnSecondary: {
    flex: 1,
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: 'rgba(160,0,0,0.3)',
    borderRadius: 9,
    paddingVertical: 7,
    alignItems: 'center',
  },
  alertBtnText: {
    color: Theme.colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  alertBtnTextSecondary: {
    color: Theme.colors.red,
    fontSize: 10,
    fontWeight: '700',
  },
  section: {
    marginTop: 20,
  },
  sectionLink: {
    fontSize: 10,
    fontWeight: '700',
    color: Theme.colors.teal,
  },
  logementCard: {
    backgroundColor: 'rgba(13,43,110,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(13,43,110,0.15)',
    borderRadius: 14,
    padding: 13,
  },
  logementTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  logementSub: {
    fontSize: 10,
    color: Theme.colors.textLight,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 10,
  },
  gestionInfo: {
    backgroundColor: Theme.colors.grey1,
    borderRadius: 9,
    padding: 9,
  },
  gestionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gestionLabel: {
    fontSize: 8,
    color: Theme.colors.textLight,
    fontWeight: '700',
    marginBottom: 1,
  },
  gestionValue: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.textMid,
  },
  roleValue: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.grey3,
  },
  gestionMention: {
    fontSize: 9,
    color: Theme.colors.textLight,
    marginTop: 5,
    fontStyle: 'italic',
  },
  bailKpiRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  bailKpiItem: {
    flex: 1,
    backgroundColor: Theme.colors.white,
    borderRadius: 9,
    paddingVertical: 6,
    alignItems: 'center',
  },
  bailKpiLabel: {
    fontSize: 9,
    color: Theme.colors.textLight,
    marginBottom: 2,
  },
  bailKpiValue: {
    fontSize: 10,
    fontWeight: '800',
    color: Theme.colors.textMid,
  },
  gestionSection: {
    marginTop: 15,
    backgroundColor: Theme.colors.grey1,
    borderRadius: 12,
    padding: 12,
  },
  gestionNotice: {
    marginTop: 8,
    backgroundColor: Theme.colors.navyPale,
    borderRadius: 9,
    padding: 8,
  },
  gestionNoticeText: {
    fontSize: 9,
    color: Theme.colors.textMid,
  },
  actionSection: {
    marginTop: 15,
  },
  quittanceCard: {
    backgroundColor: Theme.colors.greenPale,
    borderWidth: 1,
    borderColor: 'rgba(26,122,60,0.2)',
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.green,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quittanceLeft: {
    flex: 1,
  },
  quittanceMois: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  quittanceRef: {
    fontSize: 9,
    color: Theme.colors.textLight,
    marginTop: 1,
  },
  quittanceSummaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  quittanceSummaryCard: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  quittanceSummaryValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  quittanceSummaryLabel: {
    fontSize: 9,
    color: Theme.colors.textLight,
    marginTop: 2,
  },
  securityNotice: {
    backgroundColor: Theme.colors.greenPale,
    borderWidth: 1,
    borderColor: 'rgba(26,122,60,0.2)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  securityNoticeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Theme.colors.green,
  },
  quittanceListItem: {
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: Theme.colors.grey2,
    borderLeftWidth: 4,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quittanceListTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  quittanceListSub: {
    fontSize: 9,
    color: Theme.colors.textLight,
    marginTop: 1,
  },
  exportBtn: {
    width: '100%',
    backgroundColor: Theme.colors.navyPale,
    borderWidth: 1,
    borderColor: 'rgba(13,43,110,0.2)',
    borderRadius: 11,
    padding: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  exportBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.navy,
  },
  payNowBtn: {
    backgroundColor: Theme.colors.green,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  payNowText: {
    color: Theme.colors.white,
    fontSize: 10,
    fontWeight: '900',
  },
  aboRow: {
    flexDirection: 'row',
    gap: 7,
  },
  aboCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  aboType: {
    fontSize: 10,
    fontWeight: '700',
  },
  aboAmount: {
    fontSize: 13,
    fontWeight: '900',
    color: Theme.colors.text,
  },
  aboSub: {
    fontSize: 8,
    color: Theme.colors.textLight,
  },
  utilityNotice: {
    backgroundColor: Theme.colors.orangePale,
    borderWidth: 1,
    borderColor: 'rgba(192,91,0,0.2)',
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 12,
  },
  utilityNoticeText: {
    fontSize: 10,
    color: Theme.colors.textMid,
  },
  utilityCard: {
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: Theme.colors.grey2,
    borderLeftWidth: 4,
    borderRadius: 13,
    padding: 13,
    marginBottom: 10,
  },
  utilityTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  utilityIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  utilityIconBg: {
    width: 44,
    height: 44,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  utilityLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  utilitySub: {
    fontSize: 10,
    color: Theme.colors.textLight,
    marginTop: 1,
  },
  utilityBadgeRow: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 4,
  },
  utilityAmount: {
    fontSize: 16,
    fontWeight: '900',
  },
  utilityCurrency: {
    fontSize: 9,
    color: Theme.colors.textLight,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  quickActionBox: {
    width: (width - 32 - 7) / 2,
    borderWidth: 1,
    borderRadius: 12,
    padding: 11,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  quickActionSub: {
    fontSize: 9,
    color: Theme.colors.textLight,
    marginTop: 1,
  },
  profileHeader: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  profileName: {
    fontSize: 15,
    fontWeight: '800',
    color: Theme.colors.white,
  },
  profileTel: {
    fontSize: 11,
    color: Theme.colors.white,
    opacity: 0.7,
  },
  profileBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  scoreCard: {
    borderWidth: 1.5,
    borderRadius: 13,
    padding: 13,
    marginBottom: 12,
  },
  scoreTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Theme.colors.textLight,
    letterSpacing: 1,
  },
  scoreValue: {
    fontSize: 30,
    fontWeight: '900',
  },
  scoreStatus: {
    fontSize: 10,
    fontWeight: '700',
  },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scorePercent: {
    fontSize: 11,
    fontWeight: '800',
  },
  scoreBarContainer: {
    height: 5,
    backgroundColor: Theme.colors.grey1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBar: {
    height: '100%',
    borderRadius: 4,
  },
  scoreNotice: {
    marginTop: 8,
    backgroundColor: Theme.colors.navyPale,
    borderRadius: 7,
    padding: 8,
  },
  scoreNoticeText: {
    fontSize: 9,
    color: Theme.colors.textLight,
    fontStyle: 'italic',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: Theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.grey2,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingBottom: 25,
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 20,
  },
  navLabel: {
    fontSize: 9,
    marginTop: 2,
    fontWeight: '700',
  },
});
