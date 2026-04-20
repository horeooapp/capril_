import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Dimensions,
  Image
} from 'react-native';
import { 
  ChevronLeft, 
  ShieldCheck, 
  Award, 
  Download, 
  Share2, 
  CheckCircle2, 
  Info, 
  History,
  Lock,
  Star
} from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Colors } from '../theme/colors';
import { BASE_URL } from '../config/api';

const { width } = Dimensions.get('window');

export default function PassportScreen({ navigation, route }: any) {
  const { token } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [passport, setPassport] = useState<any>(null);
  const [tenantName, setTenantName] = useState('');

  useEffect(() => {
    fetchPassport();
  }, []);

  const fetchPassport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/mobile/tenant/passport`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'GET_PASSPORT' })
      });
      const data = await res.json();
      if (data.success) {
        setPassport(data.passport);
        setTenantName(data.tenantName);
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Erreur", "Impossible de charger votre passeport.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/mobile/tenant/passport`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'DOWNLOAD_PDF' })
      });
      const data = await res.json();
      if (data.success) {
        // @ts-ignore
        const fileUri = `${FileSystem.documentDirectory}${data.fileName}`;
        // @ts-ignore
        await FileSystem.writeAsStringAsync(fileUri, data.pdfBase64, { encoding: FileSystem.EncodingType.Base64 });
        await Sharing.shareAsync(fileUri);
      }
    } catch (e) {
      Alert.alert("Erreur", "La génération du PDF a échoué.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !passport) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'A+': return '#D97706'; // Gold
      case 'A': return '#6B7280'; // Silver
      case 'B': return '#92400E'; // Bronze
      default: return Colors.primary;
    }
  };

  const scoreValue = passport?.scoreGlobal || 0;
  const badge = passport?.scoreGlobal >= 850 ? 'A+' : passport?.scoreGlobal >= 750 ? 'A' : 'B';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Passeport Locatif</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* SCORE SECTION */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreCircle}>
             <Text style={styles.scoreText}>{scoreValue}</Text>
             <Text style={styles.scoreLabel}>Score ICL</Text>
          </View>
          
          <View style={[styles.badgeContainer, { backgroundColor: getBadgeColor(badge) }]}>
            <Award size={16} color="#fff" />
            <Text style={styles.badgeText}>GRADE {badge}</Text>
          </View>

          <Text style={styles.tenantName}>{tenantName}</Text>
          <Text style={styles.passportRef}>ID: {passport?.refPasseport}</Text>
        </View>

        {/* METRICS BREAKDOWN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analyse de Fiabilité</Text>
          
          <View style={styles.metricItem}>
            <View style={[styles.metricIcon, { backgroundColor: '#DCFCE7' }]}>
              <CheckCircle2 size={20} color="#059669" />
            </View>
            <View style={styles.metricContent}>
              <Text style={styles.metricLabel}>Ponctualité (12 mois)</Text>
              <Text style={styles.metricValue}>{passport?.tauxPaiementGlobal}% de paiements à temps</Text>
            </View>
          </View>

          <View style={styles.metricItem}>
            <View style={[styles.metricIcon, { backgroundColor: '#DBEAFE' }]}>
              <History size={20} color="#2563EB" />
            </View>
            <View style={styles.metricContent}>
              <Text style={styles.metricLabel}>Stabilité Locative</Text>
              <Text style={styles.metricValue}>{passport?.nbBailsInclus} Contrat(s) enregistré(s)</Text>
            </View>
          </View>

          <View style={styles.metricItem}>
            <View style={[styles.metricIcon, { backgroundColor: '#FEF3C7' }]}>
              <ShieldCheck size={20} color="#D97706" />
            </View>
            <View style={styles.metricContent}>
              <Text style={styles.metricLabel}>Profil Vérifié (KYC)</Text>
              <Text style={styles.metricValue}>Niveau 2 - Identité Certifiée</Text>
            </View>
          </View>
        </View>

        {/* INFO BOX */}
        <View style={styles.infoBox}>
          <Info size={20} color={Colors.primary} />
          <Text style={styles.infoText}>
            Ce score est mis à jour périodiquement selon vos interactions avec la plateforme. Un score élevé facilite vos futures locations.
          </Text>
        </View>

        {/* OWNER VISIBILITY OPTION */}
        <View style={styles.privacyCard}>
            <Lock size={20} color={Colors.text.muted} />
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.privacyTitle}>Visibilité Propriétaire</Text>
                <Text style={styles.privacyDesc}>Votre bailleur actuel peut consulter votre profil de fiabilité.</Text>
            </View>
        </View>

        {/* ACTION BUTTON */}
        <TouchableOpacity style={styles.premiumButton} onPress={handleDownload} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Download size={20} color="#fff" />
              <Text style={styles.premiumButtonText}>Générer mon Certificat PDF</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: { padding: 8, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 12 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  
  scrollContent: { padding: 20 },

  scoreCard: {
    backgroundColor: Colors.white,
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    marginBottom: 24,
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    borderColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginBottom: 20,
  },
  scoreText: { fontSize: 42, fontWeight: '900', color: Colors.primary },
  scoreLabel: { fontSize: 12, fontWeight: '700', color: Colors.text.muted, marginTop: -4 },
  
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    marginBottom: 16,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  
  tenantName: { fontSize: 20, fontWeight: '800', color: Colors.primary },
  passportRef: { fontSize: 12, color: Colors.text.muted, marginTop: 4, letterSpacing: 1 },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.primary, marginBottom: 16 },
  
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  metricContent: { flex: 1, marginLeft: 16 },
  metricLabel: { fontSize: 11, fontWeight: '800', color: Colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  metricValue: { fontSize: 14, fontWeight: '700', color: Colors.primary, marginTop: 2 },

  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(6, 78, 59, 0.05)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoText: { flex: 1, fontSize: 12, color: Colors.text.muted, lineHeight: 18 },

  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  privacyTitle: { fontSize: 14, fontWeight: '800', color: Colors.text.dark },
  privacyDesc: { fontSize: 11, color: Colors.text.muted, marginTop: 2 },

  premiumButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    elevation: 4,
  },
  premiumButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' }
});
