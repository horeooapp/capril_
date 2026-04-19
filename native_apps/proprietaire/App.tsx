import React, { useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import * as SplashScreen from 'expo-splash-screen';
import { 
  useFonts, 
  Sora_400Regular, 
  Sora_500Medium, 
  Sora_600SemiBold, 
  Sora_700Bold, 
  Sora_800ExtraBold 
} from '@expo-google-fonts/sora';
import { 
  DM_Sans_400Regular, 
  DM_Sans_500Medium, 
  DM_Sans_700Bold 
} from '@expo-google-fonts/dm-sans';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    'Sora_400Regular': Sora_400Regular,
    'Sora_500Medium': Sora_500Medium,
    'Sora_600SemiBold': Sora_600SemiBold,
    'Sora_700Bold': Sora_700Bold,
    'Sora_800ExtraBold': Sora_800ExtraBold,
    'DMSans_400Regular': DM_Sans_400Regular,
    'DMSans_500Medium': DM_Sans_500Medium,
    'DMSans_700Bold': DM_Sans_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
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

