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
import NativeOTPForm from '../components/auth/NativeOTPForm';

export default function LoginScreen() {
    const router = useRouter();

    return (
        <LinearGradient 
            colors={['#ECFDF5', '#F8FAFC', '#FFFFFF']} 
            style={styles.gradientContainer}
        >
            <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
                <StatusBar barStyle="dark-content" backgroundColor="#ECFDF5" />
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
                                
                                {/* NAVIGATION PRÉSENTATION DISCRÈTE */}
                                <View style={styles.topBar}>
                                    <Pressable
                                        onPress={() => router.replace('/onboarding' as any)}
                                        style={styles.backLink}
                                        hitSlop={10}
                                    >
                                        <Text style={styles.backLinkText}>‹ Présentation</Text>
                                    </Pressable>
                                </View>

                                {/* EN-TÊTE ÉPURÉ ET LUMINEUX (STYLE APPLE LIGHT) */}
                                <View style={styles.header}>
                                    <View style={styles.logoWrap}>
                                        <Image 
                                            source={{ uri: 'https://www.qapril.net/logo.png' }} 
                                            style={styles.logo}
                                            resizeMode="contain"
                                        />
                                    </View>
                                    <Text style={styles.title}>QAPRIL</Text>
                                    <Text style={styles.subtitle}>Espace Locataire</Text>
                                </View>

                                {/* FORMULAIRE ÉPURÉ, CLAIR ET ACCUEILLANT */}
                                <NativeOTPForm 
                                    role="TENANT" 
                                />
                                
                            </View>
                        </TouchableWithoutFeedback>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradientContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 24,
    },
    content: {
        width: '100%',
        maxWidth: 420,
        alignSelf: 'center',
        paddingHorizontal: 24,
    },
    topBar: {
        marginBottom: 20,
    },
    backLink: {
        alignSelf: 'flex-start',
        paddingVertical: 6,
        paddingHorizontal: 4,
    },
    backLinkText: {
        color: '#64748B',
        fontSize: 15,
        fontWeight: '500',
    },
    header: {
        alignItems: 'center',
        marginBottom: 28,
    },
    logoWrap: {
        width: 68,
        height: 68,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
    },
    logo: {
        width: 44,
        height: 44,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: '#0F172A',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 15,
        color: '#64748B',
        fontWeight: '500',
    },
});
