import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserCheck } from 'lucide-react-native';

export default function CandidatsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sub}>Dossiers Locataires</Text>
        <Text style={styles.title}>Candidats</Text>

        <View style={styles.cardEmpty}>
          <UserCheck size={40} color="#64748B" />
          <Text style={styles.emptyTitle}>Candidatures reçues</Text>
          <Text style={styles.emptyText}>
            Consultez les candidatures certifiées avec tranches de confiance A–D et badges de paiement régulier.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  scroll: { padding: 16, paddingBottom: 100 },
  sub: { fontSize: 11, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 24, fontWeight: '900', color: '#1F2A44', marginTop: 2, marginBottom: 16 },
  cardEmpty: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#E2E5EE', marginTop: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#1F2A44', marginTop: 12 },
  emptyText: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 8, lineHeight: 20 },
});

