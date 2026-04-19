import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { ChevronLeft, Wallet, ArrowDownToLine, ArrowUpFromLine, RefreshCcw, Banknote, Smartphone, FileText } from 'lucide-react-native';
import { API_ENDPOINTS, BASE_URL } from '../config/api';

export default function WalletScreen({ route, navigation }: any) {
  const { token, userId } = route.params || {};
  const [balance, setBalance] = useState<number>(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>('');
  const [suggested, setSuggested] = useState<any>(null);
  
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'MOBILE' | 'BANK'>('MOBILE');
  const [accountDetails, setAccountDetails] = useState('');

  const API_WALLET = API_ENDPOINTS.WALLET;

  const fetchWallet = () => {
    setLoading(true);
    fetch(API_WALLET, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action: 'GET_BALANCE' })
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setBalance(json.balance);
          setHistory(json.history);
          setRole(json.role);
          setSuggested(json.suggestedRecharge);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleWithdraw = () => {
    const amount = parseInt(withdrawAmount, 10);
    if (!amount || amount <= 0) return Alert.alert("Erreur", "Saisissez un montant valide.");
    if (amount > balance) return Alert.alert("Fonds insuffisants", "Le montant demandé dépasse votre solde disponible.");
    
    // Limits check (ADD-20)
    const limit = role === 'LANDLORD_PRO' ? 2000000 : 500000;
    if (amount > limit) return Alert.alert("Limite dépassée", `Votre limite de retrait est de ${limit.toLocaleString()} FCFA par transaction.`);

    if (!accountDetails) return Alert.alert("Erreur", "Veuillez préciser le numéro de compte ou téléphone.");

    setLoading(true);
    fetch(API_WALLET, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        action: 'WITHDRAW',
        amount,
        withdrawalMethod: withdrawMethod,
        accountDetails
      })
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          Alert.alert("Demande envoyée", "Votre demande de retrait a été enregistrée avec succès de façon opérationnelle par nos équipes.");
          setWithdrawModal(false);
          setWithdrawAmount('');
          setAccountDetails('');
          fetchWallet(); // Actualiser le solde
        } else {
          Alert.alert("Erreur", json.error);
          setLoading(false);
        }
      })
      .catch(err => {
        Alert.alert("Erreur réseau", "Impossible de valider le retrait.");
        setLoading(false);
      });
  };

  if (loading && history.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#064E3B" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color="#064E3B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trésorerie & Wallet</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.balanceCard}>
           <Wallet size={32} color="#ffedd5" style={{marginBottom: 16}} />
           <Text style={styles.balanceLabel}>Paiements de loyers acquis</Text>
           <Text style={styles.balanceValue}>{balance.toLocaleString()} FCFA</Text>
           
           <TouchableOpacity 
             style={styles.withdrawButton} 
             onPress={() => setWithdrawModal(true)}
           >
             <ArrowUpFromLine size={18} color="#064E3B" />
             <Text style={styles.withdrawBtnText}>Transférer mes fonds</Text>
           </TouchableOpacity>

           <TouchableOpacity 
              style={[styles.withdrawButton, { marginTop: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }]} 
              onPress={() => {
                if (userId) {
                  const url = `${BASE_URL}/export/financial-report/${userId}?token=${token}`;
                  navigation.navigate('DocumentView', { url, title: 'Bilan Financier' });
                } else {
                  Alert.alert("Information", "Données utilisateur manquantes pour l'export.");
                }
              }}
            >
              <FileText size={18} color="#fff" />
               <Text style={[styles.withdrawBtnText, { color: '#fff' }]}>Bilan Financier (.pdf)</Text>
            </TouchableOpacity>

            {role === 'LANDLORD_PRO' && (
              <View style={styles.proPill}>
                <Text style={styles.proPillText}>COMPTE PROFESSIONNEL</Text>
              </View>
            )}
        </View>

        {/* SUGGESTED RECHARGE (ADD-07) */}
        {suggested && (
          <View style={styles.suggestedContainer}>
            <Text style={styles.sectionTitle}>Recommandation de recharge</Text>
            <Text style={styles.suggestedSubtitle}>Basé sur vos baux actifs et les frais de quittance</Text>
            <View style={styles.suggestedRow}>
              <TouchableOpacity style={styles.suggestedCard}>
                <Text style={styles.suggestedLabel}>Essentiel</Text>
                <Text style={styles.suggestedValue}>{suggested.minimum.toLocaleString()} FCFA</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.suggestedCard, {borderColor: '#064E3B', backgroundColor: '#ecfdf5'}]}>
                <Text style={[styles.suggestedLabel, {color: '#064E3B'}]}>Recommandé</Text>
                <Text style={[styles.suggestedValue, {color: '#064E3B'}]}>{suggested.recommande.toLocaleString()} FCFA</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.suggestedCard}>
                <Text style={styles.suggestedLabel}>Liberté</Text>
                <Text style={styles.suggestedValue}>{suggested.confort.toLocaleString()} FCFA</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.historySection}>
           <Text style={styles.sectionTitle}>Historique des transactions</Text>
           <TouchableOpacity onPress={fetchWallet}>
              <RefreshCcw size={20} color="#6b7280" />
           </TouchableOpacity>
        </View>

        {history.length === 0 ? (
          <Text style={{textAlign: 'center', color: '#6b7280', marginTop: 20}}>Aucune transaction trouvée.</Text>
        ) : (
          history.map(tx => (
            <View key={tx.id} style={styles.txCard}>
              <View style={[styles.txIconContainer, { backgroundColor: tx.amount > 0 ? '#ecfdf5' : '#fef2f2' }]}>
                {tx.amount > 0 ? <ArrowDownToLine size={20} color="#059669" /> : <ArrowUpFromLine size={20} color="#dc2626" />}
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.txTitle}>{tx.type === 'PLEDGES' ? 'Encaissement Loyer' : 'Retrait Initié'}</Text>
                <Text style={styles.txDate}>{new Date(tx.createdAt).toLocaleDateString()}</Text>
              </View>
              <View style={{alignItems: 'flex-end'}}>
                <Text style={[styles.txAmount, { color: tx.amount > 0 ? '#059669' : '#dc2626' }]}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                </Text>
                <Text style={{fontSize: 10, color: '#9ca3af', fontWeight: '800'}}>{tx.status}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Withdraw Modal */}
      <Modal visible={withdrawModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
           <View style={styles.modalContent}>
             <Text style={styles.modalTitle}>Nouveau Retrait</Text>
             <Text style={styles.modalSubtitle}>Solde disponible: <Text style={{fontWeight:'800', color: '#064E3B'}}>{balance.toLocaleString()} FCFA</Text></Text>
             
             <View style={styles.inputGroup}>
                <Text style={styles.label}>MONTANT (FCFA)</Text>
                <TextInput 
                   style={styles.input} 
                   keyboardType="numeric" 
                   value={withdrawAmount} 
                   onChangeText={setWithdrawAmount} 
                   placeholder="Ex: 50000"
                />
             </View>

             <Text style={styles.label}>MÉTHODE DE RÉCEPTION</Text>
             <View style={styles.methodRow}>
               <TouchableOpacity 
                 style={[styles.methodCard, withdrawMethod === 'MOBILE' && styles.methodSelected]}
                 onPress={() => setWithdrawMethod('MOBILE')}
               >
                 <Smartphone size={24} color={withdrawMethod === 'MOBILE' ? '#064E3B' : '#9ca3af'} />
                 <Text style={[styles.methodText, withdrawMethod === 'MOBILE' && {color: '#064E3B'}]}>Mobile Money</Text>
               </TouchableOpacity>
               <TouchableOpacity 
                 style={[styles.methodCard, withdrawMethod === 'BANK' && styles.methodSelected]}
                 onPress={() => setWithdrawMethod('BANK')}
               >
                 <Banknote size={24} color={withdrawMethod === 'BANK' ? '#064E3B' : '#9ca3af'} />
                 <Text style={[styles.methodText, withdrawMethod === 'BANK' && {color: '#064E3B'}]}>Virement Bancaire</Text>
               </TouchableOpacity>
             </View>

             <View style={styles.inputGroup}>
                <Text style={styles.label}>INFORMATIONS DU COMPTE</Text>
                <TextInput 
                   style={styles.input} 
                   value={accountDetails} 
                   onChangeText={setAccountDetails} 
                   placeholder={withdrawMethod === 'MOBILE' ? "Numéro (ex: 0707...)" : "RIB ou IBAN"}
                />
             </View>

             <View style={{flexDirection: 'row', gap: 12, marginTop: 24}}>
               <TouchableOpacity style={[styles.submitButton, {backgroundColor: 'rgba(0,0,0,0.05)'}]} onPress={() => setWithdrawModal(false)}>
                  <Text style={{color: '#4b5563', fontWeight: '800'}}>Annuler</Text>
               </TouchableOpacity>
               <TouchableOpacity style={styles.submitButton} onPress={handleWithdraw}>
                  <Text style={{color: '#fff', fontWeight: '800'}}>Demander le virement</Text>
               </TouchableOpacity>
             </View>
           </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3f4f6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#064E3B',
  },
  container: { padding: 16 },
  balanceCard: {
    backgroundColor: '#064E3B', padding: 24, borderRadius: 24, elevation: 8,
    shadowColor: '#064E3B', shadowOffset: {width: 0, height: 10}, shadowOpacity: 0.3, shadowRadius: 15, marginBottom: 32
  },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '700', marginBottom: 8 },
  balanceValue: { color: '#fff', fontSize: 36, fontWeight: '900', marginBottom: 24 },
  withdrawButton: {
    backgroundColor: '#ffedd5', flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    padding: 16, borderRadius: 16, gap: 10
  },
  withdrawBtnText: { color: '#064E3B', fontSize: 16, fontWeight: '900' },
  historySection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  txCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f3f4f6'
  },
  txIconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  txTitle: { fontSize: 14, fontWeight: '800', color: '#111827', marginBottom: 4 },
  txDate: { fontSize: 12, color: '#6b7280' },
  txAmount: { fontSize: 15, fontWeight: '900', marginBottom: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#f9fafb', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24 },
  modalTitle: { fontSize: 24, fontWeight: '900', color: '#064E3B', marginBottom: 4 },
  modalSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 11, fontWeight: '800', color: '#6b7280', marginBottom: 8, letterSpacing: 1 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 16, fontSize: 16, color: '#111827' },
  methodRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  methodCard: { flex: 1, backgroundColor: '#fff', borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 16, padding: 16, alignItems: 'center', gap: 8 },
  methodSelected: { borderColor: '#064E3B', backgroundColor: '#ecfdf5' },
  methodText: { fontSize: 12, fontWeight: '700', color: '#9ca3af' },
  submitButton: { flex: 1, backgroundColor: '#064E3B', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  
  proPill: { 
    position: 'absolute', top: 16, right: 16, 
    backgroundColor: 'rgba(255,185,0,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,185,0,0.5)' 
  },
  proPillText: { color: '#fbbf24', fontSize: 10, fontWeight: '900' },
  
  suggestedContainer: { marginBottom: 32 },
  suggestedSubtitle: { fontSize: 12, color: '#6b7280', marginBottom: 12 },
  suggestedRow: { flexDirection: 'row', gap: 10 },
  suggestedCard: { flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  suggestedLabel: { fontSize: 10, fontWeight: '800', color: '#9ca3af', marginBottom: 4, textTransform: 'uppercase' },
  suggestedValue: { fontSize: 14, fontWeight: '900', color: '#111827' }
});
