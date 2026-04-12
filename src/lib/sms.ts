export interface SMSService {
  sendOTP(phone: string, otp: string): Promise<{ success: boolean; messageId?: string; error?: string }>;
  sendMessage(phone: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

export class TwilioService implements SMSService {
  private client: any = null;
  private from: string;
  constructor() { this.from = process.env.TWILIO_SENDER_NUMBER || ""; }
  private async getClient() {
    if (this.client) return this.client;
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (accountSid && authToken) {
      const twilio = (await import("twilio")).default;
      this.client = twilio(accountSid, authToken);
    }
    return this.client;
  }
  async sendOTP(phone: string, otp: string) {
    const message = "Votre code de vérification QAPRIL est: " + otp + ". Il est valable 10 minutes.";
    return this.sendMessage(phone, message);
  }
  async sendMessage(phone: string, message: string) {
    const client = await this.getClient();
    if (!client) return { success: false, error: "Twilio credentials missing" };
    try {
      const result = await client.messages.create({ body: message, from: this.from, to: phone.startsWith("+") ? phone : "+" + phone });
      return { success: true, messageId: result.sid };
    } catch (error: any) { return { success: false, error: error.message }; }
  }
}

export class RapidAPIVerifyService implements SMSService {
  private apiKey: string;
  private apiHost: string;
  constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY || "7e4ec2b495mshb2aca1da37b1ba7p1071b9jsn20a7212d514e";
    this.apiHost = process.env.RAPIDAPI_HOST || "sms-verify3.p.rapidapi.com";
  }
  async sendOTP(phone: string, otp: string) {
    try {
      const response = await fetch("https://sms-verify3.p.rapidapi.com/send-numeric-verify", {
        method: "POST",
        headers: { "content-type": "application/json", "x-rapidapi-host": this.apiHost, "x-rapidapi-key": this.apiKey },
        body: JSON.stringify({ target: phone.startsWith("+") ? phone : "+" + phone, estimate: true })
      });
      if (!response.ok) return { success: false, error: await response.text() };
      const data = await response.json();
      return { success: true, messageId: data.request_id || "sent" };
    } catch (err: any) { return { success: false, error: err.message }; }
  }
  async sendMessage(phone: string, message: string) {
    return new TwilioService().sendMessage(phone, message);
  }
}

export class OrangeSMSService implements SMSService {
  private clientId: string;
  private clientSecret: string;
  private senderNumber: string; // tel:+22500000000
  private senderName: string;

  constructor() {
    this.clientId = process.env.ORANGE_SMS_CLIENT_ID || "";
    this.clientSecret = process.env.ORANGE_SMS_CLIENT_SECRET || "";
    this.senderNumber = process.env.ORANGE_SMS_SENDER_NUMBER || "tel:+22500000000";
    this.senderName = process.env.ORANGE_SMS_SENDER_NAME || "QAPRIL";
  }

  private async getAccessToken() {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const response = await fetch("https://api.orange.com/oauth/v3/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    });

    if (!response.ok) {
      throw new Error(`Orange Auth Failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  async sendOTP(phone: string, otp: string) {
    const message = `[QAPRIL] Votre code de sécurité est : ${otp}. Ne le partagez pas.`;
    return this.sendMessage(phone, message);
  }

  async sendMessage(phone: string, message: string) {
    if (!this.clientId || !this.clientSecret) {
      return { success: false, error: "Orange SMS credentials missing" };
    }

    try {
      const token = await this.getAccessToken();
      const formattedPhone = phone.startsWith("+") ? phone : `+225${phone}`; // Default to CI if no prefix
      const address = `tel:${formattedPhone}`;
      
      const payload = {
        outboundSMSMessageRequest: {
          address: address,
          senderAddress: this.senderNumber,
          outboundSMSTextMessage: {
            message: message
          },
          senderName: this.senderName
        }
      };

      const response = await fetch(`https://api.orange.com/smsmessaging/v1/outbound/${encodeURIComponent(this.senderNumber)}/requests`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.message || response.statusText };
      }

      const data = await response.json();
      return { success: true, messageId: data.outboundSMSMessageRequest.resourceURL };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export function getSMSService(provider?: string) {
  const activeProvider = provider || process.env.SMS_GATEWAY_PROVIDER || "RAPIDAPI_VERIFY";
  if (activeProvider === "TWILIO") return new TwilioService();
  if (activeProvider === "ORANGE") return new OrangeSMSService();
  return new RapidAPIVerifyService();
}

export async function sendSMS(phone: string, message: string, forceProvider?: string) {
  const result = await getSMSService(forceProvider).sendMessage(phone, message);
  return result.success === true;
}
