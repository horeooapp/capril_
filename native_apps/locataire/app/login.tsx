import React from 'react';
import { 
    View, 
    Image, 
    StyleSheet, 
    StatusBar, 
    Text, 
    ScrollView, 
    KeyboardAvoidingView, 
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Building2, ShieldCheck, KeyRound, Sparkles, FileText, CheckCircle2 } from 'lucide-react-native';
import NativeOTPForm from '../components/auth/NativeOTPForm';

export default function LoginScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.content}>
                            
                            {/* BOUTON RETOUR PRÉSENTATION */}
                            <Pressable
                                onPress={() => router.replace('/onboarding' as any)}
                                style={styles.backPill}
                            >
                                <Text style={styles.backPillText}>← Voir la présentation</Text>
                            </Pressable>

                            {/* BANNIÈRE VISUELLE ET ILLUSTRÉE (HERO) */}
                            <LinearGradient
                                colors={['#1E293B', '#0F172A']}
                                style={styles.heroCard}
                            >
                                <View style={styles.heroTopRow}>
                                    <View style={styles.logoWrap}>
                                        <Image 
                                            source={{ uri: 'https://www.qapril.net/logo.png' }} 
                                            style={styles.logo}
                                            resizeMode="contain"
                                        />
                                    </View>
                                    <View style={styles.certifiedBadge}>
                                        <ShieldCheck size={13} color="#10B981" />
                                        <Text style={styles.certifiedBadgeText}>CERTIFIÉ QAPRIL</Text>
                                    </View>
                                </View>

                                {/* COMPOSITION ILLUSTRÉE CENTRALE */}
                                <View style={styles.illustrationComposition}>
                                    <View style={styles.illustrIconBadgeLeft}>
                                        <KeyRound size={20} color="#34D399" />
                                    </View>
                                    <View style={styles.illustrMainEmblem}>
                                        <Building2 size={36} color="#FFFFFF" />
                                    </View>
                                    <View style={styles.illustrIconBadgeRight}>
                                        <FileText size={20} color="#60A5FA" />
                                    </View>
                                </View>

                                <Text style={styles.heroHeadline}>Espace Locataire Intelligent</Text>
                                <Text style={styles.heroSubline}>
                                    Accédez en direct à votre bail électronique, vos quittances horodatées et votre passeport locatif.
                                </Text>

                                {/* MICRO-CHIPS DE FONCTIONNALITÉS */}
                                <View style={styles.featureChipsRow}>
                                    <View style={styles.chip}>
                                        <CheckCircle2 size={11} color="#10B981" />
                                        <Text style={styles.chipText}>Quittances</Text>
                                    </View>
                                    <View style={styles.chip}>
                                        <CheckCircle2 size={11} color="#10B981" />
                                        <Text style={styles.chipText}>Passeport</Text>
                                    </View>
                                    <View style={styles.chip}>
                                        <CheckCircle2 size={11} color="#10B981" />
                                        <Text style={styles.chipText}>Caution CDC</Text>
                                    </View>
                                </View>
                            </LinearGradient>

                            {/* FORMULAIRE AUTHENTIFICATION */}
                            <NativeOTPForm 
                                role="TENANT" 
                                title="CONNEXION SÉCURISÉE" 
                                subtitle="Saisissez votre numéro ivoirien ou votre adresse email pour recevoir votre code à usage unique."
                            />
                            
                        </View>
                    </TouchableWithoutFeedback>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#090D16',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 18,
    },
    content: {
        width: '100%',
        paddingHorizontal: 18,
    },
    backPill: {
        alignSelf: 'flex-start',
        marginBottom: 14,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.14)',
    },
    backPillText: {
        color: '#E2E8F0',
        fontSize: 11,
        fontWeight: '700',
    },
    heroCard: {
        borderRadius: 22,
        padding: 18,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        marginBottom: 16,
        alignItems: 'center',
    },
    heroTopRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    logoWrap: {
        height: 38,
        justifyContent: 'center',
    },
    logo: {
        width: 120,
        height: 36,
        tintColor: '#FFFFFF',
    },
    certifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.35)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
    },
    certifiedBadgeText: {
        color: '#34D399',
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 0.8,
    },
    illustrationComposition: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
        gap: 12,
    },
    illustrMainEmblem: {
        width: 72,
        height: 72,
        borderRadius: 22,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderWidth: 1.5,
        borderColor: 'rgba(52, 211, 153, 0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
    },
    illustrIconBadgeLeft: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '-8deg' }],
    },
    illustrIconBadgeRight: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '8deg' }],
    },
    heroHeadline: {
        fontSize: 18,
        fontWeight: '900',
        color: '#FFFFFF',
        textAlign: 'center',
        marginTop: 6,
        letterSpacing: 0.3,
    },
    heroSubline: {
        fontSize: 12,
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 16,
        marginTop: 4,
        paddingHorizontal: 10,
    },
    featureChipsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 12,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    chipText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#E2E8F0',
    },
});
