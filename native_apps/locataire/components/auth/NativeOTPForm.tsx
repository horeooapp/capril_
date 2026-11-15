import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    Pressable, 
    ActivityIndicator, 
    Platform, 
    StyleSheet, 
    TouchableOpacity 
} from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Notifications from 'expo-notifications';
import { Sparkles } from 'lucide-react-native';
import { API_URL, getStoredToken, setStoredToken } from '../../lib/api';
import { registerForPushNotificationsAsync } from '../../lib/notifications';

interface NativeOTPFormProps {
    role: 'TENANT' | 'LANDLORD' | 'ADMIN';
    title?: string;
    subtitle?: string;
}

export default function NativeOTPForm({ role }: NativeOTPFormProps) {
    const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
    const [loginType, setLoginType] = useState<'PHONE' | 'EMAIL'>('PHONE');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [emailAddress, setEmailAddress] = useState('');
    const [otp, setOtp] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'error' | 'info' | 'success'; text: string } | null>(null);
    
    const otpInputRef = useRef<TextInput>(null);
    const router = useRouter();

    useEffect(() => {
        checkBiometricAuth();
    }, []);

    // ÉCOUTE AUTOMATIQUE DES NOTIFICATIONS ET SMS OTP EN PREMIER PLAN
    useEffect(() => {
        if (step !== 'OTP') return;

        let notificationSub: Notifications.Subscription | null = null;
        try {
            notificationSub = Notifications.addNotificationReceivedListener(notification => {
                const title = notification.request.content.title || '';
                const body = notification.request.content.body || '';
                const fullText = `${title} ${body}`;
                const match = fullText.match(/\b\d{6}\b/) || fullText.match(/\d{6}/);
                if (match && match[0]) {
                    console.log('[OTP AUTO-RETRIEVAL] Code intercepté depuis notification:', match[0]);
                    handleOtpChange(match[0]);
                }
            });
        } catch (e) {
            console.log('[OTP] Notifications listener non disponible:', e);
        }

        return () => {
            notificationSub?.remove();
        };
    }, [step, isPending]);

    const checkBiometricAuth = async () => {
        try {
            if (Platform.OS === 'web') return;
            const token = await getStoredToken();
            if (!token) return;

            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            if (hasHardware && isEnrolled) {
                const result = await LocalAuthentication.authenticateAsync({
                    promptMessage: 'Connexion à votre espace QAPRIL',
                    fallbackLabel: 'Utiliser le code',
                });

                if (result.success) {
                    router.replace('/(tabs)' as any);
                }
            }
        } catch (e) {
            console.warn("Erreur biométrique", e);
        }
    };

    const handlePhoneChange = (text: string) => {
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
                    ? "Veuillez saisir votre numéro à 10 chiffres." 
                    : "Veuillez saisir une adresse e-mail valide." 
            });
            return;
        }

        if (loginType === 'PHONE') {
            const digits = phoneNumber.replace(/\s+/g, '');
            if (digits.length < 10) {
                setFeedback({ type: 'error', text: "Le numéro ivoirien doit comporter 10 chiffres." });
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
                    phone: identifier
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            const result = await response.json();

            if (response.ok && result.success) {
                setOtp('');
                setStep('OTP');
                setTimeout(() => {
                    otpInputRef.current?.focus();
                }, 300);
            } else {
                setFeedback({ type: 'error', text: result.error || "Impossible d'envoyer le code. Vérifiez votre saisie." });
            }
        } catch (error) {
            clearTimeout(timeoutId);
            setFeedback({ type: 'error', text: "Erreur de connexion. Vérifiez votre accès internet." });
        } finally {
            setIsPending(false);
        }
    };

    const handleSocialAuth = async (provider: 'google' | 'facebook') => {
        const trimmedEmail = emailAddress.trim().toLowerCase();
        if (!trimmedEmail || !trimmedEmail.includes('@')) {
            setFeedback({
                type: 'info',
                text: `Renseignez votre e-mail dans l'onglet E-mail pour continuer avec ${provider === 'google' ? 'Google' : 'Facebook'}.`
            });
            setLoginType('EMAIL');
            return;
        }

        setIsPending(true);
        setFeedback(null);
        try {
            const response = await fetch(`${API_URL}/auth/oauth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider,
                    email: trimmedEmail,
                    role: role || 'TENANT',
                    name: trimmedEmail.split('@')[0],
                }),
            });

            const result = await response.json();

            if (response.ok && result.success && result.token) {
                await setStoredToken(result.token);
                registerForPushNotificationsAsync().catch(console.error);
                router.replace('/(tabs)' as any);
            } else {
                setFeedback({
                    type: 'error',
                    text: result.error || `Erreur d'authentification ${provider}`
                });
            }
        } catch (err: any) {
            setFeedback({
                type: 'error',
                text: 'Connexion réseau impossible.'
            });
        } finally {
            setIsPending(false);
        }
    };

    // RÉCEPTION ET AUTO-SOUMISSION INSTANTANÉE DU CODE (0-TAP)
    const handleOtpChange = (txt: string) => {
        if (!txt) {
            setOtp('');
            return;
        }

        // 1. Chercher d'abord 6 chiffres consécutifs dans le texte (format SMS autofill ou message complet)
        const match = txt.match(/\b\d{6}\b/) || txt.match(/\d{6}/);
        if (match) {
            const foundOtp = match[0];
            setOtp(foundOtp);
            handleVerifyOTP(foundOtp);
            return;
        }

        // 2. Filtrer tous les chiffres saisis
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
            setFeedback({ type: 'error', text: "Saisissez les 6 chiffres du code." });
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
                body: JSON.stringify({ identifier, email: identifier, phone: identifier, otp: codeToVerify, role }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            const result = await response.json();
            
            if (response.ok && result.success && result.token) {
                await setStoredToken(result.token);
                registerForPushNotificationsAsync().catch(() => {});
                router.replace('/(tabs)' as any);
            } else {
                setFeedback({ type: 'error', text: result.error || "Code incorrect ou expiré." });
            }
        } catch (error) {
            clearTimeout(timeoutId);
            setFeedback({ type: 'error', text: "Erreur de communication avec le serveur." });
        } finally {
            setIsPending(false);
        }
    };

    return (
        <View style={styles.card}>
            {/* RETOUR VISUEL / ERREUR MINIMALISTE */}
            {feedback && (
                <View style={[
                    styles.feedbackBanner,
                    feedback.type === 'error' && styles.feedbackError,
                    feedback.type === 'success' && styles.feedbackSuccess,
                    feedback.type === 'info' && styles.feedbackInfo,
                ]}>
                    <Text style={styles.feedbackText}>{feedback.text}</Text>
                </View>
            )}

            {step === 'EMAIL' ? (
                <Animated.View entering={FadeInDown.duration(200)} exiting={FadeOutUp.duration(150)}>
                    {/* SÉLECTEUR DE CANAL SEGMENTÉ (STYLE APPLE) */}
                    <View style={styles.segmentedControl}>
                        <Pressable 
                            style={[
                                styles.segment, 
                                loginType === 'PHONE' && styles.segmentActive
                            ]}
                            onPress={() => {
                                setLoginType('PHONE');
                                setFeedback(null);
                            }}
                        >
                            <Text style={[
                                styles.segmentText, 
                                loginType === 'PHONE' && styles.segmentTextActive
                            ]}>
                                Téléphone
                            </Text>
                        </Pressable>

                        <Pressable 
                            style={[
                                styles.segment, 
                                loginType === 'EMAIL' && styles.segmentActive
                            ]}
                            onPress={() => {
                                setLoginType('EMAIL');
                                setFeedback(null);
                            }}
                        >
                            <Text style={[
                                styles.segmentText, 
                                loginType === 'EMAIL' && styles.segmentTextActive
                            ]}>
                                E-mail
                            </Text>
                        </Pressable>
                    </View>

                    {/* CHAMP DE SAISIE MONO-LIGNE ÉPURÉ */}
                    {loginType === 'PHONE' ? (
                        <View style={[styles.inputRow, isFocused && styles.inputRowFocused]}>
                            <Text style={styles.countryPrefix}>🇨🇮 +225</Text>
                            <View style={styles.inputSeparator} />
                            <TextInput
                                style={styles.input}
                                placeholder="07 00 00 00 00"
                                placeholderTextColor="#94A3B8"
                                value={phoneNumber}
                                onChangeText={handlePhoneChange}
                                keyboardType="phone-pad"
                                maxLength={14}
                                editable={!isPending}
                                numberOfLines={1}
                                onSubmitEditing={handleRequestOTP}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                            />
                        </View>
                    ) : (
                        <View style={[styles.inputRow, isFocused && styles.inputRowFocused]}>
                            <TextInput
                                style={styles.input}
                                placeholder="nom@exemple.ci"
                                placeholderTextColor="#94A3B8"
                                value={emailAddress}
                                onChangeText={setEmailAddress}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!isPending}
                                numberOfLines={1}
                                onSubmitEditing={handleRequestOTP}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                            />
                        </View>
                    )}

                    {/* BOUTON CONTINUER (STYLE BOUTON PRINCIPAL ÉMERAUDE VIBRANT) */}
                    <Pressable 
                        style={[styles.primaryButton, isPending && styles.buttonDisabled]}
                        onPress={handleRequestOTP}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.primaryButtonText}>Continuer</Text>
                        )}
                    </Pressable>

                    {/* LIGNE DE SÉPARATION DISCRÈTE */}
                    <View style={styles.dividerRow}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>ou</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* BOUTONS SOCIAUX : GOOGLE & FACEBOOK */}
                    <View style={styles.socialButtonsColumn}>
                        <Pressable
                            style={styles.googleButton}
                            onPress={() => handleSocialAuth('google')}
                            disabled={isPending}
                        >
                            <Text style={styles.googleIconText}>G</Text>
                            <Text style={styles.googleButtonText}>Continuer avec Google</Text>
                        </Pressable>

                        <Pressable
                            style={styles.facebookButton}
                            onPress={() => handleSocialAuth('facebook')}
                            disabled={isPending}
                        >
                            <Text style={styles.facebookIconText}>f</Text>
                            <Text style={styles.facebookButtonText}>Continuer avec Facebook</Text>
                        </Pressable>
                    </View>
                </Animated.View>
            ) : (
                /* ÉTAPE OTP : STYLE TWO-FACTOR AUTHENTICATION APPLE AVEC AUTOFILL TOTAL */
                <Animated.View entering={FadeInDown.duration(200)} exiting={FadeOutUp.duration(150)}>
                    <View style={styles.otpHeader}>
                        <Text style={styles.otpTitle}>Code de vérification</Text>
                        <Text style={styles.otpSubtitle}>
                            Saisi pour le {loginType === 'PHONE' ? phoneNumber || getRawIdentifier() : emailAddress}
                        </Text>
                    </View>

                    {/* CONTENEUR DES 6 CASES AVEC INPUT NATIVE DE RECOUVREMENT COMPLET OPAQUE */}
                    <View style={styles.otpWrapper}>
                        <View style={styles.otpBoxesRow} pointerEvents="none">
                            {[0, 1, 2, 3, 4, 5].map((index) => {
                                const char = otp[index] || '';
                                const isCurrent = otp.length === index;
                                const isFilled = Boolean(char);

                                return (
                                    <View 
                                        key={index} 
                                        style={[
                                            styles.otpCell,
                                            isCurrent && styles.otpCellActive,
                                            isFilled && styles.otpCellFilled,
                                        ]}
                                    >
                                        <Text style={styles.otpCellText}>
                                            {char || (isCurrent ? '|' : '·')}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>

                        {/* INPUT NATIVE COUVRANT TOUTE LA SURFACE (OPACITY: 1 POUR ÉVITER LES BLOCAGES ANDROID AUTOFILL) */}
                        <TextInput
                            ref={otpInputRef}
                            style={styles.realOtpInput}
                            value={otp}
                            onChangeText={handleOtpChange}
                            keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
                            textContentType="oneTimeCode"
                            autoComplete="sms-otp"
                            importantForAutofill="yes"
                            maxLength={100}
                            editable={!isPending}
                            autoFocus={true}
                            caretHidden={true}
                            cursorColor="transparent"
                            selectionColor="transparent"
                            selectTextOnFocus={true}
                        />
                    </View>

                    {/* PASTILLE D'INDICATION INTERACTIVE DE RÉCUPÉRATION */}
                    <TouchableOpacity 
                        style={styles.autoDetectPill}
                        onPress={() => otpInputRef.current?.focus()}
                        activeOpacity={0.8}
                    >
                        <Sparkles size={13} color="#059669" />
                        <Text style={styles.autoDetectPillText}>
                            {otp.length === 6 ? 'Code récupéré ! Validation...' : 'Récupération automatique du code activée'}
                        </Text>
                    </TouchableOpacity>

                    {/* BOUTON DE VALIDATION (OU AUTOMATIQUE À RÉCEPTION) */}
                    <Pressable 
                        style={[
                            styles.primaryButton, 
                            (isPending || otp.length < 6) && styles.buttonDisabled,
                            { marginTop: 16 }
                        ]}
                        onPress={() => handleVerifyOTP()}
                        disabled={isPending || otp.length < 6}
                    >
                        {isPending ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.primaryButtonText}>Valider</Text>
                        )}
                    </Pressable>

                    {/* MODIFIER LES COORDONNÉES */}
                    <TouchableOpacity 
                        style={styles.backRow}
                        onPress={() => {
                            setStep('EMAIL');
                            setFeedback(null);
                        }}
                        disabled={isPending}
                    >
                        <Text style={styles.backLinkMuted}>Modifier les coordonnées</Text>
                    </TouchableOpacity>
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 16,
        elevation: 4,
    },
    segmentedControl: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 3,
        marginBottom: 18,
    },
    segment: {
        flex: 1,
        paddingVertical: 9,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 9,
    },
    segmentActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    segmentText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#64748B',
    },
    segmentTextActive: {
        color: '#0F172A',
        fontWeight: '700',
    },
    inputRow: {
        height: 52,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        marginBottom: 16,
    },
    inputRowFocused: {
        borderColor: '#10B981',
        backgroundColor: '#FFFFFF',
    },
    countryPrefix: {
        fontSize: 15,
        color: '#334155',
        fontWeight: '600',
    },
    inputSeparator: {
        width: 1,
        height: 18,
        backgroundColor: '#CBD5E1',
        marginHorizontal: 12,
    },
    input: {
        flex: 1,
        height: '100%',
        color: '#0F172A',
        fontSize: 16,
        fontWeight: '500',
    },
    primaryButton: {
        height: 50,
        backgroundColor: '#10B981',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 2,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: -0.2,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 18,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E2E8F0',
    },
    dividerText: {
        marginHorizontal: 12,
        color: '#94A3B8',
        fontSize: 12,
        fontWeight: '500',
    },
    socialButtonsColumn: {
        gap: 10,
    },
    googleButton: {
        height: 48,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    googleIconText: {
        color: '#EA4335',
        fontSize: 17,
        fontWeight: '800',
    },
    googleButtonText: {
        color: '#1E293B',
        fontSize: 15,
        fontWeight: '600',
    },
    facebookButton: {
        height: 48,
        backgroundColor: '#1877F2',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    facebookIconText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '900',
    },
    facebookButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    otpHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    otpTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 4,
    },
    otpSubtitle: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
    },
    otpWrapper: {
        position: 'relative',
        width: '100%',
        height: 56,
        marginBottom: 10,
    },
    otpBoxesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
    },
    otpCell: {
        width: 48,
        height: 54,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    otpCellActive: {
        borderColor: '#10B981',
        backgroundColor: '#FFFFFF',
    },
    otpCellFilled: {
        borderColor: '#94A3B8',
        backgroundColor: '#FFFFFF',
    },
    otpCellText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#0F172A',
    },
    realOtpInput: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: 56,
        opacity: 1,
        backgroundColor: 'transparent',
        color: 'transparent',
        zIndex: 10,
    },
    autoDetectPill: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 999,
        backgroundColor: '#ECFDF5',
        alignSelf: 'center',
        marginTop: 4,
    },
    autoDetectPillText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#059669',
    },
    backRow: {
        marginTop: 18,
        alignItems: 'center',
        paddingVertical: 8,
    },
    backLinkMuted: {
        color: '#64748B',
        fontSize: 14,
        fontWeight: '500',
    },
    feedbackBanner: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        marginBottom: 16,
    },
    feedbackError: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    feedbackSuccess: {
        backgroundColor: '#F0FDF4',
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    feedbackInfo: {
        backgroundColor: '#EFF6FF',
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    feedbackText: {
        color: '#1E293B',
        fontSize: 13,
        textAlign: 'center',
        fontWeight: '500',
    },
});
