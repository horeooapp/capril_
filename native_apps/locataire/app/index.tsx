import { View, Image, StyleSheet, Dimensions, StatusBar, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import NativeOTPForm from '../components/auth/NativeOTPForm';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
    const router = useRouter();
    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F4F5F9" />
            
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2C3E6B',
    },
    content: {
        flex: 1,
        zIndex: 10,
    },
    header: {
        alignItems: 'center',
        marginTop: 56,
        marginBottom: 16,
    },
    logo: {
        width: 140,
        height: 54,
        tintColor: '#ffffff',
    },
    badge: {
        marginTop: 6,
        color: 'rgba(255,255,255,0.8)',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1,
    },
});
