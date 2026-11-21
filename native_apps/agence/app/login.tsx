import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  StatusBar,
  Text,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { FormScreen } from '../components/forms/FormScreen';
import NativeOTPForm from '../components/auth/NativeOTPForm';

export default function AgenceLoginScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#F1F5F9', '#F8FAFC', '#FFFFFF']}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="#F1F5F9" />
        <FormScreen contentStyle={styles.scrollContent}>
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

            {/* EN-TÊTE ÉPURÉ ET PROFESSIONNEL */}
            <View style={styles.header}>
              <View style={styles.logoWrap}>
                <Image
                  source={{ uri: 'https://www.qapril.net/logo.png' }}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.badge}>QAPRIL AGENCE AGRÉÉE · CPRAIMA-CI</Text>
              <Text style={styles.title}>Portail Agence</Text>
              <Text style={styles.subtitle}>
                Console de gestion sous mandat certifié & DGI
              </Text>
            </View>

            {/* FORMULAIRE AUTHENTIFICATION OTP SÉCURISÉ */}
            <NativeOTPForm role="LANDLORD" />
          </View>
        </FormScreen>
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
    marginBottom: 16,
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
    marginBottom: 24,
  },
  logoWrap: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#1F2A44',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#1F2A44',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  logo: {
    width: 38,
    height: 38,
  },
  badge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F0774B',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1F2A44',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
});
