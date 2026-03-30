import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, SafeAreaView, Dimensions, StatusBar, Image, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import WalletScreen from './src/modules/wallet/WalletScreen';
import ProprioScreen from './src/modules/proprio/ProprioScreen';
import DiasporaScreen from './src/modules/diaspora/DiasporaScreen';
import IntermediaireScreen from './src/modules/intermediaire/IntermediaireScreen';
import AuthScreen from './src/modules/auth/AuthScreen';
import { Theme } from './src/theme/theme';

const { width, height } = Dimensions.get('window');

type PortalType = 'TENANT' | 'LANDLORD' | 'DIASPORA' | 'INTERMEDIAIRE';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [portal, setPortal] = useState<PortalType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkPersistedAuth();
  }, []);

  const checkPersistedAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('qapril_token');
      if (token) {
        setIsAuthenticated(true);
        // On pourrait fetch le profil ici
      }
    } catch (e) {
      console.error("Auth restore failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (user: any) => {
    setUserProfile(user);
    setIsAuthenticated(true);
    setPortal(null); 
  };

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('qapril_token');
      setIsAuthenticated(false);
      setUserProfile(null);
      setPortal(null);
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.navy} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  if (portal === 'TENANT') return <WalletScreen onBack={() => setPortal(null)} />;
  if (portal === 'LANDLORD') return <ProprioScreen onBack={() => setPortal(null)} />;
  if (portal === 'DIASPORA') return <DiasporaScreen onBack={() => setPortal(null)} />;
  if (portal === 'INTERMEDIAIRE') return <IntermediaireScreen onBack={() => setPortal(null)} />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[Theme.colors.navyDark, Theme.colors.navy]} style={styles.gradBg}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.header}>
              <View style={styles.logoBox}>
                <Image source={require('./assets/icon.png')} style={styles.logo} resizeMode="contain" />
              </View>
              <Text style={styles.welcome}>Bienvenue sur</Text>
              <Text style={styles.userName}>Qapril</Text>
              <Text style={styles.instruction}>Veuillez sélectionner votre portail d'accès</Text>
            </View>

            <View style={styles.menu}>
              {[
                { id: 'TENANT', name: 'PORTAIL LOCATAIRE', icon: '🔑', desc: 'Loyers, quittances & score ICL', color: Theme.colors.teal, bg: Theme.colors.tealPale },
                { id: 'LANDLORD', name: 'PORTAIL PROPRIÉTAIRE', icon: '🏠', desc: 'Gestion du patrimoine & wallet', color: Theme.colors.navy, bg: '#E2E8F0' },
                { id: 'DIASPORA', name: 'PORTAIL DIASPORA', icon: '🌍', desc: 'Suivi RCI & virements SEPA', color: '#0E3A8C', bg: '#D0E1FD' },
                { id: 'INTERMEDIAIRE', name: 'PORTAIL INTERMÉDIAIRE', icon: '🤝', desc: 'Mandats, M-EDL & Médiation', color: Theme.colors.orange, bg: Theme.colors.orangePale },
              ].map(p => (
                <TouchableOpacity 
                  key={p.id}
                  activeOpacity={0.8}
                  style={styles.card} 
                  onPress={() => setPortal(p.id as PortalType)}
                >
                  <View style={[styles.iconBox, { backgroundColor: p.bg }]}>
                    <Text style={styles.iconText}>{p.icon}</Text>
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={[styles.cardTitle, { color: Theme.colors.navy }]}>{p.name}</Text>
                    <Text style={styles.cardDesc}>{p.desc}</Text>
                  </View>
                  <View style={styles.arrowBox}>
                    <Text style={{ color: Theme.colors.teal, fontWeight: '900', fontSize: 20 }}>›</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutText}>DÉCONNEXION SÉCURISÉE 🚪</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradBg: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  scroll: { padding: 30, paddingBottom: 50 },
  header: { marginTop: 20, marginBottom: 40 },
  logoBox: { width: 70, height: 70, backgroundColor: '#FFF', borderRadius: 20, padding: 10, marginBottom: 25, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 15, elevation: 10 },
  logo: { width: '100%', height: '100%' },
  welcome: { fontSize: 18, color: 'rgba(255,255,255,0.7)', fontWeight: '700' },
  userName: { fontSize: 32, fontWeight: '900', color: '#FFF', marginTop: 5 },
  instruction: { fontSize: 13, color: Theme.colors.tealPale, marginTop: 10, fontWeight: '600', opacity: 0.8 },
  menu: { gap: 15 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 25, padding: 18, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15, elevation: 5 },
  iconBox: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 26 },
  cardBody: { flex: 1, paddingLeft: 16 },
  cardTitle: { fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },
  cardDesc: { fontSize: 11, color: Theme.colors.textLight, marginTop: 4, fontWeight: '600' },
  arrowBox: { paddingLeft: 10 },
  logoutBtn: { marginTop: 40, alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 30 },
  logoutText: { color: 'rgba(255,255,255,0.5)', fontWeight: '900', fontSize: 12, letterSpacing: 2 },
});
