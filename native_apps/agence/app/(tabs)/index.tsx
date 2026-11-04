import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Upload, ShieldCheck, Users, Building2, Wallet } from 'lucide-react-native';

const HON = 0.08;
const FRAIS_QAPRIL = 2000;
const PAGES_STD = 4;

function calcDroitsDgi(loyer: number, duree: number, pages = PAGES_STD) {
  return Math.round(0.025 * loyer * duree) + 500 * pages;
}

export default function AgencePrototypeHomeScreen() {
  const [roleView, setRoleView] = useState<'chef' | 'collab'>('chef');
  const [aTab, setATab] = useState<'home' | 'biens' | 'mandants' | 'ext' | 'flux' | 'verif' | 'team'>('home');

  const [mandants, setMandants] = useState([
    { id: 'M1', nom: 'Koffi N’Guessan', bai: 'BAI-007', ref: 'M-2026-014', mask: true, diaspora: true, enc: 350000, rev: 'du' },
    { id: 'M2', nom: 'SCI Les Palmiers', bai: 'BAI-003', ref: 'M-2025-088', mask: false, diaspora: false, enc: 200000, rev: 'du' },
    { id: 'M3', nom: 'Aïssata Diallo', bai: 'BAI-005', ref: 'M-2026-002', mask: true, diaspora: true, enc: 260000, rev: 'fait' },
  ]);

  const [verifs, setVerifs] = useState([
    { bien: 'Cour commune · Yopougon Niangon', dem: 'Koffi N’Guessan (hors mandat)', st: 'demande' },
    { bien: 'Immeuble · Abobo PK18', dem: 'Bailleur BAI-012', st: 'planifiee' },
    { bien: 'Villa · Bingerville', dem: 'SCI Horizon', st: 'rapport' },
  ]);

  const [exLoyer, setExLoyer] = useState('180000');
  const [exDuree, setExDuree] = useState('24');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.subNav}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {(
            [
              ['home', 'Accueil'],
              ['biens', 'Biens sous mandat'],
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
            <Text style={styles.subMuted}>Agence Riviera · AGR-2021-0133 · CPRAIMA-CI</Text>
            <Text style={styles.h1}>
              {roleView === 'chef' ? 'Estelle Aka · Chef d’agence' : 'Yves Koffi · Gestionnaire'}
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

        {aTab === 'home' && (
          <View style={[styles.sectionGap, { marginTop: 12 }]}>
            <View style={styles.heroCard}>
              <Text style={styles.heroSub}>LOYERS DU PORTEFEUILLE · NOV. 2026</Text>
              <Text style={styles.heroBig}>
                810 000 F <Text style={{ fontSize: 15, fontWeight: '500' }}>/ 1 460 000 F</Text>
              </Text>
              <Text style={styles.heroSub}>
                À reverser aux bailleurs (net − 8 % d’honoraires) : 506 000 F
              </Text>
            </View>
          </View>
        )}

        {aTab === 'biens' && (
          <View style={[styles.sectionGap, { marginTop: 12 }]}>
            <Text style={styles.h1}>Biens gérés sous mandat (Mandats reçus)</Text>
            <Text style={styles.subMuted}>Biens et lots immobiliers confiés à votre agence par mandat de gestion.</Text>
            {mandants.map((m) => (
              <View key={m.id} style={styles.card}>
                <Text style={styles.boldText}>
                  Bailleur mandant : {roleView === 'collab' && m.mask ? m.bai : m.nom}
                </Text>
                <Text style={styles.subMuted}>
                  Mandat {m.ref} · {roleView === 'collab' && m.mask ? 'Identité masquée (RG-CONF-04)' : `Code bailleur : ${m.bai}`} · Encaissement : {m.enc.toLocaleString('fr-FR')} F
                </Text>
              </View>
            ))}
          </View>
        )}

        {aTab === 'mandants' && (
          <View style={[styles.sectionGap, { marginTop: 12 }]}>
            <Text style={styles.h1}>Mes bailleurs mandants</Text>
            {mandants.map((m) => (
              <View key={m.id} style={styles.card}>
                <Text style={styles.boldText}>{roleView === 'chef' || !m.mask ? m.nom : m.bai}</Text>
                {roleView === 'chef' && (
                  <Pressable
                    style={[styles.pillCoral, { marginTop: 6, alignSelf: 'flex-start' }]}
                    onPress={() =>
                      setMandants((prev) =>
                        prev.map((x) => (x.id === m.id ? { ...x, mask: !x.mask } : x))
                      )
                    }
                  >
                    <Text style={styles.pillCoralText}>
                      {m.mask ? `Masqué aux collaborateurs (${m.bai})` : 'Visible aux collaborateurs'}
                    </Text>
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        )}

        {aTab === 'ext' && (
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

        {aTab === 'flux' && (
          <View style={[styles.sectionGap, { marginTop: 12 }]}>
            <Text style={styles.h1}>Reversements aux bailleurs (− 8 %)</Text>
            {mandants.map((m) => {
              const net = Math.round(m.enc * (1 - HON));
              return (
                <View key={m.id} style={styles.card}>
                  <Text style={styles.boldText}>
                    {roleView === 'chef' || !m.mask ? m.nom : m.bai} · Net : {net.toLocaleString('fr-FR')} F
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {aTab === 'verif' && (
          <View style={[styles.sectionGap, { marginTop: 12 }]}>
            <Text style={styles.h1}>Visites Niveau 4 CPRAIMA-CI (ADD-22)</Text>
            {verifs.map((v, i) => (
              <View key={i} style={styles.card}>
                <Text style={styles.boldText}>{v.bien}</Text>
                <Text style={styles.subMuted}>Demandeur : {v.dem} · 15 000 F / visite</Text>
              </View>
            ))}
          </View>
        )}

        {aTab === 'team' && (
          <View style={[styles.sectionGap, { marginTop: 12 }]}>
            <Text style={styles.h1}>Équipe & Masquage (RG-CONF-02)</Text>
            <View style={styles.card}>
              <Text style={styles.boldText}>Estelle Aka · Chef d’agence (Bailleurs réels visibles)</Text>
              <Text style={styles.boldText}>Yves Koffi · Gestionnaire (Codes BAI-NNN sur biens masqués)</Text>
              <Text style={styles.boldText}>Awa Cissé · Gestionnaire (Codes BAI-NNN sur biens masqués)</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F8' },
  subNav: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E5EE', paddingVertical: 9 },
  chipsRow: { paddingHorizontal: 14, gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E5EE' },
  chipText: { fontSize: 12, fontWeight: '700', color: '#141824' },
  scroll: { padding: 16, paddingBottom: 40 },
  sectionGap: { gap: 12 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  h1: { fontSize: 21, fontWeight: '800', color: '#141824' },
  subMuted: { fontSize: 12, color: '#666D80' },
  boldText: { fontSize: 13, fontWeight: '700', color: '#141824' },
  label: { fontSize: 11, fontWeight: '800', color: '#666D80' },
  heroCard: { backgroundColor: '#1F2A44', borderRadius: 22, padding: 18, gap: 6 },
  heroSub: { fontSize: 11, color: 'rgba(255,255,255,0.82)', fontWeight: '600' },
  heroBig: { fontSize: 27, fontWeight: '800', color: '#FFFFFF' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 15, borderWidth: 1, borderColor: '#E2E5EE', gap: 6 },
  pillCoral: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  pillCoralText: { fontSize: 11, fontWeight: '800', color: '#141824' },
  input: { borderWidth: 1, borderColor: '#E2E5EE', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, fontWeight: '700', backgroundColor: '#FFFFFF' },
  btnPrimary: { backgroundColor: '#1F2A44', borderRadius: 14, height: 46, alignItems: 'center', justifyContent: 'center' },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
});

