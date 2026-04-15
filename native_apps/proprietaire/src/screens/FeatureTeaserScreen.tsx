import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { ChevronLeft, Construction, Clock, Sparkles } from 'lucide-react-native';

export default function FeatureTeaserScreen({ route, navigation }: any) {
  const featureName = route.params?.featureName || 'Module Premium';
  const iconName = route.params?.iconName || 'Sparkles';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color="#064E3B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{featureName}</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.iconWrapper}>
           <Sparkles size={64} color="#064E3B" />
           <View style={styles.badge}>
             <Clock size={16} color="#ffffff" />
           </View>
        </View>

        <Text style={styles.title}>Arrive très prochainement !</Text>
        <Text style={styles.subtitle}>
          Nos experts Qapril travaillent actuellement à l'intégration légale et fonctionnelle 
          du module <Text style={styles.highlight}>"{featureName}"</Text> pour propulser votre expérience de gestion locative.
        </Text>

        <View style={styles.infoCard}>
          <Construction size={24} color="#D97706" style={{ marginBottom: 12 }} />
          <Text style={styles.infoText}>
            Soyez parmi les premiers notifiés dès le déploiement sur les serveurs de production.
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('MainTab')}>
          <Text style={styles.buttonText}>Retour au Tableau de Bord</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3f4f6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    padding: 8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginRight: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#f3f4f6'
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#064E3B',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  highlight: {
    fontWeight: '800',
    color: '#111827',
  },
  infoCard: {
    backgroundColor: '#fef3c7',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  infoText: {
    color: '#b45309',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#064E3B',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  }
});
