import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ShieldCheck, FileText, CheckCircle2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignatureScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [lease, setLease] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'REVIEW' | 'OTP' | 'SUCCESS'>('REVIEW');
  const [otp, setOtp] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchLeaseDetails();
  }, [id]);

  const fetchLeaseDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      // For development, assuming the API runs on localhost or a known IP. 
      // In production, use your actual API URL.
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:3000';
      const response = await fetch(`${apiUrl}/api/mobile/shared/leases/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        setLease(data.lease);
      } else {
        Alert.alert('Erreur', data.error || 'Impossible de charger le bail.');
        router.back();
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOTP = async () => {
    setProcessing(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:3000';
      const response = await fetch(`${apiUrl}/api/mobile/shared/leases/${id}/otp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        setStep('OTP');
      } else {
        Alert.alert('Erreur', data.error || 'Erreur lors de la demande du code.');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur de connexion au serveur.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSign = async () => {
    if (otp.length !== 6) {
      Alert.alert('Erreur', 'Le code doit contenir 6 chiffres.');
      return;
    }
    
    setProcessing(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:3000';
      const response = await fetch(`${apiUrl}/api/mobile/shared/leases/${id}/sign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ otp })
      });
      
      const data = await response.json();
      if (response.ok) {
        setStep('SUCCESS');
      } else {
        Alert.alert('Erreur', data.error || 'Code invalide.');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la signature.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (!lease) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Signature du Bail</Text>
      </View>

      {step === 'REVIEW' && (
        <>
          <View style={styles.noticeBox}>
            <ShieldCheck color="#10B981" size={24} />
            <Text style={styles.noticeText}>
              Veuillez lire attentivement le contrat ci-dessous avant de procéder à la signature numérique.
            </Text>
          </View>

          <ScrollView style={styles.contractScroll} contentContainerStyle={styles.contractContent}>
            <Text style={styles.contractTitle}>CONTRAT DE BAIL À USAGE D'HABITATION</Text>
            
            <Text style={styles.sectionTitle}>Entre :</Text>
            <Text style={styles.paragraph}>
              Le PROPRIÉTAIRE (Bailleur) d'une part, et {lease.tenant?.firstName} {lease.tenant?.lastName} (Le Preneur) d'autre part.
            </Text>
            
            <Text style={styles.sectionTitle}>Objet du contrat :</Text>
            <Text style={styles.paragraph}>
              Location du bien : {lease.property?.title} situé à {lease.property?.address}.
            </Text>
            
            <Text style={styles.sectionTitle}>Conditions Financières :</Text>
            <Text style={styles.paragraph}>
              - Loyer mensuel : {lease.rentAmount} FCFA{'\n'}
              - Charges forfaitaires : {lease.chargesAmount} FCFA{'\n'}
              - Dépôt de garantie : {lease.depositAmount} FCFA
            </Text>

            <Text style={styles.sectionTitle}>Durée du bail :</Text>
            <Text style={styles.paragraph}>
              Ce bail est consenti pour une durée de {lease.durationMonths} mois, commençant le {new Date(lease.startDate).toLocaleDateString('fr-FR')}.
            </Text>
            
            <Text style={styles.sectionTitle}>Clauses Générales :</Text>
            <Text style={styles.paragraph}>
              Conformément à la Loi N°2019-576 du 26 juin 2019 instituant le Code de la Construction et de l'Habitat, le présent bail engage les deux parties à respecter les clauses stipulées dans le contrat officiel disponible sur votre portail QAPRIL.
            </Text>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable 
              style={[styles.button, processing && styles.buttonDisabled]} 
              onPress={handleRequestOTP}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>J'ai lu et j'accepte - Signer</Text>
              )}
            </Pressable>
          </View>
        </>
      )}

      {step === 'OTP' && (
        <View style={styles.otpContainer}>
          <FileText color="#10B981" size={48} style={{ marginBottom: 20 }} />
          <Text style={styles.otpTitle}>Vérification de sécurité</Text>
          <Text style={styles.otpSubtitle}>
            Un code à 6 chiffres a été envoyé par SMS à votre numéro de téléphone.
          </Text>
          
          <TextInput
            style={styles.otpInput}
            placeholder="000000"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
          />

          <Pressable 
            style={[styles.button, { width: '100%' }, (processing || otp.length !== 6) && styles.buttonDisabled]} 
            onPress={handleSign}
            disabled={processing || otp.length !== 6}
          >
            {processing ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Valider la signature</Text>
            )}
          </Pressable>
          
          <Pressable onPress={() => setStep('REVIEW')} style={{ marginTop: 20 }}>
            <Text style={styles.linkText}>Retour au document</Text>
          </Pressable>
        </View>
      )}

      {step === 'SUCCESS' && (
        <View style={styles.successContainer}>
          <CheckCircle2 color="#10B981" size={80} />
          <Text style={styles.successTitle}>Signature Réussie !</Text>
          <Text style={styles.successSubtitle}>
            Votre bail a été signé avec succès et possède désormais une valeur probante.
          </Text>
          <Pressable 
            style={styles.button} 
            onPress={() => router.replace('/(tabs)/')}
          >
            <Text style={styles.buttonText}>Retour à l'accueil</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#022c22', // emerald-900 background to match locataire theme
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#022c22',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#064e3b',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noticeBox: {
    flexDirection: 'row',
    backgroundColor: '#064e3b',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  noticeText: {
    color: '#d1fae5',
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  contractScroll: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
  },
  contractContent: {
    padding: 20,
  },
  contractTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#111827',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#374151',
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4b5563',
    textAlign: 'justify',
  },
  footer: {
    padding: 16,
    backgroundColor: '#022c22',
  },
  button: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  otpContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  otpSubtitle: {
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  otpInput: {
    backgroundColor: '#064e3b',
    color: '#FFF',
    fontSize: 32,
    letterSpacing: 10,
    textAlign: 'center',
    borderRadius: 12,
    width: '100%',
    padding: 20,
    marginBottom: 32,
  },
  linkText: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  successContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  successSubtitle: {
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  }
});
