import twilio from 'twilio';

/**
 * Interface for SMS Gateway implementations as per v2.0 Specification Part 3
 */
export interface SMSService {
  sendOTP(phone: string, otp: string): Promise<{ success: boolean; messageId?: string; error?: string }>;
  sendMessage(phone: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

export class TwilioService implements SMSService {
  private client: twilio.Twilio | null = null;
  private from: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.from = process.env.TWILIO_SENDER_NUMBER || '';

    if (accountSid && authToken) {
      this.client = twilio(accountSid, authToken);
    }
  }

  async sendOTP(phone: string, otp: string) {
    const message = `Votre code de vérification QAPRIL est: ${otp}. Il est valable 10 minutes.`;
    return this.sendMessage(phone, message);
  }

  async sendMessage(phone: string, message: string) {
    console.log(`[SMS][Twilio] Sending to ${phone}: ${message.substring(0, 40)}...`);
    
    if (!this.client) {
      console.error("[SMS][Twilio] Client not initialized. Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN");
      return { success: false, error: 'Twilio credentials missing' };
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.from,
        to: phone.startsWith('+') ? phone : `+${phone}`
      });

      return { success: true, messageId: result.sid };
    } catch (error: any) {
      console.error("[SMS][Twilio] Error:", error.message);
      return { success: false, error: error.message };
    }
  }
}

export class OrangeCIService implements SMSService {
  async sendMessage(phone: string, message: string) {
    // Port existing sendOTP logic to generic sendMessage
    return this.sendOTPRequest(phone, message);
  }

  async sendOTP(phone: string, otp: string) {
    const message = `Votre code de vérification QAPRIL est: ${otp}. Il est valable 10 minutes.`;
    return this.sendOTPRequest(phone, message);
  }

  private async sendOTPRequest(phone: string, message: string) {
    console.log(`[SMS][Orange] Sending to ${phone}`);
    
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
            return { success: false, error: `Orange API Auth failed: ${errText}` };
        }

        const { access_token } = await tokenRes.json();

        // 2. Send the SMS
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
                    outboundSMSTextMessage: { message }
                }
            })
        });

        if (!smsRes.ok) {
            const errText = await smsRes.text();
            return { success: false, error: `Orange API Send failed: ${errText}` };
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
    const message = `Votre code de vérification QAPRIL est: ${otp}`;
    return this.sendMessage(phone, message);
  }
  async sendMessage(phone: string, message: string) {
    console.log(`[SMS][Africa's Talking] Sending to ${phone}`);
    return { success: true, messageId: 'msg_' + Math.random().toString(36).substring(7) };
  }
}

/**
 * Generic SMS sender (non-OTP messages: alerts, reminders, notifications)
 */
export async function sendSMS(phone: string, message: string): Promise<boolean> {
    const service = getSMSService();
    const result = await service.sendMessage(phone, message);
    return result.success;
}

export function getSMSService(): SMSService {
  const provider = process.env.SMS_GATEWAY_PROVIDER || 'TWILIO';
  
  switch (provider) {
    case 'TWILIO':
      return new TwilioService();
    case 'AFRICA_TALKING':
      return new AfricaTalkingService();
    case 'ORANGE_CI':
      return new OrangeCIService();
    default:
      return new TwilioService();
  }
}
