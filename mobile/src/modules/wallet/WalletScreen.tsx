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
  useLocataire, 
  useBail, 
  useQuittances, 
  useAbonnementsEnergie, 
  useTickets,
  useLocataireMutations,
  usePaymentActions
} from '../../hooks/qapril-hooks';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

const RCL_TYPES = [
  { code: "RCL-01", label: "Quittance incorrecte", sub: "Montant, période ou nom erroné", icon: "🧾" },
  { code: "RCL-02", label: "Paiement sans quittance", sub: "Preuve Mobile Money + aucune quittance émise", icon: "💸" },
  { code: "RCL-03", label: "Charges non contractuelles", sub: "Montant hors bail enregistré", icon: "💰" },
  { code: "RCL-04", label: "Harcèlement ou pression", sub: "Tentative expulsion informelle ou pressions", icon: "🚨" },
  { code: "RCL-05", label: "Demande de travaux", sub: "Réparation urgente · entretien · mise en conformité", icon: "🔧", travaux: true },
];

export default function WalletScreen({ onBack }: { onBack?: () => void }) {
  const [tab, setTab] = useState("dash");
  const [dsec, setDsec] = useState<string | null>(null);
  const [rclCode, setRclCode] = useState<string | null>(null);
  const [prStep, setPrStep] = useState(1);
  const [preavisDate, setPreavisDate] = useState('');
  const [tSel, setTSel] = useState<any>(null);

  // Form states
  const [rclData, setRclData] = useState({ type: '', desc: '', urgent: false });

  const { data: locData, loading: locLoading, refetch: refetchLoc } = useLocataire();
  const { data: bailData, loading: bailLoading } = useBail();
  const { data: quittData, loading: quittLoading, refetch: refetchQuitt } = useQuittances();
  const { data: abosData } = useAbonnementsEnergie();
  const { data: ticketsData, refetch: refetchTickets } = useTickets();
  const { payReceipt, loading: paying } = usePaymentActions();
  const { submitTicket, respondMRL, submitPreavis, loading: mutationLoading } = useLocataireMutations();

  const changeTab = (t: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTab(t);
    setDsec(null);
    setRclCode(null);
    setPrStep(1);
    setTSel(null);
  };

  const handlePay = async (receiptId: string) => {
    try {
      await payReceipt(receiptId);
      Alert.alert("Succès", "Paiement QAPRIL certifié SHA-256 enregistré.");
      refetchQuitt();
    } catch (e: any) {
      Alert.alert("Erreur de paiement", e.message);
    }
  };

  const handleMRL = async (choice: 'oui' | 'non') => {
    try {
      await respondMRL(locData?.pendingMRL?.id, choice);
      Alert.alert(choice === 'oui' ? "Accord Enregistré" : "Refus Enregistré", "Le bailleur a été notifié. Règle MRL-01 appliquée.");
      refetchLoc();
      setDsec(null);
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    }
  };

  const fmt = (n: number) => (n || 0).toLocaleString("fr-FR");

  if (locLoading || bailLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Theme.colors.teal} />
      </View>
    );
  }

  const LOC = locData || { fullName: "Locataire", score: 750, scoreBase: 750, scoreKyc: 800, kycComplet: false };
  const BAIL = bailData || { logement: "Logement", loyer: 0, statut: "À jour", typeGestion: "agreee", bailleurNom: "...", bailleurCode: "...", bailleurMasque: true };
  const QUITTANCES = quittData || [];
  const ABOS = abosData || [];
  const TICKETS = ticketsData || [];

  const getBailleur = () => {
    if (BAIL.typeGestion === "agreee") return { val: BAIL.bailleurCode, masque: true, mention: "Agence agréée — substitution totale" };
    if (BAIL.bailleurMasque) return { val: BAIL.bailleurCode, masque: true, mention: "Identité masquée par le bailleur" };
    return { val: BAIL.bailleurNom, masque: false, mention: "Gestion directe — identité visible" };
  };
  const BAILLEUR = getBailleur();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView bounces={false} contentContainerStyle={styles.scrollContent}>
        
        <BrandHeader 
          title={`Bonjour, ${LOC.fullName?.split(" ")[0] || 'Locataire'}`}
          subtitle={`Occupant du ${BAIL.logement}`}
          roleLabel="LOCATAIRE"
          roleColor={Theme.colors.teal}
          onNotifPress={() => Alert.alert("Notifications", "Aucune notification urgente.")}
        />

        <View style={styles.kpiRowWrap}>
           {[
             { l: "LOYER", v: fmt(BAIL.loyer) + " F", icon: "💰" },
             { l: "CERTIFIÉES", v: QUITTANCES.filter((q:any)=>q.statut==='Certifiée').length, icon: "🧾" },
             { l: "SCORE ICL", v: LOC.score, icon: "⭐" },
             { l: "CAUTION", v: "✓", icon: "🔒" },
           ].map((k, i) => (
             <View key={i} style={styles.kpiSquare}>
               <Text style={styles.kpiSquareVal}>{k.v}</Text>
               <Text style={styles.kpiSquareLabel}>{k.l}</Text>
             </View>
           ))}
        </View>

        <View style={styles.body}>
          {tab === "dash" && (
            <>
              {BAIL.statut === "Impayé" && (
                <View style={styles.impayeCard}>
                   <View style={styles.impayeHeader}>
                      <Text style={styles.impayeTitle}>⚠ Loyer en retard (J+{BAIL.retard})</Text>
                      <Badge label="RÈGLE ICL-10" color="#FFF" bg={Theme.colors.red} />
                   </View>
                   <Text style={styles.impayeSub}>Le non-paiement au 5 du mois entraîne un malus automatique (−10 pts) sur votre score ICL.</Text>
                   <TouchableOpacity style={[styles.payBtn, { backgroundColor: Theme.colors.red }]} onPress={() => setTab("quitt")}>
                      <Text style={styles.payBtnText}>RÉGULARISER MAINTENANT (WAVE/OM)</Text>
                   </TouchableOpacity>
                </View>
              )}

              <SectionTitle label="Logement & Gestion" />
              <TouchableOpacity style={styles.logementBox} onPress={() => setTab("bail")}>
                 <Text style={styles.logementName}>{BAIL.logement}</Text>
                 <View style={styles.badgeRow}>
                    <Badge label={BAIL.type} color={Theme.colors.teal} bg={Theme.colors.tealPale} />
                    <Badge label={`Éch. le ${BAIL.echeance || 1}er`} color={Theme.colors.navy} bg={Theme.colors.navyPale} />
                 </View>
                 <View style={styles.bailleurStrip}>
                    <View style={{ flex: 1 }}>
                       <Text style={styles.bLabel}>{BAIL.typeGestion === "agreee" ? "AGENCE" : "BAILLEUR"}</Text>
                       <Text style={styles.bVal}>{BAIL.typeGestion === "agreee" ? BAIL.agence : BAILLEUR.val}</Text>
                    </View>
                    <Text style={styles.bMention}>🔐 {BAILLEUR.mention}</Text>
                 </View>
              </TouchableOpacity>

              <SectionTitle label="Factures & Abonnements" right={<TouchableOpacity onPress={() => setTab("util")}><Text style={styles.link}>Voir tout →</Text></TouchableOpacity>} />
              <View style={styles.aboGrid}>
                 {ABOS.map((a: any) => (
                   <TouchableOpacity key={a.id} style={[styles.aboCard, { borderLeftColor: a.color || Theme.colors.teal }]} onPress={() => setTab("util")}>
                      <Text style={{ fontSize: 20 }}>{a.icon || '⚡'}</Text>
                      <Text style={[styles.aboType, { color: a.color || Theme.colors.teal }]}>{a.type || 'ABO'}</Text>
                      <Text style={styles.aboPrice}>{fmt(a.montant || 0)} F</Text>
                   </TouchableOpacity>
                 ))}
              </View>

              <SectionTitle label="Actions Rapides" />
              <View style={styles.toolsRow}>
                 <TouchableOpacity style={styles.toolItem} onPress={() => setTab("droits")}>
                    <Text style={{ fontSize: 24 }}>⚖️</Text>
                    <Text style={styles.toolText}>Mes Droits</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={styles.toolItem} onPress={() => Alert.alert("Export", "Historique 36 mois certifié en cours de génération...")}>
                    <Text style={{ fontSize: 24 }}>📤</Text>
                    <Text style={styles.toolText}>Certificat</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={styles.toolItem} onPress={() => setTab("quitt")}>
                    <Text style={{ fontSize: 24 }}>🧾</Text>
                    <Text style={styles.toolText}>Quittances</Text>
                 </TouchableOpacity>
              </View>
            </>
          )}

          {tab === "bail" && (
            <View>
              <SectionTitle label="Contrat de Bail Digital" />
              <View style={styles.bailCard}>
                 <Row label="Référence" value={BAIL.ref || 'Q-BAIL'} />
                 <Row label="Loyer Net" value={fmt(BAIL.loyer) + " F"} color={Theme.colors.navy} />
                 <Row label="Date Signature" value={BAIL.debut || '—'} />
              </View>

              <SectionTitle label="Canaux de Règlement" />
              <View style={styles.mmHub}>
                 <Text style={styles.mmInfo}>Utilisez ces canaux pour un règlement certifié instantané.</Text>
                 {BAIL.mobileMoney?.map((mm: any) => (
                   <TouchableOpacity key={mm.id} style={styles.mmBtn} onPress={() => Alert.alert("Paiement", `Ouverture ${mm.operateur}...`)}>
                      <Text style={{ fontSize: 24 }}>{mm.icon}</Text>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                         <Text style={styles.mmOp}>{mm.operateur}</Text>
                         <Text style={styles.mmNum}>{mm.numero}</Text>
                      </View>
                      {mm.defaut && <Badge label="DÉFAUT" color={Theme.colors.teal} bg={Theme.colors.tealPale} />}
                   </TouchableOpacity>
                 ))}
              </View>

              <ACard icon="🚪" label="Initier un préavis" sub="Automatisé (1 mois loi CI)" color={Theme.colors.orange} bg={Theme.colors.orangePale} onClick={() => { setTab("droits"); setDsec("preavis"); }} />
            </View>
          )}

          {tab === "quitt" && (
             <View>
                <SectionTitle label="Mes Quittances SHA-256" />
                {QUITTANCES.map((q: any) => (
                   <TouchableOpacity key={q.id} style={styles.qLine} onPress={() => Alert.alert("Preuve Digitale", `SHA-256: ${q.sha || '...a5d2c8'}\nLa Poste CI: ${q.laposte || '—'}`)}>
                      <View>
                         <Text style={styles.qPeriod}>{q.mois || q.period}</Text>
                         <Text style={styles.qMeta}>{q.ref} · {fmt(q.montant)} F</Text>
                      </View>
                      {q.statut === 'Certifiée' ? (
                        <Badge label="CERTIFIÉE" color={Theme.colors.green} bg={Theme.colors.greenPale} />
                      ) : (
                        <TouchableOpacity style={styles.qPayBtn} onPress={() => handlePay(q.id)} disabled={paying}>
                           <Text style={styles.qPayText}>{paying ? "..." : "PAYER"}</Text>
                        </TouchableOpacity>
                      )}
                   </TouchableOpacity>
                ))}
             </View>
          )}

          {tab === "droits" && (
            <View>
               {!dsec ? (
                 <>
                   <SectionTitle label="Suivi de mes droits" />
                   {TICKETS.map((t: any) => (
                     <TouchableOpacity key={t.id} style={styles.ticketCard} onPress={() => setTSel(t)}>
                        <View style={{ flex: 1 }}>
                           <Text style={styles.ticketLabel}>{t.label}</Text>
                           <Text style={styles.ticketMeta}>{t.date} · {t.id}</Text>
                        </View>
                        {t.statut === "En attente bailleur" && (
                          <View style={{ alignItems: 'flex-end' }}>
                             <Badge label="⏳ 144H" color={Theme.colors.orange} bg={Theme.colors.orangePale} />
                             <Text style={styles.countdown}>Exp: {t.echeanceAuto?.split('T')[0]}</Text>
                          </View>
                        )}
                        {t.statut === "Résolu" && <Badge label="✓ RÉSOLU" color={Theme.colors.green} bg={Theme.colors.greenPale} />}
                     </TouchableOpacity>
                   ))}

                   <SectionTitle label="Actions Juridiques" />
                   <ACard icon="📋" label="Soumettre une réclamation" sub="Quittance, Travaux, Harcèlement" color={Theme.colors.purple} bg={Theme.colors.purplePale} onClick={() => setDsec("rcl")} />
                   <ACard icon="✏️" label="Consentement Loyers" sub="Révision MRL-01" color={Theme.colors.orange} bg={Theme.colors.orangePale} onClick={() => setDsec("mrl")} />
                   <ACard icon="🚪" label="Préavis de Sortie" sub="Formaliser mon départ" color={Theme.colors.navy} bg={Theme.colors.navyPale} onClick={() => setDsec("preavis")} />
                 </>
               ) : dsec === "rcl" ? (
                 <View>
                    <TouchableOpacity onPress={() => setDsec(null)} style={styles.backLink}><Text style={styles.linkText}>← Retour</Text></TouchableOpacity>
                    <SectionTitle label="Nouvelle Réclamation" />
                    {!rclCode ? (
                      RCL_TYPES.map(r => (
                        <TouchableOpacity key={r.code} style={styles.typePick} onPress={() => { setRclCode(r.code); setRclData({ ...rclData, type: r.label }); }}>
                           <Text style={{ fontSize: 24 }}>{r.icon}</Text>
                           <View style={{ flex: 1, marginLeft: 12 }}>
                              <Text style={styles.typePickL}>{r.label}</Text>
                              <Text style={styles.typePickS}>{r.sub}</Text>
                           </View>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View>
                         <Text style={styles.inputLabel}>Description précise</Text>
                         <TextInput 
                            style={styles.textInputArea} 
                            multiline 
                            placeholder="Détails du litige..." 
                            numberOfLines={4}
                            onChangeText={t => setRclData({ ...rclData, desc: t })}
                         />
                         <TouchableOpacity 
                            style={styles.submitBtn} 
                            disabled={mutationLoading}
                            onPress={async () => {
                              try {
                                await submitTicket({ code: rclCode, description: rclData.desc });
                                Alert.alert("Ticket Ouvert", "Votre réclamation a été transmise. Délai bailleur : 144h.");
                                setTab("dash");
                                refetchTickets();
                              } catch (e: any) {
                                Alert.alert("Erreur", e.message);
                              }
                            }}
                         >
                            <Text style={styles.submitBtnText}>{mutationLoading ? "ENVOI..." : "ENVOYER LA RÉCLAMATION"}</Text>
                         </TouchableOpacity>
                      </View>
                    )}
                 </View>
               ) : dsec === "mrl" ? (
                  <View>
                     <TouchableOpacity onPress={() => setDsec(null)} style={styles.backLink}><Text style={styles.linkText}>← Retour</Text></TouchableOpacity>
                     {LOC.pendingMRL ? (
                        <View style={styles.mrlCardBox}>
                           <Text style={styles.mrlLabel}>MRL-01 EN ATTENTE (5 jours max sans réponse)</Text>
                           <Text style={styles.mrlAmount}>Nouveau Loyer Proposé: {fmt(LOC.pendingMRL.loyerPropose)} F</Text>
                           <View style={styles.mrlActions}>
                              <TouchableOpacity style={styles.mrlNo} onPress={() => handleMRL('non')}><Text style={styles.mrlBtnTextAction}>REFUSER</Text></TouchableOpacity>
                              <TouchableOpacity style={styles.mrlYes} onPress={() => handleMRL('oui')}><Text style={styles.mrlBtnTextAction}>ACCEPTER</Text></TouchableOpacity>
                           </View>
                        </View>
                     ) : <Text style={styles.emptyMsg}>Aucune demande MRL-01 en attente.</Text>}
                  </View>
               ) : dsec === "preavis" && (
                  <View>
                      <TouchableOpacity onPress={() => setDsec(null)} style={styles.backLink}><Text style={styles.linkText}>← Retour</Text></TouchableOpacity>
                      <SectionTitle label={`Départ — Étape ${prStep}/3`} />
                      {prStep === 1 && (
                        <View>
                           <Text style={styles.stepInfo}>Date de départ envisagée :</Text>
                           <TextInput style={styles.textInput} placeholder="YYYY-MM-DD" value={preavisDate} onChangeText={setPreavisDate} />
                           <TouchableOpacity style={styles.submitBtn} onPress={() => preavisDate ? setPrStep(2) : Alert.alert("Date requise")}>
                              <Text style={styles.submitBtnText}>SUIVANT →</Text>
                           </TouchableOpacity>
                        </View>
                      )}
                      {prStep === 2 && (
                         <View>
                            <Text style={styles.stepInfo}>Confirmez-vous le créneau d'EDL ?</Text>
                            <TouchableOpacity style={styles.slotBtn} onPress={() => setPrStep(3)}>
                               <Text style={styles.slotText}>Valider le créneau proposé</Text>
                            </TouchableOpacity>
                         </View>
                      )}
                      {prStep === 3 && (
                         <TouchableOpacity 
                            style={styles.submitBtn} 
                            disabled={mutationLoading}
                            onPress={async () => {
                              try {
                                await submitPreavis({ dateDepartSouhaitee: preavisDate, creneauEDL: 'Matin' });
                                Alert.alert("Préavis Envoyé", "Votre avis de départ a été enregistré.");
                                setDsec(null);
                                refetchLoc();
                              } catch (e: any) {
                                Alert.alert("Erreur", e.message);
                              }
                            }}
                          >
                            <Text style={styles.submitBtnText}>{mutationLoading ? "LOGGING..." : "FINALISER LE PRÉAVIS"}</Text>
                         </TouchableOpacity>
                      )}
                  </View>
               )}
            </View>
          )}

          {tab === "profil" && (
            <View>
               <SectionTitle label="Certification ICL" />
               <View style={styles.profCard}>
                  <Text style={styles.pName}>{LOC.fullName}</Text>
                  <Text style={[styles.scVal, { color: LOC.score >= 800 ? Theme.colors.green : Theme.colors.orange }]}>{LOC.score}</Text>
                  <Text style={styles.scLabel}>SCORE QAPRIL ACTIVE</Text>
                  <View style={styles.scoreScale}>
                     <View style={[styles.scaleProgress, { width: `${(LOC.score / 1000) * 100}%`, backgroundColor: LOC.score >= 800 ? Theme.colors.green : Theme.colors.orange }]} />
                  </View>
                  <Text style={styles.scoreHint}>{LOC.score < 800 ? "Complétez votre KYC pour passer à 800 pts." : "Paiements à temps : +2 pts / mois."}</Text>
               </View>
               {onBack && (
                  <TouchableOpacity style={styles.logoutBtn} onPress={onBack}>
                    <Text style={styles.logoutText}>🚪 Retour Portail</Text>
                  </TouchableOpacity>
               )}
            </View>
          )}
        </View>
      </ScrollView>

      <BottomNav
        tabs={[
          { id: "dash", icon: "🏠", label: "Dashboard" },
          { id: "bail", icon: "📋", label: "Bail" },
          { id: "quitt", icon: "🧾", label: "Recus" },
          { id: "droits", icon: "⚖️", label: "Droits" },
          { id: "profil", icon: "👤", label: "Compte" },
        ]}
        activeTab={tab}
        onChange={changeTab}
        accentColor={Theme.colors.teal}
      />
    </View>
  );
}

const ACard = ({ icon, label, sub, color, bg, onClick }: any) => (
  <TouchableOpacity onPress={onClick} style={[styles.acard, { backgroundColor: bg, borderColor: color + '20' }]}>
    <Text style={{ fontSize: 22 }}>{icon}</Text>
    <View style={{ flex: 1, marginLeft: 12 }}>
      <Text style={[styles.acardL, { color }]}>{label}</Text>
      <Text style={styles.acardS}>{sub}</Text>
    </View>
    <Text style={{ fontSize: 16, color, opacity: 0.5 }}>›</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F5FA' },
  scrollContent: { paddingBottom: 100 },
  body: { padding: 16 },
  kpiRowWrap: { flexDirection: 'row', gap: 8, marginTop: -25, marginHorizontal: 16, zIndex: 10 },
  kpiSquare: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 8, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  kpiSquareVal: { fontSize: 12, color: '#FFF', fontWeight: '800' },
  kpiSquareLabel: { fontSize: 7, color: 'rgba(255,255,255,0.6)', fontWeight: '700', marginTop: 2 },
  impayeCard: { backgroundColor: '#FEECEC', borderRadius: 18, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#A0000020' },
  impayeHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  impayeTitle: { fontSize: 13, fontWeight: '900', color: Theme.colors.red },
  impayeSub: { fontSize: 10, color: Theme.colors.textMid, marginBottom: 15 },
  payBtn: { borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  payBtnText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
  logementBox: { backgroundColor: '#FFF', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#EDF2F7', marginBottom: 20 },
  logementName: { fontSize: 14, fontWeight: '800', color: Theme.colors.text, marginBottom: 6 },
  badgeRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  bailleurStrip: { backgroundColor: '#F8FAFC', borderRadius: 10, padding: 10, flexDirection: 'row', alignItems: 'center' },
  bLabel: { fontSize: 8, fontWeight: '800', color: Theme.colors.textLight },
  bVal: { fontSize: 12, fontWeight: '800', color: Theme.colors.textMid },
  bMention: { fontSize: 9, color: Theme.colors.textLight, fontStyle: 'italic' },
  aboGrid: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  aboCard: { flex: 1, backgroundColor: '#FFF', padding: 12, borderRadius: 15, borderLeftWidth: 3, borderWidth: 1, borderColor: '#EDF2F7' },
  aboType: { fontSize: 9, fontWeight: '800', marginTop: 4 },
  aboPrice: { fontSize: 14, fontWeight: '900', color: Theme.colors.text, marginTop: 2 },
  link: { fontSize: 10, fontWeight: '800', color: Theme.colors.teal },
  toolsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  toolItem: { width: (width - 32 - 16) / 3, backgroundColor: '#FFF', padding: 15, borderRadius: 18, alignItems: 'center', borderWidth: 1, borderColor: '#EDF2F7' },
  toolText: { fontSize: 10, fontWeight: '800', color: Theme.colors.navy, marginTop: 8 },
  bailCard: { backgroundColor: '#FFF', borderRadius: 18, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#EDF2F7' },
  mmHub: { backgroundColor: '#E0F4F9', padding: 16, borderRadius: 18, marginBottom: 15 },
  mmInfo: { fontSize: 10, color: Theme.colors.textMid, lineHeight: 15, marginBottom: 15 },
  mmBtn: { flexDirection: 'row', backgroundColor: '#FFF', padding: 12, borderRadius: 12, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#FFF' },
  mmOp: { fontSize: 12, fontWeight: '800', color: Theme.colors.text },
  mmNum: { fontSize: 14, fontWeight: '900', color: Theme.colors.navy, marginTop: 2 },
  acard: { flexDirection: 'row', padding: 14, borderRadius: 15, alignItems: 'center', marginBottom: 10, borderWidth: 1 },
  acardL: { fontSize: 13, fontWeight: '800' },
  acardS: { fontSize: 10, color: Theme.colors.textLight, marginTop: 2 },
  qLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginBottom: 8, borderWidth: 1, borderColor: '#EDF2F7' },
  qPeriod: { fontSize: 13, fontWeight: '800', color: Theme.colors.navy },
  qMeta: { fontSize: 10, color: Theme.colors.textLight, marginTop: 2 },
  qPayBtn: { backgroundColor: Theme.colors.teal, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  qPayText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
  backLink: { marginBottom: 15 },
  linkText: { fontSize: 12, color: Theme.colors.teal, fontWeight: '800' },
  typePick: { flexDirection: 'row', backgroundColor: '#EDE9FE', padding: 15, borderRadius: 15, alignItems: 'center', marginBottom: 10 },
  typePickL: { fontSize: 13, fontWeight: '800', color: Theme.colors.purple },
  typePickS: { fontSize: 11, color: Theme.colors.textLight, marginTop: 2 },
  inputLabel: { fontSize: 11, fontWeight: '800', color: Theme.colors.textMid, marginBottom: 8, marginTop: 15 },
  textInput: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, borderWidth: 1, borderColor: '#EDF2F7', fontSize: 14 },
  textInputArea: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, borderWidth: 1, borderColor: '#EDF2F7', fontSize: 14, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: Theme.colors.navy, paddingVertical: 15, borderRadius: 15, alignItems: 'center', marginTop: 25 },
  submitBtnText: { color: '#FFF', fontSize: 12, fontWeight: '900' },
  mrlCardBox: { backgroundColor: '#FFF3E0', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#C05B0030' },
  mrlLabel: { fontSize: 9, fontWeight: '900', color: '#C05B00', letterSpacing: 1 },
  mrlAmount: { fontSize: 16, fontWeight: '900', color: Theme.colors.navy, marginVertical: 10 },
  mrlActions: { flexDirection: 'row', gap: 10 },
  mrlNo: { flex: 1, backgroundColor: '#FFF', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: Theme.colors.red + '30' },
  mrlYes: { flex: 1, backgroundColor: '#C05B00', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  mrlBtnTextAction: { fontSize: 11, fontWeight: '900', color: '#FFF' },
  emptyMsg: { fontSize: 13, color: Theme.colors.textLight, textAlign: 'center', marginVertical: 40 },
  stepInfo: { fontSize: 12, color: Theme.colors.textMid, marginBottom: 15 },
  slotBtn: { backgroundColor: '#EEF2FA', padding: 15, borderRadius: 12, marginBottom: 8 },
  slotText: { fontSize: 13, fontWeight: '800', color: Theme.colors.navy },
  profCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 25, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#EDF2F7' },
  pName: { fontSize: 16, fontWeight: '900', color: Theme.colors.navy, marginBottom: 10 },
  scVal: { fontSize: 32, fontWeight: '900', color: Theme.colors.green },
  scLabel: { fontSize: 9, fontWeight: '900', color: Theme.colors.textLight },
  logoutBtn: { backgroundColor: '#F1F5F9', borderRadius: 15, paddingVertical: 15, alignItems: 'center', marginTop: 30 },
  logoutText: { color: Theme.colors.navy, fontWeight: '800', fontSize: 13 },
  scoreScale: { width: '100%', height: 6, backgroundColor: '#EDF2F7', borderRadius: 3, marginVertical: 15, overflow: 'hidden' },
  scaleProgress: { height: '100%', borderRadius: 3 },
  scoreHint: { fontSize: 10, color: Theme.colors.textLight, textAlign: 'center' },
  ticketCard: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 18, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: '#EDF2F7' },
  ticketLabel: { fontSize: 13, fontWeight: '800', color: Theme.colors.navy },
  ticketMeta: { fontSize: 10, color: Theme.colors.textLight, marginTop: 2 },
  countdown: { fontSize: 8, fontWeight: '800', color: Theme.colors.orange, marginTop: 4 },
});
