import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Alert, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { API_ENDPOINTS } from '../config/api';
import { Colors } from '../theme/colors';

export default function AuthScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [isLoading, setIsLoading] = useState(false);
  const [isBioChecking, setIsBioChecking] = useState(true);

  const API_URL = API_ENDPOINTS.AUTH;

  React.useEffect(() => {
    handleBiometricCheck();
  }, []);

  const handleBiometricCheck = async () => {
    try {
      const bioEnabled = await AsyncStorage.getItem('biometric_enabled');
      const savedToken = await AsyncStorage.getItem('saved_token');

      if (bioEnabled === 'true' && savedToken) {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();

        if (compatible && enrolled) {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Accès sécurisé QAPRIL',
          });

          if (result.success) {
            navigation.replace('Main', { token: savedToken });
            return;
          }
        }
      }
    } catch (e) {
      console.error("[BioAuth Error]", e);
    } finally {
      setIsBioChecking(false);
    }
  };

  const handleRequestOTP = async () => {
    if (!email) return Alert.alert("Erreur", "Veuillez entrer un email valide.");
    setIsLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REQUEST_OTP', email, role: 'TENANT' })
      });
      const data = await response.json();
      if (data.success) {
        setStep('OTP');
      } else {
        Alert.alert("Erreur", data.error || "Impossible d'envoyer le code.");
      }
    } catch (e) {
      Alert.alert("Erreur de connexion", "Serveur injoignable.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) return Alert.alert("Erreur", "Code OTP requis.");
    setIsLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'VERIFY_OTP', email, otp, role: 'TENANT' })
      });
      const data = await response.json();
      if (data.success) {
        // Redirection vers le Main (Dashboard)
        navigation.replace('Main', { token: data.token });
      } else {
        Alert.alert("Erreur", data.error || "Code incorrect.");
      }
    } catch (e) {
      Alert.alert("Erreur de connexion", "Serveur injoignable.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <StatusBar style="light" />
        
        <View style={styles.header}>
            <Image 
              source={require('../../assets/logo-qapril.png')} 
              style={styles.logo} 
              resizeMode="contain" 
            />
            <Text style={styles.subtitle}>Gérez votre habitat avec Qapril</Text>
        </View>

        <View style={styles.card}>
          {isBioChecking ? (
            <ActivityIndicator size="large" color={Colors.primary} />
          ) : (
            <>
              <Text style={styles.cardTitle}>Connexion Sécurisée</Text>

              {step === 'PHONE' ? (
                <View>
                  <Text style={styles.label}>Votre Email</Text>
                  <TextInput 
                    style={styles.input}
                    placeholder="votre@email.com"
                    placeholderTextColor="#9ca3af"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                  <TouchableOpacity style={styles.button} onPress={handleRequestOTP} disabled={isLoading}>
                    <Text style={styles.buttonText}>{isLoading ? 'Chargement...' : 'Recevoir le code'}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                   <Text style={styles.label}>Code de vérification (6 chiffres)</Text>
                   <TextInput 
                    style={[styles.input, styles.otpInput]}
                    placeholder="000000"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                    maxLength={6}
                    value={otp}
                    onChangeText={setOtp}
                  />
                  <TouchableOpacity style={styles.button} onPress={handleVerifyOTP} disabled={isLoading}>
                    <Text style={styles.buttonText}>{isLoading ? 'Vérification...' : 'Se connecter'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.linkButton} onPress={() => setStep('PHONE')}>
                    <Text style={styles.linkText}>Modifier l'email</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#001C29' },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  header: { marginBottom: 40, alignItems: 'center' },
  logo: { width: 180, height: 80, marginBottom: 10 },
  title: { fontSize: 42, fontWeight: '900', color: '#ffffff', textTransform: 'uppercase', letterSpacing: 2 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginTop: 8 },
  card: { backgroundColor: '#ffffff', borderRadius: 24, padding: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  cardTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 24, textAlign: 'center' },
  label: { fontSize: 12, fontWeight: '800', color: '#4b5563', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  input: { backgroundColor: '#f3f4f6', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 18, fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 20, borderWidth: 1, borderColor: '#e5e7eb' },
  otpInput: { fontSize: 28, letterSpacing: 10, textAlign: 'center', fontWeight: '900', color: '#001C29' },
  button: { backgroundColor: '#001C29', borderRadius: 16, paddingVertical: 18, alignItems: 'center', shadowColor: '#001C29', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  buttonText: { color: '#FFF000', fontSize: 14, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  linkButton: { marginTop: 16, alignItems: 'center' },
  linkText: { color: '#6b7280', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }
});
