import { Stack } from 'expo-router';

export default function LocataireLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="signature" options={{ title: 'Signature du bail' }} />
    </Stack>
  );
}
