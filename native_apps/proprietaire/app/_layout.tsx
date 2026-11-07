import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { BackHandler, Platform } from "react-native";
import * as Updates from "expo-updates";
import "../global.css";
import { confirmExitApp } from "../components/TopNavHeader";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    async function checkOTAUpdates() {
      if (__DEV__) return;
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch {
        // En cas d'erreur réseau ou hors-ligne, continuer normalement
      }
    }
    checkOTAUpdates();

    const timeout = setTimeout(async () => {
      await SplashScreen.hideAsync().catch(() => {});
    }, 2000);
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
      <Stack.Screen name="login" options={{ title: "Connexion", gestureEnabled: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="create-property" options={{ title: "Nouveau Bien", presentation: "modal" }} />
      <Stack.Screen name="create-lease" options={{ title: "Nouveau Bail", presentation: "modal" }} />
    </Stack>
  );
}
