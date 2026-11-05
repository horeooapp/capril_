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
        name: 'Notifications Propriétaire',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1B4D3E',
        sound: 'default',
        enableVibrate: true,
      });

      await Notifications.setNotificationChannelAsync('messages', {
        name: 'Messagerie & Échanges Propriétaire',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 150, 100, 150],
        lightColor: '#10B981',
        sound: 'default',
        enableVibrate: true,
      });
    } catch (e) {
      console.warn('[Notifications] Erreur configuration canaux Android:', e);
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
      console.log('[Notifications] Push ignoré : simulateur/émulateur détecté.');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[Notifications] Permission de notification non accordée.');
      return null;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId ??
      'edbe7064-bfd4-4162-99a6-d2c731f1f959';

    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    const pushToken = tokenResponse.data;

    // Envoi du pushToken au serveur backend
    await syncPushTokenWithServer(pushToken);

    return pushToken;
  } catch (error) {
    console.error('[Notifications] Erreur enregistrement push:', error);
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
      console.log('[Notifications] Push token synchronisé avec succès avec le backend QAPRIL.');
      return true;
    } else {
      console.warn('[Notifications] Échec synchronisation push token:', json.error);
      return false;
    }
  } catch (e) {
    console.error('[Notifications] Erreur requête sync push token:', e);
    return false;
  }
}

/**
 * Joue une notification sonore et déclenche une vibration pour les nouveaux messages reçus
 */
export async function playMessageNotificationSound(senderName: string, messageContent: string): Promise<void> {
  try {
    // 1. Retour tactile / Vibration immédiate
    Vibration.vibrate([0, 100, 50, 120]);

    // 2. Notification locale avec son système pour Android et iOS
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
        trigger: null, // Déclenchement instantané
      });
    } else if (typeof window !== 'undefined') {
      // 3. Fallback Web Audio API (carillon élégant double tonalité 587Hz -> 880Hz)
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // Ré 5
          osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.08); // La 5
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.28);
        }
      } catch {}
    }
  } catch (e) {
    console.warn('[Notifications] Erreur lecture sonnerie message:', e);
  }
}

