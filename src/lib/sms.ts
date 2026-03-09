/**
 * Interface for SMS Gateway implementations as per v2.0 Specification Part 3
 */
export interface SMSService {
  sendOTP(phone: string, otp: string): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

export class OrangeCIService implements SMSService {
  async sendOTP(phone: string, otp: string) {
    console.log(`[SMS] Sending OTP ${otp} via Orange CI to ${phone}`);
    // TODO: Implement actual Orange CI API call
    return { success: true, messageId: 'msg_oc_123' };
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
