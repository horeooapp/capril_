import { Tabs } from 'expo-router';
import { Home, Building2, Users, UserCheck, MoreHorizontal } from 'lucide-react-native';

/**
 * Navigation Agence conforme CDC IC-01-R1 (Ticket MA-03) :
 * Barre des 5 onglets : Accueil · Portefeuille · Mandants · Candidats · Plus
 */
export default function AgenceTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          borderTopWidth: 1,
          borderTopColor: '#E2E5EE',
          elevation: 0,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#1F2A44',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
      }}
    >
      {/* 1. Accueil */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, focused }) => <Home color={color} size={focused ? 22 : 20} strokeWidth={focused ? 2.4 : 1.8} />,
        }}
      />

      {/* 2. Portefeuille */}
      <Tabs.Screen
        name="portefeuille"
        options={{
          title: 'Portefeuille',
          tabBarIcon: ({ color, focused }) => <Building2 color={color} size={focused ? 22 : 20} strokeWidth={focused ? 2.4 : 1.8} />,
        }}
      />

      {/* 3. Mandants */}
      <Tabs.Screen
        name="mandants"
        options={{
          title: 'Mandants',
          tabBarIcon: ({ color, focused }) => <Users color={color} size={focused ? 22 : 20} strokeWidth={focused ? 2.4 : 1.8} />,
        }}
      />

      {/* 4. Candidats */}
      <Tabs.Screen
        name="candidats"
        options={{
          title: 'Candidats',
          tabBarIcon: ({ color, focused }) => <UserCheck color={color} size={focused ? 22 : 20} strokeWidth={focused ? 2.4 : 1.8} />,
        }}
      />

      {/* 5. Plus */}
      <Tabs.Screen
        name="plus"
        options={{
          title: 'Plus',
          tabBarIcon: ({ color, focused }) => <MoreHorizontal color={color} size={focused ? 22 : 20} strokeWidth={focused ? 2.4 : 1.8} />,
        }}
      />
    </Tabs>
  );
}
