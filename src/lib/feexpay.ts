/**
 * Service FeexPay — Agrégateur de paiement officiel QAPRIL (Production)
 * Gère les encaissements multicanaux : Wave, Orange Money, MTN MoMo, Moov Money, Carte bancaire
 */

export interface FeexPayInitializeOptions {
  transactionId: string;
  amount: number;
  description: string;
  payerPhone?: string;
  customerName?: string;
  customerEmail?: string;
  operator?: string;
  callbackUrl?: string;
  returnUrl?: string;
  leaseId?: string;
}

export class FeexPayService {
  private shopId: string;
  private apiKey: string;
  private isSandbox: boolean;

  constructor() {
    this.shopId = process.env.FEEXPAY_SHOP_ID || "6qaYdqMwX6byG7Q";
    this.apiKey = process.env.FEEXPAY_API_KEY || "test_Hg7Kjl3ZAM63UuIUpuudD9nKuu3ZAM67Kjl3Uuhn";
    this.isSandbox = process.env.FEEXPAY_SANDBOX === "true" || this.apiKey.startsWith("test_");
  }

  async initializePayment(options: FeexPayInitializeOptions): Promise<{
    success: boolean;
    payment_url: string;
    reference: string;
    payment_token?: string;
    message?: string;
  }> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://qapril.net";
    const ref = `FP-${options.transactionId.substring(0, 8)}-${Date.now()}`;
    const returnUrl = options.returnUrl || `${appUrl}/mon-espace-locataire?paiement=succes&tid=${options.transactionId}`;
    const callbackUrl = options.callbackUrl || `${appUrl}/api/webhooks/feexpay?paymentId=${options.transactionId}`;

    // 1. Tenter l'initiation API FeexPay si configuré
    try {
      const baseUrl = this.isSandbox
        ? "https://sandbox-api.feexpay.me"
        : "https://api.feexpay.me";

      const res = await fetch(`${baseUrl}/api/transactions/public/requesttopay/init`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shop: this.shopId,
          amount: options.amount,
          phoneNumber: options.payerPhone || "22500000000",
          description: options.description.substring(0, 40),
          callback_info: {
            transactionId: options.transactionId,
            operator: options.operator,
            leaseId: options.leaseId,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.payment_url) {
          return {
            success: true,
            payment_url: data.payment_url,
            reference: data.reference || ref,
            payment_token: data.reference || ref,
          };
        }
      }
    } catch (e) {
      console.warn("[FeexPay] Appel direct API en fallback vers le guichet de paiement hébergé:", e);
    }

    // 2. Guichet de paiement officiel FeexPay intégré
    const checkoutUrl = `${appUrl}/checkout/feexpay?tid=${encodeURIComponent(options.transactionId)}&ref=${encodeURIComponent(ref)}&amount=${options.amount}&desc=${encodeURIComponent(options.description)}&op=${encodeURIComponent(options.operator || 'wave')}&phone=${encodeURIComponent(options.payerPhone || '')}${options.leaseId ? `&leaseId=${encodeURIComponent(options.leaseId)}` : ''}`;

    return {
      success: true,
      payment_url: checkoutUrl,
      reference: ref,
      payment_token: ref,
    };
  }
}

export const feexpay = new FeexPayService();
