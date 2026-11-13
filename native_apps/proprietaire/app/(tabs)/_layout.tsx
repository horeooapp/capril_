import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Home, Building2, FileText, Wallet, MoreHorizontal, MessageCircle, Wrench, Globe } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { registerForPushNotificationsAsync } from '../../lib/notifications';

/**
 * Navigation Propriétaire conforme CDC IC-01-R1 (Ticket MB-03) :
 * Barre des 5 onglets : Accueil · Biens · Baux · Flux · Plus
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
          borderTopColor: '#E4E0D7',
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
        tabBarActiveTintColor: '#1B4D3E',
        tabBarInactiveTintColor: '#9CA3AF',
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

      {/* 2. Biens */}
      <Tabs.Screen
        name="properties"
        options={{
          title: 'Biens',
          tabBarAccessibilityLabel: 'Biens',
          tabBarIcon: ({ color, focused }) => <Building2 color={color} size={focused ? 22 : 20} strokeWidth={focused ? 2.4 : 1.8} />,
        }}
      />

      {/* 3. Baux */}
      <Tabs.Screen
        name="baux"
        options={{
          title: 'Baux',
          tabBarAccessibilityLabel: 'Baux',
          tabBarIcon: ({ color, focused }) => <FileText color={color} size={focused ? 22 : 20} strokeWidth={focused ? 2.4 : 1.8} />,
        }}
      />

      {/* 4. Flux */}
      <Tabs.Screen
        name="finance"
        options={{
          title: 'Flux',
          tabBarAccessibilityLabel: 'Flux',
          tabBarIcon: ({ color, focused }) => <Wallet color={color} size={focused ? 22 : 20} strokeWidth={focused ? 2.4 : 1.8} />,
        }}
      />

      {/* 5. Plus */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Plus',
          tabBarAccessibilityLabel: 'Plus',
          tabBarIcon: ({ color, focused }) => <MoreHorizontal color={color} size={focused ? 22 : 20} strokeWidth={focused ? 2.4 : 1.8} />,
        }}
      />

      {/* Diaspora avec Logotype Globe officiel */}
      <Tabs.Screen
        name="diaspora"
        options={{
          title: 'Diaspora',
          tabBarAccessibilityLabel: 'Espace Diaspora',
          tabBarIcon: ({ color, focused }) => <Globe color={color} size={focused ? 22 : 20} strokeWidth={focused ? 2.4 : 1.8} />,
        }}
      />

      {/* Écrans secondaires */}
      <Tabs.Screen
        name="chat"
        options={{
          href: null,
          title: 'Messages',
          tabBarIcon: ({ color }) => <MessageCircle color={color} size={20} />,
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
    </Tabs>
  );
}
