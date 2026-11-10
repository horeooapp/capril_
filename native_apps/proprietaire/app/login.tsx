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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Building2,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Home,
  Check,
} from 'lucide-react-native';
import NativeOTPForm from '../components/auth/NativeOTPForm';
import {
  getStoredProfile,
  setStoredProfile,
  setStoredToken,
  UserProfileRole,
} from '../lib/api';

export default function LoginScreen() {
  const router = useRouter();
  const [selectedProfile, setSelectedProfile] = useState<UserProfileRole>('proprietaire');

  useEffect(() => {
    // Vérifier si un profil est déjà mémorisé
    getStoredProfile().then((saved) => {
      if (saved === 'proprietaire' || saved === 'agence') {
        setSelectedProfile(saved);
      }
    });
  }, []);

  const isProprietaire = selectedProfile === 'proprietaire';
  const primaryColor = isProprietaire ? '#1B4D3E' : '#1F2A44';
  const accentColor = isProprietaire ? '#E8A020' : '#3B82F6';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isProprietaire ? '#0B2019' : '#0B1329' }]} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={isProprietaire ? '#0B2019' : '#0B1329'}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        {/* LOGO & TITRE */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.replace('/onboarding' as any)}
            style={{
              alignSelf: 'flex-start',
              marginBottom: 10,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 999,
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.16)',
            }}
          >
            <Text style={{ color: '#E2E8F0', fontSize: 11, fontWeight: '700' }}>
              ← Voir la présentation
            </Text>
          </Pressable>
          <Image
            source={{ uri: 'https://www.qapril.net/logo.png' }}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.badge, { color: accentColor }]}>
            {isProprietaire
              ? 'ESPACE PROPRIÉTAIRE BAILLEUR DIRECT'
              : 'ESPACE AGENCE IMMOBILIÈRE AGRÉÉE'}
          </Text>
          <Text style={styles.subTitle}>
            Plateforme certifiée de gestion immobilière · DGI & Horodatage certifié
          </Text>
        </View>

        {/* ÉTAPE OBLIGATOIRE : CHOIX DU PROFIL */}
        <View style={styles.selectorSection}>
          <View style={styles.stepHeaderRow}>
            <View style={[styles.stepNumBadge, { backgroundColor: accentColor }]}>
              <Text style={styles.stepNumText}>1</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.selectorLabel}>VOTRE ESPACE POUR CETTE SESSION</Text>
              <Text style={styles.selectorSub}>
                Choisissez votre espace de travail dédié.
              </Text>
            </View>
          </View>

          <View style={styles.rolesRow}>
            {/* CARTE PROPRIÉTAIRE */}
            <Pressable
              style={[
                styles.roleCard,
                isProprietaire && styles.roleCardActiveBailleur,
              ]}
              onPress={() => setSelectedProfile('proprietaire')}
            >
              <View style={styles.roleCardTop}>
                <View
                  style={[
                    styles.roleIconWrap,
                    { backgroundColor: isProprietaire ? '#1B4D3E' : 'rgba(255,255,255,0.08)' },
                  ]}
                >
                  <Home color={isProprietaire ? '#FFFFFF' : '#9CA3AF'} size={20} />
                </View>
                {isProprietaire && (
                  <View style={styles.activeCheckPill}>
                    <Check color="#FFFFFF" size={13} />
                  </View>
                )}
              </View>

              <Text style={[styles.roleCardTitle, isProprietaire && { color: '#FFFFFF' }]}>
                Propriétaire
              </Text>
              <Text style={styles.roleCardSub}>Bailleur direct / Particulier</Text>

              <View style={styles.roleFeaturesList}>
                <Text style={styles.roleFeatureItem}>• Mes biens & lots propres</Text>
                <Text style={styles.roleFeatureItem}>• Baux, quittances & loyers</Text>
                <Text style={styles.roleFeatureItem}>• Signalements & entretiens locataires</Text>
              </View>

              <View
                style={[
                  styles.roleCardFooter,
                  isProprietaire ? { backgroundColor: 'rgba(232, 160, 32, 0.15)' } : { opacity: 0.4 },
                ]}
              >
                <Text
                  style={[
                    styles.roleCardFooterText,
                    { color: isProprietaire ? '#E8A020' : '#9CA3AF' },
                  ]}
                >
                  {isProprietaire ? '● Profil sélectionné' : 'Sélectionner'}
                </Text>
              </View>
            </Pressable>

            {/* CARTE AGENCE */}
            <Pressable
              style={[
                styles.roleCard,
                !isProprietaire && styles.roleCardActiveAgence,
              ]}
              onPress={() => setSelectedProfile('agence')}
            >
              <View style={styles.roleCardTop}>
                <View
                  style={[
                    styles.roleIconWrap,
                    { backgroundColor: !isProprietaire ? '#1F2A44' : 'rgba(255,255,255,0.08)' },
                  ]}
                >
                  <Briefcase color={!isProprietaire ? '#FFFFFF' : '#9CA3AF'} size={20} />
                </View>
                {!isProprietaire && (
                  <View style={[styles.activeCheckPill, { backgroundColor: '#3B82F6' }]}>
                    <Check color="#FFFFFF" size={13} />
                  </View>
                )}
              </View>

              <Text style={[styles.roleCardTitle, !isProprietaire && { color: '#FFFFFF' }]}>
                Agence
              </Text>
              <Text style={styles.roleCardSub}>Cabinet Agréé CPRAIMA</Text>

              <View style={styles.roleFeaturesList}>
                <Text style={styles.roleFeatureItem}>• Portefeuille multi-mandants</Text>
                <Text style={styles.roleFeatureItem}>• Mandats et gestion déléguée</Text>
                <Text style={styles.roleFeatureItem}>• Rétrocessions & Honoraires (8%)</Text>
              </View>

              <View
                style={[
                  styles.roleCardFooter,
                  !isProprietaire ? { backgroundColor: 'rgba(59, 130, 246, 0.15)' } : { opacity: 0.4 },
                ]}
              >
                <Text
                  style={[
                    styles.roleCardFooterText,
                    { color: !isProprietaire ? '#60A5FA' : '#9CA3AF' },
                  ]}
                >
                  {!isProprietaire ? '● Profil sélectionné' : 'Sélectionner'}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* FORMULAIRE DE CONNEXION STRICT AU PROFIL SÉLECTIONNÉ */}
        <View style={styles.formContainer}>
          <NativeOTPForm
            role={isProprietaire ? 'LANDLORD' : 'ADMIN'}
            profile={selectedProfile}
            title={
              isProprietaire
                ? 'CONNEXION PROPRIÉTAIRE'
                : 'CONNEXION AGENCE IMMOBILIÈRE'
            }
            subtitle={
              isProprietaire
                ? 'Saisissez votre e-mail ou téléphone pour accéder à votre espace bailleur.'
                : 'Saisissez votre e-mail agréé pour accéder à votre console d’agence.'
            }
          />
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 48,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  logo: {
    width: 150,
    height: 52,
    tintColor: '#ffffff',
  },
  badge: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  subTitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  selectorSection: {
    marginHorizontal: 18,
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  stepNumBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    color: '#0B2019',
    fontSize: 12,
    fontWeight: '900',
  },
  selectorLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  selectorSub: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 2,
  },
  rolesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  roleCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  roleCardActiveBailleur: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  roleCardActiveAgence: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  roleCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCheckPill: {
    backgroundColor: '#10B981',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleCardTitle: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '900',
  },
  roleCardSub: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 8,
  },
  roleFeaturesList: {
    gap: 3,
    marginBottom: 10,
  },
  roleFeatureItem: {
    color: '#D1D5DB',
    fontSize: 9.5,
    lineHeight: 13,
  },
  roleCardFooter: {
    borderRadius: 8,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleCardFooterText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  formContainer: {
    marginHorizontal: 18,
  },
});