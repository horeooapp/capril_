import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Upload, ShieldCheck, Users, Building2, Wallet, Plus, Home } from 'lucide-react-native';
import { fetchWithAuth } from '../../lib/api';
import { useFocusEffect, useRouter } from 'expo-router';

const HON = 0.08;
const FRAIS_QAPRIL = 2000;
const PAGES_STD = 4;

function calcDroitsDgi(loyer: number, duree: number, pages = PAGES_STD) {
  return Math.round(0.025 * loyer * duree) + 500 * pages;
}

export default function AgencePrototypeHomeScreen() {
  const router = useRouter();
  const [roleView, setRoleView] = useState<'chef' | 'collab'>('chef');
  const [aTab, setATab] = useState<'home' | 'biens' | 'ventes' | 'mandants' | 'ext' | 'flux' | 'verif' | 'team'>('home');

  const [loading, setLoading] = useState(true);
  const [agencyData, setAgencyData] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);

  const [exLoyer, setExLoyer] = useState('180000');
  const [exDuree, setExDuree] = useState('24');
  const [prixVenteSim, setPrixVenteSim] = useState('35000000');

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashRes, propsRes] = await Promise.all([
        fetchWithAuth('/proprietaire/dashboard'),
        fetchWithAuth('/proprietaire/properties'),
      ]);

      if (dashRes.ok) {
        const d = await dashRes.json();
        setAgencyData(d);
      }
      if (propsRes.ok) {
        const p = await propsRes.json();
        if (p.properties && Array.isArray(p.properties)) {
          setProperties(p.properties);
        }
      }
    } catch (e) {
      console.error('Erreur chargement agence mobile:', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const agencyName = agencyData?.user?.nomAgence || agencyData?.user?.agencyName || agencyData?.user?.firstName || 'Mon Agence Immobilière';
  const agencyRef = agencyData?.user?.numeroAgrement ? `AGR-${agencyData.user.numeroAgrement}` : 'Agence Agréée QAPRIL';

  const totalLoyers = properties.reduce((sum, p) => sum + (Number(p.currentRent || p.declaredRentFcfa) || 0), 0);
  const totalBiensOccupes = properties.filter(p => p.isRented || p.occupancyStatus === 'Loué').length;
  const tauxOccupation = properties.length > 0 ? Math.round((totalBiensOccupes / properties.length) * 100) : 0;
  const honorairesEstimes = Math.round(totalLoyers * HON);
  const netBailleursEstime = totalLoyers - honorairesEstimes;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.subNav}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {(
            [
              ['home', 'Accueil'],
              ['biens', `Biens sous mandat (${properties.length})`],
              ['mandants', 'Bailleurs mandants'],
              ['ext', 'Bail externe → DGI (ADD-23)'],
              ['flux', 'Reversements (− 8 %)'],
              ['verif', 'Visites Niv. 4 (15 000 F)'],
              ['team', 'Équipe & Masquage'],
            ] as [typeof aTab, string][]
          ).map(([id, label]) => (
            <Pressable
              key={id}
              onPress={() => setATab(id)}
              style={[styles.chip, aTab === id && { backgroundColor: '#1F2A44', borderColor: '#1F2A44' }]}
            >
              <Text style={[styles.chipText, aTab === id && { color: '#fff' }]}>{label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.subMuted}>{agencyName} · {agencyRef}</Text>
            <Text style={styles.h1}>
              {roleView === 'chef' ? 'Chef d’agence' : 'Gestionnaire'}
            </Text>
          </View>
          <Pressable
            onPress={() => {
              const next = roleView === 'chef' ? 'collab' : 'chef';
              setRoleView(next);
              Alert.alert(
                next === 'collab' ? 'Vue collaborateur (RG-CONF-04)' : 'Vue chef d’agence',
                next === 'collab'
                  ? 'Les bailleurs masqués apparaissent uniquement sous leur code séquentiel BAI-NNN.'
                  : 'Tous les noms réels des bailleurs mandants sont visibles.'
              );
            }}
            style={[
              styles.pillCoral,
              { backgroundColor: roleView === 'collab' ? '#F0774B' : '#E7ECF6' },
            ]}
          >
            <Text style={styles.pillCoralText}>
              {roleView === 'chef' ? 'Basculer : Vue collaborateur' : 'Vue collaborateur (BAI actif)'}
            </Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#1F2A44" />
            <Text style={{ fontSize: 11, color: '#64748B', marginTop: 8 }}>Synchronisation portefeuille agence...</Text>
          </View>
        ) : null}

        {!loading && aTab === 'home' && (
          <View style={[styles.sectionGap, { marginTop: 12 }]}>
            <View style={styles.heroCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.heroSub}>LOYERS DU PORTEFEUILLE · {new Date().toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }).toUpperCase()}</Text>
                <Text style={styles.heroSub}>{tauxOccupation}% OCCUPATION</Text>
              </View>
              <Text style={styles.heroBig}>
                {totalLoyers.toLocaleString('fr-FR')} XOF
              </Text>
              <Text style={styles.heroSub}>
                À reverser aux bailleurs mandants (net − 8 % d'honoraires) : {netBailleursEstime.toLocaleString('fr-FR')} XOF
              </Text>
            </View>

            <View style={styles.grid2}>
              <View style={styles.card}>
                <Text style={styles.subMuted}>Biens Actifs</Text>
                <Text style={{ fontSize: 22, fontWeight: '900', color: '#1F2A44', marginTop: 4 }}>{properties.length}</Text>
                <Text style={{ fontSize: 10, color: '#16A34A', fontWeight: '700', marginTop: 2 }}>{totalBiensOccupes} loués</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.subMuted}>Honoraires Agence (8%)</Text>
                <Text style={{ fontSize: 20, fontWeight: '900', color: '#E11D48', marginTop: 4 }}>{honorairesEstimes.toLocaleString('fr-FR')} XOF</Text>
                <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '600', marginTop: 2 }}>Génération certifiée</Text>
              </View>
            </View>
          </View>
        )}

        {!loading && aTab === 'biens' && (
          <View style={[styles.sectionGap, { marginTop: 12 }]}>
            <Text style={styles.h1}>Biens gérés sous mandat ({properties.length})</Text>
            <Text style={styles.subMuted}>Biens et lots immobiliers gérés par votre agence.</Text>
            {properties.length === 0 ? (
              <View style={[styles.card, { alignItems: 'center', paddingVertical: 28 }]}>
                <Building2 color="#9CA3AF" size={32} />
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#64748B', marginTop: 8 }}>Aucun bien sous mandat</Text>
                <Text style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 4 }}>
                  Les biens confiés à votre agence apparaîtront directement ici.
                </Text>
              </View>
            ) : properties.map((p) => (
              <View key={p.id} style={styles.card}>
                <View style={styles.rowBetween}>
                  <Text style={styles.boldText}>{p.name || p.address}</Text>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: p.isRented ? '#16A34A' : '#D97706' }}>
                    {p.isRented ? 'LOUÉ' : 'VACANT'}
                  </Text>
                </View>
                <Text style={styles.subMuted}>
                  {p.commune} · {p.propertyType} · {Number(p.currentRent || p.declaredRentFcfa || 0).toLocaleString('fr-FR')} XOF
                </Text>
                <Text style={[styles.subMuted, { marginTop: 4 }]}>
                  Locataire : {roleView === 'collab' ? 'Locataire Masqué (RG-CONF-04)' : (p.tenantName || 'Aucun')}
                </Text>
              </View>
            ))}
          </View>
        )}

                {!loading && aTab === 'ventes' && (
          <View style={[styles.sectionGap, { marginTop: 12 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.h1}>Transactions & Ventes (ADD-25)</Text>
                <Text style={styles.subMuted}>Terrains nus, bâtis, ACD et droits de mutation DGI 4%.</Text>
              </View>
              <Pressable 
                onPress={() => router.push('/create-property')}
                style={{ backgroundColor: '#0F172A', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}
              >
                <Plus size={14} color="#FFF" />
                <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '700' }}>Nouveau bien</Text>
              </Pressable>
            </View>

            {/* Avertissement RG-VTE-16 */}
            <View style={[styles.card, { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1', borderLeftWidth: 4, borderLeftColor: '#0F172A' }]}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#0F172A', textTransform: 'uppercase' }}>
                Règle Absolue RG-VTE-16 (Séquestre Notarial)
              </Text>
              <Text style={{ fontSize: 11, color: '#334155', marginTop: 4, lineHeight: 16 }}>
                QAPRIL ne détient, n'achemine ni ne séquestre aucun acompte, prix ou arrhes. Tous les paiements de vente transitent obligatoirement par le compte séquestre de l'étude notariale désignée.
              </Text>
            </View>

            {/* Simulateur fiscal mobile */}
            <View style={[styles.card, { borderColor: '#E2E8F0' }]}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#0F172A', marginBottom: 6 }}>
                Simulateur Fiscal & Notarial Rapide
              </Text>
              <Text style={{ fontSize: 11, color: '#64748B', marginBottom: 10 }}>
                Droits DGI 4% (CGI) · Barème officiel notarial dégressif
              </Text>

              <Text style={{ fontSize: 11, fontWeight: '700', color: '#334155', marginBottom: 4 }}>
                Prix de vente souhaité (FCFA)
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: '#F8FAFC', fontWeight: '800', fontSize: 15, color: '#0F172A' }]}
                keyboardType="numeric"
                value={prixVenteSim}
                onChangeText={setPrixVenteSim}
                placeholder="35000000"
              />

              {(() => {
                const pv = parseFloat((prixVenteSim || '0').replace(/\s/g, '')) || 0;
                const dgi = Math.round(pv * 0.04);
                const com = Math.round(pv * 0.05);
                const notaire = Math.round(pv * 0.025);
                const totalFrais = dgi + notaire + com;
                const netVendeur = pv - com;
                const fmtM = (n: number) => n.toLocaleString('fr-FR');
                return (
                  <View style={{ marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9', gap: 6 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 11, color: '#64748B' }}>Droits DGI (4 %) :</Text>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#0F172A' }}>{fmtM(dgi)} F</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 11, color: '#64748B' }}>Émoluments notaire (indicatifs) :</Text>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#0F172A' }}>{fmtM(notaire)} F</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 11, color: '#64748B' }}>Commission agence (5 %) :</Text>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#0F172A' }}>{fmtM(com)} F</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#0F172A', padding: 8, borderRadius: 6, marginTop: 4 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#FFF' }}>Net vendeur estimé :</Text>
                      <Text style={{ fontSize: 12, fontWeight: '900', color: '#10B981' }}>{fmtM(netVendeur)} F</Text>
                    </View>
                  </View>
                );
              })()}
            </View>

            {/* Liste des biens en vente */}
            <View style={{ marginTop: 4 }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#0F172A', marginBottom: 8 }}>
                Biens et terrains sous mandat ({properties.filter((p: any) => p.forSale || p.categorie_vente).length})
              </Text>

              {properties.filter((p: any) => p.forSale || p.categorie_vente).length === 0 ? (
                <View style={[styles.card, { alignItems: 'center', paddingVertical: 24 }]}>
                  <Building2 color="#94A3B8" size={28} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', marginTop: 8 }}>
                    Aucun terrain ou bien en vente actif
                  </Text>
                  <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, textAlign: 'center' }}>
                    Créez un bien en sélectionnant « Vente / Transaction (ADD-25) ».
                  </Text>
                </View>
              ) : (
                properties.filter((p: any) => p.forSale || p.categorie_vente).map((bien: any) => (
                  <View key={bien.id} style={[styles.card, { marginBottom: 10 }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#0F172A', flex: 1 }}>{bien.name}</Text>
                      <View style={{ backgroundColor: bien.titre_type === 'ACD' ? '#DCFCE7' : '#FEF3C7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                        <Text style={{ fontSize: 9, fontWeight: '800', color: bien.titre_type === 'ACD' ? '#166534' : '#92400E' }}>
                          {bien.titre_type || 'TITRE EN COURS'}
                        </Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                      {bien.city} · {bien.superficie_m2 || bien.surface || '-'} m² · Lot {bien.numero_lot || '-'}
                    </Text>
                    <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', fontWeight: '700' }}>Prix de vente</Text>
                      <Text style={{ fontSize: 13, fontWeight: '900', color: '#0F172A' }}>
                        {(bien.prixVenteFcfa || bien.price || 0).toLocaleString('fr-FR')} FCFA
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {!loading && aTab === 'mandants' && (
          <View style={[styles.sectionGap, { marginTop: 12 }]}>
            <Text style={styles.h1}>Mes bailleurs mandants ({properties.length})</Text>
            {properties.length === 0 ? (
              <View style={[styles.card, { alignItems: 'center', paddingVertical: 28 }]}>
                <Users color="#9CA3AF" size={32} />
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#64748B', marginTop: 8 }}>Aucun bailleur mandant</Text>
                <Text style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 4 }}>
                  Les bailleurs mandants apparaîtront ici avec leur code de masquage.
                </Text>
              </View>
            ) : properties.map((p, idx) => {
              const baiCode = `BAI-${String(idx + 1).padStart(4, '0')}`;
              return (
                <View key={p.id} style={styles.card}>
                  <Text style={styles.boldText}>
                    {roleView === 'chef' ? (p.ownerName || 'Bailleur Mandant') : baiCode}
                  </Text>
                  <Text style={styles.subMuted}>
                    Bien : {p.name} · {roleView === 'collab' ? 'Identité protégée' : `Code : ${baiCode}`}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {!loading && aTab === 'ext' && (
          <View style={[styles.sectionGap, { marginTop: 12 }]}>
            <Text style={styles.h1}>Bail externe → DGI (ADD-23)</Text>
            <View style={styles.card}>
              <Text style={styles.label}>LOYER MENSUEL (FCFA)</Text>
              <TextInput value={exLoyer} onChangeText={setExLoyer} keyboardType="numeric" style={styles.input} />
              <Text style={styles.label}>DURÉE (MOIS)</Text>
              <TextInput value={exDuree} onChangeText={setExDuree} keyboardType="numeric" style={styles.input} />
              <Text style={styles.boldText}>
                Total DGI + Timbres + Service QAPRIL :{' '}
                {(calcDroitsDgi(Number(exLoyer) || 0, Number(exDuree) || 12) + FRAIS_QAPRIL).toLocaleString('fr-FR')} F
              </Text>
              <Pressable
                style={styles.btnPrimary}
                onPress={() => Alert.alert('Bail déposé à la DGI', 'Reçu officiel DGI généré (art. 414 CCH).')}
              >
                <Text style={styles.btnPrimaryText}>Payer et déposer à la DGI</Text>
              </Pressable>
            </View>
          </View>
        )}

        {!loading && aTab === 'flux' && (
          <View style={[styles.sectionGap, { marginTop: 12 }]}>
            <Text style={styles.h1}>Reversements aux bailleurs (− 8 %)</Text>
            {properties.length === 0 ? (
              <View style={[styles.card, { alignItems: 'center', paddingVertical: 28 }]}>
                <Wallet color="#9CA3AF" size={32} />
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#64748B', marginTop: 8 }}>Aucun flux à reverser</Text>
              </View>
            ) : properties.map((p) => {
              const loyer = Number(p.currentRent || p.declaredRentFcfa || 0);
              const net = Math.round(loyer * (1 - HON));
              return (
                <View key={p.id} style={styles.card}>
                  <Text style={styles.boldText}>{p.name}</Text>
                  <Text style={styles.subMuted}>
                    Loyer : {loyer.toLocaleString('fr-FR')} F · Net bailleur : {net.toLocaleString('fr-FR')} F (Honoraires agence : {Math.round(loyer * HON).toLocaleString('fr-FR')} F)
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {!loading && aTab === 'verif' && (
          <View style={[styles.sectionGap, { marginTop: 12 }]}>
            <Text style={styles.h1}>Visites de vérification Niveau 4 (ADD-22)</Text>
            <View style={styles.card}>
              <Text style={styles.subMuted}>
                Réseau CPRAIMA-CI · Honoraires d'intervention certifiée : 15 000 FCFA / visite
              </Text>
              <Pressable
                style={[styles.btnPrimary, { marginTop: 12 }]}
                onPress={() => Alert.alert('Demande enregistrée', 'Un créneau d’intervention Niveau 4 a été créé.')}
              >
                <Text style={styles.btnPrimaryText}>Planifier une visite certifiée</Text>
              </Pressable>
            </View>
          </View>
        )}

        {!loading && aTab === 'team' && (
          <View style={[styles.sectionGap, { marginTop: 12 }]}>
            <Text style={styles.h1}>Équipe & Habilitations</Text>
            <View style={styles.card}>
              <Text style={styles.boldText}>Règles de masquage RG-CONF-04</Text>
              <Text style={[styles.subMuted, { marginTop: 4 }]}>
                En mode collaborateur, les coordonnées réelles des bailleurs sont masquées pour protéger le portefeuille de l'agence.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F8' },
  subNav: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingVertical: 8 },
  chipsRow: { paddingHorizontal: 12, gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#fff' },
  chipText: { fontSize: 11, fontWeight: '700', color: '#334155' },
  scroll: { padding: 16, paddingBottom: 60 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subMuted: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  h1: { fontSize: 20, fontWeight: '900', color: '#1F2A44', letterSpacing: -0.5, marginTop: 2 },
  pillCoral: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  pillCoralText: { fontSize: 10, fontWeight: '800', color: '#141824' },
  sectionGap: { gap: 12 },
  heroCard: { backgroundColor: '#1F2A44', borderRadius: 20, padding: 20, gap: 8 },
  heroSub: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5 },
  heroBig: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  grid2: { flexDirection: 'row', gap: 10, marginTop: 6 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', gap: 4 },
  cardGrid: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#E2E8F0', gap: 4 },
  boldText: { fontSize: 14, fontWeight: '800', color: '#1F2A44' },
  label: { fontSize: 10, fontWeight: '800', color: '#64748B', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, padding: 10, backgroundColor: '#F8FAFC', fontSize: 14, fontWeight: '700', marginTop: 4 },
  btnPrimary: { backgroundColor: '#1F2A44', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 10 },
  btnPrimaryText: { color: '#fff', fontSize: 12, fontWeight: '800' },
});
