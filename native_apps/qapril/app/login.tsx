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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { FormScreen } from '../components/forms/FormScreen';
import NativeOTPForm from '../components/auth/NativeOTPForm';
import { ActiveSpace } from '../lib/api';

export default function UnifiedLoginScreen() {
  const router = useRouter();
  const { space } = useLocalSearchParams<{ space?: string }>();
  
  const activeSpace: ActiveSpace = space === 'BAILLEUR' ? 'BAILLEUR' : 'LOCATAIRE';
  const isBailleur = activeSpace === 'BAILLEUR';

  const theme = {
    badgeColor: isBailleur ? '#1B4D3E' : '#2C3E6B',
    badgeBg: isBailleur ? '#ECFDF5' : '#EEF2FF',
    badgeText: isBailleur ? 'ESPACE BAILLEUR · PATRIMOINE & BAUX DGI' : 'ESPACE LOCATAIRE · PAIEMENTS & QUITTANCES',
    title: isBailleur ? 'Connexion Bailleur' : 'Connexion Locataire',
    subtitle: isBailleur
      ? 'Pilotez vos biens, contrats et encaissements certifiés'
      : 'Consultez vos quittances et payez votre loyer en toute sérénité',
    statusBarBg: '#F1F5F9',
  };

  return (
    <LinearGradient
      colors={['#F1F5F9', '#F8FAFC', '#FFFFFF']}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.statusBarBg} />
        <FormScreen contentStyle={styles.scrollContent}>
          <View style={styles.content}>
            
            {/* RETOUR VERS LE CHOIX D'ESPACE (RG-IDN-16) */}
            <View style={styles.topBar}>
              <Pressable
                onPress={() => router.replace('/select-space' as any)}
                style={styles.backLink}
                hitSlop={10}
              >
                <Text style={styles.backLinkText}>‹ Changer d'espace</Text>
              </Pressable>
            </View>

            {/* EN-TÊTE PROFESSIONNEL */}
            <View style={styles.header}>
              <View style={[styles.logoWrap, isBailleur ? styles.logoWrapBailleur : styles.logoWrapLocataire]}>
                <Image
                  source={{ uri: 'https://www.qapril.net/logo.png' }}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              <View style={[styles.badgeWrap, { backgroundColor: theme.badgeBg }]}>
                <Text style={[styles.badge, { color: theme.badgeColor }]}>{theme.badgeText}</Text>
              </View>

              <Text style={styles.title}>{theme.title}</Text>
              <Text style={styles.subtitle}>{theme.subtitle}</Text>
            </View>

            {/* FORMULAIRE OTP DYNAMIQUE DÉDIÉ À L'ESPACE */}
            <NativeOTPForm
              space={activeSpace}
              role={isBailleur ? 'LANDLORD' : 'TENANT'}
              profile={isBailleur ? 'proprietaire' : 'locataire'}
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
    marginBottom: 16,
  },
  backLink: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  backLinkText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoWrap: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  logoWrapLocataire: {
    backgroundColor: '#2C3E6B',
    shadowColor: '#2C3E6B',
  },
  logoWrapBailleur: {
    backgroundColor: '#1B4D3E',
    shadowColor: '#1B4D3E',
  },
  logo: {
    width: 38,
    height: 38,
  },
  badgeWrap: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  badge: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 18,
  },
});
