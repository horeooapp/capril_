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
    Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import NativeOTPForm from '../components/auth/NativeOTPForm';

export default function LoginScreen() {
    const router = useRouter();
    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#2C3E6B" />
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
                            <View style={styles.header}>
                                <Image 
                                    source={{ uri: 'https://www.qapril.net/logo.png' }} 
                                    style={styles.logo}
                                    resizeMode="contain"
                                />
                                <Text style={styles.badge}>QAPRIL LOCATAIRE · MOBILE</Text>
                            </View>

                            <NativeOTPForm 
                                role="TENANT" 
                                title="ESPACE LOCATAIRE" 
                                subtitle="Saisissez votre email ou téléphone pour accéder à vos quittances, caution et passeport locatif."
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
        backgroundColor: '#2C3E6B',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 24,
    },
    content: {
        width: '100%',
        paddingHorizontal: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logo: {
        width: 150,
        height: 54,
        tintColor: '#ffffff',
    },
    badge: {
        marginTop: 6,
        color: 'rgba(255,255,255,0.85)',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1.2,
    },
});

