import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ChevronLeft, Globe, Briefcase, PhoneCall, FileText } from 'lucide-react-native';

export default function DiasporaScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color="#064E3B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Diaspora & Investissement</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.banner}>
          <Globe size={40} color="#FFF000" />
          <Text style={styles.bannerTitle}>Pack Sérénité Diaspora</Text>
          <Text style={styles.bannerText}>
            Gérez vos projets immobiliers depuis la diaspora en toute sécurité et transparence.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Services exclusifs</Text>

        <View style={styles.grid}>
          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.iconWrap, { backgroundColor: '#e0e7ff' }]}>
               <Briefcase size={24} color="#4f46e5" />
            </View>
            <Text style={styles.actionTitle}>Mandat de gestion</Text>
            <Text style={styles.actionDesc}>Souscrire en ligne</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.iconWrap, { backgroundColor: '#fef3c7' }]}>
               <FileText size={24} color="#d97706" />
            </View>
            <Text style={styles.actionTitle}>Suivi de chantier</Text>
            <Text style={styles.actionDesc}>Rapports photos Hebdo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contactCard}>
           <Text style={styles.contactTitle}>Un conseiller Dédié</Text>
           <Text style={styles.contactText}>Vous avez une question sur la fiscalité locale ou un projet d'achat de terrain ?</Text>
           <TouchableOpacity style={styles.callBtn}>
              <PhoneCall size={18} color="#fff" />
              <Text style={styles.callText}>Contacter l'Expert Diaspora</Text>
           </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3f4f6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#064E3B',
  },
  container: { padding: 16 },
  banner: {
    backgroundColor: '#064E3B',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  bannerTitle: { color: '#FFF', fontSize: 22, fontWeight: '900', marginTop: 12, marginBottom: 8 },
  bannerText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 22 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 16 },
  grid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  actionCard: {
    flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 16,
    elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4
  },
  iconWrap: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  actionTitle: { fontSize: 14, fontWeight: '800', color: '#1f2937', marginBottom: 4 },
  actionDesc: { fontSize: 12, color: '#6b7280' },
  contactCard: {
    backgroundColor: '#fff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb'
  },
  contactTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 8 },
  contactText: { fontSize: 14, color: '#4b5563', lineHeight: 20, marginBottom: 16 },
  callBtn: {
    backgroundColor: '#064E3B', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 48, borderRadius: 12, gap: 10
  },
  callText: { color: '#fff', fontWeight: '800', fontSize: 14 }
});
