import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity, StatusBar } from 'react-native';
import { Menu, User, Bell, Wallet, FilePlus, Users, FileText, ArrowUpRight, TrendingUp, Activity } from 'lucide-react-native';
import { API_ENDPOINTS } from '../config/api';
import { Colors } from '../theme/colors';
import RevenueChart from '../components/charts/RevenueChart';

export default function DashboardScreen({ route, navigation }: any) {
  const token = route.params?.token;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = API_ENDPOINTS.DASHBOARD;

  useEffect(() => {
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, role: 'OWNER' })
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

    // Enregistrer le token push si on a un token de session
    if (token) {
      import('../utils/notifications').then(({ registerForPushNotificationsAsync }) => {
        registerForPushNotificationsAsync(token);
      });
    }
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Premium Header */}
      <View style={styles.topHeader}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>Capril Propriétaire</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.profileIcon}
            onPress={() => navigation.navigate('Profile', { token, userProfile: data })}
          >
            {data?.role === 'LANDLORD_PRO' ? (
               <View style={styles.proBadge}><Text style={styles.proBadgeText}>PRO</Text></View>
            ) : (
               <User size={20} color={Colors.primary} />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Bell size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>{data?.greeting || 'Bonjour'}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{data?.pendingRepairs || 0} Alertes</Text>
          </View>
        </View>
        
        {/* ONBOARDING STATE */}
        {data?.onboarding && (
          <View style={styles.onboardingCard}>
             <View style={styles.onboardingIcon}>
               <FilePlus size={32} color={Colors.white} />
             </View>
             <Text style={styles.onboardingTitle}>Bienvenue sur Capril !</Text>
             <Text style={styles.onboardingText}>
               Commencez par ajouter votre premier bien immobilier pour activer votre dashboard et suivre vos revenus.
             </Text>
             <TouchableOpacity 
               style={styles.onboardingBtn}
               onPress={() => navigation.navigate('CreateLease')}
             >
               <Text style={styles.onboardingBtnText}>Démarrer maintenant</Text>
             </TouchableOpacity>
          </View>
        )}

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Revenus Globaux (Taux d'occupation {data?.occupancyRate})</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>{data?.totalRevenue || '0 FCFA'}</Text>
            <View style={styles.trendBadge}>
              <TrendingUp size={14} color={Colors.white} />
              <Text style={styles.trendText}>+12%</Text>
            </View>
          </View>
        </View>

        {/* REVENUE HISTORY CHART */}
        {data?.revenueHistory && <RevenueChart data={data.revenueHistory} />}

        {/* Nouveaux Raccourcis Rapides */}
        <Text style={styles.sectionTitle}>Accès Rapides</Text>
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Wallet', { token, userId: data?.userId })}>
            <View style={[styles.actionIcon, {backgroundColor: Colors.cardColors.cream}]}><Wallet size={20} color={Colors.primary} /></View>
            <Text style={styles.actionText}>Tirelire</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('CreateLease')}>
            <View style={[styles.actionIcon, {backgroundColor: Colors.cardColors.mint}]}><FilePlus size={20} color={Colors.primary} /></View>
            <Text style={styles.actionText}>Créer Bail</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Tenants')}>
            <View style={[styles.actionIcon, {backgroundColor: Colors.cardColors.yellow}]}><Users size={20} color={Colors.primary} /></View>
            <Text style={styles.actionText}>Locataires</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Applications', { token })}>
            <View style={[styles.actionIcon, {backgroundColor: Colors.cardColors.rose}]}><FileText size={20} color={Colors.primary} /></View>
            <Text style={styles.actionText}>Dossiers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Accounting', { token })}>
            <View style={[styles.actionIcon, {backgroundColor: Colors.cardColors.orange}]}><Activity size={20} color={Colors.primary} /></View>
            <Text style={styles.actionText}>Compta</Text>
          </TouchableOpacity>
        </View>
        
        {/* SECTION OBSERVATOIRE (Marché local) */}
        {data?.marketStats && (
          <View style={styles.observatoryContainer}>
            <View style={styles.observatoryHeader}>
              <Text style={styles.sectionTitle}>Analyse du Marché ({data.marketStats.commune})</Text>
              <Activity size={18} color={Colors.primary} />
            </View>
            <View style={styles.observatoryCard}>
              <View style={{flex: 1}}>
                <Text style={styles.obsLabel}>Loyer Moyen (Zone)</Text>
                <Text style={styles.obsValue}>{data.marketStats.avgRent.toLocaleString('fr-FR')} FCFA</Text>
                
                {data.marketStats.marketPositioning !== undefined && (
                  <View style={styles.positioningRow}>
                    <TrendingUp size={12} color={data.marketStats.marketPositioning >= 0 ? Colors.success : Colors.danger} />
                    <Text style={[styles.positioningText, { color: data.marketStats.marketPositioning >= 0 ? Colors.success : Colors.danger }]}>
                      {data.marketStats.marketPositioning > 0 ? `+${data.marketStats.marketPositioning}%` : `${data.marketStats.marketPositioning}%`} par rapport à vos biens
                    </Text>
                  </View>
                )}
              </View>
              <View style={[styles.obsTrend, data.marketStats.trendPct >= 0 ? styles.obsTrendUp : styles.obsTrendDown]}>
                <Text style={styles.obsTrendText}>
                  {data.marketStats.trendPct >= 0 ? '+' : ''}{data.marketStats.trendPct}%
                </Text>
              </View>
            </View>
            <Text style={styles.obsFooter}>Basé sur les baux certifiés de la période {data.marketStats.period}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Mes Biens Immobiliers</Text>
        {data?.properties?.map((prop: any) => (
          <View key={prop.id} style={styles.propertyCard}>
            <View>
              <Text style={styles.propertyName}>{prop.name}</Text>
              <Text style={styles.propertyRent}>{prop.rent}</Text>
            </View>
            <View style={[styles.statusBadge, prop.status === 'Loué' ? styles.statusGreen : styles.statusRed]}>
              <Text style={[styles.statusText, prop.status === 'Loué' ? styles.textGreen : styles.textRed]}>{prop.status}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 24, paddingTop: 10 },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.white,
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 10 },
  greeting: { fontSize: 28, fontWeight: '800', color: Colors.primary },
  badge: { backgroundColor: Colors.cardColors.orange, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText: { color: Colors.primary, fontWeight: '700', fontSize: 12 },
  balanceCard: { backgroundColor: Colors.primary, padding: 24, borderRadius: 24, marginBottom: 32, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 10 },
  balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  balanceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  balanceAmount: { color: Colors.white, fontSize: 32, fontWeight: '900' },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  trendText: { color: Colors.white, fontSize: 12, fontWeight: '800' },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.primary, marginBottom: 16 },
  propertyCard: { backgroundColor: Colors.white, padding: 20, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  propertyName: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  propertyRent: { fontSize: 14, color: Colors.text.muted, marginTop: 4 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusGreen: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  textGreen: { color: Colors.success, fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
  statusRed: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  textRed: { color: Colors.danger, fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
  statusText: { fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
  quickActionsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  actionBtn: { width: '30%', backgroundColor: Colors.white, padding: 12, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  actionIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionText: { fontSize: 11, fontWeight: '800', color: Colors.primary, textAlign: 'center' },
  
  // Styles Observatoire
  observatoryContainer: { marginBottom: 32 },
  observatoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  observatoryCard: { 
    backgroundColor: Colors.white, 
    padding: 18, 
    borderRadius: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 8
  },
  obsLabel: { fontSize: 12, color: Colors.text.muted, fontWeight: '600' },
  obsValue: { fontSize: 20, fontWeight: '900', color: Colors.primary, marginTop: 4 },
  obsTrend: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  obsTrendUp: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  obsTrendDown: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  obsTrendText: { fontSize: 13, fontWeight: '800', color: Colors.primary },
  obsFooter: { fontSize: 10, color: Colors.text.muted, marginTop: 8, fontStyle: 'italic' },
  positioningRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  positioningText: { fontSize: 11, fontWeight: '700' },
  proBadge: { backgroundColor: Colors.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  proBadgeText: { color: Colors.white, fontSize: 10, fontWeight: '900' },

  // Styles Onboarding
  onboardingCard: { 
    backgroundColor: Colors.white, 
    padding: 24, 
    borderRadius: 24, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: Colors.border, 
    marginBottom: 32,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  onboardingIcon: { 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    backgroundColor: Colors.primary, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  onboardingTitle: { fontSize: 20, fontWeight: '900', color: Colors.primary, marginBottom: 8 },
  onboardingText: { fontSize: 14, color: Colors.text.muted, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  onboardingBtn: { backgroundColor: Colors.cardColors.mint, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  onboardingBtnText: { color: Colors.primary, fontWeight: '800', fontSize: 14 }
});
