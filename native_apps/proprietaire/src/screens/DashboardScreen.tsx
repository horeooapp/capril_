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
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Bell, 
  TrendingUp, 
  Activity, 
  Plus, 
  Home, 
  Users, 
  BarChart3, 
  User as UserIcon,
  ChevronRight
} from 'lucide-react-native';
import { API_ENDPOINTS } from '../config/api';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import RevenueChart from '../components/charts/RevenueChart';

const { width } = Dimensions.get('window');

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

    if (token) {
      import('../utils/notifications').then(({ registerForPushNotificationsAsync }) => {
        registerForPushNotificationsAsync(token);
      });
    }
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.qGreen} />
      </View>
    );
  }

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'loué':
      case 'loue':
        return Colors.status.loue;
      case 'impayé':
      case 'impaye':
        return Colors.status.impaye;
      case 'vacant':
        return Colors.status.vacant;
      default:
        return { bg: Colors.qNavyLight, text: Colors.qNavyMedium };
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* PRO HEADER */}
        <LinearGradient
          colors={[Colors.qGreenDark, Colors.qGreen, Colors.qGreenMedium]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.proHeader}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerGreeting}>Tableau de bord</Text>
              <Text style={styles.headerName}>{data?.name || data?.userName || 'Chargement...'}</Text>
            </View>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={() => navigation.navigate('Profile', { token, userProfile: data })}
            >
              <View style={styles.avatarLabel}>
                <Text style={styles.avatarText}>
                  {(data?.name || 'User').substring(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={[styles.notifDot, { backgroundColor: Colors.qCoral }]} />
            </TouchableOpacity>
          </View>

          {/* QUICK STATS */}
          <View style={styles.phStats}>
            <View style={styles.phStat}>
              <Text style={styles.phStatVal}>{data?.properties?.length || 0}</Text>
              <Text style={styles.phStatLbl}>Biens</Text>
            </View>
            <View style={styles.phStat}>
              <Text style={styles.phStatVal}>
                {data?.properties?.filter((p: any) => p.status.toLowerCase().includes('lou')).length || 0}
              </Text>
              <Text style={styles.phStatLbl}>Loués</Text>
            </View>
            <View style={styles.phStat}>
              <Text style={styles.phStatVal}>
                {data?.properties?.filter((p: any) => p.status.toLowerCase().includes('vacant')).length || 0}
              </Text>
              <Text style={styles.phStatLbl}>Vacants</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.contentBody}>
          {/* REVENUE CARD */}
          <LinearGradient
            colors={[Colors.qNavy, Colors.qNavyMedium]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.revCard}
          >
            <Text style={styles.revLbl}>Revenus · {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</Text>
            <Text style={styles.revAmount}>{data?.totalRevenue || '0 FCFA'}</Text>
            <Text style={styles.revSub}>Taux d'occupation : {data?.occupancyRate || '0%'}</Text>
            
            <View style={styles.revPills}>
              <View style={[styles.revPill, styles.revPillSuccess]}>
                <Text style={styles.revPillText}>+12% vs mois dernier</Text>
              </View>
              {data?.pendingRepairs > 0 && (
                <View style={[styles.revPill, styles.revPillDanger]}>
                  <Text style={styles.revPillText}>{data.pendingRepairs} alertes</Text>
                </View>
              )}
            </View>
          </LinearGradient>

          {/* REVENUE CHART */}
          {data?.revenueHistory && (
            <View style={styles.chartSection}>
              <Text style={styles.sectionTitle}>Evolution des revenus</Text>
              <RevenueChart data={data.revenueHistory} />
            </View>
          )}

          {/* PROPERTY LIST */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mes biens immobiliers</Text>
            <TouchableOpacity onPress={() => navigation.navigate('CreateLease')}>
              <Text style={styles.seeAll}>Ajouter</Text>
            </TouchableOpacity>
          </View>

          {data?.properties?.map((prop: any) => {
            const statusStyle = getStatusStyle(prop.status);
            return (
              <TouchableOpacity key={prop.id} style={styles.bienCard}>
                <View style={styles.bcTop}>
                  <View>
                    <Text style={styles.bcAddr}>{prop.name}</Text>
                    <Text style={styles.bcType}>{prop.type || 'Appartement'}</Text>
                  </View>
                  <View style={[styles.bcStatus, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.bcStatusText, { color: statusStyle.text }]}>
                      {prop.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.bcBottom}>
                  <View style={styles.bcTenant}>
                    <View style={[styles.bcAvatarSm, { backgroundColor: Colors.qGreenLight }]}>
                      <Text style={[styles.bcAvatarText, { color: Colors.qGreenDark }]}>
                        {prop.tenantName?.substring(0, 2).toUpperCase() || '??'}
                      </Text>
                    </View>
                    <Text style={styles.bcTenantName}>{prop.tenantName || 'Pas de locataire'}</Text>
                  </View>
                  <Text style={[styles.bcAmt, { color: statusStyle.text }]}>
                    {prop.rent}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* BOTTOM NAV MOCKUP (Since we are on a screen) */}
      <View style={styles.bnav}>
        <TouchableOpacity style={styles.bnItem}>
          <Home size={22} color={Colors.qGreen} />
          <Text style={[styles.bnLbl, { color: Colors.qGreen }]}>Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bnItem} onPress={() => navigation.navigate('Tenants')}>
          <Users size={22} color={Colors.qNavyMedium} />
          <Text style={styles.bnLbl}>Locataires</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bnFabContainer} onPress={() => navigation.navigate('CreateLease')}>
          <LinearGradient
            colors={[Colors.qGreenDark, Colors.qGreenMedium]}
            style={styles.bnFab}
          >
            <Plus size={28} color={Colors.white} />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bnItem} onPress={() => navigation.navigate('Accounting')}>
          <BarChart3 size={22} color={Colors.qNavyMedium} />
          <Text style={styles.bnLbl}>Compta</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bnItem} onPress={() => navigation.navigate('Profile', { token })}>
          <UserIcon size={22} color={Colors.qNavyMedium} />
          <Text style={styles.bnLbl}>Profil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  
  proHeader: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerGreeting: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  headerName: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 20,
    color: Colors.white,
    marginTop: 2,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarLabel: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 14,
    color: Colors.white,
  },
  notifDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: Colors.qGreen,
  },
  
  phStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  phStat: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  phStatVal: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 18,
    color: Colors.white,
  },
  phStatLbl: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.xs,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },

  contentBody: {
    paddingHorizontal: 16,
    marginTop: -25,
  },
  
  revCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    elevation: 8,
    shadowColor: Colors.qNavy,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  revLbl: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  revAmount: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 28,
    color: Colors.white,
    marginVertical: 8,
  },
  revSub: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255,255,255,0.5)',
  },
  revPills: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  revPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  revPillSuccess: {
    backgroundColor: 'rgba(77, 201, 160, 0.2)',
    borderColor: 'rgba(77, 201, 160, 0.3)',
  },
  revPillDanger: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  revPillText: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: 10,
    color: Colors.white,
  },

  chartSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.fontSize.lg,
    color: Colors.qNavy,
  },
  seeAll: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.qGreen,
  },

  bienCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bcTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bcAddr: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 15,
    color: Colors.qNavy,
  },
  bcType: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 12,
    color: Colors.qNavyMedium,
    marginTop: 2,
  },
  bcStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bcStatusText: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 10,
  },
  bcBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  bcTenant: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bcAvatarSm: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bcAvatarText: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 9,
  },
  bcTenantName: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.qNavyMedium,
  },
  bcAmt: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 14,
  },

  bnav: {
    position: 'absolute',
    bottom: 0,
    width: width,
    height: 80,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(26, 31, 60, 0.05)',
  },
  bnItem: {
    alignItems: 'center',
    gap: 4,
  },
  bnLbl: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: 9,
    color: Colors.qNavyMedium,
  },
  bnFabContainer: {
    marginTop: -40,
  },
  bnFab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: Colors.qGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  }
});

