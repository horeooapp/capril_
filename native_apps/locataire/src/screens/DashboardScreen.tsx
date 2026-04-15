import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity,
  StatusBar,
  Alert,
  Linking
} from 'react-native';
import { Colors } from '../theme/colors';
import { 
  Menu, 
  User, 
  Bell, 
  ShieldCheck, 
  CreditCard, 
  ClipboardList, 
  AlertCircle, 
  FileText 
} from 'lucide-react-native';
import DashboardCard from '../components/dashboard/DashboardCard';
import { API_ENDPOINTS } from '../config/api';

export default function DashboardScreen({ navigation, route }: any) {
  const { token } = route.params || {};
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Accueil');

  const API_DASHBOARD = API_ENDPOINTS.DASHBOARD;

  useEffect(() => {
    fetch(API_DASHBOARD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, role: 'TENANT' })
    })
      .then(res => res.json())
      .then(json => {
        setData(json.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const tabs = ['Accueil', 'Loyer', 'Contrat'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.headerIcon}>
          <Menu size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Capril Connect</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.profileIcon}>
            <User size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Bell size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Tableau de Bord Immobilier</Text>
            <Text style={styles.heroSubtitle}>
              Suivez vos paiements, vos quittances et vos demandes d'intervention en temps réel.
            </Text>
          </View>
          <View style={styles.heroIconContainer}>
            <ShieldCheck size={40} color={Colors.accent} />
          </View>
        </View>

        {/* Segmented Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map(tab => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Ma Situation</Text>

        {/* Card Grid */}
        <View style={styles.grid}>
          <DashboardCard
            title="Loyer"
            status={data?.balanceDue || 'À jour'}
            subStatus={data?.totalArrears > 0 ? `${data.totalArrears.toLocaleString()} FCFA impayés` : (data?.recentReceipts?.[0] ? `Dernier : ${new Date(data.recentReceipts[0].paidAt).toLocaleDateString('fr-FR')}` : "Aucun paiement enregistré")}
            icon={<CreditCard size={28} color="#059669" />}
            backgroundColor={Colors.cardColors.mint}
            onPress={() => {
              if (data?.lease?.id) {
                navigation.navigate('PaymentProcess', { 
                  amount: data.totalArrears || data.lease.rent, 
                  leaseId: data.lease.id,
                  token 
                });
              } else {
                Alert.alert("Information", "Aucun bail actif trouvé pour le paiement.");
              }
            }}
          />
          <DashboardCard
            title="Quittances"
            status={`${data?.recentReceipts?.length || 0} Disponibles`}
            subStatus={data?.recentReceipts?.[0] ? `Dernière : ${data.recentReceipts[0].period}` : "Aucune quittance"}
            icon={<FileText size={28} color="#D97706" />}
            backgroundColor={Colors.cardColors.cream}
            onPress={() => {
              if (data?.recentReceipts?.[0]?.qrToken) {
                Linking.openURL(`https://qapril.app/v/${data.recentReceipts[0].qrToken}`);
              } else {
                Alert.alert("Information", "Vous n'avez pas encore de quittances certifiées.");
              }
            }}
          />
          <DashboardCard
            title="Incidents"
            status={`${data?.activeRequests || 0} En cours`}
            subStatus={data?.activeRequests > 0 ? "Vos tickets en traitement" : "Aucun incident signalé"}
            icon={<AlertCircle size={28} color="#DB2777" />}
            backgroundColor={Colors.cardColors.rose}
            onPress={() => navigation.navigate('Services')}
          />
          <DashboardCard
            title="Mon Bail"
            status={data?.hasLease ? "Actif" : "Inactif"}
            subStatus={data?.lease?.ref || "NON RENSEIGNÉ"}
            icon={<ClipboardList size={28} color="#4F46E5" />}
            backgroundColor={Colors.cardColors.yellow}
            onPress={() => navigation.navigate('Contract', { lease: data?.lease })}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  scrollContainer: { padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.background,
  },
  headerIcon: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  heroCard: {
    backgroundColor: Colors.primary,
    borderRadius: 32,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  heroContent: {
    flex: 1,
    paddingRight: 10,
  },
  heroTitle: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    lineHeight: 18,
  },
  heroIconContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 6,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: Colors.background,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.muted,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  }
});
