import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  Alert,
  ScrollView,
  TextInput
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, FileText, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw, CreditCard } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { API_ENDPOINTS } from '../config/api';

export default function ScanBillScreen({ navigation, route }: any) {
  const { token } = route.params || {};
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualAmount, setManualAmount] = useState('');

  const pickImage = async (useCamera = false) => {
    let result;
    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') return Alert.alert("Permissions", "L'accès à la caméra est requis.");
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
    }

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      processOCR(result.assets[0].uri);
    }
  };

  const processOCR = async (uri: string) => {
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      // @ts-ignore
      formData.append('file', {
        uri: uri,
        type: 'image/jpeg',
        name: 'invoice.jpg',
      });
      formData.append('typeUtility', 'CIE'); // Default to CIE for now, could be dynamic
      formData.append('token', token);

      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/v1/utilities/ocr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        Alert.alert("Échec de l'IA", data.error || "Impossible d'analyser la facture. Assurez-vous que l'image est nette.");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Erreur", "Une erreur est survenue lors de l'analyse.");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = () => {
    if (!result?.amount) return;
    navigation.navigate('PaymentProcess', { 
      amount: result.amount, 
      token,
      source: 'SCAN_IA'
    });
  };
  
  const handleManualSubmit = () => {
    const amount = parseInt(manualAmount.replace(/[^0-9]/g, ''));
    if (isNaN(amount) || amount <= 0) {
      return Alert.alert("Erreur", "Veuillez saisir un montant valide.");
    }
    navigation.navigate('PaymentProcess', { 
      amount: amount, 
      token,
      source: 'MANUAL_ENTRY'
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>QAPRIL Scan</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {!image && !loading && (
          <View style={styles.emptyState}>
            <View style={styles.iconCircle}>
              <FileText size={60} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Scannez vos factures CIE / SODECI</Text>
            <Text style={styles.subtitle}>Prenez une photo nette de votre facture pour que l'IA puisse extraire le montant automatiquement.</Text>
            
            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.mainButton} onPress={() => pickImage(true)}>
                <Camera size={24} color={Colors.white} />
                <Text style={styles.mainButtonText}>Prendre une photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.secondaryButton} onPress={() => pickImage(false)}>
                <Text style={styles.secondaryButtonText}>Choisir dans la galerie</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {image && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: image }} style={styles.previewImage} />
            
            {loading ? (
              <View style={styles.statusBox}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.statusText}>Analyse par l'IA en cours...</Text>
              </View>
            ) : result ? (
              <View style={[styles.statusBox, styles.successBox]}>
                <View style={styles.resultHeader}>
                  <CheckCircle2 size={24} color={Colors.success} />
                  <Text style={styles.resultTitle}>Analyse terminée avec succès</Text>
                </View>
                
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Montant détecté</Text>
                  <Text style={styles.dataValue}>{result.amount.toLocaleString()} FCFA</Text>
                </View>
                
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Échéance</Text>
                  <Text style={styles.dataValue}>{new Date(result.dueDate).toLocaleDateString('fr-FR')}</Text>
                </View>

                <TouchableOpacity style={styles.payButton} onPress={handlePay}>
                  <CreditCard size={20} color={Colors.white} />
                  <Text style={styles.payButtonText}>Valider et Payer {result.amount.toLocaleString()} FCFA</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.retryButton} onPress={() => setImage(null)}>
                  <RefreshCw size={16} color={Colors.text.muted} />
                  <Text style={styles.retryButtonText}>Reprendre une photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.statusBox, styles.errorBox]}>
                <AlertCircle size={30} color={Colors.danger} />
                <Text style={styles.errorText}>L'IA n'a pas pu lire cette facture.</Text>
                
                <TouchableOpacity style={styles.payButton} onPress={() => setIsManualMode(true)}>
                   <Text style={[styles.payButtonText, { fontSize: 14 }]}>Saisir le montant manuellement</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.retryButton} onPress={() => { setImage(null); setIsManualMode(false); }}>
                  <RefreshCw size={16} color={Colors.text.muted} />
                  <Text style={styles.retryButtonText}>Réessayer la photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {isManualMode && (
          <View style={styles.manualContainer}>
            <Text style={styles.manualTitle}>Saisie Manuelle</Text>
            <Text style={styles.manualSub}>Entrez le montant total net à payer indiqué sur votre facture.</Text>
            
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.manualInput}
                placeholder="Montant en FCFA"
                keyboardType="numeric"
                value={manualAmount}
                onChangeText={setManualAmount}
                autoFocus
              />
              <Text style={styles.currencyLabel}>FCFA</Text>
            </View>

            <TouchableOpacity style={styles.payButton} onPress={handleManualSubmit}>
               <CreditCard size={20} color={Colors.white} />
               <Text style={styles.payButtonText}>Valider et Payer</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.retryButton} onPress={() => setIsManualMode(false)}>
               <Text style={styles.retryButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)'
  },
  backButton: { padding: 10 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  container: { padding: 24, flexGrow: 1, justifyContent: 'center' },
  emptyState: { alignItems: 'center' },
  iconCircle: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    backgroundColor: 'rgba(6, 78, 59, 0.1)', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 32
  },
  title: { fontSize: 24, fontWeight: '900', color: Colors.primary, textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 14, color: Colors.text.muted, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },
  buttonGroup: { width: '100%', marginTop: 40, gap: 12 },
  mainButton: { 
    backgroundColor: Colors.primary, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: 60, 
    borderRadius: 20,
    gap: 12,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10
  },
  mainButtonText: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  secondaryButton: { 
    height: 60, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary
  },
  secondaryButtonText: { color: Colors.primary, fontSize: 16, fontWeight: '700' },
  previewContainer: { flex: 1, width: '100%' },
  previewImage: { width: '100%', height: 300, borderRadius: 24, marginBottom: 24 },
  statusBox: { 
    backgroundColor: Colors.white, 
    borderRadius: 24, 
    padding: 24, 
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  statusText: { marginTop: 16, fontSize: 16, fontWeight: '700', color: Colors.primary },
  successBox: { borderColor: Colors.success, borderWidth: 1 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 },
  resultTitle: { fontSize: 16, fontWeight: '800', color: Colors.success },
  dataRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '100%', 
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  dataLabel: { fontSize: 14, color: Colors.text.muted, fontWeight: '600' },
  dataValue: { fontSize: 18, fontWeight: '900', color: Colors.primary },
  payButton: { 
    backgroundColor: Colors.accent, 
    width: '100%', 
    height: 60, 
    borderRadius: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: 10,
    marginTop: 10
  },
  payButtonText: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  retryButton: { marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 8 },
  retryButtonText: { color: Colors.text.muted, fontSize: 14, fontWeight: '600' },
  errorBox: { borderColor: Colors.danger, borderWidth: 1 },
  errorText: { marginTop: 16, fontSize: 14, color: Colors.danger, fontWeight: '700', textAlign: 'center', marginBottom: 20 },
  manualContainer: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    marginTop: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  manualTitle: { fontSize: 18, fontWeight: '900', color: Colors.primary, marginBottom: 8 },
  manualSub: { fontSize: 13, color: Colors.text.muted, marginBottom: 20 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  manualInput: {
    flex: 1,
    height: 60,
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary
  },
  currencyLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text.muted
  }
});
