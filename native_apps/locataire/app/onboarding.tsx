import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  FlatList,
  Modal,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ShieldCheck,
  FileCheck2,
  Receipt,
  UserCheck2,
  Home,
} from 'lucide-react-native';
import { setHasSeenOnboarding } from '../lib/api';

const { width } = Dimensions.get('window');

const ONBOARDING_SLIDES = [
  {
    id: '1',
    badge: 'PROTECTION LOCATAIRE',
    title: 'Baux certifiés & caution protégée',
    description:
      'Vos droits sont garantis par le Code de la Construction et de l\'Habitat : caution et avance strictement plafonnées à 2 mois, signées par code OTP SMS.',
    icon: FileCheck2,
  },
  {
    id: '2',
    badge: 'PAIEMENTS & PREUVES OFFICIELLES',
    title: 'Quittances certifiées avec QR Code',
    description:
      'Chaque paiement de loyer génère immédiatement une quittance officielle vérifiable par QR Code, acceptée par les banques et les administrations.',
    icon: Receipt,
  },
  {
    id: '3',
    badge: 'HISTORIQUE & PASSEPORT LOCATIF',
    title: 'Passeport de fiabilité locative',
    description:
      'Valorisez votre historique de paiement régulier pour débloquer votre passeport locatif officiel et faciliter vos futures locations sans caution exorbitante.',
    icon: UserCheck2,
  },
];

export default function LocataireOnboardingScreen() {
  const router = useRouter();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showLegalConsent, setShowLegalConsent] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const finishOnboarding = async () => {
    try {
      await setHasSeenOnboarding();
    } catch {}
    router.replace('/login');
  };

  const handleNext = () => {
    if (currentSlideIndex < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentSlideIndex + 1,
        animated: true,
      });
      setCurrentSlideIndex(currentSlideIndex + 1);
    } else {
      finishOnboarding();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 1. MODALE DE CONSENTEMENT ET CADRE LÉGAL RÉPUBLICAIN */}
      <Modal visible={showLegalConsent} transparent={true} animationType="fade">
        <SafeAreaView style={styles.modalBackdrop}>
          <StatusBar barStyle="dark-content" backgroundColor="rgba(15, 23, 42, 0.45)" />
          <View style={styles.consentCard}>
            <View style={styles.consentBadge}>
              <ShieldCheck color="#1E40AF" size={15} />
              <Text style={styles.consentBadgeText}>DROITS DU LOCATAIRE · ARTCI</Text>
            </View>

            <Text style={styles.consentTitle}>Bienvenue sur QAPRIL</Text>
            <Text style={styles.consentSubtitle}>
              Votre espace locataire souverain et transparent en Côte d’Ivoire.
            </Text>

            <View style={styles.separator} />

            <Text style={styles.consentBody}>
              QAPRIL protège votre relation locative conformément au Code de la Construction et de l'Habitat et à la réglementation ARTCI sur les données personnelles.
              {'\n\n'}
              Accédez à vos quittances certifiées, suivez vos versements de loyer et recevez vos alertes de signature de bail par code OTP sécurisé.
              {'\n\n'}
              En appuyant sur <Text style={{ fontWeight: '700' }}>Accepter</Text>, vous acceptez nos Conditions Générales et notre Politique de Confidentialité.
            </Text>

            <View style={styles.consentButtonsRow}>
              <Pressable
                style={styles.btnSecondary}
                onPress={() => setShowLegalConsent(false)}
              >
                <Text style={styles.btnSecondaryText}>Annuler</Text>
              </Pressable>
              <Pressable
                style={styles.btnPrimaryConsent}
                onPress={() => setShowLegalConsent(false)}
              >
                <Text style={styles.btnPrimaryText}>Accepter</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* 2. EN-TÊTE FIXE */}
      <View style={styles.topBar}>
        <View style={styles.logoRow}>
          <Home color="#1E3A8A" size={20} />
          <Text style={styles.logoText}>QAPRIL LOCATAIRE</Text>
        </View>
        <Pressable onPress={finishOnboarding} hitSlop={10}>
          <Text style={styles.skipText}>Passer</Text>
        </Pressable>
      </View>

      {/* 3. SLIDES CAROUSEL */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentSlideIndex(index);
        }}
        renderItem={({ item }) => {
          const Icon = item.icon;
          return (
            <View style={styles.slide}>
              <View style={styles.visualContainer}>
                <View style={styles.iconCircle}>
                  <Icon color="#1E3A8A" size={44} />
                </View>
              </View>

              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>

              <Text style={styles.slideTitle}>{item.title}</Text>
              <Text style={styles.slideDescription}>{item.description}</Text>
            </View>
          );
        }}
      />

      {/* 4. PIED DE PAGE : BOUTON D'ACTION + POINTS DE PAGINATION */}
      <View style={styles.footer}>
        <Pressable style={styles.actionBtn} onPress={handleNext}>
          <Text style={styles.actionBtnText}>
            {currentSlideIndex === ONBOARDING_SLIDES.length - 1
              ? 'Utiliser maintenant'
              : 'Continuer'}
          </Text>
        </Pressable>

        {/* Points de pagination sous le bouton */}
        <View style={styles.paginationRow}>
          {ONBOARDING_SLIDES.map((_, i) => (
            <Pressable
              key={i}
              onPress={() => {
                flatListRef.current?.scrollToIndex({ index: i, animated: true });
                setCurrentSlideIndex(i);
              }}
              hitSlop={8}
            >
              <View
                style={[
                  styles.dot,
                  currentSlideIndex === i ? styles.dotActive : styles.dotInactive,
                ]}
              />
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E3A8A',
    letterSpacing: 1,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  slide: {
    width: width,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visualContainer: {
    width: 156,
    height: 156,
    borderRadius: 78,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  iconCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeContainer: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.6,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 30,
  },
  slideDescription: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 30,
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  dotInactive: {
    backgroundColor: '#E2E8F0',
  },
  actionBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // Modale de consentement flottante laissant apparaître l'illustration en haut
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  consentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  consentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  consentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E40AF',
  },
  consentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  consentSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },
  separator: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  consentBody: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },
  consentButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
  btnPrimaryConsent: {
    flex: 2,
    backgroundColor: '#1E3A8A',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

