import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Colors } from '../theme/colors';

import AuthScreen from '../screens/AuthScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import DashboardScreen from '../screens/DashboardScreen';
import DiasporaScreen from '../screens/DiasporaScreen';
import PropertiesScreen from '../screens/PropertiesScreen';
import MaintenanceScreen from '../screens/MaintenanceScreen';

// Nouveaux écrans Parité Web
import WalletScreen from '../screens/WalletScreen';
import CreateLeaseScreen from '../screens/CreateLeaseScreen';
import TenantsScreen from '../screens/TenantsScreen';
import ApplicationsScreen from '../screens/ApplicationsScreen';
import MessageScreen from '../screens/MessageScreen';
import FeatureTeaserScreen from '../screens/FeatureTeaserScreen';
import GenericDataScreen from '../screens/GenericDataScreen';

import CustomBottomTab from '../components/navigation/CustomBottomTab';
import CustomDrawer from '../components/navigation/CustomDrawer';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Menu Inférieur avec Tab Bar Personnalisée
function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomBottomTab {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Contract" component={PropertiesScreen} />
      <Tab.Screen name="Services" component={MaintenanceScreen} />
      <Tab.Screen name="Messages" component={MessageScreen} />
    </Tab.Navigator>
  );
}

// Menu Latéral (Drawer)
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: { width: '85%' },
      }}
    >
      <Drawer.Screen name="MainTab" component={MainTabNavigator} />
      <Drawer.Screen name="Diaspora" component={DiasporaScreen} />
      <Drawer.Screen name="FeatureTeaser" component={FeatureTeaserScreen} />
      <Drawer.Screen name="GenericData" component={GenericDataScreen} />
      <Drawer.Screen name="PropertiesScreen" component={PropertiesScreen} />
      <Drawer.Screen name="Wallet" component={WalletScreen} />
      <Drawer.Screen name="Maintenance" component={MaintenanceScreen} />
      <Drawer.Screen name="Message" component={MessageScreen} />
      <Drawer.Screen name="Tenants" component={TenantsScreen} />
      <Drawer.Screen name="Applications" component={ApplicationsScreen} />
    </Drawer.Navigator>
  );
}

// Navigation Globale
export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="Main" component={DrawerNavigator} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="CreateLease" component={CreateLeaseScreen} />
      <Stack.Screen name="Tenants" component={TenantsScreen} />
      <Stack.Screen name="Applications" component={ApplicationsScreen} />
      <Stack.Screen name="PaymentProcess" component={DashboardScreen} /> 
    </Stack.Navigator>
  );
}
