import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  StatusBar,
  Pressable,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { FormScreen } from '../components/forms/FormScreen';
import NativeOTPForm from '../components/auth/NativeOTPForm';
import {
  getStoredProfile,
  setStoredProfile,
  UserProfileRole,
} from '../lib/api';

export default function LoginScreen() {
  const router = useRouter();
  const [selectedProfile, setSelectedProfile] = useState<UserProfileRole>('proprietaire');

  useEffect(() => {
    getStoredProfile().then((saved) => {
      if (saved === 'proprietaire' || saved === 'agence') {
        setSelectedProfile(saved);
      }
    });
  }, []);

  const isProprietaire = selectedProfile === 'proprietaire';
  const gradientColors = isProprietaire 
    ? ['#FEF9C3', '#FFFBEB', '#FFFFFF'] as const 
    : ['#E0F2FE', '#F0F9FF', '#FFFFFF'] as const;

  return (
    <LinearGradient colors={gradientColors} style={styles.gradientContainer}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor={isProprietaire ? '#FEF9C3' : '#E0F2FE'} />

        <FormScreen contentStyle={styles.scrollContent}>
          <View style={styles.content}>
                {/* TOP BAR / LIEN PRÉSENTATION DISCRET */}
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
                  <Text style={styles.subtitle}>
                    {isProprietaire ? 'Espace Propriétaire & Bailleur' : 'Console Agence Immobilière'}
                  </Text>

                  {/* SÉLECTEUR DE PROFIL STYLE UISegmentedControl */}
                  <View style={styles.segmentedControl}>
                    <Pressable
                      style={[
                        styles.segment,
                        isProprietaire && styles.segmentActive,
                      ]}
                      onPress={() => {
                        setSelectedProfile('proprietaire');
                        setStoredProfile('proprietaire');
                      }}
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          isProprietaire && styles.segmentTextActive,
                        ]}
                      >
                        Propriétaire
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.segment,
                        !isProprietaire && styles.segmentActive,
                      ]}
                      onPress={() => {
                        setSelectedProfile('agence');
                        setStoredProfile('agence');
                      }}
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          !isProprietaire && styles.segmentTextActive,
                        ]}
                      >
                        Agence Immobilière
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* FORMULAIRE AUTHENTIFICATION DIRECT ET ÉPURÉ */}
                <NativeOTPForm
                  role={isProprietaire ? 'LANDLORD' : 'ADMIN'}
                  profile={selectedProfile}
                />
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
    marginBottom: 24,
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
    marginBottom: 18,
    textAlign: 'center',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 12,
    padding: 3,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  segmentActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
});
