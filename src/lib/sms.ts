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

export class AfricasTalkingService implements SMSService {
  private username: string;
  private apiKey: string;
  private senderId: string;

  constructor() {
    this.username = process.env.AT_USERNAME || "sandbox";
    this.apiKey = process.env.AT_API_KEY || "";
    this.senderId = process.env.AT_SENDER_ID || "";
  }

  async sendOTP(phone: string, otp: string) {
    const message = `[QAPRIL] Code de sécurité : ${otp}. Valable 10 min.`;
    return this.sendMessage(phone, message);
  }

  async sendMessage(phone: string, message: string) {
    if (!this.apiKey) return { success: false, error: "Africa's Talking API key missing" };

    try {
      const isSandbox = this.username === "sandbox";
      const url = isSandbox 
        ? "https://api.sandbox.africastalking.com/version1/messaging"
        : "https://api.africastalking.com/version1/messaging";

      const formattedPhone = phone.startsWith("+") ? phone : `+225${phone}`;
      
      const body = new URLSearchParams();
      body.append('username', this.username);
      body.append('to', formattedPhone);
      body.append('message', message);
      if (this.senderId && !isSandbox) {
        body.append('from', this.senderId);
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          "apiKey": this.apiKey
        },
        body: body.toString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: `Africa's Talking Error: ${errorText}` };
      }

      const data = await response.json();
      const recipient = data?.SMSMessageData?.Recipients?.[0];
      
      if (recipient && recipient.status === "Success") {
         return { success: true, messageId: recipient.messageId };
      }
      
      return { success: false, error: recipient?.status || "Unknown AT error" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export class HSMSService implements SMSService {
  private apiKey: string;
  private senderId: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.HSMS_API_KEY || "";
    this.senderId = process.env.HSMS_SENDER_ID || "QAPRIL";
    this.apiUrl = process.env.HSMS_API_URL || "https://api.hsms.ci/send"; // Default HSMS endpoint
  }

  async sendOTP(phone: string, otp: string) {
    const message = `[QAPRIL] Code de sécurité : ${otp}. Valable 10 min.`;
    return this.sendMessage(phone, message);
  }

  async sendMessage(phone: string, message: string) {
    if (!this.apiKey) return { success: false, error: "HSMS API key missing" };

    try {
      // Nettoyer le numéro (ex: +225... devient 225...)
      const cleanPhone = phone.replace("+", "");
      
      // Standard HSMS payload
      const payload = {
        api_key: this.apiKey,
        sender_id: this.senderId,
        recipient: cleanPhone,
        message: message
      };

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: `HSMS Error: ${errorText}` };
      }

      const data = await response.json();
      
      // Adaptation selon la réponse exacte de HSMS
      if (data.status === "success" || data.code === 200) {
         return { success: true, messageId: data.message_id || "sent_via_hsms" };
      }
      
      return { success: false, error: data.message || "Unknown HSMS error" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export function getSMSService(provider?: string) {
  const activeProvider = provider || process.env.SMS_GATEWAY_PROVIDER || "HSMS";
  if (activeProvider === "TWILIO") return new TwilioService();
  if (activeProvider === "AFRICASTALKING") return new AfricasTalkingService();
  if (activeProvider === "HSMS") return new HSMSService();
  if (activeProvider === "RAPIDAPI_VERIFY") return new RapidAPIVerifyService();
  return new OrangeSMSService(); // Default to Orange CI
}

export async function sendSMS(phone: string, message: string, forceProvider?: string) {
  // Mechanism Fallback
  const providersToTry = forceProvider ? [forceProvider] : ["HSMS", "ORANGE", "AFRICASTALKING", "TWILIO"];
  
  for (const provider of providersToTry) {
    console.log(`[SMS] Attempting to send via ${provider}...`);
    const service = getSMSService(provider);
    const result = await service.sendMessage(phone, message);
    
    if (result.success) {
      console.log(`[SMS] Success via ${provider} - ID: ${result.messageId}`);
      return true;
    } else {
      console.error(`[SMS] Failed via ${provider}: ${result.error}`);
    }
  }
  
  console.error(`[SMS] All gateways failed for ${phone}.`);
  return false;
}
