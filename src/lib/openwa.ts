/**
 * OpenWA Integration — WhatsApp API Gateway (Baileys/WAHA)
 * Utilise l'API REST OpenWA v2 : /api/sessions/:sessionId/messages/send-text
 *
 * Configuration requise (variables d'environnement) :
 *   OPENWA_API_URL     = http://openwa-api:2785  (URL de base du gateway)
 *   OPENWA_API_KEY     = owa_k1_...              (clé API OpenWA)
 *   OPENWA_SESSION_ID  = 06353e46-...            (UUID de la session WhatsApp active)
 */

export interface OpenWAResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Nettoie et formate le numéro au format chatId WhatsApp (ex: 2250700000000@c.us)
 */
export function formatOpenWAChatId(phone: string): string {
  let clean = phone.replace(/[^\d]/g, '');

  // Format Côte d'Ivoire : 10 chiffres commençant par 0 → ajouter indicatif 225
  if (clean.length === 10 && clean.startsWith('0')) {
    clean = '225' + clean;
  } else if (clean.length === 8) {
    // Ancien format CI 8 chiffres
    clean = '2250' + clean;
  }

  return clean.includes('@') ? clean : `${clean}@c.us`;
}

/**
 * Envoie un message texte via l'API OpenWA v2 (Baileys)
 * Endpoint: POST /api/sessions/:sessionId/messages/send-text
 */
export async function sendOpenWAMessage(phone: string, text: string): Promise<OpenWAResponse> {
  const apiUrl = (process.env.OPENWA_API_URL || 'http://localhost:2785').replace(/\/$/, '');
  const apiKey = process.env.OPENWA_API_KEY || '';
  const sessionId = process.env.OPENWA_SESSION_ID || '';
  const chatId = formatOpenWAChatId(phone);

  // Mode simulation : si pas de session configurée et hors production
  const isMock =
    process.env.ENABLE_OPENWA_MOCK === 'true' ||
    (!process.env.OPENWA_API_URL && process.env.NODE_ENV !== 'production');

  if (isMock) {
    console.log(`[OPENWA SIMULATION] To: ${chatId} | Message:\n${text}`);
    return { success: true, messageId: `mock_openwa_${Date.now()}` };
  }

  if (!sessionId) {
    const errMsg = '[OPENWA] OPENWA_SESSION_ID non configuré — impossible d\'envoyer le message.';
    console.error(errMsg);
    return { success: false, error: 'OPENWA_SESSION_ID manquant dans la configuration.' };
  }

  const endpoint = `${apiUrl}/api/sessions/${sessionId}/messages/send-text`;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      // OpenWA v2 utilise X-Api-Key
      headers['X-Api-Key'] = apiKey;
      // Compatibilité Bearer pour les proxys
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        chatId,
        text,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      const messageId = data?.messageId || data?.id || data?.response || 'sent_via_openwa';
      console.log(`[OPENWA] ✅ Message envoyé à ${chatId} (ID: ${messageId})`);
      return { success: true, messageId: String(messageId) };
    }

    const errorText = await response.text().catch(() => 'Erreur inconnue');
    console.error(`[OPENWA] ❌ Échec d'envoi à ${chatId} (HTTP ${response.status}): ${errorText}`);
    return { success: false, error: `OpenWA HTTP ${response.status}: ${errorText}` };

  } catch (error: any) {
    console.error(`[OPENWA] ❌ Erreur réseau / connexion à ${apiUrl}:`, error?.message || error);

    // En dev sans serveur OpenWA, simuler pour ne pas bloquer
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[OPENWA] Fallback simulation activé (serveur non joignable en dev).`);
      return { success: true, messageId: `fallback_sim_${Date.now()}` };
    }

    return { success: false, error: error?.message || 'Erreur de connexion OpenWA' };
  }
}

/**
 * Envoie un code OTP formaté via WhatsApp
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
 * Service WhatsApp compatible avec l'interface SMSService
 */
export class OpenWAService {
  async sendOTP(phone: string, otp: string): Promise<OpenWAResponse> {
    return sendOpenWAOTP(phone, otp, 'Sécurité');
  }

  async sendMessage(phone: string, message: string): Promise<OpenWAResponse> {
    return sendOpenWAMessage(phone, message);
  }
}
