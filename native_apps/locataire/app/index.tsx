import { View, Image, StyleSheet, Dimensions, StatusBar } from 'react-native';
import NativeOTPForm from '../components/auth/NativeOTPForm';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0B1120" />
            
            {/* Background elements (Glassmorphism & glows) */}
            <View style={[styles.glow, styles.glow1]} />
            <View style={[styles.glow, styles.glow2]} />
            
            <View style={styles.content}>
                <View style={styles.header}>
                    <Image 
                        source={{ uri: 'https://www.qapril.net/logo.png' }} 
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                <NativeOTPForm 
                    role="TENANT" 
                    title="VOTRE HABITAT" 
                    subtitle="Saisissez votre email pour accéder à votre espace locataire sécurisé."
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#021812', // Tenant theme dark bg
    },
    glow: {
        position: 'absolute',
        width: width * 0.8,
        height: height * 0.6,
        borderRadius: width,
        opacity: 0.15,
    },
    glow1: {
        top: -height * 0.1,
        left: -width * 0.2,
        backgroundColor: '#10B981', // Emerald glow
        transform: [{ scale: 1.5 }],
    },
    glow2: {
        bottom: -height * 0.1,
        right: -width * 0.2,
        backgroundColor: '#059669', // Emerald dark glow
        transform: [{ scale: 1.2 }],
    },
    content: {
        flex: 1,
        zIndex: 10,
    },
    header: {
        alignItems: 'center',
        marginTop: 60,
        marginBottom: 20,
    },
    logo: {
        width: 150,
        height: 60,
        tintColor: '#ffffff', // Invert to white
    }
});
