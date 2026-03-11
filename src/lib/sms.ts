/**
 * Interface for SMS Gateway implementations as per v2.0 Specification Part 3
 */
export interface SMSService {
  sendOTP(phone: string, otp: string): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

export class OrangeCIService implements SMSService {
  async sendOTP(phone: string, otp: string) {
    console.log(`[SMS] Sending OTP ${otp} via Orange CI to ${phone}`);
    
    // Default to the developer phone number if SMS_SENDER_NAME isn't a valid phone
    const senderAddress = process.env.SMS_SENDER_NAME || '00000000';
    const authHeader = process.env.SMS_API_KEY;

    if (!authHeader) {
        console.error("[SMS] Missing SMS_API_KEY in environment");
        return { success: false, error: 'SMS_API_KEY is missing' };
    }

    try {
        // 1. Authenticate with Orange Developer API
        const tokenRes = await fetch('https://api.orange.com/oauth/v3/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authHeader}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: 'grant_type=client_credentials'
        });

        if (!tokenRes.ok) {
            const errText = await tokenRes.text();
            console.error('[SMS] Orange Auth failed:', errText);
            return { success: false, error: 'Orange API Authentication failed' };
        }

        const { access_token } = await tokenRes.json();

        // 2. Send the SMS
        // Note: For Orange API, senderAddress in the URL path must be URL-encoded, e.g., tel%3A%2B22500000000
        const safeSender = senderAddress.replace('+', '');
        const outBoundUrl = `https://api.orange.com/smsmessaging/v1/outbound/tel%3A%2B${safeSender}/requests`;
        const phoneFormat = phone.startsWith('+') ? phone : `+${phone}`;

        const smsRes = await fetch(outBoundUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                outboundSMSMessageRequest: {
                    address: `tel:${phoneFormat}`,
                    senderAddress: `tel:+${safeSender}`,
                    senderName: 'QAPRIL',
                    outboundSMSTextMessage: {
                        message: `Votre code de vérification QAPRIL est: ${otp}. Il est valable 10 minutes.`
                    }
                }
            })
        });

        if (!smsRes.ok) {
            const errText = await smsRes.text();
            console.error('[SMS] Orange Send failed:', errText);
            return { success: false, error: 'Orange API Send SMS failed' };
        }

        const smsData = await smsRes.json();
        return { success: true, messageId: smsData.resourceReference?.resourceURL || 'sent' };

    } catch (err) {
        console.error('[SMS] Orange API Error:', err);
        return { success: false, error: 'Internal error communicating with Orange' };
    }
  }
}

export class AfricaTalkingService implements SMSService {
  async sendOTP(phone: string, otp: string) {
    console.log(`[SMS] Sending OTP ${otp} via Africa's Talking to ${phone}`);
    // TODO: Implement actual Africa's Talking API call
    return { success: true, messageId: 'msg_at_123' };
  }
}

/**
 * Generic SMS sender (non-OTP messages: alerts, reminders, notifications)
 */
export async function sendSMS(phone: string, message: string): Promise<boolean> {
    console.log(`[SMS] Sending to ${phone}: ${message.substring(0, 80)}...`);
    // TODO: Integrate with getSMSService() provider
    return true;
}

export function getSMSService(): SMSService {
  const provider = process.env.SMS_GATEWAY_PROVIDER || 'ORANGE_CI';
  
  switch (provider) {
    case 'AFRICA_TALKING':
      return new AfricaTalkingService();
    case 'INFOBIP':
      // return new InfobipService();
    case 'ORANGE_CI':
    default:
      return new OrangeCIService();
  }
}
