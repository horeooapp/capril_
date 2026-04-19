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
  Platform,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Bell, 
  Receipt, 
  Settings, 
  ClipboardList, 
  BarChart3, 
  Home, 
  User as UserIcon,
  CreditCard,
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

    if (token) {
      import('../utils/notifications').then(({ registerForPushNotificationsAsync }) => {
        registerForPushNotificationsAsync(token);
      });
    }
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.qOrange} />
      </View>
    );
  }

  const handlePayment = () => {
    if (data?.lease?.id) {
      navigation.navigate('PaymentProcess', { 
        amount: data.totalArrears || data.lease.rent, 
        leaseId: data.lease.id,
        token 
      });
    } else {
      Alert.alert("Information", "Aucun bail actif trouvé pour le paiement.");
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* FIXED HEADER */}
      <LinearGradient
        colors={[Colors.qOrangeDark, Colors.qOrange, Colors.qOrangeMedium]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fixedHeader}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerSubtitle}>Bonjour 👋</Text>
            <Text style={styles.headerTitle}>{data?.name || 'Locataire'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={() => navigation.navigate('Profile', { token, leaseId: data?.lease?.id, userProfile: data })}
          >
            <View style={styles.avatarLabel}>
              <Text style={styles.avatarTextMain}>
                {(data?.name || 'KA').substring(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={[styles.onlineDot, { backgroundColor: Colors.qGreen }]} />
          </TouchableOpacity>
        </View>

        {/* PAYMENT CARD (In Header) */}
        <View style={styles.lhCard}>
          <Text style={styles.lhAmountLbl}>Loyer en cours</Text>
          <Text style={styles.lhAmount}>
            {data?.totalArrears?.toLocaleString() || data?.lease?.rent?.toLocaleString() || '0'} 
            <Text style={styles.lhAmountCurrency}> FCFA</Text>
          </Text>
          <TouchableOpacity style={styles.lhPayBtn} onPress={handlePayment}>
            <CreditCard size={16} color={Colors.qOrange} />
            <Text style={styles.lhPayBtnText}>Payer maintenant</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* SCROLLABLE BODY */}
      <View style={styles.scrollingContentContainer}>
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* QUICK ACTIONS GRID */}
          <View style={styles.qaGrid}>
            <TouchableOpacity style={styles.qaItem} onPress={() => navigation.navigate('History')}>
              <View style={[styles.qaIcon, { backgroundColor: Colors.qOrangeLight }]}>
                <Text style={styles.emoji}>🧾</Text>
              </View>
              <Text style={styles.qaLbl}>Quittances</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.qaItem} onPress={() => navigation.navigate('Services')}>
              <View style={[styles.qaIcon, { backgroundColor: Colors.qGreenLight }]}>
                <Text style={styles.emoji}>🔧</Text>
              </View>
              <Text style={styles.qaLbl}>Maintenance</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.qaItem} onPress={() => navigation.navigate('Contract', { lease: data?.lease })}>
              <View style={[styles.qaIcon, { backgroundColor: Colors.qNavyLight }]}>
                <Text style={styles.emoji}>📋</Text>
              </View>
              <Text style={styles.qaLbl}>Mon bail</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.qaItem} onPress={() => navigation.navigate('Passport')}>
              <View style={[styles.qaIcon, { backgroundColor: Colors.qAmberLight }]}>
                <Text style={styles.emoji}>📊</Text>
              </View>
              <Text style={styles.qaLbl}>Score ICL</Text>
            </TouchableOpacity>
          </View>

          {/* STATS ROW */}
          <View style={styles.mcRow}>
            <View style={styles.mc}>
              <Text style={styles.emojiSmall}>📅</Text>
              <Text style={styles.mcVal}>{data?.monthsPaidCount || '14'}</Text>
              <Text style={styles.mcLbl}>Mois payés</Text>
              <View style={[styles.mcBadge, { backgroundColor: Colors.qGreenLight }]}>
                <Text style={styles.mcBadgeText}>à temps</Text>
              </View>
            </View>
            <View style={styles.mc}>
              <Text style={styles.emojiSmall}>⭐</Text>
              <Text style={styles.mcVal}>{data?.reliabilityScore || '720'} pts</Text>
              <Text style={styles.mcLbl}>Score ICL</Text>
              <View style={[styles.mcBadge, { backgroundColor: Colors.qOrangeLight }]}>
                <Text style={styles.mcBadgeText}>Grade B</Text>
              </View>
            </View>
          </View>

          {/* ICL PASSPORT CARD UPDATED */}
          <View style={styles.iclCard}>
            <View style={styles.iclTop}>
              <Text style={styles.iclTitle}>Passeport locatif</Text>
              <LinearGradient
                colors={[Colors.qOrangeDark, Colors.qOrangeMedium]}
                style={styles.iclGradeBadge}
              >
                <Text style={styles.iclGradeBadgeText}>B</Text>
              </LinearGradient>
            </View>
            <View style={styles.iclBarWrap}>
              <View style={[styles.iclBarFill, { width: '72%' }]} />
            </View>
            <View style={styles.iclStats}>
              <View style={styles.iclStat}>
                <Text style={styles.iclStatVal}>{data?.reliabilityScore || '72'}</Text>
                <Text style={styles.iclStatLbl}>Score</Text>
              </View>
              <View style={styles.iclStat}>
                <Text style={styles.iclStatVal}>100%</Text>
                <Text style={styles.iclStatLbl}>Ponctualité</Text>
              </View>
              <View style={styles.iclStat}>
                <Text style={styles.iclStatVal}>{data?.hasLease ? 'Actif' : 'Inactif'}</Text>
                <Text style={styles.iclStatLbl}>Statut</Text>
              </View>
            </View>
          </View>

          {/* ACTIVITY FEED */}
          <Text style={styles.activTitle}>Activité récente</Text>
          {data?.recentReceipts?.map((receipt: any, idx: number) => (
            <View key={receipt.id || idx} style={styles.activItem}>
              <View style={[styles.aiDot, { backgroundColor: Colors.qGreenLight }]}>
                <CheckCircle size={18} color={Colors.qGreen} />
              </View>
              <View style={styles.aiInfo}>
                <Text style={styles.aiTitle}>Quittance {receipt.period} reçue</Text>
                <Text style={styles.aiSub}>{receipt.ref || 'QAPRIL-CERT'}</Text>
              </View>
              <Text style={[styles.aiAmt, { color: Colors.qGreenDark }]}>+5 pts</Text>
            </View>
          ))}
          
          <View style={styles.activItem}>
            <View style={[styles.aiDot, { backgroundColor: Colors.qOrangeLight }]}>
              <Clock size={18} color={Colors.qOrange} />
            </View>
            <View style={styles.aiInfo}>
              <Text style={styles.aiTitle}>Paiement confirmé</Text>
              <Text style={styles.aiSub}>Orange Money · Aujourd'hui</Text>
            </View>
            <Text style={[styles.aiAmt, { color: Colors.qOrange }]}>DONE</Text>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      {/* FIXED BOTTOM NAV */}
      <View style={styles.bnav}>
        <TouchableOpacity style={styles.bnItem}>
          <Home size={22} color={Colors.qOrange} />
          <Text style={[styles.bnLbl, { color: Colors.qOrange }]}>Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bnItem} onPress={() => navigation.navigate('History')}>
          <Receipt size={22} color={Colors.qNavyMedium} />
          <Text style={styles.bnLbl}>Quittances</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bnFabContainer} onPress={handlePayment}>
          <LinearGradient
            colors={[Colors.qOrange, Colors.qOrangeMedium]}
            style={styles.bnFab}
          >
            <CreditCard size={28} color={Colors.white} />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bnItem} onPress={() => navigation.navigate('Passport')}>
          <BarChart3 size={22} color={Colors.qNavyMedium} />
          <Text style={styles.bnLbl}>Score</Text>
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
    borderWidth: 2,
    borderColor: Colors.qOrange,
  },
  
  lhCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  lhAmountLbl: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  lhAmount: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 26,
    color: Colors.white,
    marginTop: 4,
  },
  lhAmountCurrency: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.bodyMedium,
  },
  lhPayBtn: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  lhPayBtnText: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 13,
    color: Colors.qOrange,
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

  qaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  qaItem: {
    width: (width - 80) / 4,
    alignItems: 'center',
    gap: 6,
  },
  qaIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  emoji: { fontSize: 24 },
  qaLbl: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: 9,
    color: Colors.qNavy,
    textAlign: 'center',
  },

  mcRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  mc: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mcVal: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 18,
    color: Colors.qNavy,
    marginTop: 4,
  },
  mcLbl: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.xs,
    color: Colors.qNavyMedium,
  },
  mcBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  mcBadgeText: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 8,
    color: Colors.qNavy,
  },
  emojiSmall: { fontSize: 16 },

  iclCard: {
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iclTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iclTitle: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 16,
    color: Colors.qNavy,
  },
  iclGradeBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iclGradeBadgeText: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 20,
    color: Colors.white,
  },
  iclBarWrap: {
    height: 10,
    backgroundColor: Colors.qWarm,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 16,
  },
  iclBarFill: {
    height: '100%',
    backgroundColor: Colors.qOrange,
    borderRadius: 5,
  },
  iclStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iclStat: {
    alignItems: 'center',
  },
  iclStatVal: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 15,
    color: Colors.qNavy,
  },
  iclStatLbl: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 10,
    color: Colors.qNavyMedium,
  },

  activTitle: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.fontSize.lg,
    color: Colors.qNavy,
    marginBottom: 12,
  },
  activItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  aiDot: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiInfo: {
    flex: 1,
    marginLeft: 12,
  },
  aiTitle: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: 13,
    color: Colors.qNavy,
  },
  aiSub: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 11,
    color: Colors.qNavyMedium,
    marginTop: 2,
  },
  aiAmt: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 12,
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
    shadowColor: Colors.qOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  }
});
