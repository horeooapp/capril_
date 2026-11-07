import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { Mail, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { API_URL, getStoredToken, setStoredToken, setStoredProfile, UserProfileRole } from '../../lib/api';
import { registerForPushNotificationsAsync } from '../../lib/notifications';

interface NativeOTPFormProps {
    role: 'TENANT' | 'LANDLORD' | 'ADMIN';
    title: string;
    subtitle: string;
    profile?: UserProfileRole;
}

export default function NativeOTPForm({ role, title, subtitle, profile = 'proprietaire' }: NativeOTPFormProps) {
    const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isPending, setIsPending] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'error' | 'info' | 'success'; text: string } | null>(null);
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
                    promptMessage: 'Authentifiez-vous pour continuer',
                    fallbackLabel: 'Utiliser le mot de passe',
                });

                if (result.success) {
                    if (profile) await setStoredProfile(profile);
                    router.replace({ pathname: '/(tabs)', params: profile ? { profile } : undefined } as any);
                }
            }
        } catch (e) {
            console.warn("Erreur biométrique", e);
        }
    };

    const isAgence = profile === 'agence';
    const theme = isAgence ? {
        primary: '#3B82F6',
        bg: 'rgba(15, 23, 42, 0.85)',
        text: '#fff',
        accent: '#60A5FA',
    } : {
        primary: '#10B981',
        bg: 'rgba(6, 31, 23, 0.85)',
        text: '#fff',
        accent: '#34D399',
    };

    const handleRequestOTP = async () => {
        setFeedback(null);
        const trimmedEmail = email.trim();
        
        if (!trimmedEmail) {
            setFeedback({ type: 'error', text: "Veuillez saisir votre adresse email ou identifiant." });
            return;
        }

        setIsPending(true);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        try {
            const response = await fetch(`${API_URL}/auth/request-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: trimmedEmail }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            const result = await response.json();

            if (response.ok && result.success) {
                setOtp('');
                setFeedback({ type: 'success', text: "Code de sécurité envoyé par e-mail !" });
                setStep('OTP');
            } else {
                setFeedback({ type: 'error', text: result.error || "Impossible d'envoyer le code de sécurité. Vérifiez votre adresse e-mail." });
            }
        } catch (error) {
            clearTimeout(timeoutId);
            setFeedback({ type: 'error', text: "Erreur de connexion au serveur. Vérifiez votre connexion internet." });
        } finally {
            setIsPending(false);
        }
    };

    
    const handleSocialAuth = async (provider: 'google' | 'facebook') => {
        const trimmedEmail = email.trim().toLowerCase();
        if (!trimmedEmail) {
            setFeedback({
                type: 'info',
                text: `Veuillez renseigner votre adresse e-mail ci-dessus puis appuyez sur Continuer avec ${provider === 'google' ? 'Google' : 'Facebook'}.`
            });
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
                    role: role || (profile === 'proprietaire' ? 'LANDLORD' : 'TENANT'),
                    name: trimmedEmail.split('@')[0],
                }),
            });

            const result = await response.json();

            if (response.ok && result.success && result.token) {
                if (profile) {
                    await setStoredProfile(profile);
                }
                await setStoredToken(result.token);
                registerForPushNotificationsAsync().catch(console.error);
                router.replace('/(tabs)');
            } else {
                setFeedback({
                    type: 'error',
                    text: result.error || `Erreur d'authentification sociale ${provider}`
                });
            }
        } catch (err: any) {
            setFeedback({
                type: 'error',
                text: 'Connexion réseau impossible. Vérifiez votre connexion.'
            });
        } finally {
            setIsPending(false);
        }
    };

    const handleVerifyOTP = async () => {
        setFeedback(null);
        if (!otp || otp.length < 6) {
            setFeedback({ type: 'error', text: "Veuillez entrer le code à 6 chiffres reçu." });
            return;
        }

        setIsPending(true);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        try {
            const response = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), otp, role }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            const result = await response.json();
            
            if (response.ok && result.success && result.token) {
                if (profile) {
                    await setStoredProfile(profile);
                }
                await setStoredToken(result.token);
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
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
            </View>

                {feedback && (
                    <View style={[
                        styles.feedbackBox,
                        feedback.type === 'error' && styles.feedbackError,
                        feedback.type === 'success' && styles.feedbackSuccess,
                        feedback.type === 'info' && styles.feedbackInfo,
                    ]}>
                        {feedback.type === 'error' ? (
                            <AlertCircle color="#F87171" size={16} />
                        ) : feedback.type === 'success' ? (
                            <CheckCircle2 color="#34D399" size={16} />
                        ) : (
                            <Sparkles color="#FBBF24" size={16} />
                        )}
                        <Text style={styles.feedbackText}>{feedback.text}</Text>
                    </View>
                )}

                {step === 'EMAIL' ? (
                    <Animated.View entering={FadeInDown} exiting={FadeOutUp} style={styles.form}>
                        <Text style={styles.label}>IDENTIFIANT EMAIL OU TÉLÉPHONE</Text>
                        <View style={styles.inputContainer}>
                            <Mail color="#9ca3af" size={20} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="votre@email.com"
                                placeholderTextColor="#6b7280"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!isPending}
                                onSubmitEditing={handleRequestOTP}
                            />
                        </View>

                        <Pressable 
                            style={[styles.button, { backgroundColor: theme.primary, opacity: isPending ? 0.7 : 1 }]}
                            onPress={handleRequestOTP}
                            disabled={isPending}
                        >
                            {isPending ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Text style={styles.buttonText}>RECEVOIR MON CODE</Text>
                                    <ArrowRight color="#fff" size={20} />
                                </>
                            )}
                        </Pressable>

                        {/* SÉPARATEUR CONNEXION SOCIALE */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 14 }}>
                            <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
                            <Text style={{ marginHorizontal: 10, fontSize: 10, fontWeight: '700', color: '#9CA3AF', letterSpacing: 0.5 }}>
                                OU CONTINUER AVEC
                            </Text>
                            <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
                        </View>

                        {/* BOUTONS SOCIAUX GOOGLE / APPLE / FACEBOOK */}
                        <View style={{ gap: 8 }}>
                            <Pressable
                                style={styles.socialButton}
                                onPress={() => handleSocialAuth('google')}
                                disabled={isPending}
                            >
                                <Text style={styles.socialGoogleIcon}>G</Text>
                                <Text style={styles.socialButtonTextDark}>Continuer avec Google</Text>
                            </Pressable>

                            <Pressable
                                style={[styles.socialButton, { backgroundColor: '#1877F2', borderColor: '#1877F2' }]}
                                onPress={() => handleSocialAuth('facebook')}
                                disabled={isPending}
                            >
                                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '900', marginRight: 8 }}>f</Text>
                                <Text style={styles.socialButtonTextLight}>Continuer avec Facebook</Text>
                            </Pressable>
                        </View>
                    </Animated.View>
                ) : (
                    <Animated.View entering={FadeInDown} exiting={FadeOutUp} style={styles.form}>
                        <Text style={styles.label}>CODE DE SÉCURITÉ REÇU PAR EMAIL</Text>
                        <View style={styles.inputContainer}>
                            <ShieldCheck color={theme.primary} size={20} style={styles.icon} />
                            <TextInput
                                style={[styles.input, styles.otpInput]}
                                placeholder="Code à 6 chiffres"
                                placeholderTextColor="#6b7280"
                                value={otp}
                                onChangeText={setOtp}
                                keyboardType="number-pad"
                                maxLength={6}
                                editable={!isPending}
                                onSubmitEditing={handleVerifyOTP}
                            />
                        </View>

                        <Pressable 
                            style={[styles.button, { backgroundColor: theme.primary, opacity: isPending ? 0.7 : 1 }]}
                            onPress={handleVerifyOTP}
                            disabled={isPending}
                        >
                            {isPending ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>VALIDER ET ENTRER DANS L'APPLICATION</Text>
                            )}
                        </Pressable>

                        <Pressable 
                            style={styles.backButton}
                            onPress={() => {
                                setStep('EMAIL');
                                setFeedback(null);
                            }}
                            disabled={isPending}
                        >
                            <ArrowLeft color="#9ca3af" size={16} />
                            <Text style={styles.backButtonText}>Modifier l'email</Text>
                        </Pressable>
                    </Animated.View>
                )}
        </View>
    );
}

const styles = StyleSheet.create({
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 44,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    socialGoogleIcon: {
        fontSize: 16,
        fontWeight: '900',
        color: '#4285F4',
        marginRight: 8,
    },
    socialButtonTextDark: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1F2937',
    },
    socialButtonTextLight: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    card: {
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        borderRadius: 28,
        padding: 28,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
        textTransform: 'uppercase',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 13,
        color: '#9ca3af',
        textAlign: 'center',
        lineHeight: 18,
    },
    feedbackBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        marginBottom: 16,
    },
    feedbackError: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    feedbackSuccess: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    feedbackInfo: {
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    feedbackText: {
        color: '#F3F4F6',
        fontSize: 12,
        fontWeight: '600',
        flex: 1,
    },
    form: {
        gap: 14,
    },
    label: {
        fontSize: 10,
        fontWeight: '900',
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        borderRadius: 14,
        paddingHorizontal: 14,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
        paddingVertical: 14,
    },
    otpInput: {
        fontSize: 28,
        letterSpacing: 6,
        textAlign: 'center',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 14,
        marginTop: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    quickAccessBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        marginTop: 4,
    },
    quickAccessText: {
        fontSize: 11,
        fontWeight: '700',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 8,
        paddingVertical: 8,
    },
    backButtonText: {
        color: '#9ca3af',
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
    }
});
