import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform, Vibration } from 'react-native';
import { getStoredToken, API_URL } from './api';

// Configuration du gestionnaire de notifications pour afficher alertes et jouer le son en premier plan
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Configure les canaux de notifications pour Android avec sonnerie et vibration
 */
export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Notifications Agence Agréée',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1F2A44',
        sound: 'default',
        enableVibrate: true,
      });

      await Notifications.setNotificationChannelAsync('messages', {
        name: 'Messagerie & Portefeuille Agence',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 150, 100, 150],
        lightColor: '#F0774B',
        sound: 'default',
        enableVibrate: true,
      });
    } catch (e) {
      console.warn('[Notifications Agence] Erreur configuration canaux Android:', e);
    }
  }
}

/**
 * Enregistre l'appareil pour les notifications push et transmet le pushToken au serveur QAPRIL
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    await setupNotificationChannels();

    if (Platform.OS === 'web') {
      return null;
    }

    if (!Device.isDevice) {
      console.log('[Notifications Agence] Push ignoré : simulateur/émulateur détecté.');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[Notifications Agence] Permission de notification non accordée.');
      return null;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId ??
      '848dd040-6268-433e-962d-4bde271e515b';

    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    const pushToken = tokenResponse.data;

    // Envoi du pushToken au serveur backend
    await syncPushTokenWithServer(pushToken);

    return pushToken;
  } catch (error) {
    console.error('[Notifications Agence] Erreur enregistrement push:', error);
    return null;
  }
}

/**
 * Synchronise le token push avec le backend QAPRIL
 */
export async function syncPushTokenWithServer(pushToken: string): Promise<boolean> {
  try {
    const userToken = await getStoredToken();
    if (!userToken) return false;

    const response = await fetch(`${API_URL}/user/push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        token: userToken,
        pushToken,
      }),
    });

    const json = await response.json();
    if (response.ok) {
      console.log('[Notifications Agence] Push token synchronisé avec succès.');
      return true;
    } else {
      console.warn('[Notifications Agence] Échec synchronisation push token:', json.error);
      return false;
    }
  } catch (e) {
    console.error('[Notifications Agence] Erreur requête sync push token:', e);
    return false;
  }
}

/**
 * Joue une notification sonore et déclenche une vibration pour les nouveaux messages reçus
 */
export async function playMessageNotificationSound(senderName: string, messageContent: string): Promise<void> {
  try {
    Vibration.vibrate([0, 100, 50, 120]);

    if (Platform.OS !== 'web') {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `💬 ${senderName || 'Nouveau message'}`,
          body: messageContent.length > 80 ? messageContent.substring(0, 80) + '...' : messageContent,
          sound: 'default',
          priority: 'max',
          vibrate: [0, 150, 100, 150],
          data: { type: 'chat' },
        },
        trigger: null,
      });
    }
  } catch (e) {
    console.warn('[Notifications Agence] Erreur lecture sonnerie message:', e);
  }
}
