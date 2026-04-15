import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Colors } from '../theme/colors';

import AuthScreen from '../screens/AuthScreen';
import DashboardScreen from '../screens/DashboardScreen';
import EmergencyServicesScreen from '../screens/EmergencyServicesScreen';
import ContractScreen from '../screens/ContractScreen';
import MessageScreen from '../screens/MessageScreen';
import PaymentProcessScreen from '../screens/PaymentProcessScreen';
import CustomBottomTab from '../components/navigation/CustomBottomTab';
import SideMenuHeader from '../components/navigation/SideMenuHeader';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Menu Inférieur avec Tab Bar Personnalisée
function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomBottomTab {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Contract" component={ContractScreen} />
      <Tab.Screen name="Services" component={EmergencyServicesScreen} />
      <Tab.Screen name="Messages" component={MessageScreen} />
    </Tab.Navigator>
  );
}

// Menu Latéral (Drawer)
function DrawerNavigator() {
  return (
    <Drawer.Navigator
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
        options={{ title: 'Accueil' }}
      />
      <Drawer.Screen 
        name="Contract" 
        component={ContractScreen} 
        options={{ title: 'Mon Contrat' }}
      />
      <Drawer.Screen 
        name="Messages" 
        component={MessageScreen} 
        options={{ title: 'Messagerie' }}
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
    </Stack.Navigator>
  );
}
