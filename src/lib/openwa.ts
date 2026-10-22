/**
 * OpenWA Integration (WhatsApp Web Automation API)
 * Service centralisé pour toutes les validations et envois de codes OTP par WhatsApp
 */

export interface OpenWAResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Nettoie et formate le numéro au format international attendu par OpenWA (ex: 2250700000000@c.us)
 */
export function formatOpenWAChatId(phone: string): string {
  let clean = phone.replace(/[^\d]/g, '');

  // Format Côte d'Ivoire : si numéro à 10 chiffres commençant par 01, 05, 07, etc.
  if (clean.length === 10 && clean.startsWith('0')) {
    clean = '225' + clean;
  } else if (clean.length === 8) {
    // Ancien format CI 8 chiffres
    clean = '2250' + clean;
  }

  return clean.includes('@') ? clean : `${clean}@c.us`;
}

/**
 * Envoie un message texte simple via l'API OpenWA
 */
export async function sendOpenWAMessage(phone: string, text: string): Promise<OpenWAResponse> {
  const apiUrl = process.env.OPENWA_API_URL || process.env.OPENWA_HOST || 'http://localhost:8085';
  const apiKey = process.env.OPENWA_API_KEY || '';
  const chatId = formatOpenWAChatId(phone);

  const isMock = process.env.ENABLE_OPENWA_MOCK === 'true' || 
                 (!process.env.OPENWA_API_URL && process.env.NODE_ENV !== 'production');

  if (isMock) {
    console.log(`[OPENWA SIMULATION] To: ${chatId} | Message:\n${text}`);
    return { success: true, messageId: `mock_openwa_${Date.now()}` };
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
      headers['api-key'] = apiKey;
    }

    // Endpoint standard OpenWA : /sendText
    const response = await fetch(`${apiUrl.replace(/\/$/, '')}/sendText`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        chatId,
        content: text,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      const messageId = data?.response || data?.id || data?.messageId || 'sent_via_openwa';
      console.log(`[OPENWA] Message envoyé avec succès à ${chatId} (ID: ${messageId})`);
      return { success: true, messageId: String(messageId) };
    }

    // Fallback éventuel sur /sendMessage
    const fallbackResponse = await fetch(`${apiUrl.replace(/\/$/, '')}/sendMessage`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        to: chatId,
        body: text,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (fallbackResponse.ok) {
      const fallbackData = await fallbackResponse.json().catch(() => ({}));
      return { success: true, messageId: String(fallbackData?.id || 'sent_via_openwa_fallback') };
    }

    const errorText = await response.text().catch(() => 'Unknown error');
    console.error(`[OPENWA] Échec d'envoi à ${chatId} (${response.status}): ${errorText}`);
    return { success: false, error: `OpenWA error (${response.status}): ${errorText}` };

  } catch (error: any) {
    console.error(`[OPENWA] Erreur réseau / connexion à ${apiUrl}:`, error?.message || error);
    
    // En dev/test, si le serveur OpenWA n'est pas démarré, simuler pour ne pas bloquer l'utilisateur
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[OPENWA] Fallback simulation activé pour le dev (serveur non joignable). Code envoyé virtuellement.`);
      return { success: true, messageId: `fallback_sim_${Date.now()}` };
    }

    return { success: false, error: error?.message || 'Erreur de connexion OpenWA' };
  }
}

/**
 * Envoie un code de validation OTP formaté par OpenWA (WhatsApp)
 */
export async function sendOpenWAOTP(
  phone: string, 
  otp: string, 
  context: string = 'Validation'
): Promise<OpenWAResponse> {
  const message = [
    `🔐 *QAPRIL — Code de validation*`,
    ``,
    `Votre code de sécurité (${context}) est :`,
    `👉 *${otp}*`,
    ``,
    `⏱ _Ce code est valable pendant 10 minutes._`,
    `⚠️ _Ne le partagez avec personne. L'équipe QAPRIL ne vous demandera jamais ce code._`,
  ].join('\n');

  console.log(`[OPENWA OTP] Envoi du code ${otp} (${context}) vers ${phone}...`);
  return sendOpenWAMessage(phone, message);
}

/**
 * Implémentation du service SMS / WhatsApp compatible avec l'interface SMSService
 */
export class OpenWAService {
  async sendOTP(phone: string, otp: string): Promise<OpenWAResponse> {
    return sendOpenWAOTP(phone, otp, 'Sécurité');
  }

  async sendMessage(phone: string, message: string): Promise<OpenWAResponse> {
    return sendOpenWAMessage(phone, message);
  }
}
