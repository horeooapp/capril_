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
  FlatList
} from 'react-native';
import { 
  ChevronLeft, 
  FileText, 
  Activity, 
  Download, 
  Layers, 
  PieChart, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle
} from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Colors } from '../theme/colors';
import RevenueChart from '../components/charts/RevenueChart';

const { width } = Dimensions.get('window');

export default function AccountingScreen({ navigation, route }: any) {
  const { token } = route.params || {};
  const [activeTab, setActiveTab] = useState('BILANS'); // BILANS | QUITTANCES
  const [loading, setLoading] = useState(false);
  
  // Bilan State
  const [bilanData, setBilanData] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Bulk State
  const [bulkStats, setBulkStats] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    if (activeTab === 'BILANS') fetchBilan();
    else fetchBulkStats();
  }, [activeTab, selectedYear, selectedMonth]);

  const fetchBilan = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://qapril-api.com/api/mobile/owner/accounting', { // Updated with real domain if available
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'GET_YEARLY_BILAN', year: selectedYear })
      });
      const data = await res.json();
      if (data.success) setBilanData(data.bilan);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchBulkStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://qapril-api.com/api/mobile/owner/accounting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'GET_BULK_STATS', month: selectedMonth, year: selectedYear })
      });
      const data = await res.json();
      if (data.success) setBulkStats(data.stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBulk = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://qapril-api.com/api/mobile/owner/accounting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'EXECUTE_BULK_QUITTANCES', month: selectedMonth, year: selectedYear })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert("Succès", `${data.results.generatedNow} quittances ont été générées et envoyées.`);
        fetchBulkStats();
      }
    } catch (e) {
      Alert.alert("Erreur", "La génération groupée a échoué.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDFBilan = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://qapril-api.com/api/mobile/owner/accounting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'GENERATE_YEARLY_PDF', year: selectedYear })
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
      Alert.alert("Erreur", "Le téléchargement du PDF a échoué.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comptabilité</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* TABS */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'BILANS' && styles.activeTab]}
          onPress={() => setActiveTab('BILANS')}
        >
          <PieChart size={18} color={activeTab === 'BILANS' ? Colors.white : Colors.primary} />
          <Text style={[styles.tabText, activeTab === 'BILANS' && styles.activeTabText]}>Bilans Annuels</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'QUITTANCES' && styles.activeTab]}
          onPress={() => setActiveTab('QUITTANCES')}
        >
          <Layers size={18} color={activeTab === 'QUITTANCES' ? Colors.white : Colors.primary} />
          <Text style={[styles.tabText, activeTab === 'QUITTANCES' && styles.activeTabText]}>Groupage</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'BILANS' ? (
          <View>
            <YearSelector selectedYear={selectedYear} onSelect={setSelectedYear} />
            
            {loading && !bilanData ? (
                <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
            ) : (
              <>
                {/* BIG METRICS CARD */}
                <View style={styles.bilanHero}>
                  <Text style={styles.heroLabel}>RÉSULTAT NET ANNUEL {selectedYear}</Text>
                  <Text style={styles.heroAmount}>{bilanData?.finalResult.toLocaleString()} FCFA</Text>
                  <View style={styles.heroRow}>
                    <View style={styles.heroBadge}>
                      <ArrowUpCircle size={14} color="#059669" />
                      <Text style={styles.heroBadgeText}>Revenus : {bilanData?.totalIncome.toLocaleString()} F</Text>
                    </View>
                    <View style={[styles.heroBadge, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                      <ArrowDownCircle size={14} color="#DC2626" />
                      <Text style={[styles.heroBadgeText, { color: '#DC2626' }]}>Charges : {bilanData?.totalMaintenance.toLocaleString()} F</Text>
                    </View>
                  </View>
                </View>

                {/* GRAPH DES REVENUS */}
                {bilanData?.monthlyBreakdown && (
                  <RevenueChart 
                    title="Évolution des Revenus"
                    subtitle={`Performance mensuelle pour l'année ${selectedYear}`}
                    data={bilanData.monthlyBreakdown.map((m: any) => ({
                      month: ['Jan', 'Féb', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'][m.month - 1],
                      amount: m.income
                    }))}
                  />
                )}

                {/* TAX ALERT */}
                <View style={styles.infoBox}>
                  <AlertCircle size={20} color={Colors.accent} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.infoTitle}>Provision Fiscale Airsi (7.5%)</Text>
                    <Text style={styles.infoDesc}>
                      Il est estimé que vous devrez régler environ {bilanData?.estimatedTaxAirsi.toLocaleString()} FCFA d'AIRSI à la DGI pour cet exercice.
                    </Text>
                  </View>
                </View>

                {/* INTERACTIVE TABLE */}
                <Text style={styles.sectionTitle}>Performance par Bien</Text>
                <View style={styles.tableCard}>
                  {bilanData?.propertyBreakdown.map((item: any) => (
                    <View key={item.propertyId} style={styles.tableRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemTitle}>{item.propertyName}</Text>
                        <Text style={styles.itemSub}>Revenu total sur l'année</Text>
                      </View>
                      <Text style={styles.itemAmount}>{item.income.toLocaleString()} F</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity style={styles.pdfButton} onPress={downloadPDFBilan} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : (
                    <>
                      <Download size={20} color="#fff" />
                      <Text style={styles.pdfButtonText}>Télécharger le Rapport DGI (PDF)</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        ) : (
          <View>
            <MonthSelector selectedMonth={selectedMonth} onSelect={setSelectedMonth} />
            
            <View style={styles.bulkActionCard}>
              <View style={styles.bulkHeader}>
                <Layers size={32} color={Colors.primary} />
                <Text style={styles.bulkTitle}>Génération Groupée</Text>
              </View>
              <Text style={styles.bulkDesc}>
                Identifiez et envoyez instantanément les quittances manquantes pour tous vos bails actifs.
              </Text>
              
              <View style={styles.statsGrid}>
                <View style={styles.statMini}>
                  <Text style={styles.statMiniVal}>{bulkStats?.totalLeases || 0}</Text>
                  <Text style={styles.statMiniLab}>Total Baux</Text>
                </View>
                <View style={[styles.statMini, { backgroundColor: bulkStats?.missingCount > 0 ? '#FEE2E2' : '#DCFCE7' }]}>
                  <Text style={[styles.statMiniVal, { color: bulkStats?.missingCount > 0 ? '#EF4444' : '#059669' }]}>
                    {bulkStats?.missingCount || 0}
                  </Text>
                  <Text style={styles.statMiniLab}>À Générer</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.mainActionBtn, (!bulkStats || bulkStats.missingCount === 0) && styles.disabledBtn]} 
                onPress={handleGenerateBulk}
                disabled={loading || !bulkStats || bulkStats.missingCount === 0}
              >
                {loading ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <FileText size={20} color="#fff" />
                    <Text style={styles.mainActionBtnText}>
                      {bulkStats?.missingCount > 0 ? `Lancer l'envoi de ${bulkStats.missingCount} quittances` : "Tout est à jour"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.helpBox}>
              <CheckCircle2 size={18} color="#059669" />
              <Text style={styles.helpText}>
                Les locataires recevront leur quittance certifiée automatiquement par WhatsApp et Email.
              </Text>
            </View>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const YearSelector = ({ selectedYear, onSelect }: any) => {
  const years = [2024, 2025, 2026];
  return (
    <View style={styles.selectorContainer}>
      {years.map(y => (
        <TouchableOpacity key={y} style={[styles.selectorItem, selectedYear === y && styles.selectorItemActive]} onPress={() => onSelect(y)}>
          <Text style={[styles.selectorText, selectedYear === y && styles.selectorTextActive]}>{y}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const MonthSelector = ({ selectedMonth, onSelect }: any) => {
  const months = ['Jan', 'Féb', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorContainer}>
      {months.map((m, i) => (
        <TouchableOpacity key={m} style={[styles.selectorItem, selectedMonth === i + 1 && styles.selectorItemActive]} onPress={() => onSelect(i + 1)}>
          <Text style={[styles.selectorText, selectedMonth === i + 1 && styles.selectorTextActive]}>{m}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
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
  
  tabContainer: {
    flexDirection: 'row',
    padding: 6,
    margin: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
    elevation: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  activeTab: { backgroundColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: Colors.text.muted },
  activeTabText: { color: Colors.white, fontWeight: '800' },

  scrollContent: { paddingHorizontal: 16 },

  selectorContainer: { flexDirection: 'row', marginBottom: 20 },
  selectorItem: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 10, marginRight: 8, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border },
  selectorItemActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  selectorText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  selectorTextActive: { color: "#fff" },

  bilanHero: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
  },
  heroLabel: { fontSize: 12, fontWeight: '700', color: Colors.text.muted, letterSpacing: 1 },
  heroAmount: { fontSize: 32, fontWeight: '900', color: Colors.primary, marginVertical: 12 },
  heroRow: { flexDirection: 'row', gap: 10 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(5, 150, 105, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  heroBadgeText: { fontSize: 11, fontWeight: '700', color: '#059669' },

  infoBox: { flexDirection: 'row', backgroundColor: '#FEF3C7', padding: 16, borderRadius: 16, marginBottom: 24, borderLeftWidth: 4, borderLeftColor: '#F59E0B' },
  infoTitle: { fontSize: 14, fontWeight: '800', color: '#92400E' },
  infoDesc: { fontSize: 12, color: '#92400E', marginTop: 4, lineHeight: 18 },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.primary, marginBottom: 12 },
  tableCard: { backgroundColor: Colors.white, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  tableRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.03)' },
  itemTitle: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  itemSub: { fontSize: 11, color: Colors.text.muted, marginTop: 2 },
  itemAmount: { fontSize: 15, fontWeight: '800', color: Colors.primary },

  pdfButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, padding: 18, borderRadius: 18, marginTop: 24, gap: 10 },
  pdfButtonText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  bulkActionCard: { backgroundColor: Colors.white, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: Colors.border },
  bulkHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  bulkTitle: { fontSize: 20, fontWeight: '900', color: Colors.primary },
  bulkDesc: { fontSize: 13, color: Colors.text.muted, lineHeight: 20, marginBottom: 24 },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statMini: { flex: 1, padding: 16, borderRadius: 16, backgroundColor: '#F8FAFC', alignItems: 'center' },
  statMiniVal: { fontSize: 20, fontWeight: '900', color: Colors.primary },
  statMiniLab: { fontSize: 11, color: Colors.text.muted, fontWeight: '700', marginTop: 4 },
  mainActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, padding: 20, borderRadius: 18, gap: 12 },
  mainActionBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  disabledBtn: { backgroundColor: '#E2E8F0' },

  helpBox: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16, paddingHorizontal: 4 },
  helpText: { fontSize: 12, color: '#475569', flex: 1, lineHeight: 18 }
});
