import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Home, Building2, Wallet, MessageCircle, User, Wrench } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { registerForPushNotificationsAsync } from '../../lib/notifications';

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
          fontWeight: '600',
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
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarAccessibilityLabel: 'Accueil',
          tabBarIcon: ({ color, focused }) => <Home color={color} size={focused ? 22 : 20} strokeWidth={focused ? 2.4 : 1.8} />,
        }}
      />
      <Tabs.Screen
        name="properties"
        options={{
          title: 'Biens',
          tabBarAccessibilityLabel: 'Biens',
          tabBarIcon: ({ color, focused }) => <Building2 color={color} size={focused ? 22 : 20} strokeWidth={focused ? 2.4 : 1.8} />,
        }}
      />
      <Tabs.Screen
        name="maintenance"
        options={{
          href: null,
          title: 'Travaux',
          tabBarAccessibilityLabel: 'Signalements',
          tabBarIcon: ({ color, focused }) => <Wrench color={color} size={focused ? 22 : 20} strokeWidth={focused ? 2.4 : 1.8} />,
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: 'Finances',
          tabBarAccessibilityLabel: 'Finances',
          tabBarIcon: ({ color, focused }) => <Wallet color={color} size={focused ? 22 : 20} strokeWidth={focused ? 2.4 : 1.8} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Messages',
          tabBarAccessibilityLabel: 'Messages',
          tabBarIcon: ({ color, focused }) => <MessageCircle color={color} size={focused ? 22 : 20} strokeWidth={focused ? 2.4 : 1.8} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarAccessibilityLabel: 'Profil',
          tabBarIcon: ({ color, focused }) => <User color={color} size={focused ? 22 : 20} strokeWidth={focused ? 2.4 : 1.8} />,
        }}
      />
    </Tabs>
  );
}
