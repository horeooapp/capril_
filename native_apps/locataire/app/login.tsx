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
import NativeOTPForm from '../components/auth/NativeOTPForm';

export default function LoginScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />
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
                            
                            {/* BOUTON PRÉSENTATION DISCRET (STYLE NAVIGATION APPLE) */}
                            <View style={styles.topBar}>
                                <Pressable
                                    onPress={() => router.replace('/onboarding' as any)}
                                    style={styles.backLink}
                                    hitSlop={10}
                                >
                                    <Text style={styles.backLinkText}>‹ Présentation</Text>
                                </Pressable>
                            </View>

                            {/* EN-TÊTE ÉPURÉ STYLE APPLE */}
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

                            {/* FORMULAIRE AUTHENTIFICATION DIRECT ET ÉPURÉ */}
                            <NativeOTPForm 
                                role="TENANT" 
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
        backgroundColor: '#000000',
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
        color: '#8E8E93',
        fontSize: 15,
        fontWeight: '400',
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoWrap: {
        width: 68,
        height: 68,
        borderRadius: 16,
        backgroundColor: '#1C1C1E',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    logo: {
        width: 44,
        height: 44,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 15,
        color: '#8E8E93',
        fontWeight: '400',
    },
});
