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
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../theme/theme';
import { useAuth } from '../../hooks/qapril-hooks';

const { width, height } = Dimensions.get('window');

interface AuthScreenProps {
  onLogin: (user: any) => void;
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
  const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const { requestOTP, verifyOTP, loading, error } = useAuth();
  
  const [localError, setLocalError] = useState<string | null>(null);

  const handleRequestOTP = async () => {
    setLocalError(null);
    const trimmedEmail = email.trim().toLowerCase();
    
    // Basic email validation
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setLocalError("Veuillez entrer une adresse email valide.");
      return;
    }

    try {
      await requestOTP(trimmedEmail);
      setEmail(trimmedEmail);
      setStep('OTP');
    } catch (e: any) {
      // hook catches it
    }
  };

  const handleVerifyOTP = async () => {
    setLocalError(null);
    if (otp.length < 4) {
      setLocalError("Le code OTP doit contenir au moins 4 chiffres.");
      return;
    }
    
    try {
      const res = await verifyOTP(email, otp.trim());
      if (res && res.success && res.user) {
        onLogin(res.user);
      } else if (res && (res as any).error) {
        setLocalError((res as any).error);
      }
    } catch (e: any) {
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
                        source={require('../../../assets/logo-qapril.png')} 
                        style={styles.logoImage} 
                        resizeMode="contain"
                     />
                  </View>
                  <Text style={styles.brandTitle}>Qapril</Text>
                  <Text style={styles.brandSubtitle}>
                    Plateforme Nationale de{'\n'}Gestion Locative Certifiée
                  </Text>
                  
                  <View style={styles.trustBadge}>
                    <Text style={styles.trustText}>🔒 Accès Chiffré & Certifié</Text>
                  </View>
                </View>

                {/* FORM SECTION (BOTTOM SHEET) */}
                <View style={[styles.bottomSheet, { minHeight: step === 'OTP' ? height * 0.55 : height * 0.45 }]}>
                  
                  <View style={styles.sheetIndicator} />
                  
                  <Text style={styles.sheetTitle}>
                    {step === 'EMAIL' ? "Identifiez-vous" : "Vérification"}
                  </Text>
                  <Text style={styles.sheetDesc}>
                    {step === 'EMAIL' 
                      ? "Accédez à votre portefeuille de biens, vos baux et vos loyers certifiés en toute sécurité." 
                      : `Un code temporaire a été envoyé à l'adresse\n${email}`}
                  </Text>

                  {displayError && (
                    <View style={styles.errorBox}>
                      <Text style={styles.errorText}>⚠️ {displayError}</Text>
                    </View>
                  )}

                  <View style={styles.formContainer}>
                    {step === 'EMAIL' ? (
                      <>
                        <Text style={styles.inputLabel}>Adresse Email</Text>
                        <View style={styles.inputWrapper}>
                           <TextInput 
                            style={[styles.input, { paddingLeft: 20 }]}
                            placeholder="votre@email.ci"
                            placeholderTextColor={Theme.colors.grey3}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                            autoFocus
                          />
                        </View>
                        
                        <TouchableOpacity onPress={handleRequestOTP} disabled={loading} style={styles.btnShadow}>
                          <LinearGradient
                            colors={Theme.gradients.premium}
                            style={styles.mainBtn}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                          >
                            {loading ? <ActivityIndicator color={Theme.colors.white} /> : <Text style={styles.btnText}>Poursuivre</Text>}
                          </LinearGradient>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <Text style={styles.inputLabel}>Code de sécurité OTP</Text>
                        <View style={styles.otpWrapper}>
                          <TextInput 
                            style={styles.otpInput}
                            placeholder="● ● ● ● ● ●"
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
                            colors={Theme.gradients.premium}
                            style={styles.mainBtn}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                          >
                            {loading ? <ActivityIndicator color={Theme.colors.white} /> : <Text style={styles.btnText}>Authentifier l'accès</Text>}
                          </LinearGradient>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={styles.cancelBtn}
                          onPress={() => { setStep('EMAIL'); setOtp(''); setLocalError(null); }}
                          disabled={loading}
                        >
                          <Text style={styles.cancelBtnText}>Utiliser une autre adresse</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                  
                  <View style={styles.footer}>
                    <Text style={styles.footerBrand}>QAPRIL Technologies SA © 2026</Text>
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
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  innerContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  brandingSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    marginTop: 20,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: '90%',
    height: '90%',
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: Theme.colors.white,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  brandSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Theme.colors.tealPale,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.9,
    marginBottom: 24,
  },
  trustBadge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  trustText: {
    color: '#E0F4F9',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bottomSheet: {
    backgroundColor: Theme.colors.white,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
    minHeight: height * 0.45,
  },
  sheetIndicator: {
    width: 40,
    height: 4,
    backgroundColor: Theme.colors.grey2,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  sheetTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: Theme.colors.navy,
    marginBottom: 6,
  },
  sheetDesc: {
    fontSize: 13,
    color: Theme.colors.textLight,
    lineHeight: 18,
    marginBottom: 26,
  },
  errorBox: {
    backgroundColor: Theme.colors.redPale,
    borderWidth: 1,
    borderColor: 'rgba(160,0,0,0.15)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  errorText: {
    color: Theme.colors.red,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '700',
  },
  formContainer: {
    paddingBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: Theme.colors.navy,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: Theme.colors.grey2,
    borderRadius: 16,
    height: 60,
    marginBottom: 24,
    paddingRight: 16,
  },
  prefixBox: {
    backgroundColor: Theme.colors.white,
    height: '100%',
    paddingHorizontal: 16,
    borderRightWidth: 1,
    borderRightColor: Theme.colors.grey2,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  prefixText: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.navy,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.text,
    paddingLeft: 16,
    height: '100%',
  },
  otpWrapper: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: Theme.colors.grey2,
    borderRadius: 16,
    height: 66,
    marginBottom: 24,
  },
  otpInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '900',
    color: Theme.colors.navy,
    textAlign: 'center',
    letterSpacing: 12,
  },
  btnShadow: {
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  mainBtn: {
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: Theme.colors.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cancelBtn: {
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
  },
  cancelBtnText: {
    color: Theme.colors.textLight,
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerBrand: {
    fontSize: 9,
    fontWeight: '700',
    color: Theme.colors.grey3,
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
});
