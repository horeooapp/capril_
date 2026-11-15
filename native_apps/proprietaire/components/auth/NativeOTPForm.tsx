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
import { API_URL, getStoredToken, setStoredToken, setStoredProfile, UserProfileRole } from '../../lib/api';
import { registerForPushNotificationsAsync } from '../../lib/notifications';

interface NativeOTPFormProps {
    role: 'TENANT' | 'LANDLORD' | 'ADMIN';
    title?: string;
    subtitle?: string;
    profile?: UserProfileRole;
}

export default function NativeOTPForm({ role, profile = 'proprietaire' }: NativeOTPFormProps) {
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
                    router.replace({ pathname: '/(tabs)', params: profile ? { profile } : undefined } as any);
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
                }, 400);
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
                text: "Renseignez votre e-mail dans l'onglet E-mail pour continuer avec Google."
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
                    role: role || 'LANDLORD',
                    name: trimmedEmail.split('@')[0],
                }),
            });

            const result = await response.json();

            if (response.ok && result.success && result.token) {
                await setStoredToken(result.token);
                if (profile) await setStoredProfile(profile);
                registerForPushNotificationsAsync().catch(console.error);
                router.replace({ pathname: '/(tabs)', params: profile ? { profile } : undefined } as any);
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

    const handleVerifyOTP = async () => {
        setFeedback(null);
        if (!otp || otp.length < 6) {
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
                body: JSON.stringify({ identifier, email: identifier, phone: identifier, otp, role }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            const result = await response.json();
            
            if (response.ok && result.success && result.token) {
                await setStoredToken(result.token);
                if (profile) await setStoredProfile(profile);
                registerForPushNotificationsAsync().catch(() => {});
                router.replace({ pathname: '/(tabs)', params: profile ? { profile } : undefined } as any);
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
        <View style={styles.container}>
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
                                placeholderTextColor="#636366"
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
                                placeholderTextColor="#636366"
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

                    {/* BOUTON CONTINUER (STYLE BOUTON PRINCIPAL APPLE) */}
                    <Pressable 
                        style={[styles.primaryButton, isPending && styles.buttonDisabled]}
                        onPress={handleRequestOTP}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <ActivityIndicator color="#000000" />
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

                    {/* AUTHENTIFICATION GOOGLE ÉPURÉE */}
                    <Pressable
                        style={styles.socialButton}
                        onPress={() => handleSocialAuth('google')}
                        disabled={isPending}
                    >
                        <Text style={styles.socialGoogleIcon}>G</Text>
                        <Text style={styles.socialButtonText}>Continuer avec Google</Text>
                    </Pressable>
                </Animated.View>
            ) : (
                /* ÉTAPE OTP : STYLE TWO-FACTOR AUTHENTICATION APPLE */
                <Animated.View entering={FadeInDown.duration(200)} exiting={FadeOutUp.duration(150)}>
                    <View style={styles.otpHeader}>
                        <Text style={styles.otpTitle}>Code de vérification</Text>
                        <Text style={styles.otpSubtitle}>
                            Saisi pour le {loginType === 'PHONE' ? phoneNumber || getRawIdentifier() : emailAddress}
                        </Text>
                    </View>

                    {/* 6 CASES NUMÉRIQUES DISCRÈTES ET VISIBLES */}
                    <Pressable 
                        style={styles.otpBoxesRow}
                        onPress={() => otpInputRef.current?.focus()}
                    >
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
                                        {char || (isCurrent ? '|' : '')}
                                    </Text>
                                </View>
                            );
                        })}
                    </Pressable>

                    {/* INPUT RÉEL TRANSPARENT */}
                    <TextInput
                        ref={otpInputRef}
                        style={styles.hiddenInput}
                        value={otp}
                        onChangeText={(txt) => setOtp(txt.replace(/[^0-9]/g, '').slice(0, 6))}
                        keyboardType="number-pad"
                        maxLength={6}
                        editable={!isPending}
                        onSubmitEditing={handleVerifyOTP}
                        autoFocus
                    />

                    {/* BOUTON DE VALIDATION */}
                    <Pressable 
                        style={[
                            styles.primaryButton, 
                            (isPending || otp.length < 6) && styles.buttonDisabled,
                            { marginTop: 24 }
                        ]}
                        onPress={handleVerifyOTP}
                        disabled={isPending || otp.length < 6}
                    >
                        {isPending ? (
                            <ActivityIndicator color="#000000" />
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
    container: {
        width: '100%',
    },
    segmentedControl: {
        flexDirection: 'row',
        backgroundColor: '#1C1C1E',
        borderRadius: 10,
        padding: 3,
        marginBottom: 20,
    },
    segment: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 7,
    },
    segmentActive: {
        backgroundColor: '#2C2C2E',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        shadowRadius: 2,
        elevation: 2,
    },
    segmentText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#8E8E93',
    },
    segmentTextActive: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    inputRow: {
        height: 52,
        backgroundColor: '#1C1C1E',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2C2C2E',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        marginBottom: 16,
    },
    inputRowFocused: {
        borderColor: '#FFFFFF',
    },
    countryPrefix: {
        fontSize: 15,
        color: '#8E8E93',
        fontWeight: '500',
    },
    inputSeparator: {
        width: 1,
        height: 18,
        backgroundColor: '#2C2C2E',
        marginHorizontal: 12,
    },
    input: {
        flex: 1,
        height: '100%',
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '400',
    },
    primaryButton: {
        height: 50,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonDisabled: {
        opacity: 0.4,
    },
    primaryButtonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: -0.2,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#1C1C1E',
    },
    dividerText: {
        marginHorizontal: 12,
        color: '#636366',
        fontSize: 12,
    },
    socialButton: {
        height: 48,
        backgroundColor: '#1C1C1E',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2C2C2E',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    socialGoogleIcon: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    socialButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '500',
    },
    otpHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    otpTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 6,
    },
    otpSubtitle: {
        fontSize: 14,
        color: '#8E8E93',
        textAlign: 'center',
    },
    otpBoxesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    otpCell: {
        width: 48,
        height: 54,
        borderRadius: 10,
        backgroundColor: '#1C1C1E',
        borderWidth: 1,
        borderColor: '#2C2C2E',
        alignItems: 'center',
        justifyContent: 'center',
    },
    otpCellActive: {
        borderColor: '#FFFFFF',
    },
    otpCellFilled: {
        borderColor: '#3A3A3C',
    },
    otpCellText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    hiddenInput: {
        position: 'absolute',
        width: 1,
        height: 1,
        opacity: 0.01,
    },
    backRow: {
        marginTop: 20,
        alignItems: 'center',
        paddingVertical: 8,
    },
    backLinkMuted: {
        color: '#8E8E93',
        fontSize: 14,
        fontWeight: '400',
    },
    feedbackBanner: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        marginBottom: 16,
    },
    feedbackError: {
        backgroundColor: 'rgba(255, 69, 58, 0.15)',
    },
    feedbackSuccess: {
        backgroundColor: 'rgba(48, 209, 88, 0.15)',
    },
    feedbackInfo: {
        backgroundColor: 'rgba(10, 132, 255, 0.15)',
    },
    feedbackText: {
        color: '#FFFFFF',
        fontSize: 13,
        textAlign: 'center',
    },
});
