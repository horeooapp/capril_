import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Notifications from 'expo-notifications';
import { API_URL, getStoredToken, setStoredToken } from '../../lib/api';
import { registerForPushNotificationsAsync } from '../../lib/notifications';

interface NativeOTPFormProps {
  role?: 'TENANT' | 'LANDLORD' | 'ADMIN';
  title?: string;
  subtitle?: string;
}

export default function NativeOTPForm({ role = 'LANDLORD' }: NativeOTPFormProps) {
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [loginType, setLoginType] = useState<'PHONE' | 'EMAIL'>('PHONE');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [otp, setOtp] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'info' | 'success'; text: string } | null>(null);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const otpInputRef = useRef<TextInput>(null);
  const router = useRouter();

  const primaryColor = '#1F2A44';

  useEffect(() => {
    checkBiometricAuth();
  }, []);

  useEffect(() => {
    let timer: any = null;
    if (step === 'OTP' && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, resendCountdown]);

  // Écoute des notifications entrantes contenant un code OTP
  useEffect(() => {
    if (step !== 'OTP') return;

    const notificationSub = Notifications.addNotificationReceivedListener((notification) => {
      try {
        const title = notification.request.content.title || '';
        const body = notification.request.content.body || '';
        const fullText = `${title} ${body}`;
        const match = fullText.match(/\b\d{6}\b/) || fullText.match(/\d{6}/);
        if (match && match[0] && !isPending) {
          const foundCode = match[0];
          setOtp(foundCode);
          handleVerifyOTP(foundCode);
        }
      } catch (e) {
        console.log('[OTP Agence] Erreur lecture push OTP:', e);
      }
    });

    return () => {
      notificationSub.remove();
    };
  }, [step, isPending]);

  const checkBiometricAuth = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const storedToken = await getStoredToken();

      if (hasHardware && isEnrolled && storedToken) {
        const authResult = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Connexion Agence QAPRIL via Biométrie',
          fallbackLabel: 'Utiliser un code SMS',
          cancelLabel: 'Annuler',
          disableDeviceFallback: false,
        });

        if (authResult.success) {
          router.replace('/(tabs)');
        }
      }
    } catch {
      // Ignorer si la biométrie est indisponible
    }
  };

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 10) {
      let formatted = '';
      for (let i = 0; i < cleaned.length; i++) {
        if (i > 0 && i % 2 === 0) formatted += ' ';
        formatted += cleaned[i];
      }
      setPhoneNumber(formatted);
    }
  };

  const getRawIdentifier = () => {
    if (loginType === 'PHONE') {
      const rawDigits = phoneNumber.replace(/\s+/g, '');
      if (!rawDigits) return '';
      if (rawDigits.startsWith('0')) {
        return `+225${rawDigits}`;
      } else if (rawDigits.startsWith('225')) {
        return `+${rawDigits}`;
      } else if (rawDigits.startsWith('+225')) {
        return rawDigits;
      }
      return `+225${rawDigits}`;
    } else {
      return emailAddress.trim().toLowerCase();
    }
  };

  const handleRequestOTP = async () => {
    setFeedback(null);
    const identifier = getRawIdentifier();

    if (!identifier) {
      setFeedback({
        type: 'error',
        text: loginType === 'PHONE'
          ? 'Veuillez saisir votre numéro à 10 chiffres.'
          : 'Veuillez saisir une adresse e-mail valide.',
      });
      return;
    }

    if (loginType === 'PHONE') {
      const digits = phoneNumber.replace(/\s+/g, '');
      if (digits.length < 10) {
        setFeedback({ type: 'error', text: 'Le numéro ivoirien doit comporter 10 chiffres.' });
        return;
      }
    } else {
      if (!identifier.includes('@') || !identifier.includes('.')) {
        setFeedback({ type: 'error', text: "Format d'adresse e-mail invalide." });
        return;
      }
    }

    setIsPending(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(`${API_URL}/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          email: identifier,
          phone: identifier,
          role,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const result = await response.json();

      if (response.ok && result.success) {
        setStep('OTP');
        setResendCountdown(60);
        setCanResend(false);
        setFeedback({
          type: 'info',
          text: `Code envoyé à ${identifier}. Saisissez les 6 chiffres reçus.`,
        });
        setTimeout(() => otpInputRef.current?.focus(), 300);
      } else {
        setFeedback({
          type: 'error',
          text: result.error || "Impossible d'envoyer le code. Vérifiez vos identifiants.",
        });
      }
    } catch {
      clearTimeout(timeoutId);
      setFeedback({ type: 'error', text: 'Erreur de connexion. Vérifiez votre accès internet.' });
    } finally {
      setIsPending(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || isPending) return;
    setResendCountdown(60);
    setCanResend(false);
    await handleRequestOTP();
  };

  const handleOtpChange = (txt: string) => {
    if (!txt) {
      setOtp('');
      return;
    }
    const match = txt.match(/\b\d{6}\b/) || txt.match(/\d{6}/);
    if (match) {
      const foundOtp = match[0];
      setOtp(foundOtp);
      handleVerifyOTP(foundOtp);
      return;
    }
    const cleaned = txt.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(cleaned);
    if (cleaned.length === 6 && !isPending) {
      handleVerifyOTP(cleaned);
    }
  };

  const handleVerifyOTP = async (customOtp?: string) => {
    const codeToVerify = typeof customOtp === 'string' ? customOtp : otp;
    setFeedback(null);
    if (!codeToVerify || codeToVerify.length < 6) {
      setFeedback({ type: 'error', text: 'Saisissez les 6 chiffres du code.' });
      return;
    }

    setIsPending(true);
    const identifier = getRawIdentifier();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          email: identifier,
          phone: identifier,
          otp: codeToVerify,
          role,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const result = await response.json();

      if (response.ok && result.success && result.token) {
        await setStoredToken(result.token);
        registerForPushNotificationsAsync().catch(() => {});
        router.replace('/(tabs)');
      } else {
        setFeedback({ type: 'error', text: result.error || 'Code incorrect ou expiré.' });
      }
    } catch {
      clearTimeout(timeoutId);
      setFeedback({ type: 'error', text: 'Erreur de communication avec le serveur.' });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <View style={styles.card}>
      {feedback && (
        <View
          style={[
            styles.feedbackBanner,
            feedback.type === 'error' && styles.feedbackError,
            feedback.type === 'success' && styles.feedbackSuccess,
            feedback.type === 'info' && styles.feedbackInfo,
          ]}
        >
          <Text style={styles.feedbackText}>{feedback.text}</Text>
        </View>
      )}

      {step === 'PHONE' ? (
        <View style={styles.formSection}>
          <View style={styles.tabSelector}>
            <Pressable
              style={[styles.tabBtn, loginType === 'PHONE' && styles.tabBtnActive]}
              onPress={() => {
                setLoginType('PHONE');
                setFeedback(null);
              }}
            >
              <Text style={[styles.tabBtnText, loginType === 'PHONE' && styles.tabBtnTextActive]}>
                Numéro Mobile
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tabBtn, loginType === 'EMAIL' && styles.tabBtnActive]}
              onPress={() => {
                setLoginType('EMAIL');
                setFeedback(null);
              }}
            >
              <Text style={[styles.tabBtnText, loginType === 'EMAIL' && styles.tabBtnTextActive]}>
                E-mail Agence
              </Text>
            </Pressable>
          </View>

          {loginType === 'PHONE' ? (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Numéro de téléphone</Text>
              <View style={styles.phoneInputRow}>
                <View style={styles.prefixBadge}>
                  <Text style={styles.prefixText}>🇨🇮 +225</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  keyboardType="phone-pad"
                  placeholder="07 00 00 00 00"
                  placeholderTextColor="#94A3B8"
                  value={phoneNumber}
                  onChangeText={formatPhoneNumber}
                  maxLength={14}
                  autoFocus
                />
              </View>
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Adresse e-mail professionnelle</Text>
              <TextInput
                style={[styles.textInput, styles.singleInput]}
                keyboardType="email-address"
                placeholder="direction@agence.ci"
                placeholderTextColor="#94A3B8"
                value={emailAddress}
                onChangeText={setEmailAddress}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
            </View>
          )}

          <Pressable
            style={[styles.actionBtn, isPending && styles.btnDisabled]}
            onPress={handleRequestOTP}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.actionBtnText}>Recevoir mon code de connexion →</Text>
            )}
          </Pressable>
        </View>
      ) : (
        <View style={styles.formSection}>
          <Text style={styles.otpHeaderTitle}>Vérification du code</Text>
          <Text style={styles.otpHeaderSub}>
            Saisissez le code à 6 chiffres transmis à {getRawIdentifier()}
          </Text>

          <TextInput
            ref={otpInputRef}
            style={styles.otpInput}
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={handleOtpChange}
            placeholder="000000"
            placeholderTextColor="#CBD5E1"
            textContentType="oneTimeCode"
            autoFocus
          />

          <Pressable
            style={[styles.actionBtn, isPending && styles.btnDisabled]}
            onPress={() => handleVerifyOTP()}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.actionBtnText}>Confirmer et accéder au portail →</Text>
            )}
          </Pressable>

          <View style={styles.otpFooterRow}>
            <Pressable
              onPress={() => {
                setStep('PHONE');
                setOtp('');
                setFeedback(null);
              }}
              style={styles.textBtn}
            >
              <Text style={styles.textBtnLabel}>‹ Modifier le numéro</Text>
            </Pressable>

            <Pressable
              onPress={handleResendOTP}
              disabled={!canResend || isPending}
              style={styles.textBtn}
            >
              <Text style={[styles.textBtnLabel, !canResend && styles.textBtnLabelDisabled]}>
                {canResend ? 'Renvoyer le code' : `Renvoyer (${resendCountdown}s)`}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  formSection: {
    gap: 16,
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#1F2A44',
    fontWeight: '700',
  },
  inputContainer: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  prefixBadge: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#E2E8F0',
    borderRightWidth: 1,
    borderRightColor: '#CBD5E1',
  },
  prefixText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  singleInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  actionBtn: {
    backgroundColor: '#1F2A44',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  otpHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  otpHeaderSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  otpInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 14,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 8,
    color: '#0F172A',
    marginVertical: 8,
  },
  otpFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  textBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  textBtnLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2A44',
  },
  textBtnLabelDisabled: {
    color: '#94A3B8',
  },
  feedbackBanner: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  feedbackError: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  feedbackSuccess: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  feedbackInfo: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
});
