import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { BackHandler, Platform } from 'react-native';
import { confirmExitApp } from '../components/TopNavHeader';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const onBackPress = () => {
      if (router.canGoBack()) {
        router.back();
        return true;
      }
      confirmExitApp();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [router]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
