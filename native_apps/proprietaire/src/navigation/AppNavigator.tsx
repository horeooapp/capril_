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
function MainTabNavigator({ route }: any) {
  const token = route.params?.token;
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomBottomTab {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} initialParams={{ token }} />
      <Tab.Screen name="Contract" component={PropertiesScreen} initialParams={{ token }} />
      <Tab.Screen name="Services" component={MaintenanceScreen} initialParams={{ token }} />
      <Tab.Screen name="Messages" component={MessageScreen} initialParams={{ token }} />
    </Tab.Navigator>
  );
}

// Menu Latéral (Drawer)
function DrawerNavigator({ route }: any) {
  const token = route.params?.token;
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} token={token} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: { width: '85%' },
      }}
    >
      <Drawer.Screen name="MainTab" component={MainTabNavigator} initialParams={{ token }} />
      <Drawer.Screen name="Diaspora" component={DiasporaScreen} initialParams={{ token }} />
      <Drawer.Screen name="FeatureTeaser" component={FeatureTeaserScreen} initialParams={{ token }} />
      <Drawer.Screen name="GenericData" component={GenericDataScreen} initialParams={{ token }} />
      <Drawer.Screen name="PropertiesScreen" component={PropertiesScreen} initialParams={{ token }} />
      <Drawer.Screen name="Wallet" component={WalletScreen} initialParams={{ token }} />
      <Drawer.Screen name="Maintenance" component={MaintenanceScreen} initialParams={{ token }} />
      <Drawer.Screen name="Message" component={MessageScreen} initialParams={{ token }} />
      <Drawer.Screen name="Tenants" component={TenantsScreen} initialParams={{ token }} />
      <Drawer.Screen name="CreateLease" component={CreateLeaseScreen} initialParams={{ token }} />
      <Drawer.Screen name="Applications" component={ApplicationsScreen} initialParams={{ token }} />
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
