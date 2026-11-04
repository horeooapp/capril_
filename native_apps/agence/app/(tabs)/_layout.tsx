import { Tabs } from 'expo-router';
import { LayoutDashboard, Building2, FileText, Wallet, User } from 'lucide-react-native';

export default function AgenceTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          borderTopWidth: 1,
          borderTopColor: '#E2E5EE',
          elevation: 0,
          height: 68,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#1F2A44',
        tabBarInactiveTintColor: '#666D80',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Agence agréée',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

