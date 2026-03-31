import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Alert,
  LayoutAnimation
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../theme/theme';
import { Badge } from '../../components/common/Badge';
import { Row } from '../../components/common/Row';
import { SectionTitle } from '../../components/common/SectionTitle';
import { BrandHeader } from '../../components/common/BrandHeader';
import { BottomNav } from '../../components/common/BottomNav';
import { BottomSheet } from '../../components/common/BottomSheet';
import { useDiaspora, useDiasporaTransfer } from '../../hooks/qapril-hooks';

const { width } = Dimensions.get('window');
const FCFA_EUR = 655.957; // Taux de change fixe (Zone Franc)

export default function DiasporaScreen({ onBack }: { onBack?: () => void }) {
  const [tab, setTab] = useState("dash");
  const [devise, setDevise] = useState("FCFA");
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  const { data: profile, loading: profileLoading } = useDiaspora();
  const { transfer, loading: actionLoading } = useDiasporaTransfer();

  const fmt = (n: number) => (n || 0).toLocaleString("fr-FR");
  const toEuro = (fcfa: number) => (fcfa / FCFA_EUR).toFixed(2);
  const aff = (fcfa: number) => devise === "EUR" ? `${toEuro(fcfa)} €` : `${fmt(fcfa)} F`;

  const changeTab = (t: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTab(t);
  };

  const handleTransfer = async () => {
    const amount = profile?.soldeRecouvre || 0;
    if (amount <= 0) return Alert.alert("Solde Insuffisant", "Aucun fonds à transférer pour le moment.");
    
    try {
      await transfer(amount, devise);
      Alert.alert("Succès", `Virement SEPA de ${aff(amount)} initié vers votre compte de réception.`);
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    }
  };

  if (profileLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Theme.colors.navy} />
      </View>
    );
  }

  const DIASPORA = profile || { fullName: "Bailleur", soldeRecouvre: 425000, properties: [] };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView bounces={false} contentContainerStyle={styles.scrollContent}>
        
        <BrandHeader 
          title={DIASPORA.fullName?.toUpperCase()}
          subtitle="Bailleur Diaspora"
          roleLabel="DIASPORA"
          roleColor={Theme.colors.navy}
          onNotifPress={() => Alert.alert("Notifications", "Aucune alerte pour le moment.")}
        />

        <View style={styles.currencySwitch}>
           {["FCFA", "EUR"].map(d => (
             <TouchableOpacity key={d} style={[styles.curBtn, devise === d && styles.curBtnActive]} onPress={() => setDevise(d)}>
                <Text style={[styles.curText, devise === d && { color: '#FFF' }]}>{d}</Text>
             </TouchableOpacity>
           ))}
        </View>

        <View style={styles.kpiRow}>
           <View style={styles.kpiBox}>
              <Text style={styles.kpiVal}>{aff(DIASPORA.soldeRecouvre)}</Text>
              <Text style={styles.kpiLabel}>LOYERS À RÉCUPÉRER</Text>
           </View>
           <View style={[styles.kpiBox, { borderLeftWidth: 1, borderColor: '#EEE' }]}>
              <Text style={styles.kpiVal}>{DIASPORA.properties?.length || 0}</Text>
              <Text style={styles.kpiLabel}>UNITÉS EN GESTION</Text>
           </View>
        </View>

        <View style={styles.body}>
          {tab === "dash" && (
            <>
              <SectionTitle label="Virement International" />
              <TouchableOpacity style={styles.transferCard} onPress={handleTransfer} disabled={actionLoading}>
                 <LinearGradient colors={[Theme.colors.navy, '#1e3a8a']} style={styles.gradCard}>
                    <Text style={styles.tLabel}>SOLDE DISPONIBLE SEPA</Text>
                    <Text style={styles.tVal}>{aff(DIASPORA.soldeRecouvre)}</Text>
                    <View style={styles.tBtn}>
                       <Text style={styles.tBtnText}>{actionLoading ? "TRAITEMENT..." : "INITIER LE TRANSFERT SEPA"}</Text>
                    </View>
                 </LinearGradient>
              </TouchableOpacity>
              <Text style={styles.rateHint}>Cours du jour (Fixe RCI) : 1 EUR = {FCFA_EUR} FCFA</Text>
              <Text style={[styles.rateHint, { marginTop: 4, color: Theme.colors.navy }]}>
                 * Ce virement permet le rapatriement sécurisé de vos revenus locatifs collectés en Côte d'Ivoire vers votre compte européen certifié.
              </Text>

              <SectionTitle label="Suivi de mes Biens" />
              {(DIASPORA.properties || []).slice(0, 2).map((p: any) => (
                 <TouchableOpacity key={p.id} style={styles.propLine} onPress={() => setTab("biens")}>
                    <View style={{ flex: 1 }}>
                       <Text style={styles.pName}>{p.name}</Text>
                       <Text style={styles.pSub}>{p.commune} · {aff(p.loyer)}</Text>
                    </View>
                    <Badge label={p.statut} color={Theme.colors.green} bg={Theme.colors.greenPale} />
                 </TouchableOpacity>
              ))}
            </>
          )}

          {tab === "biens" && (
             <View>
                <SectionTitle label="Mes Investissements au Pays" />
                {(DIASPORA.properties || []).map((p: any) => (
                   <View key={p.id} style={styles.propCard}>
                      <View style={styles.pTop}>
                         <Text style={styles.pCardName}>{p.name}</Text>
                         <Badge label="GÉRÉ" color={Theme.colors.navy} bg={Theme.colors.navyPale} />
                      </View>
                      <Row label="Loyer mensuel" value={aff(p.loyer)} />
                      <Row label="Paiement Locataire" value={p.paiement || "À jour"} color={Theme.colors.green} />
                      <Row label="Délai SLA" value="24h" />
                   </View>
                ))}

                 <TouchableOpacity style={[styles.submitBtn, { backgroundColor: Theme.colors.navy, marginTop: 25 }]} onPress={() => Alert.alert("Action refusée", "Contactez votre gestionnaire de compte pour valider un nouveau bien.")}>
                    <View style={styles.gradientBtn}><Text style={styles.submitBtnText}>+ AJOUTER UN BIEN AU PAYS</Text></View>
                 </TouchableOpacity>
                 <TouchableOpacity style={[styles.submitBtn, { backgroundColor: Theme.colors.teal, marginTop: 10 }]} onPress={() => Alert.alert("Action refusée", "Un locataire doit être vérifié avant rattachement.")}>
                    <View style={styles.gradientBtn}><Text style={styles.submitBtnText}>+ RATTACHER UN LOCATAIRE GÉRÉ</Text></View>
                 </TouchableOpacity>
             </View>
          )}

          {tab === "virements" && (
             <View>
                <SectionTitle label="Réception Europe" />
                <View style={styles.ibanCard}>
                   <Text style={styles.ibanLabel}>VOTRE IBAN CERTIFIÉ</Text>
                   <Text style={styles.ibanVal}>{DIASPORA.iban || 'FR76 XXXX XXXX XXXX XXXX XXXX XXX'}</Text>
                   <Text style={styles.ibanBank}>{DIASPORA.bankName || 'REVOLUT / BOURSORAMA'}</Text>
                </View>
                <Text style={styles.legalInfo}>Règle stricte: Acheminement SEPA Automatisé vers IBAN certifié dès l'émission de la quittance validée. Archive fiscale 10 ans disponible sur demande.</Text>
             </View>
          )}

          {tab === "profil" && (
             <View>
                <SectionTitle label="Profil Identité KYC" />
                <View style={styles.profCard}>
                    <View style={styles.avatar}><Text style={{ fontSize: 32 }}>👤</Text></View>
                    <Text style={styles.userName}>{DIASPORA.fullName}</Text>
                    <Text style={styles.userRes}>Résident : {DIASPORA.paysResidence || 'Europe'}</Text>
                 </View>

                 <SectionTitle label="SLA & Délégation Mandataire" />
                 <TouchableOpacity style={[styles.submitBtn, { backgroundColor: Theme.colors.navy, marginTop: 5, marginBottom: 15 }]} onPress={() => {
                    Alert.alert("Génération d'Invitation", "Créer un lien sécurisé actif pendant 7 Jours ?", [
                        { text: "Annuler", style: "cancel" },
                        { text: "Oui, créer", onPress: async () => {
                            try {
                                const { apiFetch } = require('../../hooks/qapril-hooks');
                                const res = await apiFetch('/v1/diaspora/invite', { method: 'POST', body: { email: 'agence@test.ci' } });
                                Alert.alert("Lien Généré", `${res.link}\n(Copié dans le presse-papier)`);
                            } catch(e: any) { Alert.alert("Erreur", e.message); }
                        }}
                    ]);
                 }}>
                    <View style={styles.gradientBtn}><Text style={styles.submitBtnText}>🔗 GÉNÉRER LIEN D'INVITATION (7J)</Text></View>
                 </TouchableOpacity>
                 <View style={styles.kycForm}>
                    <Text style={[styles.inputLabel, {marginTop: 0}]}>Niveau d'exigence SLA (Délai Relance)</Text>
                    <View style={styles.inputVal}><Text style={styles.inputText}>Urgente (12h) | Correspondant (24h) | Agence (48h)</Text></View>
                    <Text style={styles.inputLabel}>Fuseau Horaire Reporting</Text>
                    <View style={styles.inputVal}><Text style={styles.inputText}>Europe/Paris (Standard GMT+1)</Text></View>
                    <Text style={styles.inputLabel}>Fréquence PDF Q-Cert</Text>
                    <View style={styles.inputVal}><Text style={styles.inputText}>Hebdomadaire (Vendredi, 18H)</Text></View>
                 </View>
                 
                 <SectionTitle label="Mon Profil de Résident" />
                 <View style={styles.kycForm}>
                    <Text style={styles.inputLabel}>Nom & Prénom exacts</Text>
                    <View style={styles.inputVal}><Text style={styles.inputText}>{DIASPORA.fullName}</Text></View>
                    <Text style={styles.inputLabel}>Numéro de Téléphone</Text>
                    <View style={styles.inputVal}><Text style={styles.inputText}>+33 6 XX XX XX XX</Text></View>
                    <Text style={styles.inputLabel}>Email de contact</Text>
                    <View style={styles.inputVal}><Text style={styles.inputText}>contact@bailleur.com</Text></View>
                    
                    <TouchableOpacity style={[styles.submitBtn, { backgroundColor: Theme.colors.orange, marginTop: 25 }]} onPress={() => Alert.alert("Sécurité", "La modification de votre identité légale nécessite une nouvelle validation KYC de la part des administrateurs Qapril. Continuer ?")}>
                       <View style={styles.gradientBtn}><Text style={styles.submitBtnText}>METTRE À JOUR MES DONNÉES</Text></View>
                    </TouchableOpacity>
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
          { id: "dash", icon: "📊", label: "Dashboard" },
          { id: "biens", icon: "🏢", label: "Biens" },
          { id: "virements", icon: "💶", label: "Virements" },
          { id: "profil", icon: "👤", label: "Profil" },
        ]}
        activeTab={tab}
        onChange={setTab}
        accentColor={Theme.colors.navy}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingBottom: 100 },
  body: { padding: 20 },
  currencySwitch: { flexDirection: 'row', backgroundColor: '#E2E8F0', borderRadius: 12, padding: 4, marginHorizontal: 30, marginTop: 10 },
  curBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  curBtnActive: { backgroundColor: Theme.colors.navy },
  curText: { fontSize: 11, fontWeight: '900', color: Theme.colors.textLight },
  kpiRow: { flexDirection: 'row', marginTop: 20, marginHorizontal: 20, backgroundColor: '#FFF', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  kpiBox: { flex: 1, alignItems: 'center' },
  kpiVal: { fontSize: 16, fontWeight: '900', color: Theme.colors.navy },
  kpiLabel: { fontSize: 8, fontWeight: '800', color: Theme.colors.textLight, marginTop: 4, textAlign: 'center' },
  transferCard: { marginTop: 10, borderRadius: 25, overflow: 'hidden' },
  gradCard: { padding: 25, alignItems: 'center' },
  tLabel: { fontSize: 9, color: 'rgba(255,255,255,0.7)', fontWeight: '800', letterSpacing: 1 },
  tVal: { fontSize: 32, fontWeight: '900', color: '#FFF', marginVertical: 10 },
  tBtn: { backgroundColor: '#FFF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 15, marginTop: 10 },
  tBtnText: { color: Theme.colors.navy, fontSize: 11, fontWeight: '900' },
  rateHint: { fontSize: 10, color: Theme.colors.textLight, textAlign: 'center', marginTop: 10, fontStyle: 'italic' },
  propLine: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  pName: { fontSize: 14, fontWeight: '800', color: Theme.colors.navy },
  pSub: { fontSize: 11, color: Theme.colors.textLight, marginTop: 2 },
  propCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 18, marginBottom: 15, borderWidth: 1, borderColor: '#EDF2F7' },
  pTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, alignItems: 'center' },
  pCardName: { fontSize: 15, fontWeight: '800', color: Theme.colors.navy },
  ibanCard: { backgroundColor: Theme.colors.navy, padding: 25, borderRadius: 25 },
  ibanLabel: { fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: '800', letterSpacing: 1 },
  ibanVal: { fontSize: 16, color: '#FFF', fontWeight: '900', marginVertical: 10, fontFamily: 'monospace' },
  ibanBank: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '700' },
  legalInfo: { fontSize: 10, color: Theme.colors.textLight, textAlign: 'center', paddingHorizontal: 30, marginTop: 25 },
  profCard: { backgroundColor: '#FFF', borderRadius: 25, padding: 30, alignItems: 'center', marginBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EDF2F7', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  userName: { fontSize: 18, fontWeight: '900', color: Theme.colors.navy },
  userRes: { fontSize: 12, color: Theme.colors.textLight, marginTop: 5 },
  logoutBtn: { backgroundColor: '#F1F5F9', borderRadius: 15, paddingVertical: 15, alignItems: 'center', marginTop: 30 },
  logoutText: { color: Theme.colors.navy, fontWeight: '800', fontSize: 13 },
  submitBtn: { borderRadius: 15, marginTop: 20, overflow: 'hidden' },
  gradientBtn: { paddingVertical: 15, alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontSize: 12, fontWeight: '900' },
  kycForm: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#EDF2F7', marginBottom: 20 },
  inputLabel: { fontSize: 10, fontWeight: '800', color: Theme.colors.textLight, marginBottom: 5, marginTop: 10 },
  inputVal: { backgroundColor: '#F8FAFC', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#EDF2F7' },
  inputText: { fontSize: 13, fontWeight: '700', color: Theme.colors.navy },
});
