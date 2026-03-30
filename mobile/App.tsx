import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, SafeAreaView, Dimensions, StatusBar, Image } from 'react-native';
import WalletScreen from './src/modules/wallet/WalletScreen';
import ProprioScreen from './src/modules/proprio/ProprioScreen';
import DiasporaScreen from './src/modules/diaspora/DiasporaScreen';
import IntermediaireScreen from './src/modules/intermediaire/IntermediaireScreen';
import AgencyScreen from './src/modules/agency/AgencyScreen';
import AuthScreen from './src/modules/auth/AuthScreen';
import { Theme } from './src/theme/theme';

const { width } = Dimensions.get('window');

type PortalType = 'TENANT' | 'LANDLORD' | 'AGENCE' | 'DIASPORA' | 'INTERMEDIAIRE';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [portal, setPortal] = useState<PortalType | null>(null);

  const handleLogin = (user: any) => {
    setUserProfile(user);
    setIsAuthenticated(true);
    // Manual routing disabled to allow user choice (MM-01)
    setPortal(null); 
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserProfile(null);
    setPortal(null);
  };

  // 1. Si non authentifié
  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  // 2. Écrans spécifiques aux rôles (avec fonction déconnexion)
  if (portal === 'TENANT') return <WalletScreen onBack={handleLogout} />;
  if (portal === 'LANDLORD') return <ProprioScreen onBack={handleLogout} />;
  if (portal === 'DIASPORA') return <DiasporaScreen onBack={handleLogout} />;
  if (portal === 'INTERMEDIAIRE') return <IntermediaireScreen onBack={handleLogout} />;
  if (portal === 'AGENCE') return <AgencyScreen onBack={handleLogout} />;

  // 3. Fallback (Sélection manuelle / Espace Bienvenue)
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <View style={styles.header}>
          <Image 
            source={require('./assets/logo-qapril.png')} 
            style={{ width: 80, height: 80, marginBottom: 20 }} 
            resizeMode="contain"
          />
          <Text style={styles.title}>Qapril</Text>
          <View style={styles.titleUnderline} />
          <Text style={styles.sub}>Choisissez votre espace d'accès QAPRIL</Text>
        </View>
        
        <View style={styles.grid}>
          {[
            { id: 'TENANT', name: 'Locataire', icon: '🔑', desc: 'Vos baux, quittances & score ICL' },
            { id: 'LANDLORD', name: 'Propriétaire', icon: '🏠', desc: 'Gestion de vos biens & revenus' },
            { id: 'AGENCE', name: 'Agence', icon: '🏢', desc: 'Gestion mandats & recouvrement' },
            { id: 'DIASPORA', name: 'Diaspora', icon: '🌍', desc: 'Suivi de vos projets à distance' },
            { id: 'INTERMEDIAIRE', name: 'Intermédiaire', icon: '🤝', desc: 'Supervision & mandats' },
          ].map(p => (
            <TouchableOpacity 
              key={p.id}
              activeOpacity={0.7}
              style={styles.card} 
              onPress={() => setPortal(p.id as PortalType)}
            >
              <View style={styles.cardIconBox}>
                <Text style={styles.cardIcon}>{p.icon}</Text>
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{p.name}</Text>
                <Text style={styles.cardDesc}>{p.desc}</Text>
              </View>
              <Text style={styles.cardArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Se déconnecter 🚪</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: Theme.colors.navy,
    letterSpacing: 2,
  },
  titleUnderline: {
    width: 60,
    height: 4,
    backgroundColor: Theme.colors.teal,
    marginTop: 8,
    borderRadius: 2,
  },
  sub: {
    fontSize: 14,
    color: Theme.colors.textLight,
    marginTop: 16,
    fontWeight: '600',
    opacity: 0.8,
  },
  grid: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    shadowColor: '#0D2B6E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIcon: {
    fontSize: 24,
  },
  cardText: {
    flex: 1,
    paddingLeft: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Theme.colors.navy,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 11,
    color: '#8FA0BC',
    fontWeight: '600',
  },
  cardArrow: {
    fontSize: 24,
    color: Theme.colors.teal,
    opacity: 0.4,
    paddingLeft: 10,
  },
  logoutBtn: {
    marginTop: 'auto',
    marginBottom: 40,
    alignItems: 'center',
    paddingVertical: 12,
  },
  logoutText: {
    color: Theme.colors.red,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
