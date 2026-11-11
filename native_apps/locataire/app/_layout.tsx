import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { BackHandler, Platform, View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Updates from "expo-updates";
import "../global.css";
import { confirmExitApp } from "../components/TopNavHeader";

SplashScreen.preventAutoHideAsync().catch(() => {});

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Text style={{ color: '#EF4444', fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>
        Une interruption est survenue
      </Text>
      <Text style={{ color: '#94A3B8', fontSize: 13, textAlign: 'center', marginBottom: 24, lineHeight: 18 }}>
        {error?.message || 'Impossible de charger l\'écran d\'accueil. Veuillez relancer l\'application.'}
      </Text>
      <Pressable
        onPress={retry}
        style={{ backgroundColor: '#2C3E6B', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
      >
        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>Relancer l'application</Text>
      </Pressable>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    async function checkOTAUpdates() {
      if (__DEV__) return;
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          // Télécharge la mise à jour en arrière-plan pour le prochain démarrage
          // Ne JAMAIS appeler reloadAsync() brutalement au boot pour éviter le crash/fermeture de l'application
          await Updates.fetchUpdateAsync();
        }
      } catch {
        // En cas d'erreur réseau ou hors-ligne, continuer normalement
      }
    }
    checkOTAUpdates();

    const timeout = setTimeout(async () => {
      await SplashScreen.hideAsync().catch(() => {});
    }, 400);
    return () => clearTimeout(timeout);
  }, []);

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
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Accueil" }} />
      <Stack.Screen name="onboarding" options={{ title: "Présentation", gestureEnabled: false }} />
      <Stack.Screen name="login" options={{ title: "Connexion", gestureEnabled: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
    </Stack>
  );
}
