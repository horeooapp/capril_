import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useState, useEffect } from "react";
import { BackHandler, Platform, View, Text, Pressable } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { KeyboardProvider } from "react-native-keyboard-controller";
import * as Updates from "expo-updates";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "../lib/notifications";
import "../global.css";
import { confirmExitApp } from "../components/TopNavHeader";

SplashScreen.preventAutoHideAsync().catch(() => {});

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  const [updating, setUpdating] = useState(false);

  const handleUpdateAndRestart = async () => {
    setUpdating(true);
    try {
      if (!__DEV__) {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
        }
        await Updates.reloadAsync();
        return;
      }
    } catch (e) {
      console.warn('[ErrorBoundary] Échec de la mise à jour:', e);
    } finally {
      setUpdating(false);
    }
    retry();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Text style={{ color: '#EF4444', fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>
        Une interruption est survenue
      </Text>
      <Text style={{ color: '#94A3B8', fontSize: 13, textAlign: 'center', marginBottom: 24, lineHeight: 18 }}>
        {error?.message || 'Impossible de charger l\'écran d\'accueil. Veuillez relancer l\'application.'}
      </Text>
      <Pressable
        onPress={handleUpdateAndRestart}
        disabled={updating}
        style={{ backgroundColor: '#1E7E4E', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, minWidth: 200, alignItems: 'center', marginBottom: 12 }}
      >
        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
          {updating ? 'Mise à jour en cours...' : 'Relancer l\'application'}
        </Text>
      </Pressable>
      <Pressable
        onPress={retry}
        style={{ paddingHorizontal: 16, paddingVertical: 8 }}
      >
        <Text style={{ color: '#64748B', fontSize: 12 }}>Réessayer sans recharger</Text>
      </Pressable>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    async function checkAppUpdates() {
      if (__DEV__ || !Updates.isEnabled) return;
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (e) {
        // En cas d'absence de réseau ou d'erreur, continuer normalement
      }
    }
    checkAppUpdates();

    // Enregistrement push notifications & synchronisation du jeton
    registerForPushNotificationsAsync().catch((err) => {
      console.log('[Push] Enregistrement initial ignoré:', err);
    });

    // Écouteur de clic sur notification pour navigation contextuelle
    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      try {
        const data = response?.notification?.request?.content?.data;
        if (!data) return;

        if (data.type === 'LEASE_SIGNATURE' || data.type === 'LEASE_CONFIRMED' || data.leaseId) {
          router.push('/(tabs)/baux' as any);
        } else if (data.type === 'chat' || data.type === 'NOUVEAU_MESSAGE_BAIL') {
          router.push('/(tabs)/chat' as any);
        } else if (data.type === 'payment' || data.type === 'PAYMENT_CONFIRMATION') {
          router.push('/(tabs)/finance' as any);
        } else if (data.type === 'APP_UPDATE' || data.type === 'MAJ_DISPONIBLE') {
          Updates.reloadAsync().catch(() => {});
        }
      } catch (navErr) {
        console.warn('[Push] Erreur navigation push:', navErr);
      }
    });

    const timeout = setTimeout(async () => {
      await SplashScreen.hideAsync().catch(() => {});
    }, 400);

    return () => {
      clearTimeout(timeout);
      responseListener.remove();
    };
  }, [router]);

  // Interception du bouton retour Android pour demander confirmation avant de quitter
  useEffect(() => {
    if (Platform.OS !== "android") return;

    const onBackPress = () => {
      if (router.canGoBack()) {
        router.back();
        return true;
      }
      confirmExitApp();
      return true;
    };

    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => sub.remove();
  }, [router]);

  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ title: "Accueil" }} />
          <Stack.Screen name="onboarding" options={{ title: "Présentation", gestureEnabled: false }} />
          <Stack.Screen name="login" options={{ title: "Connexion", gestureEnabled: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="create-property" options={{ title: "Nouveau Bien", presentation: "modal" }} />
          <Stack.Screen name="create-lease" options={{ title: "Nouveau Bail", presentation: "modal" }} />
        </Stack>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
