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
import { Home, KeyRound, ArrowRight, ShieldCheck } from 'lucide-react-native';

export default function SelectSpaceScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── EN-TÊTE PRINCIPAL CENTRÉ AVEC LOGOTYPE OFFICIEL ── */}
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <Image
              source={{ uri: 'https://www.qapril.net/logo.png' }}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          <View style={styles.sovereignBadge}>
            <ShieldCheck size={14} color="#D97706" />
            <Text style={styles.sovereignBadgeText}>RÉPUBLIQUE DE CÔTE D'IVOIRE</Text>
          </View>

          <Text style={styles.brandTitle}>QAPRIL</Text>
          <Text style={styles.brandTagline}>
            Infrastructure numérique de confiance pour l'immobilier
          </Text>
          <Text style={styles.subtitle}>
            Choisissez votre espace de connexion
          </Text>
        </View>

        {/* ── LES DEUX GRANDS ESPACES CENTRÉS ET LISIBLES ── */}
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
            {/* Logotype Centré */}
            <View style={[styles.emblemBox, styles.locataireEmblem]}>
              <KeyRound size={32} color="#2C3E6B" strokeWidth={2.4} />
            </View>

            {/* Badge de rôle centré */}
            <View style={styles.locatairePill}>
              <Text style={styles.locatairePillText}>ESPACE LOCATAIRE</Text>
            </View>

            {/* Titre centré & haute lisibilité */}
            <Text style={styles.cardTitle}>Je suis Locataire</Text>

            {/* Description claire et rassurante */}
            <Text style={styles.cardDesc}>
              Paiement du loyer par Mobile Money, quittances certifiées instantanées et attestations de résidence
            </Text>

            {/* Bouton d'action centré */}
            <View style={[styles.actionBtn, styles.locataireActionBtn]}>
              <Text style={styles.locataireActionText}>Accéder à mon espace</Text>
              <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.4} />
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
            {/* Logotype Centré */}
            <View style={[styles.emblemBox, styles.bailleurEmblem]}>
              <Home size={32} color="#1B4D3E" strokeWidth={2.4} />
            </View>

            {/* Badge de rôle centré */}
            <View style={styles.bailleurPill}>
              <Text style={styles.bailleurPillText}>ESPACE BAILLEUR</Text>
            </View>

            {/* Titre centré & haute lisibilité */}
            <Text style={styles.cardTitle}>Je suis Bailleur / Propriétaire</Text>

            {/* Description claire et rassurante */}
            <Text style={styles.cardDesc}>
              Gestion des logements, baux certifiés conformes à la loi, quittance express et encaissements sécurisés
            </Text>

            {/* Bouton d'action centré */}
            <View style={[styles.actionBtn, styles.bailleurActionBtn]}>
              <Text style={styles.bailleurActionText}>Accéder à mon espace</Text>
              <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.4} />
            </View>
          </Pressable>

        </View>

        {/* ── PIED DE PAGE DISCRET ET RASSURANT ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Plateforme certifiée conforme aux lois immobilières ivoiriennes
          </Text>
          <Text style={styles.footerSubText}>
            Les agences immobilières agréées opèrent sur qapril.net
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
    maxWidth: 440,
  },
  logoWrap: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  logo: {
    width: 42,
    height: 42,
  },
  sovereignBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 8,
  },
  sovereignBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.8,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.8,
  },
  brandTagline: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 300,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginTop: 10,
  },
  cardsWrap: {
    gap: 18,
    width: '100%',
    maxWidth: 440,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  cardPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.96,
  },
  locataireCard: {
    borderColor: '#CBD5E1',
  },
  bailleurCard: {
    borderColor: '#CBD5E1',
  },
  emblemBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  locataireEmblem: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
  },
  bailleurEmblem: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
  },
  locatairePill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  locatairePillText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#2C3E6B',
    letterSpacing: 0.8,
  },
  bailleurPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  bailleurPillText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1B4D3E',
    letterSpacing: 0.8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#334155',
    textAlign: 'center',
    lineHeight: 19,
    fontWeight: '500',
    marginBottom: 16,
    paddingHorizontal: 6,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 13,
    borderRadius: 14,
  },
  locataireActionBtn: {
    backgroundColor: '#2C3E6B',
  },
  locataireActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  bailleurActionBtn: {
    backgroundColor: '#1B4D3E',
  },
  bailleurActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 16,
    maxWidth: 360,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  footerSubText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
});
