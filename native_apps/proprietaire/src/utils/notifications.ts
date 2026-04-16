import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { API_ENDPOINTS } from '../config/api';

// Configuration du comportement des notifications quand l'application est ouverte
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync(token: string) {
  let pushToken;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    try {
      pushToken = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("Expo Push Token (Owner):", pushToken);
    } catch (e) {
      console.log("Erreur lors de la récupération du token Expo:", e);
      return;
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  if (pushToken && token) {
    try {
      await fetch(`${API_ENDPOINTS.BASE_URL}/api/mobile/user/push-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, pushToken }),
      });
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du push token au serveur:", error);
    }
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return pushToken;
}
