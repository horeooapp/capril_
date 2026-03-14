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
        const authValue = authHeader.startsWith('Basic ') ? authHeader : `Basic ${authHeader}`;
        const tokenRes = await fetch('https://api.orange.com/oauth/v3/token', {
            method: 'POST',
            headers: {
                'Authorization': authValue,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: 'grant_type=client_credentials'
        });

        if (!tokenRes.ok) {
            const errText = await tokenRes.text();
            console.error('[SMS] Orange Auth failed:', errText);
            return { success: false, error: `Orange API Auth failed (${tokenRes.status}): ${errText}` };
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

export class IKODDIService implements SMSService {
  async sendOTP(phone: string, otp: string) {
    const message = `Votre code de vérification QAPRIL est: ${otp}. Il est valable 10 minutes.`;
    return this.sendSMS(phone, message);
  }

  async sendSMS(phone: string, message: string) {
    console.log(`[SMS] Sending via IKODDI to ${phone}: ${message.substring(0, 50)}...`);
    
    const apiKey = process.env.IKODDI_API_KEY;
    if (!apiKey) {
        console.error("[SMS] Missing IKODDI_API_KEY in environment");
        return { success: false, error: 'IKODDI_API_KEY is missing' };
    }

    try {
        const phoneFormat = phone.startsWith('+') ? phone : `+${phone}`;
        
        const response = await fetch('https://api.ikoddi.com/v1/sms/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: phoneFormat,
                message: message,
                sender: 'QAPRIL'
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('[SMS] IKODDI Send failed:', errText);
            return { success: false, error: `IKODDI API error: ${response.status}` };
        }

        const data = await response.json();
        // Assuming success structure based on common REST APIs if specific structure is unknown
        // Typically { success: true, messageId: "..." } or similar
        if (data.success || data.status === "success" || data.id) {
            return { success: true, messageId: data.id || data.messageId };
        } else {
            console.error('[SMS] IKODDI Error:', data);
            return { success: false, error: data.message || 'Unknown IKODDI error' };
        }

    } catch (err) {
        console.error('[SMS] IKODDI API Error:', err);
        return { success: false, error: 'Internal error communicating with IKODDI' };
    }
  }
}

/**
 * Generic SMS sender (non-OTP messages: alerts, reminders, notifications)
 */
export async function sendSMS(phone: string, message: string): Promise<boolean> {
    console.log(`[SMS] Sending to ${phone}: ${message.substring(0, 80)}...`);
    const service = getSMSService();
    
    // If it's IKODDIService, use its specific sendSMS method if available
    if ('sendSMS' in service) {
        const res = await (service as any).sendSMS(phone, message);
        return res.success;
    }
    
    return true;
}

export function getSMSService(): SMSService {
  const provider = process.env.SMS_GATEWAY_PROVIDER || 'IKODDI';
  
  switch (provider) {
    case 'IKODDI':
      return new IKODDIService();
    case 'AFRICA_TALKING':
      return new AfricaTalkingService();
    case 'INFOBIP':
      // return new InfobipService();
    case 'ORANGE_CI':
    default:
      return new OrangeCIService();
  }
}
