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
import { Key, Home, Globe, Handshake, ChevronRight } from 'lucide-react-native';

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
      const [token] = await Promise.all([
        SecureStore.getItemAsync('qapril_token'),
        new Promise(resolve => setTimeout(resolve, 2500)) // 2.5 seconds artificial delay
      ]);
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

  // 1. Loading State
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: Theme.colors.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.splashLogoBox}>
           <Image source={require('./assets/icon.png')} style={styles.splashLogo} resizeMode="contain" />
        </View>
        <Text style={styles.splashBrand}>QAPRIL</Text>
        <ActivityIndicator size="small" color={Theme.colors.navyDark} style={{ marginTop: 30 }} />
      </View>
    );
  }

  // 2. Authenticated but portal chosen -> Direct Access
  if (isAuthenticated && portal !== null) {
    if (portal === 'TENANT') return <WalletScreen onBack={() => setPortal(null)} />;
    if (portal === 'LANDLORD') return <ProprioScreen onBack={() => setPortal(null)} />;
    if (portal === 'DIASPORA') return <DiasporaScreen onBack={() => setPortal(null)} />;
    if (portal === 'INTERMEDIAIRE') return <IntermediaireScreen onBack={() => setPortal(null)} />;
  }

  // 3. Portal chosen but NOT authenticated -> Auth Screen
  if (portal !== null && !isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} onCancel={() => setPortal(null)} />;
  }

  // 4. No portal chosen -> Show Menu
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={Theme.gradients.institutional} style={styles.gradBg}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.header}>
              <View style={styles.logoBox}>
                <Image source={require('./assets/icon.png')} style={styles.logo} resizeMode="contain" />
              </View>
              <Text style={styles.welcome}>Portail Officiel</Text>
              <Text style={styles.userName}>QAPRIL</Text>
              <Text style={styles.instruction}>Veuillez sélectionner votre session certifiée</Text>
            </View>

            <View style={styles.menu}>
              {[
                { id: 'TENANT', name: 'PORTAIL LOCATAIRE', Icon: Key, desc: 'Loyers, quittances & score ICL', color: Theme.colors.navyDark, bg: Theme.colors.greenPale, iconColor: Theme.colors.green },
                { id: 'LANDLORD', name: 'PORTAIL PROPRIÉTAIRE', Icon: Home, desc: 'Gestion du patrimoine & wallet', color: Theme.colors.navyDark, bg: Theme.colors.navyPale, iconColor: Theme.colors.navyDark },
                { id: 'DIASPORA', name: 'PORTAIL DIASPORA', Icon: Globe, desc: 'Suivi RCI & virements SEPA', color: Theme.colors.navyDark, bg: Theme.colors.grey1, iconColor: Theme.colors.diaspora },
                { id: 'INTERMEDIAIRE', name: 'PORTAIL INTERMÉDIAIRE', Icon: Handshake, desc: 'Mandats, M-EDL & Médiation', color: Theme.colors.navyDark, bg: Theme.colors.orangePale, iconColor: Theme.colors.orange },
              ].map(p => (
                <TouchableOpacity 
                  key={p.id}
                  activeOpacity={0.8}
                  style={styles.card} 
                  onPress={() => setPortal(p.id as PortalType)}
                >
                  <View style={[styles.iconBox, { backgroundColor: p.bg }]}>
                    <p.Icon size={24} color={p.iconColor} strokeWidth={2.5} />
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={[styles.cardTitle, { color: p.color }]}>{p.name}</Text>
                    <Text style={styles.cardDesc}>{p.desc}</Text>
                  </View>
                  <View style={styles.arrowBox}>
                    <ChevronRight size={20} color={Theme.colors.navy} strokeWidth={3} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {isAuthenticated && (
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                  <Text style={styles.logoutText}>DÉCONNEXION SÉCURISÉE 🚪</Text>
                </TouchableOpacity>
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradBg: { flex: 1 },
  splashLogoBox: { width: 120, height: 120, backgroundColor: '#FFF', borderRadius: 30, padding: 15, marginBottom: 20, ...Theme.shadows.lg },
  splashLogo: { width: '100%', height: '100%' },
  splashBrand: { fontSize: 28, fontWeight: '900', color: Theme.colors.navyDark, letterSpacing: 1.5 },
  scroll: { padding: 30, paddingBottom: 50 },
  header: { marginTop: 20, marginBottom: 40 },
  logoBox: { width: 70, height: 70, backgroundColor: '#FFF', borderRadius: 20, padding: 10, marginBottom: 25, ...Theme.shadows.md },
  logo: { width: '100%', height: '100%' },
  welcome: { fontSize: 13, color: Theme.colors.orange, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' },
  userName: { fontSize: 40, fontWeight: '900', color: Theme.colors.navyDark, marginTop: 5, letterSpacing: -1 },
  instruction: { fontSize: 12, color: Theme.colors.textLight, marginTop: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  menu: { gap: 15 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18, borderWidth: 1, borderColor: Theme.colors.grey1, ...Theme.shadows.md },
  iconBox: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, paddingLeft: 16 },
  cardTitle: { fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },
  cardDesc: { fontSize: 11, color: Theme.colors.textLight, marginTop: 4, fontWeight: '600' },
  arrowBox: { paddingLeft: 10 },
  logoutBtn: { marginTop: 40, alignItems: 'center', borderTopWidth: 1, borderTopColor: Theme.colors.grey1, paddingTop: 30 },
  logoutText: { color: Theme.colors.textLight, fontWeight: '900', fontSize: 10, letterSpacing: 2 },
});
