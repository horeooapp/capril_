import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Home, KeyRound, ShieldCheck, ChevronRight } from 'lucide-react-native';

export default function SelectSpaceScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#141C30" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* EN-TÊTE SOUVERAIN */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Image
              source={{ uri: 'https://www.qapril.net/logo.png' }}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.republicanPill}>
            <ShieldCheck size={14} color="#F0774B" />
            <Text style={styles.republicanPillText}>RÉPUBLIQUE DE CÔTE D'IVOIRE</Text>
          </View>
          <Text style={styles.appTitle}>QAPRIL</Text>
          <Text style={styles.appSubtitle}>
            Infrastructure numérique de confiance pour l'immobilier
          </Text>
          <Text style={styles.instruction}>
            Choisissez votre espace de connexion
          </Text>
        </View>

        {/* CARTES DE SÉLECTION D'ESPACE (RG-IDN-16 & RG-IDN-22) */}
        <View style={styles.cardsContainer}>
          
          {/* 1. ESPACE LOCATAIRE */}
          <Pressable
            style={({ pressed }) => [
              styles.spaceCard,
              styles.locataireCard,
              pressed && styles.cardPressed,
            ]}
            onPress={() => router.push({ pathname: '/login', params: { space: 'LOCATAIRE' } })}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconCircle, styles.locataireIconCircle]}>
                <KeyRound size={26} color="#FFFFFF" />
              </View>
              <View style={styles.badgePillLocataire}>
                <Text style={styles.badgeTextLocataire}>ESPACE LOCATAIRE</Text>
              </View>
            </View>

            <Text style={styles.cardTitle}>Je suis Locataire</Text>
            <Text style={styles.cardDescription}>
              Paiement des loyers par Mobile Money, quittances numériques infalsifiables, attestations de résidence et signalements.
            </Text>

            <View style={styles.cardFooter}>
              <Text style={styles.enterTextLocataire}>Entrer comme locataire</Text>
              <ChevronRight size={18} color="#2C3E6B" />
            </View>
          </Pressable>

          {/* 2. ESPACE BAILLEUR */}
          <Pressable
            style={({ pressed }) => [
              styles.spaceCard,
              styles.bailleurCard,
              pressed && styles.cardPressed,
            ]}
            onPress={() => router.push({ pathname: '/login', params: { space: 'BAILLEUR' } })}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconCircle, styles.bailleurIconCircle]}>
                <Home size={26} color="#FFFFFF" />
              </View>
              <View style={styles.badgePillBailleur}>
                <Text style={styles.badgeTextBailleur}>ESPACE BAILLEUR</Text>
              </View>
            </View>

            <Text style={styles.cardTitle}>Je suis Propriétaire / Bailleur</Text>
            <Text style={styles.cardDescription}>
              Gestion de votre patrimoine, signature de baux certifiés, encaissements directs, télédéclaration DGI et quittance express.
            </Text>

            <View style={styles.cardFooter}>
              <Text style={styles.enterTextBailleur}>Entrer comme bailleur</Text>
              <ChevronRight size={18} color="#1B4D3E" />
            </View>
          </Pressable>

        </View>

        {/* MENTION LÉGALE & AGENCES */}
        <View style={styles.footerNote}>
          <Text style={styles.footerText}>
            Vous êtes une agence immobilière agréée ?
          </Text>
          <Text style={styles.footerSub}>
            Accédez à la console multi-mandants depuis votre navigateur sur <Text style={styles.footerLink}>qapril.net/espace-agence</Text>
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141C30',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#1F2A44',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  logo: {
    width: 40,
    height: 40,
  },
  republicanPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(240, 119, 75, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(240, 119, 75, 0.25)',
  },
  republicanPillText: {
    color: '#F0774B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
  instruction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
    marginTop: 18,
  },
  cardsContainer: {
    gap: 16,
  },
  spaceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  cardPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.95,
  },
  locataireCard: {
    borderColor: '#2C3E6B',
  },
  bailleurCard: {
    borderColor: '#1B4D3E',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locataireIconCircle: {
    backgroundColor: '#2C3E6B',
  },
  bailleurIconCircle: {
    backgroundColor: '#1B4D3E',
  },
  badgePillLocataire: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeTextLocataire: {
    color: '#2C3E6B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgePillBailleur: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeTextBailleur: {
    color: '#1B4D3E',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    marginBottom: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  enterTextLocataire: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C3E6B',
  },
  enterTextBailleur: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B4D3E',
  },
  footerNote: {
    marginTop: 26,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
  },
  footerSub: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
  },
  footerLink: {
    color: '#F0774B',
    fontWeight: '700',
  },
});
