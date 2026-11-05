/**
 * Service d'envoi de notifications Push Expo pour les applications mobiles QAPRIL
 */
export interface ExpoPushPayload {
    to: string | string[];
    title: string;
    body: string;
    sound?: string | null;
    channelId?: string;
    priority?: 'default' | 'normal' | 'high';
    badge?: number;
    data?: Record<string, any>;
}

export async function sendExpoPushNotification(payload: ExpoPushPayload): Promise<boolean> {
    try {
        const tokens = Array.isArray(payload.to) ? payload.to : [payload.to];
        const validTokens = tokens.filter(t => t && (t.startsWith('ExponentPushToken[') || t.startsWith('token:')));

        if (validTokens.length === 0) {
            return false;
        }

        const messages = validTokens.map(token => ({
            to: token,
            sound: payload.sound !== undefined ? payload.sound : 'default',
            title: payload.title,
            body: payload.body,
            channelId: payload.channelId || 'default',
            priority: payload.priority || 'high',
            badge: payload.badge,
            data: payload.data || {},
        }));

        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(messages),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('[ExpoPush] Erreur HTTP Expo API:', response.status, errText);
            return false;
        }

        const resData = await response.json();
        console.log(`[ExpoPush] Notification envoyée avec succès à ${validTokens.length} appareil(s):`, payload.title);
        return true;
    } catch (error) {
        console.error('[ExpoPush] Erreur envoi push Expo:', error);
        return false;
    }
}

