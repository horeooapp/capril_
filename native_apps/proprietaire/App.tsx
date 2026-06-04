import 'react-native-gesture-handler';
import React, { useEffect, useCallback } from 'react';
import { View, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';
import { 
  useFonts, 
  Sora_400Regular, 
  Sora_500Medium, 
  Sora_600SemiBold, 
  Sora_700Bold, 
  Sora_800ExtraBold 
} from '@expo-google-fonts/sora';
import { 
  DMSans_400Regular, 
  DMSans_500Medium, 
  DMSans_700Bold 
} from '@expo-google-fonts/dm-sans';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'Sora_400Regular': Sora_400Regular,
    'Sora_500Medium': Sora_500Medium,
    'Sora_600SemiBold': Sora_600SemiBold,
    'Sora_700Bold': Sora_700Bold,
    'Sora_800ExtraBold': Sora_800ExtraBold,
    'DMSans_400Regular': DMSans_400Regular,
    'DMSans_500Medium': DMSans_500Medium,
    'DMSans_700Bold': DMSans_700Bold,
  });

  useEffect(() => {
    // Safety timeout to ensure splash hides even if fonts fail or hang indefinitely
    const timeout = setTimeout(async () => {
      await SplashScreen.hideAsync().catch(() => {});
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    async function checkAutomaticUpdates() {
      if (__DEV__) return;
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          Alert.alert(
            "Mise à jour installée",
            "Une nouvelle mise à jour de l'application a été installée. L'application va redémarrer pour l'appliquer.",
            [
              { 
                text: "Redémarrer", 
                onPress: async () => {
                  await Updates.reloadAsync();
                } 
              }
            ],
            { cancelable: false }
          );
        }
      } catch (error) {
        console.warn("Erreur de mise à jour automatique :", error);
      }
    }

    const delayTimer = setTimeout(() => {
      checkAutomaticUpdates();
    }, 2000);

    return () => clearTimeout(delayTimer);
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }


  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </View>
  );
}

