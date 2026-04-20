import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { Colors } from '../theme/colors';
import { LogOut } from 'lucide-react-native';

import AuthScreen from '../screens/AuthScreen';
import DashboardScreen from '../screens/DashboardScreen';
import EmergencyServicesScreen from '../screens/EmergencyServicesScreen';
import ContractScreen from '../screens/ContractScreen';
import MessageScreen from '../screens/MessageScreen';
import PaymentProcessScreen from '../screens/PaymentProcessScreen';
import ReceiptViewScreen from '../screens/ReceiptView';
import CustomBottomTab from '../components/navigation/CustomBottomTab';
import SideMenuHeader from '../components/navigation/SideMenuHeader';
import { useNotifications } from '../hooks/useNotifications';
import ScanBillScreen from '../screens/ScanBillScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PassportScreen from '../screens/PassportScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Menu Inférieur avec Tab Bar Personnalisée
function MainTabNavigator({ route }: any) {
  const token = route.params?.token;
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomBottomTab {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} initialParams={{ token }} />
      <Tab.Screen name="Contract" component={ContractScreen} initialParams={{ token }} />
      <Tab.Screen name="Passport" component={PassportScreen} initialParams={{ token }} />
      <Tab.Screen name="Profile" component={ProfileScreen} initialParams={{ token }} />
    </Tab.Navigator>
  );
}

// Custom Drawer Content pour le Locataire
function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView {...props} style={{ flex: 1 }}>
      <SideMenuHeader />
      <DrawerItemList {...props} />
      <DrawerItem 
        label="Déconnexion" 
        labelStyle={{ color: '#ef4444', fontWeight: 'bold' }}
        icon={({ color, size }) => <LogOut color="#ef4444" size={size} />}
        onPress={() => props.navigation.reset({ index: 0, routes: [{ name: 'Auth' }] })} 
        style={{ marginTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' }}
      />
    </DrawerContentScrollView>
  );
}

// Menu Latéral (Drawer)
function DrawerNavigator({ route }: any) {
  const token = route.params?.token;
  
  // Initialize Push Notifications
  useNotifications(token);

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: Colors.primary,
          width: 280,
        },
        drawerActiveTintColor: Colors.accent,
        drawerInactiveTintColor: Colors.white,
      }}
    >
      <Drawer.Screen 
        name="MainTab" 
        component={MainTabNavigator} 
        initialParams={{ token }}
        options={{ title: 'Accueil' }}
      />
      <Drawer.Screen 
        name="Contract" 
        component={ContractScreen} 
        initialParams={{ token }}
        options={{ title: 'Mon Contrat' }}
      />
      <Drawer.Screen 
        name="Messages" 
        component={MessageScreen} 
        initialParams={{ token }}
        options={{ title: 'Messagerie' }}
      />
      <Drawer.Screen 
        name="Passport" 
        component={PassportScreen} 
        initialParams={{ token }}
        options={{ title: 'Mon Passeport' }}
      />
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen} 
        initialParams={{ token }}
        options={{ title: 'Mon Profil' }}
      />
    </Drawer.Navigator>
  );
}

// Navigation Globale
export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="Main" component={DrawerNavigator} />
      <Stack.Screen name="PaymentProcess" component={PaymentProcessScreen} />
      <Stack.Screen name="ReceiptView" component={ReceiptViewScreen} />
      <Stack.Screen name="ScanBill" component={ScanBillScreen} />
      <Stack.Screen name="Passport" component={PassportScreen} />
    </Stack.Navigator>
  );
}
