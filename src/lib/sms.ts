export interface SMSService {
  sendOTP(phone: string, otp: string): Promise<{ success: boolean; messageId?: string; error?: string }>;
  sendMessage(phone: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

export function formatOrangePhoneNumber(phone: string): string {
  if (!phone) return "";
  let cleaned = phone.trim().replace(/[\s\-\(\)\.]/g, "");
  
  if (cleaned.startsWith("00")) {
    cleaned = "+" + cleaned.slice(2);
  }
  
  if (cleaned.startsWith("+")) {
    return cleaned;
  }
  
  if (cleaned.startsWith("225")) {
    return "+" + cleaned;
  }
  
  // Format national ivoirien (10 chiffres commençant par 0: 01, 05, 07, etc.)
  if (cleaned.length === 10 && cleaned.startsWith("0")) {
    return "+225" + cleaned;
  }
  
  // Format ancien 8 chiffres (CI)
  if (cleaned.length === 8) {
    return "+225" + cleaned;
  }
  
  return "+225" + cleaned;
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
  private static cachedToken: { token: string; expiresAt: number } | null = null;

  constructor() {
    this.clientId = process.env.ORANGE_SMS_CLIENT_ID || process.env.ORANGE_CLIENT_ID || "NwdPqbZaW7ne4xhKMdtQKgjTIWc5l9AZ";
    this.clientSecret = process.env.ORANGE_SMS_CLIENT_SECRET || process.env.ORANGE_CLIENT_SECRET || "jsik63aaYJpLTRQIglGpi9fN4EEvdLokruZZwfpimMrq";
    this.senderNumber = process.env.ORANGE_SMS_SENDER_NUMBER || "tel:+22500000000";
    this.senderName = process.env.ORANGE_SMS_SENDER_NAME || "QAPRIL";
  }

  private async getAccessToken(): Promise<string> {
    if (
      OrangeSMSService.cachedToken &&
      Date.now() < OrangeSMSService.cachedToken.expiresAt
    ) {
      return OrangeSMSService.cachedToken.token;
    }

    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
    const response = await fetch("https://api.orange.com/oauth/v3/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: "grant_type=client_credentials"
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`Orange Auth Failed (${response.status}): ${response.statusText} ${errText}`);
    }

    const data = await response.json();
    const expiresIn = Number(data.expires_in) || 3600;
    OrangeSMSService.cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + Math.max(60, expiresIn - 120) * 1000
    };
    return data.access_token;
  }

  async sendOTP(phone: string, otp: string) {
    const message = `[QAPRIL] Votre code de sécurité est : ${otp}. Ne le partagez pas.`;
    return this.sendMessage(phone, message);
  }

  async sendMessage(phone: string, message: string) {
    if (!this.clientId || !this.clientSecret) {
      return { success: false, error: "Identifiants Orange SMS manquants (CLIENT_ID / CLIENT_SECRET)" };
    }

    try {
      const token = await this.getAccessToken();
      const formattedPhone = formatOrangePhoneNumber(phone);
      const recipientAddress = `tel:${formattedPhone}`;
      const senderAddr = this.senderNumber.startsWith("tel:")
        ? this.senderNumber
        : `tel:${this.senderNumber}`;

      const payload = {
        outboundSMSMessageRequest: {
          address: recipientAddress,
          senderAddress: senderAddr,
          outboundSMSTextMessage: {
            message: message
          },
          senderName: this.senderName
        }
      };

      const endpoint = `https://api.orange.com/smsmessaging/v1/outbound/${encodeURIComponent(senderAddr)}/requests`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorMsg = `HTTP ${response.status} ${response.statusText}`;
        try {
          const errJson = await response.json();
          if (errJson?.requestError?.policyException) {
            const pe = errJson.requestError.policyException;
            const vars = pe.variables ? ` (${pe.variables.join("; ")})` : "";
            errorMsg = `${pe.messageId || "PolicyException"}: ${pe.text || ""}${vars}`;
          } else if (errJson?.requestError?.serviceException) {
            const se = errJson.requestError.serviceException;
            const vars = se.variables ? ` (${se.variables.join("; ")})` : "";
            errorMsg = `${se.messageId || "ServiceException"}: ${se.text || ""}${vars}`;
          } else if (errJson?.message) {
            errorMsg = errJson.message;
          }
        } catch {
          // ignore parsing error
        }
        return { success: false, error: `Orange SMS: ${errorMsg}` };
      }

      const data = await response.json();
      const resourceURL = data?.outboundSMSMessageRequest?.resourceURL || "sent";
      return { success: true, messageId: resourceURL };
    } catch (error: any) {
      return { success: false, error: error.message || "Erreur inconnue Orange SMS" };
    }
  }

  async checkBalance(): Promise<{
    success: boolean;
    availableUnits?: number;
    status?: string;
    expirationDate?: string;
    country?: string;
    error?: string;
  }> {
    if (!this.clientId || !this.clientSecret) {
      return { success: false, error: "Identifiants Orange SMS manquants" };
    }

    try {
      const token = await this.getAccessToken();
      const response = await fetch("https://api.orange.com/sms/admin/v1/contracts", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Erreur consultation forfait Orange (${response.status}): ${response.statusText}`
        };
      }

      const contracts = await response.json();
      if (Array.isArray(contracts) && contracts.length > 0) {
        const civContract = contracts.find((c: any) => c.country === "CIV") || contracts[0];
        return {
          success: true,
          availableUnits: civContract.availableUnits ?? 0,
          status: civContract.status || "UNKNOWN",
          expirationDate: civContract.expirationDate,
          country: civContract.country || "CIV"
        };
      }

      return { success: true, availableUnits: 0, status: "AUCUN_CONTRAT", country: "CIV" };
    } catch (error: any) {
      return { success: false, error: error.message || "Erreur de connexion Orange Contracts" };
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
    this.apiUrl = process.env.HSMS_API_URL || "https://api.hsms.ci/send";
  }

  async sendOTP(phone: string, otp: string) {
    const message = `[QAPRIL] Code de sécurité : ${otp}. Valable 10 min.`;
    return this.sendMessage(phone, message);
  }

  async sendMessage(phone: string, message: string) {
    if (!this.apiKey) return { success: false, error: "HSMS API key missing" };

    try {
      const cleanPhone = phone.replace("+", "");
      
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
      
      if (data.status === "success" || data.code === 200) {
         return { success: true, messageId: data.message_id || "sent_via_hsms" };
      }
      
      return { success: false, error: data.message || "Unknown HSMS error" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

import { OpenWAService } from "@/lib/openwa";

export function getSMSService(provider?: string): SMSService {
  const activeProvider = (provider || process.env.SMS_GATEWAY_PROVIDER || "ORANGE").toUpperCase();
  if (activeProvider === "OPENWA") return new OpenWAService();
  if (activeProvider === "TWILIO") return new TwilioService();
  if (activeProvider === "AFRICASTALKING") return new AfricasTalkingService();
  if (activeProvider === "HSMS") return new HSMSService();
  if (activeProvider === "RAPIDAPI_VERIFY") return new RapidAPIVerifyService();
  if (activeProvider === "ORANGE" || activeProvider === "ORANGE_CI") return new OrangeSMSService();
  return new OrangeSMSService();
}

export async function sendSMSWithDetails(
  phone: string,
  message: string,
  forceProvider?: string
): Promise<{ success: boolean; provider?: string; messageId?: string; error?: string }> {
  const preferred = (process.env.SMS_GATEWAY_PROVIDER || "ORANGE").toUpperCase();
  const defaultOrder = ["ORANGE", "OPENWA", "HSMS", "AFRICASTALKING", "TWILIO"];
  const prioritized = defaultOrder.includes(preferred)
    ? [preferred, ...defaultOrder.filter((p) => p !== preferred)]
    : ["ORANGE", ...defaultOrder.filter((p) => p !== "ORANGE")];

  const providersToTry = forceProvider ? [forceProvider.toUpperCase()] : prioritized;

  let lastError = "Aucun fournisseur configuré";
  for (const provider of providersToTry) {
    try {
      const service = getSMSService(provider);
      const result = await service.sendMessage(phone, message);
      if (result.success) {
        return { success: true, provider, messageId: result.messageId };
      }
      lastError = result.error || "Échec d'envoi";
      console.warn(`[SMS] Failed via ${provider}: ${lastError}`);
    } catch (e: any) {
      lastError = e?.message || "Exception";
      console.warn(`[SMS] Exception via ${provider}: ${lastError}`);
    }
  }

  return { success: false, error: lastError };
}

export async function sendSMS(phone: string, message: string, forceProvider?: string): Promise<boolean> {
  const res = await sendSMSWithDetails(phone, message, forceProvider);
  return res.success;
}
