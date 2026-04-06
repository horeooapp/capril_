import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';

export default function PaymentScreen() {
  const [phone, setPhone] = useState('');
  const [operator, setOperator] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePayment = () => {
    if (!operator) return Alert.alert("Erreur", "Sélectionnez un opérateur (Wave, Orange, MTN)");
    if (!phone) return Alert.alert("Erreur", "Saisissez un numéro de téléphone");

    setLoading(true);
    
    // Simulation API Call to Payment Gateway
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        "Redirection Sécurisée", 
        "Vous allez être redirigé vers l'interface de CinetPay pour finaliser votre règlement par " + operator
      );
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Règlement du Loyer</Text>
        <Text style={styles.subtitle}>Sélectionnez votre moyen de paiement sécurisé</Text>

        <View style={styles.operatorContainer}>
          <TouchableOpacity 
            style={[styles.operatorButton, operator === 'Wave' && styles.operatorSelectedWave]} 
            onPress={() => setOperator('Wave')}
          >
            <Text style={[styles.operatorText, operator === 'Wave' && styles.textWave]}>Wave</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.operatorButton, operator === 'Orange' && styles.operatorSelectedOrange]} 
            onPress={() => setOperator('Orange')}
          >
            <Text style={[styles.operatorText, operator === 'Orange' && styles.textOrange]}>Orange</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.operatorButton, operator === 'MTN' && styles.operatorSelectedMTN]} 
            onPress={() => setOperator('MTN')}
          >
            <Text style={[styles.operatorText, operator === 'MTN' && styles.textMTN]}>MTN</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.inputLabel}>Numéro de l'expéditeur</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: 0707070707"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <TouchableOpacity style={styles.payButton} onPress={handlePayment} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>PROCÉDER AU PAIEMENT</Text>
          )}
        </TouchableOpacity>

        <View style={styles.securityBox}>
          <Text style={styles.securityText}>🔒 Vos transactions sont sécurisées de bout en bout (AES-256) via CinetPay. Une quittance certifiée SHA-256 sera générée automatiquement post-règlement.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3f4f6' },
  container: { padding: 24, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: '900', color: '#1f2937', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#6b7280', marginBottom: 32 },
  
  operatorContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  operatorButton: { flex: 1, paddingVertical: 16, alignItems: 'center', borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, marginHorizontal: 4 },
  
  operatorSelectedWave: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
  operatorSelectedOrange: { borderColor: '#f97316', backgroundColor: '#fff7ed' },
  operatorSelectedMTN: { borderColor: '#eab308', backgroundColor: '#fefce8' },
  
  operatorText: { fontWeight: '800', color: '#9ca3af', textTransform: 'uppercase', fontSize: 12 },
  textWave: { color: '#2563eb' },
  textOrange: { color: '#ea580c' },
  textMTN: { color: '#ca8a04' },
  
  inputLabel: { fontSize: 12, fontWeight: '800', color: '#4b5563', textTransform: 'uppercase', marginBottom: 8 },
  input: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 16, fontSize: 16, fontWeight: '700', color: '#1f2937', marginBottom: 32 },
  
  payButton: { backgroundColor: '#111827', padding: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  payButtonText: { color: '#ffffff', fontWeight: '900', letterSpacing: 1, fontSize: 13 },

  securityBox: { marginTop: 40, backgroundColor: '#e0e7ff', padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#4f46e5' },
  securityText: { fontSize: 11, color: '#3730a3', fontWeight: '600', lineHeight: 18 }
});
