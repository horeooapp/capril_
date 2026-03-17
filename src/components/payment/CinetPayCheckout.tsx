"use client"

import { useState } from "react"
import { createMMIntent } from "@/actions/payment-actions"

interface CinetPayCheckoutProps {
    leaseId: string;
    amount: number;
    monthsCount: number;
    receiptId?: string;
    onSuccess?: (intentId: string) => void;
    onError?: (message: string) => void;
}

export default function CinetPayCheckout({
    leaseId,
    amount,
    monthsCount,
    receiptId,
    onSuccess,
    onError
}: CinetPayCheckoutProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handlePayment = async () => {
        setIsLoading(true);
        try {
            // we default to Orange for the record, but CinetPay will handle all
            const result = await createMMIntent({
                leaseId,
                amount,
                monthsCount,
                operator: 'orange', 
                payerPhone: "00000000", // placeholder, CinetPay will ask for real one
                receiptId
            });

            if (result.error) {
                onError?.(result.error);
                return;
            }

            if (result.paymentUrl) {
                // Redirection to CinetPay Checkout
                window.location.href = result.paymentUrl;
            } else {
                onSuccess?.(result.intentId!);
            }
        } catch (err) {
            console.error("[CHECKOUT_ERROR]", err);
            onError?.("Erreur lors de l'initialisation du paiement.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <button
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full bg-[#FF8200] hover:bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-xl shadow-orange-100 disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Initialisation...
                    </>
                ) : (
                    <>
                        💳 Payer via CinetPay (MM / Carte)
                    </>
                )}
            </button>
            
            {/* Simulation Badge */}
            <div className="flex items-center justify-center gap-2 py-2 px-4 bg-orange-50 rounded-xl border border-orange-100">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">Mode Test Activé</span>
            </div>
        </div>
    );
}
