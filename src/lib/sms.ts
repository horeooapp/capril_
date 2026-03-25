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

export function getSMSService() {
  const provider = process.env.SMS_GATEWAY_PROVIDER || "RAPIDAPI_VERIFY";
  if (provider === "TWILIO") return new TwilioService();
  return new RapidAPIVerifyService();
}

export async function sendSMS(phone: string, message: string) {
  const result = await getSMSService().sendMessage(phone, message);
  return result.success === true;
}
