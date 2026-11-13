import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ShieldCheck, HelpCircle, Info, LogOut } from 'lucide-react-native';
import { logoutAndRedirect } from '../../lib/api';
import { APP_VERSION, BUILD_NUMBER } from '../../lib/version';

export default function PlusScreen() {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vous déconnecter de votre espace agence ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Me déconnecter',
          style: 'destructive',
          onPress: async () => {
            await logoutAndRedirect(router);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sub}>Administration</Text>
        <Text style={styles.title}>Plus</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <ShieldCheck size={20} color="#1F2A44" />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Agrément Professionnel</Text>
              <Text style={styles.cardSub}>Agence certifiée et agréée par le Ministère de la Construction et du Logement.</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <HelpCircle size={20} color="#1F2A44" />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Aide</Text>
              <Text style={styles.cardSub}>Guide d'utilisation et support technique de la plateforme QAPRIL.</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Info size={20} color="#1F2A44" />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>À propos</Text>
              <Text style={styles.cardSub}>QAPRIL Technologies CI · Version {APP_VERSION} (Build {BUILD_NUMBER})</Text>
            </View>
          </View>
        </View>

        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={18} color="#DC2626" />
          <Text style={styles.logoutBtnText}>Me déconnecter</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  scroll: { padding: 16, paddingBottom: 100 },
  sub: { fontSize: 11, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 24, fontWeight: '900', color: '#1F2A44', marginTop: 2, marginBottom: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E5EE', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#1F2A44' },
  cardSub: { fontSize: 12, color: '#64748B', marginTop: 4, lineHeight: 18 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, backgroundColor: '#FEF2F2', borderRadius: 12, borderWidth: 1, borderColor: '#FEE2E2', marginTop: 20 },
  logoutBtnText: { color: '#DC2626', fontSize: 14, fontWeight: '800' },
});

