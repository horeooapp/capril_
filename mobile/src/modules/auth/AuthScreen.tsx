import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  StatusBar,
  Image,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../theme/theme';
import { useAuth } from '../../hooks/qapril-hooks';

const { width, height } = Dimensions.get('window');

interface AuthScreenProps {
  onLogin: (user: any) => void;
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const { login, loading, error } = useAuth();
  
  const [localError, setLocalError] = useState<string | null>(null);

  const handleRequestOTP = async () => {
    setLocalError(null);
    const cleaned = phone.replace(/\s/g, '');
    
    if (cleaned.length < 8) {
      setLocalError("Veuillez entrer un numéro de téléphone valide.");
      return;
    }

    // In a real scenario, we'd call a requestOTP endpoint here.
    // For now, based on hook alignment, we proceed to OTP entry.
    setStep('OTP');
  };

  const handleVerifyOTP = async () => {
    setLocalError(null);
    if (otp.length < 4) {
      setLocalError("Le code OTP doit contenir au moins 4 chiffres.");
      return;
    }
    
    try {
      const res = await login(phone, otp.trim());
      if (res && res.success) {
        onLogin(res.profil);
      }
    } catch (e: any) {
      // hook handles UI error
    }
  };

  const displayError = localError || error;

  return (
    <>
      <StatusBar barStyle="light-content" />
      <LinearGradient 
        colors={[Theme.colors.navyDark, Theme.colors.navy]} 
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.keyboardView}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.innerContent}>
                
                {/* BRANDING SECTION (TOP) */}
                <View style={styles.brandingSection}>
                  <View style={styles.logoCircle}>
                      <Image 
                        source={require('../../../assets/icon.png')} 
                        style={styles.logoImage} 
                        resizeMode="contain"
                     />
                  </View>
                  <Text style={styles.brandTitle}>Qapril</Text>
                  <Text style={styles.brandSubtitle}>
                    Plateforme Nationale de{'\n'}Gestion Locative Certifiée (DGI CI)
                  </Text>
                  
                  <View style={styles.trustBadge}>
                    <Text style={styles.trustText}>🔒 Accès Sécurisé SHA-256</Text>
                  </View>
                </View>

                {/* FORM SECTION (BOTTOM SHEET) */}
                <View style={[styles.bottomSheet, { minHeight: step === 'OTP' ? height * 0.55 : height * 0.45 }]}>
                  
                  <View style={styles.sheetIndicator} />
                  
                  <Text style={styles.sheetTitle}>
                    {step === 'PHONE' ? "Bienvenue" : "Vérification SMS"}
                  </Text>
                  <Text style={styles.sheetDesc}>
                    {step === 'PHONE' 
                      ? "Identifiez-vous avec votre numéro de téléphone pour accéder à votre espace certifié." 
                      : `Saisissez le code de sécurité envoyé au\n${phone}`}
                  </Text>

                  {displayError && (
                    <View style={styles.errorBox}>
                      <Text style={styles.errorText}>⚠️ {displayError}</Text>
                    </View>
                  )}

                  <View style={styles.formContainer}>
                    {step === 'PHONE' ? (
                      <>
                        <Text style={styles.inputLabel}>Numéro de Téléphone</Text>
                        <View style={styles.inputWrapper}>
                           <View style={styles.prefixBox}>
                              <Text style={styles.prefixText}>+225</Text>
                           </View>
                           <TextInput 
                            style={styles.input}
                            placeholder="01 02 03 04 05"
                            placeholderTextColor={Theme.colors.grey3}
                            keyboardType="phone-pad"
                            value={phone}
                            onChangeText={setPhone}
                            autoFocus
                          />
                        </View>
                        
                        <TouchableOpacity onPress={handleRequestOTP} disabled={loading} style={styles.btnShadow}>
                          <LinearGradient
                            colors={[Theme.colors.teal, Theme.colors.navy]}
                            style={styles.mainBtn}
                          >
                            {loading ? <ActivityIndicator color={Theme.colors.white} /> : <Text style={styles.btnText}>Recevoir le code</Text>}
                          </LinearGradient>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <Text style={styles.inputLabel}>Code OTP de sécurité</Text>
                        <View style={styles.otpWrapper}>
                          <TextInput 
                            style={styles.otpInput}
                            placeholder="● ● ● ●"
                            placeholderTextColor={Theme.colors.grey3}
                            keyboardType="number-pad"
                            maxLength={6}
                            value={otp}
                            onChangeText={setOtp}
                            autoFocus
                          />
                        </View>
                        
                        <TouchableOpacity onPress={handleVerifyOTP} disabled={loading} style={styles.btnShadow}>
                          <LinearGradient
                            colors={[Theme.colors.teal, Theme.colors.navy]}
                            style={styles.mainBtn}
                          >
                            {loading ? <ActivityIndicator color={Theme.colors.white} /> : <Text style={styles.btnText}>S'authentifier</Text>}
                          </LinearGradient>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={styles.cancelBtn}
                          onPress={() => { setStep('PHONE'); setOtp(''); setLocalError(null); }}
                          disabled={loading}
                        >
                          <Text style={styles.cancelBtnText}>Utiliser un autre numéro</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                  
                  <View style={styles.footer}>
                    <Text style={styles.footerBrand}>QAPRIL CI · 2026</Text>
                  </View>

                </View>

              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  innerContent: { flex: 1, justifyContent: 'space-between' },
  brandingSection: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, marginTop: 20 },
  logoCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFFFFF', padding: 10, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 15, elevation: 10, alignItems: 'center', justifyContent: 'center' },
  logoImage: { width: '85%', height: '85%' },
  brandTitle: { fontSize: 32, fontWeight: '900', color: Theme.colors.white, letterSpacing: 2, marginBottom: 8 },
  brandSubtitle: { fontSize: 13, fontWeight: '500', color: Theme.colors.tealPale, textAlign: 'center', lineHeight: 20, opacity: 0.9, marginBottom: 20 },
  trustBadge: { backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  trustText: { color: '#E0F4F9', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  bottomSheet: { backgroundColor: Theme.colors.white, borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 30, paddingTop: 15, paddingBottom: 20, minHeight: height * 0.45, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15, elevation: 20 },
  sheetIndicator: { width: 40, height: 5, backgroundColor: '#E2E8F0', borderRadius: 3, alignSelf: 'center', marginBottom: 25 },
  sheetTitle: { fontSize: 24, fontWeight: '900', color: Theme.colors.navy, marginBottom: 8 },
  sheetDesc: { fontSize: 13, color: Theme.colors.textLight, lineHeight: 18, marginBottom: 25 },
  errorBox: { backgroundColor: Theme.colors.redPale, borderRadius: 12, padding: 12, marginBottom: 20 },
  errorText: { color: Theme.colors.red, fontSize: 11, textAlign: 'center', fontWeight: '800' },
  formContainer: { paddingBottom: 10 },
  inputLabel: { fontSize: 11, fontWeight: '900', color: Theme.colors.navy, marginBottom: 8, letterSpacing: 0.5 },
  inputWrapper: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderWidth: 2, borderColor: '#EDF2F7', borderRadius: 18, height: 60, marginBottom: 20, overflow: 'hidden' },
  prefixBox: { width: 70, backgroundColor: '#EDF2F7', alignItems: 'center', justifyContent: 'center' },
  prefixText: { fontSize: 15, fontWeight: '900', color: Theme.colors.navy },
  input: { flex: 1, fontSize: 18, fontWeight: '800', color: Theme.colors.navy, paddingLeft: 15 },
  otpWrapper: { backgroundColor: '#F8FAFC', borderWidth: 2, borderColor: '#EDF2F7', borderRadius: 18, height: 65, marginBottom: 20 },
  otpInput: { flex: 1, fontSize: 24, fontWeight: '900', color: Theme.colors.navy, textAlign: 'center', letterSpacing: 10 },
  btnShadow: { shadowColor: Theme.colors.navy, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  mainBtn: { height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: Theme.colors.white, fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  cancelBtn: { alignItems: 'center', marginTop: 15 },
  cancelBtnText: { color: Theme.colors.textLight, fontSize: 12, fontWeight: '800' },
  footer: { alignItems: 'center', marginTop: 20 },
  footerBrand: { fontSize: 10, fontWeight: '900', color: '#CBD5E1', letterSpacing: 2 },
});
