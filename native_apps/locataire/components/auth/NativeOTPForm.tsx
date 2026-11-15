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
import { 
    Mail, 
    Phone, 
    ShieldCheck, 
    ArrowRight, 
    ArrowLeft, 
    CheckCircle2, 
    AlertCircle, 
    Sparkles, 
    Eye, 
    EyeOff, 
    RotateCcw 
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { API_URL, getStoredToken, setStoredToken } from '../../lib/api';
import { registerForPushNotificationsAsync } from '../../lib/notifications';

interface NativeOTPFormProps {
    role: 'TENANT' | 'LANDLORD' | 'ADMIN';
    title: string;
    subtitle: string;
}

export default function NativeOTPForm({ role, title, subtitle }: NativeOTPFormProps) {
    const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
    const [loginType, setLoginType] = useState<'PHONE' | 'EMAIL'>('PHONE');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [emailAddress, setEmailAddress] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtp, setShowOtp] = useState(true); // Codes visibles à la saisie par défaut
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
                    promptMessage: 'Authentifiez-vous pour continuer',
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

    const theme = {
        TENANT: {
            primary: '#10B981',
            accent: '#34D399',
            badgeBg: 'rgba(16, 185, 129, 0.15)',
            borderActive: '#10B981',
        },
        LANDLORD: {
            primary: '#F59E0B',
            accent: '#FBBF24',
            badgeBg: 'rgba(245, 158, 11, 0.15)',
            borderActive: '#F59E0B',
        },
        ADMIN: {
            primary: '#C55A11',
            accent: '#FB923C',
            badgeBg: 'rgba(197, 90, 17, 0.15)',
            borderActive: '#C55A11',
        }
    }[role];

    // Formatter pour le numéro de téléphone ivoirien (ex: 07 07 16 76 16)
    const handlePhoneChange = (text: string) => {
        // Garder uniquement les chiffres
        const cleaned = text.replace(/[^0-9]/g, '');
        if (cleaned.length <= 10) {
            // Formattage 2 par 2
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
            // Si l'utilisateur a saisi 10 chiffres (ex: 0707167616), on préfixe par +225
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
                    ? "Veuillez saisir votre numéro de téléphone ivoirien à 10 chiffres." 
                    : "Veuillez saisir une adresse e-mail valide." 
            });
            return;
        }

        if (loginType === 'PHONE') {
            const digits = phoneNumber.replace(/\s+/g, '');
            if (digits.length < 10) {
                setFeedback({ type: 'error', text: "Le numéro ivoirien doit comporter 10 chiffres (ex: 07 00 00 00 00)." });
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
                const channelMsg = result.channel === 'PHONE' ? 'par SMS / WhatsApp' : 'par e-mail';
                setFeedback({ type: 'success', text: `Code de sécurité envoyé avec succès ${channelMsg} !` });
                setStep('OTP');
                setTimeout(() => {
                    otpInputRef.current?.focus();
                }, 400);
            } else {
                setFeedback({ type: 'error', text: result.error || "Impossible d'envoyer le code de sécurité. Vérifiez votre saisie." });
            }
        } catch (error) {
            clearTimeout(timeoutId);
            setFeedback({ type: 'error', text: "Erreur de connexion au serveur. Vérifiez votre connexion internet." });
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
                text: 'Connexion réseau impossible. Vérifiez votre connexion.'
            });
        } finally {
            setIsPending(false);
        }
    };

    const handleVerifyOTP = async () => {
        setFeedback(null);
        if (!otp || otp.length < 6) {
            setFeedback({ type: 'error', text: "Veuillez saisir l'intégralité du code à 6 chiffres." });
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
                registerForPushNotificationsAsync().catch(() => {});
                router.replace('/(tabs)' as any);
            } else {
                setFeedback({ type: 'error', text: result.error || "Code de sécurité incorrect ou expiré." });
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
                <View style={[styles.titleBadge, { backgroundColor: theme.badgeBg }]}>
                    <ShieldCheck color={theme.accent} size={15} />
                    <Text style={[styles.titleBadgeText, { color: theme.accent }]}>ACCÈS SÉCURISÉ QAPRIL</Text>
                </View>
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
                    {/* SÉLECTEUR TÉLÉPHONE / EMAIL */}
                    <View style={styles.modeTabsContainer}>
                        <Pressable 
                            style={[
                                styles.modeTab, 
                                loginType === 'PHONE' && [styles.modeTabActive, { borderColor: theme.primary }]
                            ]}
                            onPress={() => {
                                setLoginType('PHONE');
                                setFeedback(null);
                            }}
                        >
                            <Phone size={14} color={loginType === 'PHONE' ? '#FFFFFF' : '#94A3B8'} />
                            <Text style={[
                                styles.modeTabText, 
                                loginType === 'PHONE' && styles.modeTabTextActive
                            ]}>
                                Numéro Mobile
                            </Text>
                        </Pressable>

                        <Pressable 
                            style={[
                                styles.modeTab, 
                                loginType === 'EMAIL' && [styles.modeTabActive, { borderColor: theme.primary }]
                            ]}
                            onPress={() => {
                                setLoginType('EMAIL');
                                setFeedback(null);
                            }}
                        >
                            <Mail size={14} color={loginType === 'EMAIL' ? '#FFFFFF' : '#94A3B8'} />
                            <Text style={[
                                styles.modeTabText, 
                                loginType === 'EMAIL' && styles.modeTabTextActive
                            ]}>
                                Adresse E-mail
                            </Text>
                        </Pressable>
                    </View>

                    {/* CHAMP DE SAISIE SUR UNE SEULE LIGNE */}
                    {loginType === 'PHONE' ? (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>NUMÉRO DE TÉLÉPHONE IVOIRIEN</Text>
                            <View style={styles.singleLineRow}>
                                <View style={styles.countryCodeBadge}>
                                    <Text style={styles.flagEmoji}>🇨🇮</Text>
                                    <Text style={styles.countryCodeText}>+225</Text>
                                </View>
                                <TextInput
                                    style={styles.singleLineInputPhone}
                                    placeholder="07 00 00 00 00"
                                    placeholderTextColor="#64748B"
                                    value={phoneNumber}
                                    onChangeText={handlePhoneChange}
                                    keyboardType="phone-pad"
                                    maxLength={14}
                                    editable={!isPending}
                                    numberOfLines={1}
                                    onSubmitEditing={handleRequestOTP}
                                />
                            </View>
                            <Text style={styles.helperText}>
                                Format officiel 10 chiffres (Orange 07, MTN 05, Moov 01)
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>ADRESSE E-MAIL DE CONNEXION</Text>
                            <View style={styles.singleLineRow}>
                                <View style={styles.emailIconBadge}>
                                    <Mail color="#94A3B8" size={18} />
                                </View>
                                <TextInput
                                    style={styles.singleLineInputEmail}
                                    placeholder="nom.prenom@exemple.ci"
                                    placeholderTextColor="#64748B"
                                    value={emailAddress}
                                    onChangeText={setEmailAddress}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!isPending}
                                    numberOfLines={1}
                                    onSubmitEditing={handleRequestOTP}
                                />
                            </View>
                            <Text style={styles.helperText}>
                                Tient aisément sur une ligne sans retour à la ligne
                            </Text>
                        </View>
                    )}

                    {/* BOUTON PRINCIPAL */}
                    <Pressable 
                        style={[styles.button, { backgroundColor: theme.primary, opacity: isPending ? 0.7 : 1 }]}
                        onPress={handleRequestOTP}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.buttonText}>RECEVOIR MON CODE DE SÉCURITÉ</Text>
                                <ArrowRight color="#fff" size={18} />
                            </>
                        )}
                    </Pressable>

                    {/* SÉPARATEUR CONNEXION SOCIALE */}
                    <View style={styles.socialDividerRow}>
                        <View style={styles.socialDividerLine} />
                        <Text style={styles.socialDividerText}>OU CONTINUER AVEC</Text>
                        <View style={styles.socialDividerLine} />
                    </View>

                    {/* BOUTONS SOCIAUX */}
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
                /* ÉTAPE OTP : CODES VISIBLES EN DIRECT À LA SAISIE */
                <Animated.View entering={FadeInDown} exiting={FadeOutUp} style={styles.form}>
                    <View style={styles.otpHeaderRow}>
                        <Text style={styles.label}>CODE DE VÉRIFICATION REÇU</Text>
                        
                        {/* BOUTON POUR BASCULER LA VISIBILITÉ DU CODE (VISIBLE PAR DÉFAUT) */}
                        <TouchableOpacity 
                            onPress={() => setShowOtp(!showOtp)} 
                            style={styles.eyeToggleBtn}
                            activeOpacity={0.7}
                        >
                            {showOtp ? (
                                <>
                                    <Eye size={14} color="#10B981" />
                                    <Text style={[styles.eyeToggleText, { color: '#10B981' }]}>Code visible</Text>
                                </>
                            ) : (
                                <>
                                    <EyeOff size={14} color="#94A3B8" />
                                    <Text style={styles.eyeToggleText}>Code masqué</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* GRILLE VISUELLE DE 6 CASES DE SAISIE */}
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
                                        isCurrent && [styles.otpCellActive, { borderColor: theme.borderActive }],
                                        isFilled && styles.otpCellFilled,
                                    ]}
                                >
                                    <Text style={[
                                        styles.otpCellText,
                                        isFilled && { color: '#FFFFFF' }
                                    ]}>
                                        {isFilled ? (showOtp ? char : '•') : (isCurrent ? '|' : '—')}
                                    </Text>
                                </View>
                            );
                        })}
                    </Pressable>

                    {/* INPUT RÉEL TRANSPARENT LIÉ AU CLAVIER */}
                    <TextInput
                        ref={otpInputRef}
                        style={styles.hiddenOtpInput}
                        value={otp}
                        onChangeText={(txt) => setOtp(txt.replace(/[^0-9]/g, '').slice(0, 6))}
                        keyboardType="number-pad"
                        maxLength={6}
                        editable={!isPending}
                        onSubmitEditing={handleVerifyOTP}
                        autoFocus
                    />

                    {/* BANDEAU DE CONFIRMATION VISUELLE DU CODE */}
                    <View style={styles.codePreviewBanner}>
                        <Text style={styles.codePreviewLabel}>Chiffres saisis :</Text>
                        <Text style={styles.codePreviewDigits}>
                            {otp ? otp.split('').join('  ') : 'En attente de saisie...'}
                        </Text>
                        {otp.length > 0 && (
                            <TouchableOpacity 
                                onPress={() => setOtp('')} 
                                style={styles.codeResetBtn}
                            >
                                <RotateCcw size={12} color="#94A3B8" />
                                <Text style={styles.codeResetText}>Effacer</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* BOUTON DE VALIDATION */}
                    <Pressable 
                        style={[
                            styles.button, 
                            { 
                                backgroundColor: theme.primary, 
                                opacity: isPending || otp.length < 6 ? 0.7 : 1 
                            }
                        ]}
                        onPress={handleVerifyOTP}
                        disabled={isPending || otp.length < 6}
                    >
                        {isPending ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.buttonText}>VALIDER LE CODE ET ENTRER</Text>
                                <ArrowRight color="#fff" size={18} />
                            </>
                        )}
                    </Pressable>

                    {/* RETOUR ARRIÈRE */}
                    <Pressable 
                        style={styles.backButton}
                        onPress={() => {
                            setStep('EMAIL');
                            setFeedback(null);
                        }}
                        disabled={isPending}
                    >
                        <ArrowLeft color="#94A3B8" size={16} />
                        <Text style={styles.backButtonText}>Modifier mes coordonnées</Text>
                    </Pressable>
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(15, 23, 42, 0.88)',
        borderRadius: 24,
        padding: 22,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
        elevation: 8,
    },
    header: {
        alignItems: 'center',
        marginBottom: 18,
    },
    titleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 999,
        marginBottom: 8,
    },
    titleBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '900',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        marginBottom: 6,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 12,
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 17,
        paddingHorizontal: 8,
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
        borderColor: 'rgba(239, 68, 68, 0.35)',
    },
    feedbackSuccess: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.35)',
    },
    feedbackInfo: {
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.35)',
    },
    feedbackText: {
        color: '#F8FAFC',
        fontSize: 12,
        fontWeight: '600',
        flex: 1,
    },
    form: {
        gap: 14,
    },
    modeTabsContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(2, 6, 23, 0.7)',
        borderRadius: 12,
        padding: 3,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        marginBottom: 4,
    },
    modeTab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 9,
        borderRadius: 9,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    modeTabActive: {
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
    },
    modeTabText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94A3B8',
    },
    modeTabTextActive: {
        color: '#FFFFFF',
    },
    inputGroup: {
        gap: 6,
    },
    label: {
        fontSize: 10,
        fontWeight: '800',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginLeft: 2,
    },
    singleLineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(2, 6, 23, 0.8)',
        borderWidth: 1.2,
        borderColor: 'rgba(255, 255, 255, 0.14)',
        borderRadius: 14,
        paddingHorizontal: 8,
        height: 52,
    },
    countryCodeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 9,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        marginRight: 8,
    },
    flagEmoji: {
        fontSize: 14,
    },
    countryCodeText: {
        color: '#F8FAFC',
        fontSize: 13,
        fontWeight: '800',
    },
    singleLineInputPhone: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 1.5,
        paddingVertical: 0,
    },
    emailIconBadge: {
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        padding: 8,
        borderRadius: 9,
        marginRight: 8,
    },
    singleLineInputEmail: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
        paddingVertical: 0,
    },
    helperText: {
        fontSize: 11,
        color: '#64748B',
        marginLeft: 4,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 50,
        borderRadius: 14,
        marginTop: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    socialDividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    socialDividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
    },
    socialDividerText: {
        marginHorizontal: 10,
        fontSize: 9,
        fontWeight: '800',
        color: '#64748B',
        letterSpacing: 0.8,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 44,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
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
        color: '#0F172A',
    },
    socialButtonTextLight: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    otpHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    eyeToggleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    eyeToggleText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#94A3B8',
    },
    otpBoxesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 6,
        marginVertical: 8,
    },
    otpCell: {
        flex: 1,
        height: 54,
        borderRadius: 12,
        backgroundColor: 'rgba(2, 6, 23, 0.75)',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    otpCellActive: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        borderWidth: 2,
    },
    otpCellFilled: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.35)',
    },
    otpCellText: {
        fontSize: 22,
        fontWeight: '900',
        color: '#64748B',
    },
    hiddenOtpInput: {
        position: 'absolute',
        opacity: 0,
        height: 0,
        width: 0,
    },
    codePreviewBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    codePreviewLabel: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '600',
    },
    codePreviewDigits: {
        fontSize: 15,
        fontWeight: '800',
        color: '#10B981',
        letterSpacing: 2,
    },
    codeResetBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    codeResetText: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '600',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 8,
    },
    backButtonText: {
        color: '#94A3B8',
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
    }
});
