import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    const timeout = setTimeout(async () => {
      await SplashScreen.hideAsync().catch(() => {});
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Accueil" }} />
    </Stack>
  );
}
