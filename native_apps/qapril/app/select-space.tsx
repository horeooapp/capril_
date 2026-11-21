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
        {/* ── EN-TÊTE CONVIVIAL AVEC LOGOTYPE OFFICIEL ── */}
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
          <Text style={styles.subtitle}>
            Choisissez votre espace
          </Text>
        </View>

        {/* ── LES DEUX ESPACES CONVIVIAUX (ICÔNE EN FACE DU TITRE & BOUTON EN DESSOUS) ── */}
        <View style={styles.cardsWrap}>
          
          {/* 1. ESPACE LOCATAIRE : Clé en face de "Je suis Locataire", Accéder à mon espace en dessous */}
          <Pressable
            style={({ pressed }) => [
              styles.card,
              styles.locataireCard,
              pressed && styles.cardPressed,
            ]}
            onPress={() => router.push({ pathname: '/login', params: { space: 'LOCATAIRE' } })}
            android_ripple={{ color: '#E0E7FF' }}
          >
            <View style={styles.cardHeaderRow}>
              <View style={[styles.emblemBox, styles.locataireEmblem]}>
                <KeyRound size={28} color="#2C3E6B" strokeWidth={2.4} />
              </View>
              <View style={styles.cardTitleWrap}>
                <Text style={styles.cardRolePillLocataire}>ESPACE LOCATAIRE</Text>
                <Text style={styles.cardTitle}>Je suis Locataire</Text>
              </View>
            </View>

            <View style={[styles.actionBtn, styles.locataireActionBtn]}>
              <Text style={styles.actionBtnText}>Accéder à mon espace</Text>
              <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.4} />
            </View>
          </Pressable>

          {/* 2. ESPACE BAILLEUR : Maison en face de "Je suis Bailleur", Accéder à mon espace en dessous */}
          <Pressable
            style={({ pressed }) => [
              styles.card,
              styles.bailleurCard,
              pressed && styles.cardPressed,
            ]}
            onPress={() => router.push({ pathname: '/login', params: { space: 'BAILLEUR' } })}
            android_ripple={{ color: '#DCFCE7' }}
          >
            <View style={styles.cardHeaderRow}>
              <View style={[styles.emblemBox, styles.bailleurEmblem]}>
                <Home size={28} color="#1B4D3E" strokeWidth={2.4} />
              </View>
              <View style={styles.cardTitleWrap}>
                <Text style={styles.cardRolePillBailleur}>ESPACE BAILLEUR</Text>
                <Text style={styles.cardTitle}>Je suis Bailleur</Text>
              </View>
            </View>

            <View style={[styles.actionBtn, styles.bailleurActionBtn]}>
              <Text style={styles.actionBtnText}>Accéder à mon espace</Text>
              <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.4} />
            </View>
          </Pressable>

        </View>

        {/* ── PIED DE PAGE DISCRET ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Plateforme certifiée conforme aux lois ivoiriennes
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
    marginBottom: 28,
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
    width: 44,
    height: 44,
  },
  sovereignBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 10,
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
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    marginTop: 6,
  },
  cardsWrap: {
    gap: 18,
    width: '100%',
    maxWidth: 440,
    marginBottom: 28,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  cardPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.95,
  },
  locataireCard: {
    borderColor: '#E2E8F0',
  },
  bailleurCard: {
    borderColor: '#E2E8F0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  emblemBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
  cardTitleWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  cardRolePillLocataire: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2C3E6B',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  cardRolePillBailleur: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1B4D3E',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
  },
  locataireActionBtn: {
    backgroundColor: '#2C3E6B',
  },
  bailleurActionBtn: {
    backgroundColor: '#1B4D3E',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 12,
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
