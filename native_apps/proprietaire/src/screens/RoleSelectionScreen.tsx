import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronRight, Building, Key, Globe } from 'lucide-react-native';

export default function RoleSelectionScreen({ route, navigation }: any) {
  const token = route.params?.token;

  const selectRole = (roleType: string) => {
    // Dans une version plus avancée, on pourrait sauvegarder ce type dans le backend
    // ou adapter le Dashboard. Pour le MVP, on passe le rôle dans les paramètres et on lance Main.
    navigation.replace('Main', { token, selectedProfile: roleType });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Bienvenue !</Text>
        <Text style={styles.subtitle}>Sélectionnez votre profil d'utilisation pour démarrer.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => selectRole('PROPRIETAIRE')}
        >
          <View style={styles.iconContainer}>
            <Building size={28} color="#064E3B" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Propriétaire Bailleur</Text>
            <Text style={styles.cardDesc}>Je gère directement mon patrimoine immobilier et mes locataires.</Text>
          </View>
          <ChevronRight size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          onPress={() => selectRole('INTERMEDIAIRE')}
        >
          <View style={styles.iconContainer}>
            <Key size={28} color="#064E3B" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Intermédiaire Immobilier</Text>
            <Text style={styles.cardDesc}>Je suis une agence ou un courtier en charge de la gestion déléguée.</Text>
          </View>
          <ChevronRight size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          onPress={() => selectRole('DIASPORA')}
        >
          <View style={styles.iconContainer}>
            <Globe size={28} color="#064E3B" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Espace Diaspora</Text>
            <Text style={styles.cardDesc}>J'investis et je suis mon patrimoine depuis l'étranger.</Text>
          </View>
          <ChevronRight size={20} color="#9ca3af" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#064E3B' }, // Vert Premium Qapril
  header: { padding: 24, marginTop: 40, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '900', color: '#ffffff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#ffedd5', fontWeight: '500', lineHeight: 24 },
  container: { paddingHorizontal: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  textContainer: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 4 },
  cardDesc: { fontSize: 13, color: '#6b7280', lineHeight: 18 }
});
