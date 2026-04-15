import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import AppNavigator from './src/navigation/AppNavigator';

// Empêche l'écran de splash de se cacher automatiquement
SplashScreen.preventAutoHideAsync();

export default function App() {
  useEffect(() => {
    // Force l'affichage pendant 5 secondes
    const timer = setTimeout(async () => {
      await SplashScreen.hideAsync();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
