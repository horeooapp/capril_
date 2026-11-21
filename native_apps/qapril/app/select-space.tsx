import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Home, KeyRound, ChevronRight } from 'lucide-react-native';

export default function SelectSpaceScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      <View style={styles.content}>
        
        {/* EN-TÊTE ÉPURÉ STYLE APPLE AVEC LOGOTYPE ET TEXTES HAUT CONTRASTE */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logoWrap}>
              <Image
                source={{ uri: 'https://www.qapril.net/logo.png' }}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.brandTextWrap}>
              <Text style={styles.brandTitle}>QAPRIL</Text>
              <Text style={styles.brandTagline}>Gestion Locative Simple</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            Choisissez votre espace pour commencer
          </Text>
        </View>

        {/* LES DEUX CARTES SÉLECTIONNABLES */}
        <View style={styles.cardsWrap}>
          
          {/* 1. ESPACE LOCATAIRE */}
          <Pressable
            style={({ pressed }) => [
              styles.card,
              styles.locataireCard,
              pressed && styles.cardPressed,
            ]}
            onPress={() => router.push({ pathname: '/login', params: { space: 'LOCATAIRE' } })}
            android_ripple={{ color: '#E0E7FF' }}
          >
            <View style={[styles.iconBox, styles.locataireIconBox]}>
              <KeyRound size={28} color="#2C3E6B" strokeWidth={2.2} />
            </View>
            <View style={styles.cardTextWrap}>
              <Text style={styles.cardTitle}>Espace Locataire</Text>
              <Text style={styles.cardDesc}>
                Paiement du loyer, quittances certifiées et attestations de résidence
              </Text>
            </View>
            <View style={styles.chevronWrap}>
              <ChevronRight size={22} color="#94A3B8" />
            </View>
          </Pressable>

          {/* 2. ESPACE BAILLEUR */}
          <Pressable
            style={({ pressed }) => [
              styles.card,
              styles.bailleurCard,
              pressed && styles.cardPressed,
            ]}
            onPress={() => router.push({ pathname: '/login', params: { space: 'BAILLEUR' } })}
            android_ripple={{ color: '#DCFCE7' }}
          >
            <View style={[styles.iconBox, styles.bailleurIconBox]}>
              <Home size={28} color="#1B4D3E" strokeWidth={2.2} />
            </View>
            <View style={styles.cardTextWrap}>
              <Text style={styles.cardTitle}>Espace Bailleur</Text>
              <Text style={styles.cardDesc}>
                Gestion des biens, baux certifiés, quittance express et encaissements
              </Text>
            </View>
            <View style={styles.chevronWrap}>
              <ChevronRight size={22} color="#94A3B8" />
            </View>
          </Pressable>

        </View>

        {/* PIED DE PAGE DISCRET */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Plateforme immobilière certifiée de Côte d'Ivoire
          </Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingVertical: 24,
    justifyContent: 'space-between',
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    marginBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10,
  },
  logoWrap: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  logo: {
    width: 38,
    height: 38,
  },
  brandTextWrap: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.6,
  },
  brandTagline: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 15,
    color: '#334155',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
  },
  cardsWrap: {
    gap: 16,
    marginVertical: 'auto',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardPressed: {
    transform: [{ scale: 0.985 }],
    backgroundColor: '#F8FAFC',
  },
  locataireCard: {
    borderColor: '#CBD5E1',
  },
  bailleurCard: {
    borderColor: '#CBD5E1',
  },
  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locataireIconBox: {
    backgroundColor: '#EFF6FF',
  },
  bailleurIconBox: {
    backgroundColor: '#F0FDF4',
  },
  cardTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  cardDesc: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    fontWeight: '500',
  },
  chevronWrap: {
    paddingLeft: 4,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
});
