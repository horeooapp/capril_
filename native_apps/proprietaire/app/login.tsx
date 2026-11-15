import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  StatusBar,
  Pressable,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
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
    marginBottom: 28,
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
    marginBottom: 20,
    textAlign: 'center',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    padding: 3,
    width: '100%',
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
  },
  segmentActive: {
    backgroundColor: '#2C2C2E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
