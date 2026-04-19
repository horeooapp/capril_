import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Plus, 
  Home, 
  Building2, 
  BarChart3, 
  User, 
  TrendingUp, 
  CheckCircle,
  Clock
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { API_ENDPOINTS } from '../config/api';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation, route }: any) {
  const { token } = route.params || {};
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const API_DASHBOARD = API_ENDPOINTS.DASHBOARD;

  useEffect(() => {
    fetch(API_DASHBOARD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, role: 'LANDLORD' })
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
        <ActivityIndicator size="large" color={Colors.qGreen} />
      </View>
    );
  }

  const renderBien = (item: any, index: number) => {
    const isImpaye = item.status?.toLowerCase().includes('impay') || item.statut?.toLowerCase().includes('impay');
    const isLoue = item.status === 'Loué' || item.statut === 'Loué';
    
    return (
      <TouchableOpacity key={item.id || index} style={styles.bienCard}>
        <View style={styles.bcTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bcAddr}>{item.name || item.ref || item.nom}</Text>
            <Text style={styles.bcType}>{item.type || 'Appartement'}</Text>
          </View>
          <View style={[
            styles.bcStatus, 
            { backgroundColor: isImpaye ? Colors.qCoralLight : (isLoue ? Colors.qGreenLight : Colors.qWarm) }
          ]}>
            <Text style={[
              styles.bcStatusText, 
              { color: isImpaye ? Colors.qCoral : (isLoue ? Colors.qGreenDark : Colors.qNavyMedium) }
            ]}>
              {item.status || item.statut || 'Vacant'}
            </Text>
          </View>
        </View>
        
        <View style={styles.bcBottom}>
          <View style={styles.bcTenant}>
            <View style={[styles.bcAvatarSm, { backgroundColor: Colors.qNavyLight }]}>
              <Text style={styles.bcAvatarText}>
                {(item.tenantName || '..').substring(0,2).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.bcTenantName}>{item.tenantName || 'Aucun locataire'}</Text>
          </View>
          <Text style={[styles.bcAmt, { color: Colors.qNavy }]}>
            {item.rent?.toLocaleString() ?? item.loyer?.toLocaleString() ?? '0'} <Text style={{fontSize: 10}}>F</Text>
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* FIXED HEADER */}
      <LinearGradient
        colors={[Colors.qGreenDark, Colors.qGreen, Colors.qGreenMedium]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fixedHeader}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerSubtitle}>Tableau de bord</Text>
            <Text style={styles.headerTitle}>{data?.name || data?.userName || 'Propriétaire'}</Text>
          </View>
          <TouchableOpacity style={styles.avatarContainer} onPress={() => navigation.navigate('Profile', { token })}>
            <View style={styles.avatarLabel}>
              <Text style={styles.avatarTextMain}>
                {(data?.name || 'OI').substring(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={styles.onlineDot} />
          </TouchableOpacity>
        </View>

        {/* TOP STATS */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{data?.stats?.total_biens ?? data?.properties?.length ?? 0}</Text>
            <Text style={styles.statLbl}>Biens</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{data?.stats?.loues ?? data?.properties?.filter((p:any)=>p.status==='Loué').length ?? 0}</Text>
            <Text style={styles.statLbl}>Loués</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{data?.stats?.vacants ?? data?.properties?.filter((p:any)=>p.status==='Vacant').length ?? 0}</Text>
            <Text style={styles.statLbl}>Vacant</Text>
          </View>
        </View>
      </LinearGradient>

      {/* SCROLLABLE CONTENT */}
      <View style={styles.scrollingContentContainer}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* REVENUE CARD */}
          <LinearGradient
            colors={[Colors.qNavy, Colors.qNavyDark]}
            style={styles.revCard}
          >
            <View style={styles.revHeader}>
              <Text style={styles.revTitle}>Revenus · {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</Text>
              <TrendingUp size={20} color={Colors.qGreen} />
            </View>
            
            <Text style={styles.revAmount}>
              {data?.total_revenue?.toLocaleString() ?? data?.totalRevenue?.toLocaleString() ?? 0} 
            <Text style={{fontSize: 14, fontFamily: Typography.fontFamily.bodyMedium}}> FCFA</Text>
            </Text>
            
            <Text style={styles.revSub}>
              {data?.stats?.payments_count ?? 0} loyers perçus sur {data?.stats?.expected_count ?? 0} attendus
            </Text>

            <View style={styles.revPills}>
              <View style={[styles.revPill, styles.revPillSuccess]}>
                <Text style={styles.revPillText}>+12% vs mois dernier</Text>
              </View>
              {data?.pendingRepairs > 0 && (
                <View style={[styles.revPill, styles.revPillDanger]}>
                  <Text style={styles.revPillText}>{data.pendingRepairs} réparations</Text>
                </View>
              )}
            </View>
          </LinearGradient>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mes biens</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Tout voir</Text>
            </TouchableOpacity>
          </View>

          {/* BIENS LIST */}
          {(data?.mes_biens || data?.properties)?.map((item: any, index: number) => renderBien(item, index))}

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      <View style={{ height: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  
  fixedHeader: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 50,
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  headerSubtitle: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 22,
    color: Colors.white,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarLabel: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarTextMain: {
    fontFamily: Typography.fontFamily.heading,
    color: Colors.white,
    fontSize: 14,
  },
  onlineDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.qCoral,
    borderWidth: 2,
    borderColor: Colors.qGreenDark,
  },

  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statVal: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 18,
    color: Colors.white,
  },
  statLbl: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },

  scrollingContentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },

  revCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.qNavy,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  revHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  revTitle: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  revAmount: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 28,
    color: Colors.white,
  },
  revCurrency: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: 16,
  },
  revSub: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
  },
  revPills: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  revPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
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
    zIndex: 20,
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
