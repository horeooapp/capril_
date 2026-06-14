import { Tabs, useRouter } from 'expo-router';
import { Home, FileText, PenTool, User, Plus, X, CreditCard, Wrench, MessageCircle } from 'lucide-react-native';
import { View, Pressable, StyleSheet, Modal, Text, Animated as RNAnimated } from 'react-native';
import { useState, useRef, useEffect } from 'react';

// Composant pour le bouton central flottant
const CustomTabBarButton = ({ children, onPress }: any) => (
  <Pressable
    style={{
      top: -20,
      justifyContent: 'center',
      alignItems: 'center',
    }}
    onPress={onPress}
  >
    <View style={styles.fab}>
      {children}
    </View>
  </Pressable>
);

export default function TabLayout() {
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const slideAnim = useRef(new RNAnimated.Value(300)).current;
  const router = useRouter();

  useEffect(() => {
    if (modalVisible) {
      RNAnimated.parallel([
        RNAnimated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        RNAnimated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true })
      ]).start();
    } else {
      RNAnimated.parallel([
        RNAnimated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        RNAnimated.timing(slideAnim, { toValue: 300, duration: 200, useNativeDriver: true })
      ]).start();
    }
  }, [modalVisible]);

  const navigateTo = (route: string) => {
      setModalVisible(false);
      setTimeout(() => router.push(route as any), 300);
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#022c22', // emerald-900
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            height: 60,
            paddingBottom: 10,
            paddingTop: 5,
          },
          tabBarActiveTintColor: '#34d399', // emerald-400
          tabBarInactiveTintColor: '#64748b', // slate-500
          tabBarShowLabel: false, // Cache les labels pour un look plus épuré
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Accueil',
            tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="receipts"
          options={{
            title: 'Quittances',
            tabBarIcon: ({ color, size }) => <FileText color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="action"
          options={{
            title: '',
            tabBarIcon: () => <Plus color="#fff" size={32} />,
            tabBarButton: (props) => (
              <CustomTabBarButton onPress={() => setModalVisible(true)}>
                {props.children}
              </CustomTabBarButton>
            ),
          }}
        />
        <Tabs.Screen
          name="maintenance"
          options={{
            title: 'Signalement',
            tabBarIcon: ({ color, size }) => <PenTool color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'Chat',
            tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profil',
            tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          }}
        />
      </Tabs>

      {/* Modale d'actions rapides (BottomSheet) */}
      {modalVisible && (
        <Modal transparent visible={true} animationType="none" onRequestClose={() => setModalVisible(false)}>
          <RNAnimated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
            <Pressable style={styles.modalBackground} onPress={() => setModalVisible(false)} />
            
            <RNAnimated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Actions rapides</Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <X color="#9ca3af" size={24} />
                </Pressable>
              </View>

              <View style={styles.actionGrid}>
                <Pressable style={styles.actionButton} onPress={() => navigateTo('/(tabs)/receipts')}>
                  <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                    <CreditCard color="#10b981" size={28} />
                  </View>
                  <Text style={styles.actionText}>Payer mon loyer</Text>
                </Pressable>

                <Pressable style={styles.actionButton} onPress={() => navigateTo('/(tabs)/maintenance')}>
                  <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                    <Wrench color="#f59e0b" size={28} />
                  </View>
                  <Text style={styles.actionText}>Faire un signalement</Text>
                </Pressable>
              </View>
            </RNAnimated.View>
          </RNAnimated.View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10B981', // Emerald 500
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#021812', // Match background to simulate cutout
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(2, 24, 18, 0.8)',
  },
  modalBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: '#022c22',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40, // padding pour iPhone X/SafeArea
    borderTopWidth: 1,
    borderColor: '#059669',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  }
});
