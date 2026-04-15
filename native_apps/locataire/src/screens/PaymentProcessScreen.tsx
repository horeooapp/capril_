import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { Colors } from '../theme/colors';
import { 
  ChevronLeft, 
  CheckCircle, 
  CreditCard,
  Smartphone,
  FileText
} from 'lucide-react-native';

const OPERATORS = [
  { id: 'wave', name: 'Wave', color: '#1eb5ff', logo: 'https://wave.com/static/wave-logo.png' },
  { id: 'orange', name: 'Orange Money', color: '#ff7900', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Orange_logo.svg/1024px-Orange_logo.svg.png' },
  { id: 'mtn', name: 'MTN MoMo', color: '#ffcc00', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/MTN-Logo.svg/1024px-MTN-Logo.svg.png' },
  { id: 'moov', name: 'Moov Money', color: '#005a9c', logo: 'https://seeklogo.com/images/M/moov-logo-AF8D8D3B16-seeklogo.com.png' }
];

import { API_ENDPOINTS } from '../config/api';

export default function PaymentProcessScreen({ navigation, route }: any) {
  const { token, amount: initialAmount, leaseId: initialLeaseId } = route.params || {};
  
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!initialAmount || !initialLeaseId);
  const [successData, setSuccessData] = useState<any>(null);
  
  const [amount, setAmount] = useState<number>(initialAmount || 0);
  const [leaseId, setLeaseId] = useState<string>(initialLeaseId || '');

  const API_PAY = API_ENDPOINTS.PAY_RENT;
  const API_DASHBOARD = API_ENDPOINTS.DASHBOARD;

  React.useEffect(() => {
    if (initialLoading) {
      // Fetch active lease and arrears from Dashboard API
      fetch(API_DASHBOARD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token || 'DUMMY', role: 'TENANT' })
      })
      .then(res => res.json())
      .then(json => {
        if (json.data?.lease?.id) {
          setLeaseId(json.data.lease.id);
          setAmount(json.data.totalArrears > 0 ? json.data.totalArrears : json.data.lease.rent);
        } else {
          Alert.alert("Erreur", "Aucun contrat de bail actif trouvé.");
          navigation.goBack();
        }
      })
      .catch(err => {
        Alert.alert("Erreur réseau", "Impossible de récupérer les informations de paiement.");
        navigation.goBack();
      })
      .finally(() => setInitialLoading(false));
    }
  }, []);

  const handlePayment = async () => {
    if (!selectedOperator) {
      Alert.alert('Erreur', 'Veuillez sélectionner un opérateur.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_PAY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token || 'DUMMY',
          leaseId,
          amount,
          operator: selectedOperator
        })
      });

      const json = await response.json();
      if (json.success) {
        setSuccessData(json);
      } else {
        Alert.alert('Échec de l\'opération', json.error || 'Une règle de gestion a bloqué le paiement.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur Réseau', 'Impossible de contacter le serveur QAPRIL.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, {justifyContent: 'center', alignItems: 'center'}]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{marginTop: 10, color: Colors.primary}}>Chargement des informations...</Text>
      </SafeAreaView>
    );
  }

  if (successData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.successContainer}>
          <View style={styles.successIconBox}>
            <CheckCircle size={80} color="#059669" />
          </View>
          <Text style={styles.successTitle}>Paiement Confirmé !</Text>
          <Text style={styles.successSubtitle}>
            Votre règlement de {amount?.toLocaleString('fr-FR')} FCFA a été enregistré avec succès.
          </Text>
          
          <View style={styles.receiptInfoCard}>
             <Text style={styles.receiptLabel}>RÉFÉRENCE DE QUITTANCE</Text>
             <Text style={styles.receiptRef}>{successData.receiptRef}</Text>
          </View>

          <TouchableOpacity 
            style={styles.viewPdfButton}
            onPress={() => Alert.alert("PDF Disponible", "Veuillez vérifier votre section Quittances pour le télécharger.")}
          >
            <FileText size={20} color={Colors.white} style={{ marginRight: 10 }} />
            <Text style={styles.viewPdfText}>Terminer</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backHomeButton}
            onPress={() => navigation.navigate('MainTab', { screen: 'Dashboard' })}
          >
            <Text style={styles.backHomeText}>Retour à l'accueil</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Règlement Loyers</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Montant à régler</Text>
          <Text style={styles.amountValue}>{amount?.toLocaleString('fr-FR')} FCFA</Text>
          <View style={styles.leaseBadge}>
            <Text style={styles.leaseText}>Bail RÉF: {leaseId?.substring(0, 8)}...</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Choisir un opérateur</Text>
        
        <View style={styles.operatorsGrid}>
          {OPERATORS.map(op => (
            <TouchableOpacity 
              key={op.id}
              style={[
                styles.operatorItem, 
                selectedOperator === op.id && { borderColor: op.color, borderWidth: 2, backgroundColor: op.color + '10' }
              ]}
              onPress={() => setSelectedOperator(op.id)}
            >
              <View style={[styles.opIconContainer, { backgroundColor: op.color }]}>
                <Smartphone size={24} color={Colors.white} />
              </View>
              <Text style={styles.opName}>{op.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.payButton, !selectedOperator && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={loading || !selectedOperator}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <CreditCard size={20} color={Colors.white} style={{ marginRight: 10 }} />
              <Text style={styles.payButtonText}>Confirmer le Paiement</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.infoText}>
          En confirmant, vous autorisez QAPRIL à débiter votre compte mobile money du montant indiqué.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.background,
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
    color: Colors.primary,
  },
  container: { padding: 20 },
  amountCard: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  amountLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  amountValue: {
    color: Colors.accent,
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 16,
  },
  leaseBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  leaseText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 20,
  },
  operatorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  operatorItem: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  opIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  opName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  payButton: {
    backgroundColor: Colors.primary,
    height: 64,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  payButtonDisabled: {
    backgroundColor: 'rgba(0,28,41,0.5)',
  },
  payButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  infoText: {
    fontSize: 12,
    color: Colors.text.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  successIconBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 15,
  },
  successSubtitle: {
    fontSize: 15,
    color: Colors.text.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  receiptInfoCard: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    width: '100%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  receiptLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.text.muted,
    marginBottom: 8,
    letterSpacing: 1,
  },
  receiptRef: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  viewPdfButton: {
    backgroundColor: Colors.accent,
    width: '100%',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewPdfText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  backHomeButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 16,
  },
  backHomeText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
  }
});
