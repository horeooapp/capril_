path = 'native_apps/locataire/app/(tabs)/index.tsx'

with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Update lucide-react-native imports
if 'Droplets,' not in c:
    c = c.replace(
        '  Sparkles,\n} from \'lucide-react-native\';',
        '  Sparkles,\n  Zap,\n  Droplets,\n  Smartphone,\n  Wifi,\n  Check,\n  Copy,\n} from \'lucide-react-native\';'
    )

# 2. Update LocScreen type
if "'factures'" not in c:
    c = c.replace(
        "type LocScreen =\n  | 'accueil'\n  | 'payer'",
        "type LocScreen =\n  | 'accueil'\n  | 'factures'\n  | 'payer'"
    )

# 3. Update MENU_ITEMS
if "id: 'factures'" not in c:
    c = c.replace(
        "  { id: 'accueil' as LocScreen, label: 'Accueil', desc: 'Statut du bail, loyer et alertes CDC-CI', icon: Home },",
        "  { id: 'accueil' as LocScreen, label: 'Accueil', desc: 'Statut du bail, loyer et alertes CDC-CI', icon: Home },\n  { id: 'factures' as LocScreen, label: 'Régler mes factures', desc: 'Eau (SODECI), Élec (CIE), Téléphone, Internet', icon: Zap },"
    )

# 4. Add states inside LocatairePrototypeScreen
if 'factureCat' not in c:
    target_state = "  const [shareScore, setShareScore] = useState(false);"
    replacement_state = """  const [shareScore, setShareScore] = useState(false);

  // States for Utilities / Factures (Eau, Elec, Tel, Internet)
  const [factureCat, setFactureCat] = useState<'EAU' | 'ELEC' | 'TEL' | 'NET'>('EAU');
  const [factureElecMode, setFactureElecMode] = useState<'POSTPAYE' | 'PREPAYE'>('PREPAYE');
  const [factureIdentifiant, setFactureIdentifiant] = useState('');
  const [factureMontant, setFactureMontant] = useState(10000);
  const [factureOp, setFactureOp] = useState<'Wave' | 'Orange Money' | 'MTN MoMo' | 'Moov'>('Wave');
  const [facturePaying, setFacturePaying] = useState(false);
  const [factureReceipt, setFactureReceipt] = useState<any>(null);
  const [factureHistory, setFactureHistory] = useState<any[]>([
    { id: 'f-1', cat: 'EAU', service: 'SODECI', ref: 'SOD-892301', montant: 14500, date: '02 Nov 2026', statut: 'PAYEE' },
    { id: 'f-2', cat: 'ELEC', service: 'CIE Compteur Prépayé', ref: '1409281729', montant: 10000, date: '28 Oct 2026', statut: 'PAYEE', token: '4829-1029-4819-3019' },
    { id: 'f-3', cat: 'NET', service: 'Orange Livebox Fibre', ref: 'BOX-99201', montant: 25000, date: '15 Oct 2026', statut: 'PAYEE' },
  ]);
  const [copiedToken, setCopiedToken] = useState(false);"""
    c = c.replace(target_state, replacement_state)

# 5. Add Quick Action card in screen === 'accueil'
quick_card = """
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
"""

target_grid_label = "{/* GRILLE DE NAVIGATION RAPIDE VERS LES 8 ÉCRANS */}"
if quick_card not in c and target_grid_label in c:
    c = c.replace(target_grid_label, quick_card + "\n            " + target_grid_label)

# 6. Add screen === 'factures' section
factures_view = """
        {/* =========================================================
            ÉCRAN FACTURES & FLUIDES (Eau, Électricité, Téléphone, Internet)
           ========================================================= */}
        {screen === 'factures' && (
          <View style={styles.sectionGap}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.h1}>Factures & Fluides</Text>
                <Text style={styles.subMuted}>
                  Règlement sécurisé Eau, Électricité, Téléphone et Box Internet
                </Text>
              </View>
              <Pressable style={styles.btnGhost} onPress={() => setScreen('accueil')}>
                <Text style={styles.btnGhostText}>‹ Retour</Text>
              </Pressable>
            </View>

            {/* SÉLECTEUR DE CATÉGORIE */}
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {[
                { id: 'EAU', label: 'Eau', icon: Droplets, sub: 'SODECI' },
                { id: 'ELEC', label: 'Électricité', icon: Zap, sub: 'CIE' },
                { id: 'TEL', label: 'Mobile', icon: Smartphone, sub: 'Pass' },
                { id: 'NET', label: 'Internet', icon: Wifi, sub: 'Fibre' },
              ].map((item) => {
                const IconComp = item.icon;
                const active = factureCat === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => {
                      setFactureCat(item.id as any);
                      setFactureReceipt(null);
                    }}
                    style={[
                      styles.factureCatBtn,
                      active && styles.factureCatBtnActive
                    ]}
                  >
                    <IconComp color={active ? '#fff' : '#2C3E6B'} size={18} />
                    <Text style={[styles.factureCatLabel, active && styles.factureCatLabelActive]}>
                      {item.label}
                    </Text>
                    <Text style={[styles.factureCatSub, active && styles.factureCatSubActive]}>
                      {item.sub}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* FORMULAIRE DE RÈGLEMENT */}
            <View style={styles.card}>
              <Text style={styles.label}>
                1. FOURNISSEUR & TYPE · {factureCat === 'EAU' ? 'EAU' : factureCat === 'ELEC' ? 'ÉLECTRICITÉ' : factureCat === 'TEL' ? 'TÉLÉPHONE' : 'INTERNET'}
              </Text>

              {factureCat === 'ELEC' && (
                <View style={[styles.segRow, { marginBottom: 12 }]}>
                  <Pressable
                    onPress={() => setFactureElecMode('PREPAYE')}
                    style={[styles.segBtn, factureElecMode === 'PREPAYE' && styles.segBtnOn]}
                  >
                    <Text style={[styles.segText, factureElecMode === 'PREPAYE' && styles.segTextOn]}>
                      Compteur Prépayé (Token)
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setFactureElecMode('POSTPAYE')}
                    style={[styles.segBtn, factureElecMode === 'POSTPAYE' && styles.segBtnOn]}
                  >
                    <Text style={[styles.segText, factureElecMode === 'POSTPAYE' && styles.segTextOn]}>
                      Facture Mensuelle
                    </Text>
                  </Pressable>
                </View>
              )}

              <Text style={[styles.label, { marginTop: 4 }]}>
                {factureCat === 'EAU'
                  ? 'NUMÉRO COMPTEUR SODECI / RÉFÉRENCE ABONNÉ'
                  : factureCat === 'ELEC'
                  ? 'NUMÉRO COMPTEUR CIE (10 OU 11 CHIFFRES)'
                  : factureCat === 'TEL'
                  ? 'NUMÉRO DE MOBILE (ORANGE, MTN, MOOV)'
                  : 'NUMÉRO DE LIGNE / CONTRAT BOX FIBRE'}
              </Text>

              <TextInput
                style={styles.factureInput}
                value={factureIdentifiant}
                onChangeText={setFactureIdentifiant}
                placeholder={
                  factureCat === 'EAU'
                    ? 'Ex: SOD-0482910'
                    : factureCat === 'ELEC'
                    ? 'Ex: 1409281729'
                    : factureCat === 'TEL'
                    ? 'Ex: 07 00 00 00 00'
                    : 'Ex: BOX-99201'
                }
                placeholderTextColor="#9CA3AF"
              />

              <Text style={[styles.label, { marginTop: 14 }]}>MONTANT À RÉGLER (XOF)</Text>
              <View style={styles.segRow}>
                {[2000, 5000, 10000, 25000, 50000].map((val) => (
                  <Pressable
                    key={val}
                    onPress={() => setFactureMontant(val)}
                    style={[styles.segBtn, factureMontant === val && styles.segBtnOn]}
                  >
                    <Text style={[styles.segText, factureMontant === val && styles.segTextOn]}>
                      {fmt(val)}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[styles.label, { marginTop: 14 }]}>MOYEN DE PAIEMENT</Text>
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

              <Pressable
                style={[styles.btnPrimary, { marginTop: 16 }]}
                disabled={facturePaying}
                onPress={async () => {
                  if (!factureIdentifiant.trim()) {
                    Alert.alert('Attention', 'Veuillez renseigner votre référence ou numéro de compteur.');
                    return;
                  }
                  setFacturePaying(true);
                  try {
                    // Simulation ou appel direct à l'API mobile
                    const serviceName =
                      factureCat === 'EAU'
                        ? 'SODECI'
                        : factureCat === 'ELEC'
                        ? (factureElecMode === 'PREPAYE' ? 'CIE Prépayé' : 'CIE Facture')
                        : factureCat === 'TEL'
                        ? 'Mobile ' + factureOp
                        : 'Internet Box';

                    let token = null;
                    if (factureCat === 'ELEC' && factureElecMode === 'PREPAYE') {
                      token = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
                    }

                    const newRec = {
                      id: 'f-' + Date.now(),
                      cat: factureCat,
                      service: serviceName,
                      ref: factureIdentifiant.trim(),
                      montant: factureMontant,
                      date: new Date().toLocaleDateString('fr-CI', { day: '2-digit', month: 'short', year: 'numeric' }),
                      token,
                      statut: 'PAYEE',
                      op: factureOp,
                    };

                    setFactureHistory([newRec, ...factureHistory]);
                    setFactureReceipt(newRec);
                    Alert.alert(
                      'Règlement validé !',
                      `Votre paiement de ${fmt(factureMontant)} via ${factureOp} pour ${serviceName} a été confirmé.`
                    );
                  } catch (e: any) {
                    Alert.alert('Erreur', e.message || 'Impossible de finaliser le paiement.');
                  } finally {
                    setFacturePaying(false);
                  }
                }}
              >
                <Zap color="#fff" size={18} />
                <Text style={styles.btnPrimaryText}>
                  {facturePaying ? 'Validation en cours...' : `Confirmer & Régler ${fmt(factureMontant)}`}
                </Text>
              </Pressable>
            </View>

            {/* MODAL / ENCART DE CONFIRMATION DE REÇU */}
            {factureReceipt && (
              <View style={[styles.card, { borderColor: '#1E7E4E', borderWidth: 2, backgroundColor: '#F0FDF4' }]}>
                <View style={styles.rowBetween}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 color="#1E7E4E" size={20} />
                    <Text style={[styles.boldText, { color: '#1E7E4E' }]}>Règlement Confirmé & Certifié</Text>
                  </View>
                  <View style={styles.pillOk}>
                    <Text style={styles.pillOkText}>Quittance délivrée</Text>
                  </View>
                </View>

                {factureReceipt.token && (
                  <View style={{ backgroundColor: '#FEF3C7', padding: 12, borderRadius: 12, marginTop: 12, alignItems: 'center' }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#92400E' }}>
                      CODE TOKEN COMPTEUR CIE PRÉPAYÉ (20 CHIFFRES) :
                    </Text>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: '#1A1D26', marginVertical: 6, letterSpacing: 2, fontFamily: 'monospace' }}>
                      {factureReceipt.token}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#B45309' }}>
                      Entrez ce code sur le clavier de votre compteur pour créditer vos kWh.
                    </Text>
                  </View>
                )}

                <View style={[styles.recapBox, { backgroundColor: '#fff', marginTop: 12 }]}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.subMuted}>Service</Text>
                    <Text style={styles.boldText}>{factureReceipt.service}</Text>
                  </View>
                  <View style={styles.rowBetween}>
                    <Text style={styles.subMuted}>Identifiant / Compteur</Text>
                    <Text style={styles.boldText}>{factureReceipt.ref}</Text>
                  </View>
                  <View style={styles.rowBetween}>
                    <Text style={styles.subMuted}>Moyen de paiement</Text>
                    <Text style={styles.boldText}>{factureReceipt.op}</Text>
                  </View>
                  <View style={styles.rowBetween}>
                    <Text style={styles.subMuted}>Montant</Text>
                    <Text style={[styles.boldText, { color: '#2C3E6B' }]}>{fmt(factureReceipt.montant)}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* HISTORIQUE DES FACTURES RÉGLÉES */}
            <Text style={styles.label}>HISTORIQUE DES FACTURES RÉGLÉES</Text>
            {factureHistory.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.rowBetween}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' }}>
                      {item.cat === 'EAU' ? <Droplets color="#0284C7" size={18} /> : item.cat === 'ELEC' ? <Zap color="#D97706" size={18} /> : item.cat === 'TEL' ? <Smartphone color="#16A34A" size={18} /> : <Wifi color="#4F46E5" size={18} />}
                    </View>
                    <View>
                      <Text style={styles.boldText}>{item.service}</Text>
                      <Text style={styles.subMuted}>Réf: {item.ref} · {item.date}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.boldText, { color: '#2C3E6B' }]}>{fmt(item.montant)}</Text>
                    <Text style={{ fontSize: 10, color: '#16A34A', fontWeight: '700' }}>✓ Payée</Text>
                  </View>
                </View>

                {item.token && (
                  <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: '700', color: '#D97706' }}>
                      Token: {item.token}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
"""

target_payer_screen = "{/* =========================================================" + "\n            ÉCRAN 2 · PAYER MON LOYER"
if factures_view not in c and target_payer_screen in c:
    c = c.replace(target_payer_screen, factures_view + "\n\n        " + target_payer_screen)

# 7. Add styles for Factures components
styles_addition = """  factureQuickBtn: {
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
    fontWeight: '800',
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
    fontWeight: '800',
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
"""

last_style_bracket = "});"
if 'factureQuickBtn:' not in c:
    idx_style = c.rfind(last_style_bracket)
    if idx_style != -1:
        c = c[:idx_style] + styles_addition + c[idx_style:]

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print('Updated native_apps/locataire/app/(tabs)/index.tsx successfully!')

