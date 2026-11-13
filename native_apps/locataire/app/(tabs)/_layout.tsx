import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Home, ShieldCheck, Shield, CreditCard, Search, User, FileText, Wrench, MessageCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { registerForPushNotificationsAsync } from '../../lib/notifications';

/**
 * Navigation Locataire conforme CDC IC-01-R1 (Ticket ML-05) :
 * Barre des 5 onglets : Accueil · Mon bail · Payer · Recherche · Moi
 */
export default function TabLayout() {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    registerForPushNotificationsAsync().catch(() => {});
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EF',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
          shadowRadius: 4,
          height: 58 + Math.max(insets.bottom, 14),
          paddingBottom: Math.max(insets.bottom, 14),
          paddingTop: 6,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarActiveTintColor: '#2C3E6B',
        tabBarInactiveTintColor: '#94A3B8',
      }}
    >
      {/* 1. Accueil */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarAccessibilityLabel: 'Accueil',
          tabBarIcon: ({ color, focused }) => <Home color={color} size={focused ? 22 : 20} strokeWidth={focused ? 2.4 : 1.8} />,
        }}
      />

      {/* 2. Mon bail */}
      <Tabs.Screen
        name="bail"
        options={{
          title: 'Mon bail',
          tabBarAccessibilityLabel: 'Mon bail',
          tabBarIcon: ({ color, focused }) => <ShieldCheck color={color} size={focused ? 22 : 20} strokeWidth={focused ? 2.4 : 1.8} />,
        }}
      />

      {/* 3. Payer */}
      <Tabs.Screen
        name="payer"
        options={{
          title: 'Payer',
          tabBarAccessibilityLabel: 'Payer',
          tabBarIcon: ({ color, focused }) => <CreditCard color={color} size={focused ? 22 : 20} strokeWidth={focused ? 2.4 : 1.8} />,
        }}
      />

      {/* 4. Recherche */}
      <Tabs.Screen
        name="recherche"
        options={{
          title: 'Recherche',
          tabBarAccessibilityLabel: 'Recherche',
          tabBarIcon: ({ color, focused }) => <Search color={color} size={focused ? 22 : 20} strokeWidth={focused ? 2.4 : 1.8} />,
        }}
      />

      {/* 5. Moi */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Moi',
          tabBarAccessibilityLabel: 'Moi',
          tabBarIcon: ({ color, focused }) => <User color={color} size={focused ? 22 : 20} strokeWidth={focused ? 2.4 : 1.8} />,
        }}
      />

      {/* Passeport avec Logotype Shield officiel */}
      <Tabs.Screen
        name="passeport"
        options={{
          title: 'Passeport',
          tabBarAccessibilityLabel: 'Passeport locataire',
          tabBarIcon: ({ color, focused }) => <Shield color={color} size={focused ? 22 : 20} strokeWidth={focused ? 2.4 : 1.8} />,
        }}
      />

      {/* Écrans secondaires masqués de la barre principale mais accessibles via router */}
      <Tabs.Screen
        name="receipts"
        options={{
          href: null,
          title: 'Quittances',
          tabBarIcon: ({ color }) => <FileText color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="maintenance"
        options={{
          href: null,
          title: 'Travaux',
          tabBarIcon: ({ color }) => <Wrench color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          href: null,
          title: 'Messages',
          tabBarIcon: ({ color }) => <MessageCircle color={color} size={20} />,
        }}
      />
    </Tabs>
  );
}
