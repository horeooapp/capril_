/**
 * CinetPay NodeJS SDK / Library helper
 * Handles payment initialization and verification
 */

const CINETPAY_API_URL = "https://api-checkout.cinetpay.com/api/v2/payment";
const CINETPAY_VERIFY_URL = "https://api-checkout.cinetpay.com/api/v2/payment/check";

export interface CinetPayPaymentData {
    transaction_id: string;
    amount: number;
    currency: "XOF";
    description: string;
    customer_name: string;
    customer_surname: string;
    customer_email: string;
    customer_phone_number: string;
    customer_address?: string;
    customer_city?: string;
    customer_country?: string;
    customer_state?: string;
    customer_zip_code?: string;
    notify_url: string;
    return_url: string;
    channels: "ALL" | "MOBILE_MONEY" | "CARD" | "WALLET";
    metadata?: string;
}

export class CinetPayService {
    private siteId: string;
    private apiKey: string;
    public isTest: boolean;

    constructor() {
        this.siteId = process.env.CINETPAY_SITE_ID || "";
        this.apiKey = process.env.CINETPAY_API_KEY || "";
        this.isTest = process.env.NEXT_PUBLIC_PAYMENT_MODE === "test" || !this.siteId || !this.apiKey;
    }

    /**
     * Step 1: Initialize Payment
     * Returns the payment token and checkout URL
     */
    async initializePayment(data: CinetPayPaymentData) {
        try {
            const payload = {
                apikey: this.apiKey,
                site_id: this.siteId,
                ...data,
                lang: "fr"
            };

            const response = await fetch(`${CINETPAY_API_URL}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.code === "201") {
                return {
                    success: true,
                    payment_token: result.data.payment_token,
                    payment_url: result.data.payment_url
                };
            }

            return {
                success: false,
                message: result.message || "Initialization failed",
                code: result.code
            };
        } catch (error) {
            console.error("[CINETPAY_INIT_ERROR]", error);
            return { success: false, message: "Network error during CinetPay initialization" };
        }
    }

    /**
     * Step 2: Verify Payment Status
     */
    async verifyPayment(transactionId: string) {
        try {
            const payload = {
                apikey: this.apiKey,
                site_id: this.siteId,
                transaction_id: transactionId
            };

            const response = await fetch(`${CINETPAY_VERIFY_URL}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.code === "00") {
                return {
                    success: true,
                    status: result.data.status, // ACCEPTED, REFUSED, PENDING
                    amount: result.data.amount,
                    currency: result.data.currency,
                    operator_id: result.data.operator_id,
                    payment_method: result.data.payment_method
                };
            }

            return { success: false, message: result.message, code: result.code };
        } catch (error) {
            console.error("[CINETPAY_VERIFY_ERROR]", error);
            return { success: false, message: "Network error during CinetPay verification" };
        }
    }
}

export const cinetpay = new CinetPayService();
