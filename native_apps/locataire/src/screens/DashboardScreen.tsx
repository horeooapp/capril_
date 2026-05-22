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
import { useIsFocused } from '@react-navigation/native';
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
  Clock,
  MessageSquare, 
  MapPin, 
  Download, 
  ArrowRight,
  TrendingUp,
  Store
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { API_ENDPOINTS } from '../config/api';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation, route }: any) {
  const { token } = route.params || {};
  const isFocused = useIsFocused();
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
        // Enforce data consistency for the mobile UI
        const mappedData = {
          ...json.data,
          name: json.data.fullName || json.data.name || 'Locataire'
        };
        setData(mappedData);
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
  }, [API_DASHBOARD, token, isFocused]);

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

  const renderQuickAction = (label: string, emoji: string, onPress: () => void) => (
    <TouchableOpacity style={styles.qaItem} onPress={onPress}>
      <View style={[styles.qaIcon, { backgroundColor: Colors.qOrangeLight }]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <Text style={styles.qaLbl}>{label}</Text>
    </TouchableOpacity>
  );

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
        {/* PUSH THE CIRCLES BEHIND THE HEADER CONTENT */}
        <View style={{position: 'absolute', bottom: -40, right: -30, width: 130, height: 130, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 65}} />
        <View style={{position: 'absolute', top: 10, left: -20, width: 80, height: 80, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 40}} />

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
            <View style={[styles.onlineDot, { backgroundColor: Colors.qGreenMedium }]} />
          </TouchableOpacity>
        </View>

        {/* PAYMENT CARD (In Header) */}
        <View style={styles.lhCard}>
          <Text style={styles.lhAmountLbl}>Loyer en cours</Text>
          <Text style={styles.lhAmount}>
            {data?.totalArrears?.toLocaleString() ?? data?.lease?.rent?.toLocaleString() ?? 0} 
            <Text style={styles.lhAmountCurrency}> FCFA</Text>
          </Text>
          <TouchableOpacity style={styles.lhPayBtn} onPress={handlePayment}>
            <CreditCard size={12} color={Colors.qOrange} />
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
            {renderQuickAction('Quittance', '📄', () => {
              if (data?.lease?.qrToken) {
                const url = `${API_ENDPOINTS.BASE_URL}/v/${data.lease.qrToken}`;
                navigation.navigate('ReceiptView', { url, token });
              } else {
                Alert.alert("Information", "Aucune quittance disponible.");
              }
            })}
            {renderQuickAction('Maintenance', '🛠️', () => navigation.navigate('Services', { token, leaseId: data?.lease?.id }))}
            {renderQuickAction('Mon Bail', '🏠', () => navigation.navigate('Contract', { lease: data?.lease, token }))}
            {renderQuickAction('Marketplace', '🛒', () => navigation.navigate('Marketplace', { token }))}
          </View>

          {/* LANDLORD INFO CARD */}
          {data?.lease?.landlord && (
            <View style={styles.landlordCard}>
              <View style={styles.lcHeader}>
                <Text style={styles.lcTitle}>Mon Propriétaire</Text>
                <View style={[styles.onlineBadge, { backgroundColor: data.lease.landlord.isOnline ? '#4ADE80' : '#94A3B8' }]}>
                  <Text style={styles.onlineText}>{data.lease.landlord.isOnline ? 'En ligne' : 'Hors ligne'}</Text>
                </View>
              </View>
              <View style={styles.lcBody}>
                <View style={styles.lcAvatar}>
                  <Text style={styles.lcAvatarText}>{data.lease.landlord.name.substring(0, 2).toUpperCase()}</Text>
                </View>
                <View style={styles.lcInfo}>
                  <Text style={styles.lcName}>{data.lease.landlord.name}</Text>
                  <Text style={styles.lcPhone}>{data.lease.landlord.phone}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.lcChatBtn}
                  onPress={() => navigation.navigate('Chat', { leaseId: data.lease.id, token, userId: data.userId })}
                >
                  <MessageSquare size={20} color={Colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STATS ROW */}
          <View style={styles.mcRow}>
            <View style={styles.mc}>
              <Text style={styles.emojiSmall}>📅</Text>
              <Text style={styles.mcVal}>{data?.monthsPaidCount ?? 0}</Text>
              <Text style={styles.mcLbl}>Mois payés</Text>
              <View style={[styles.mcBadge, { backgroundColor: Colors.qGreenLight }]}>
                <Text style={styles.mcBadgeText}>à temps</Text>
              </View>
            </View>
            <View style={styles.mc}>
              <Text style={styles.emojiSmall}>⭐</Text>
              <Text style={styles.mcVal}>{data?.reliabilityScore ?? 0} pts</Text>
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
                <Text style={styles.iclStatVal}>{data?.reliabilityScore ?? 0}</Text>
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
          
          {data?.recentReceipts?.length === 0 && (
            <Text style={{textAlign: 'center', color: Colors.text.muted, marginTop: 20}}>
               Aucune activité récente.
            </Text>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
      </View>


    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  
  fixedHeader: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 50,
    paddingHorizontal: 16,
    paddingBottom: 25,
    position: 'relative',
    overflow: 'hidden',
    zIndex: 10,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
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
    borderRadius: 16,
    padding: 14,
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
    fontSize: 22,
    color: Colors.white,
    marginTop: 0,
  },
  lhAmountCurrency: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.bodyMedium,
  },
  lhPayBtn: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 8,
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
    backgroundColor: Colors.qCream,
    marginTop: 0,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 100,
  },

  qaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  qaItem: {
    width: (width - 60) / 4,
    alignItems: 'center',
    gap: 4,
  },

  landlordCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(26, 31, 60, 0.06)',
  },
  lcHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  lcTitle: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 13,
    color: Colors.qNavy,
  },
  onlineBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  onlineText: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: 9,
    color: Colors.white,
  },
  lcBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lcAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.qWarm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lcAvatarText: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 18,
    color: Colors.qNavy,
  },
  lcInfo: {
    flex: 1,
  },
  lcName: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 14,
    color: Colors.qNavy,
  },
  lcPhone: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 11,
    color: Colors.qNavyMedium,
  },
  lcChatBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.qOrange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qaIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: { fontSize: 26 },
  qaLbl: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: 11,
    color: Colors.qNavy,
    textAlign: 'center',
  },

  mcRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  mc: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(26, 31, 60, 0.06)',
  },
  mcVal: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 16,
    color: Colors.qNavy,
    marginTop: 4,
  },
  mcLbl: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 10,
    color: Colors.qNavyMedium,
  },
  mcBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  mcBadgeText: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 8,
    color: Colors.qNavy,
  },
  emojiSmall: { fontSize: 16 },

  iclCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(26, 31, 60, 0.06)',
  },
  iclTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iclTitle: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 13,
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
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  iclBarFill: {
    height: '100%',
    backgroundColor: Colors.qOrange,
    borderRadius: 10,
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
    fontSize: 14,
    color: Colors.qNavy,
  },
  iclStatLbl: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 9,
    color: Colors.qNavyMedium,
  },

  activTitle: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 13,
    color: Colors.qNavy,
    marginBottom: 10,
    marginTop: 5,
  },
  activItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(26, 31, 60, 0.06)',
  },
  aiDot: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiInfo: {
    flex: 1,
    marginLeft: 10,
  },
  aiTitle: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: 11,
    color: Colors.qNavy,
  },
  aiSub: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 10,
    color: Colors.qNavyMedium,
    marginTop: 2,
  },
  aiAmt: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 12,
  }
});
