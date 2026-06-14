import { View, Image, StyleSheet, Dimensions, StatusBar } from 'react-native';
import NativeOTPForm from '../components/auth/NativeOTPForm';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0A1128" />
            
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
                    role="LANDLORD" 
                    title="ESPACE PATRIMOINE" 
                    subtitle="Saisissez votre email pour gérer et superviser vos investissements."
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A1128', // Landlord theme dark bg
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
        backgroundColor: '#d97706', // Amber glow
        transform: [{ scale: 1.5 }],
    },
    glow2: {
        bottom: -height * 0.1,
        right: -width * 0.2,
        backgroundColor: '#2563eb', // Blue glow
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
