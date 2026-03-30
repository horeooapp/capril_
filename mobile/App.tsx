import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import WalletScreen from './src/modules/wallet/WalletScreen';
import ProprioScreen from './src/modules/proprio/ProprioScreen';
import DiasporaScreen from './src/modules/diaspora/DiasporaScreen';
import IntermediaireScreen from './src/modules/intermediaire/IntermediaireScreen';
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
    
    // Routage automatique basé sur le rôle reçu du backend
    if (user?.role === 'TENANT') setPortal('TENANT');
    else if (user?.role === 'LANDLORD') setPortal('LANDLORD');
    else if (user?.role === 'DIASPORA') setPortal('DIASPORA');
    else if (user?.role === 'INTERMEDIAIRE') setPortal('INTERMEDIAIRE');
    else setPortal('TENANT'); // Fallback par défaut
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

  // 3. Fallback (Sélection manuelle si le routing a échoué)
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>QAPRIL MOBILE</Text>
        <Text style={styles.sub}>Role non défini. Sélectionnez votre portail</Text>
        
        {[
          { id: 'TENANT', name: 'Locataire', icon: '🔑' },
          { id: 'LANDLORD', name: 'Propriétaire', icon: '🏠' },
          { id: 'DIASPORA', name: 'Diaspora', icon: '🌍' },
          { id: 'INTERMEDIAIRE', name: 'Intermédiaire', icon: '🤝' },
        ].map(p => (
          <TouchableOpacity 
            key={p.id}
            style={[styles.btn, { backgroundColor: Theme.colors.navy }]} 
            onPress={() => setPortal(p.id as PortalType)}
          >
            <Text style={styles.btnText}>Accès {p.name} {p.icon}</Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity style={{ marginTop: 20, padding: 10 }} onPress={handleLogout}>
          <Text style={{ color: Theme.colors.red, fontWeight: 'bold' }}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F5FA',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0D2B6E',
    marginBottom: 8,
  },
  sub: {
    fontSize: 14,
    color: '#6A7D9E',
    marginBottom: 40,
  },
  btn: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  version: {
    position: 'absolute',
    bottom: 20,
    fontSize: 10,
    color: '#8FA0BC',
  }
});
