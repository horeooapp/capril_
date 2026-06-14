import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { Mail, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

interface NativeOTPFormProps {
    role: 'TENANT' | 'LANDLORD' | 'ADMIN';
    title: string;
    subtitle: string;
}

export default function NativeOTPForm({ role, title, subtitle }: NativeOTPFormProps) {
    const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    const theme = {
        TENANT: {
            primary: '#10B981', // emerald-500
            bg: '#022c22', // emerald-900
            text: '#fff',
        },
        LANDLORD: {
            primary: '#F59E0B', // amber-500
            bg: '#1e3a8a', // blue-900
            text: '#fff',
        },
        ADMIN: {
            primary: '#C55A11',
            bg: '#0f172a', // slate-900
            text: '#fff',
        }
    }[role];

    // Utilisation de l'URL d'API configurée globalement (gère Prod et Dev)
    const API_URL = require('../../lib/api').API_URL;

    const handleRequestOTP = async () => {
        if (!email) {
            Alert.alert('Erreur', "L'email est requis.");
            return;
        }

        setIsPending(true);
        try {
            const response = await fetch(`${API_URL}/auth/request-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setStep('OTP');
            } else {
                Alert.alert('Erreur', result.error || "Échec de l'envoi du code.");
            }
        } catch (error) {
            Alert.alert('Erreur', "Erreur de connexion au serveur.");
        } finally {
            setIsPending(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length < 6) {
            Alert.alert('Erreur', "Veuillez entrer le code à 6 chiffres.");
            return;
        }

        setIsPending(true);
        try {
            const response = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, role })
            });

            const result = await response.json();
            
            if (response.ok && result.success) {
                 await SecureStore.setItemAsync('userToken', result.token);
                 router.replace('/(tabs)'); // Redirect to main app layout
            } else {
                 Alert.alert('Erreur', result.error || "Code incorrect.");
            }
        } catch (error) {
            Alert.alert('Erreur', "Erreur de connexion au serveur.");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={[styles.container, { backgroundColor: theme.bg }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.card}>
                <View style={styles.header}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>
                </View>

                {step === 'EMAIL' ? (
                    <Animated.View entering={FadeInDown} exiting={FadeOutUp} style={styles.form}>
                        <Text style={styles.label}>IDENTIFIANT EMAIL</Text>
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
                    </Animated.View>
                ) : (
                    <Animated.View entering={FadeInDown} exiting={FadeOutUp} style={styles.form}>
                        <Text style={styles.label}>CODE DE SÉCURITÉ (6 CHIFFRES)</Text>
                        <View style={styles.inputContainer}>
                            <ShieldCheck color={theme.primary} size={20} style={styles.icon} />
                            <TextInput
                                style={[styles.input, styles.otpInput]}
                                placeholder="000000"
                                placeholderTextColor="#6b7280"
                                value={otp}
                                onChangeText={setOtp}
                                keyboardType="number-pad"
                                maxLength={6}
                                editable={!isPending}
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
                                <Text style={styles.buttonText}>VÉRIFIER ET ME CONNECTER</Text>
                            )}
                        </Pressable>

                        <Pressable 
                            style={styles.backButton}
                            onPress={() => setStep('EMAIL')}
                            disabled={isPending}
                        >
                            <ArrowLeft color="#9ca3af" size={16} />
                            <Text style={styles.backButtonText}>Changer d'email</Text>
                        </Pressable>
                    </Animated.View>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    card: {
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        borderRadius: 32,
        padding: 32,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
        textTransform: 'uppercase',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#9ca3af',
        textAlign: 'center',
        lineHeight: 20,
    },
    form: {
        gap: 16,
    },
    label: {
        fontSize: 10,
        fontWeight: '900',
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        paddingHorizontal: 16,
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        paddingVertical: 16,
    },
    otpInput: {
        fontSize: 32,
        letterSpacing: 8,
        textAlign: 'center',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 18,
        borderRadius: 16,
        marginTop: 16,
    },
    buttonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 16,
        paddingVertical: 8,
    },
    backButtonText: {
        color: '#9ca3af',
        fontSize: 12,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
    }
});
