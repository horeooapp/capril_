import { Stack } from 'expo-router';

export default function BailleurLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="create-property" options={{ title: 'Nouveau Bien', presentation: 'modal' }} />
      <Stack.Screen name="create-lease" options={{ title: 'Nouveau Bail', presentation: 'modal' }} />
      <Stack.Screen name="signature" options={{ title: 'Signature du bail' }} />
    </Stack>
  );
}
