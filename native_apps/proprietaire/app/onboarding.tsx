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
  FileText,
  CreditCard,
  MessageSquare,
  Building2,
  Lock,
} from 'lucide-react-native';
import { setHasSeenOnboarding } from '../lib/api';

const { width } = Dimensions.get('window');

const ONBOARDING_SLIDES = [
  {
    id: '1',
    badge: 'LOI 2019-576 CCH',
    title: 'Contrats de bail certifiés',
    description:
      'Rédigez, validez et scellez vos baux d\'habitation et commerciaux en 3 minutes. Plafonnement légal de la caution (2 mois) et signature numérique par code OTP SMS.',
    icon: FileText,
  },
  {
    id: '2',
    badge: 'GESTION DE PATRIMOINE',
    title: 'Zéro impayé, quittances certifiées',
    description:
      'Chaque paiement Mobile Money ou virement déclenche l’émission d’une quittance officielle scellée SHA-256 avec QR Code de contrôle vérifiable.',
    icon: CreditCard,
  },
  {
    id: '3',
    badge: 'CANAL CONVERSATIONNEL (ADD-26)',
    title: 'Accessible sans application, 24h/24',
    description:
      'Vos locataires peuvent déclarer, confirmer leurs paiements et recevoir leurs quittances par simple SMS ou WhatsApp, sans obligation d’installer l’application.',
    icon: MessageSquare,
  },
];

export default function OnboardingScreen() {
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
      <Modal visible={showLegalConsent} transparent={false} animationType="fade">
        <SafeAreaView style={styles.modalBackdrop}>
          <StatusBar barStyle="dark-content" backgroundColor="#F1F5F9" />
          <View style={styles.consentCard}>
            <View style={styles.consentBadge}>
              <ShieldCheck color="#166534" size={15} />
              <Text style={styles.consentBadgeText}>CADRE RÉPUBLICAIN & ARTCI</Text>
            </View>

            <Text style={styles.consentTitle}>Bienvenue sur QAPRIL</Text>
            <Text style={styles.consentSubtitle}>
              Plateforme de gestion immobilière numérique de référence en Côte d’Ivoire.
            </Text>

            <View style={styles.separator} />

            <Text style={styles.consentBody}>
              Conformément à la Loi N° 2019-576 régissant les baux d'habitation et à la Loi N° 2013-450 sur la protection des données personnelles (ARTCI), QAPRIL garantit la sécurité juridique et financière de votre patrimoine.
              {'\n\n'}
              Pour certifier vos actes, émettre les quittances officielles et notifier vos parties prenantes, l’application utilise vos canaux de communication certifiés (SMS & WhatsApp).
              {'\n\n'}
              En appuyant sur <Text style={{ fontWeight: '700' }}>Accepter et continuer</Text>, vous approuvez nos Conditions Générales d’Utilisation et notre Politique de Confidentialité.
            </Text>

            <View style={styles.consentButtonsRow}>
              <Pressable
                style={styles.btnSecondary}
                onPress={finishOnboarding}
              >
                <Text style={styles.btnSecondaryText}>Passer</Text>
              </Pressable>
              <Pressable
                style={styles.btnPrimaryConsent}
                onPress={() => setShowLegalConsent(false)}
              >
                <Text style={styles.btnPrimaryText}>Accepter et continuer</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* 2. EN-TÊTE FIXE */}
      <View style={styles.topBar}>
        <View style={styles.logoRow}>
          <Building2 color="#1B4D3E" size={20} />
          <Text style={styles.logoText}>QAPRIL</Text>
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
                  <Icon color="#1B4D3E" size={44} />
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

      {/* 4. PIED DE PAGE : PAGINATION + BOUTON D'ACTION */}
      <View style={styles.footer}>
        {/* Points de pagination solides */}
        <View style={styles.paginationRow}>
          {ONBOARDING_SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                currentSlideIndex === i ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <Pressable style={styles.actionBtn} onPress={handleNext}>
          <Text style={styles.actionBtnText}>
            {currentSlideIndex === ONBOARDING_SLIDES.length - 1
              ? 'Commencer maintenant'
              : 'Continuer'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Fond solide noble mat
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1B4D3E',
    letterSpacing: 1.2,
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
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E6F4EA',
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
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 28,
  },
  slideDescription: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 16,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#1B4D3E', // Aplat solide émeraude
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#CBD5E1',
  },
  actionBtn: {
    backgroundColor: '#1B4D3E', // Aplat uni vert souverain
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // Modale de consentement solide
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  consentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
  },
  consentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  consentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#166534',
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
    backgroundColor: '#1B4D3E',
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

