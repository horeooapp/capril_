import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import WalletScreen from './src/modules/wallet/WalletScreen';
import ProprioScreen from './src/modules/proprio/ProprioScreen';
import AgencyScreen from './src/modules/agency/AgencyScreen';
import DiasporaScreen from './src/modules/diaspora/DiasporaScreen';
import IntermediaireScreen from './src/modules/intermediaire/IntermediaireScreen';
import { Theme } from './src/theme/theme';

const { width } = Dimensions.get('window');

export default function App() {
  const [portal, setPortal] = useState<'TENANT' | 'LANDLORD' | 'AGENCE' | 'DIASPORA' | 'INTERMEDIAIRE' | null>(null);

  const portals = [
    { id: 'TENANT', name: 'Locataire', icon: '🔑', desc: 'Gestion de bail & paiements' },
    { id: 'LANDLORD', name: 'Propriétaire', icon: '🏠', desc: 'Suivi patrimoine & revenus' },
    { id: 'AGENCE', name: 'Agence', icon: '🏢', desc: 'Gestion de portefeuille' },
    { id: 'DIASPORA', name: 'Diaspora', icon: '🌍', desc: 'Investisseur étranger' },
    { id: 'INTERMEDIAIRE', name: 'Intermédiaire', icon: '🤝', desc: 'Apporteur affaires' },
  ];

  if (portal === 'TENANT') return <WalletScreen onBack={() => setPortal(null)} />;
  if (portal === 'LANDLORD') return <ProprioScreen onBack={() => setPortal(null)} />;
  if (portal === 'AGENCE') return <AgencyScreen onBack={() => setPortal(null)} />;
  if (portal === 'DIASPORA') return <DiasporaScreen onBack={() => setPortal(null)} />;
  if (portal === 'INTERMEDIAIRE') return <IntermediaireScreen onBack={() => setPortal(null)} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>QAPRIL MOBILE</Text>
        <Text style={styles.sub}>Sélectionnez votre portail</Text>
        
        {portals.map(p => (
          <TouchableOpacity 
            key={p.id}
            style={[styles.btn, { backgroundColor: p.id === 'TENANT' ? Theme.colors.navy : p.id === 'LANDLORD' ? Theme.colors.gold : p.id === 'AGENCE' ? Theme.colors.teal : p.id === 'DIASPORA' ? Theme.colors.diaspora : Theme.colors.orange }]} 
            onPress={() => setPortal(p.id as any)}
          >
            <Text style={styles.btnText}>Accès {p.name} {p.icon}</Text>
          </TouchableOpacity>
        ))}
        
        <Text style={styles.version}>v0.2.0-alpha · QAPRIL Technologies</Text>
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
