"use client"

import { useState } from "react";
import { RefreshCcw, Check, AlertCircle } from "lucide-react";
import { retryReversal } from "@/actions/reversal";

interface ReversalRetryButtonProps {
    paymentId: string;
}

export default function ReversalRetryButton({ paymentId }: ReversalRetryButtonProps) {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    async function handleRetry() {
        if (status === "loading") return;

        setStatus("loading");
        setErrorMessage(null);

        try {
            const res = await retryReversal(paymentId);
            if (res.success) {
                setStatus("success");
                // Reset to idle after 3 seconds
                setTimeout(() => setStatus("idle"), 3000);
            } else {
                setStatus("error");
                setErrorMessage(res.error || "Échec du reversement");
            }
        } catch (e) {
            console.error("Retry Reversal Error:", e);
            setStatus("error");
            setErrorMessage("Une erreur inattendue est survenue.");
        }
    }

    return (
        <div className="relative group">
            <button 
                onClick={handleRetry}
                disabled={status === "loading" || status === "success"}
                className={`p-2 border rounded-lg shadow-sm transition-all flex items-center justify-center
                    ${status === "idle" ? "bg-white border-gray-200 text-gray-400 hover:bg-gray-50 hover:border-indigo-200 hover:text-indigo-600" : ""}
                    ${status === "loading" ? "bg-indigo-50 border-indigo-200 text-indigo-600 animate-spin" : ""}
                    ${status === "success" ? "bg-green-50 border-green-200 text-green-600" : ""}
                    ${status === "error" ? "bg-red-50 border-red-200 text-red-600" : ""}
                `}
                title={status === "error" ? errorMessage || "Réessayer" : "Réessayer le reversement"}
            >
                {status === "success" ? <Check size={16} /> : 
                 status === "error" ? <AlertCircle size={16} /> : 
                 <RefreshCcw size={16} />}
            </button>

            {status === "error" && errorMessage && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-red-600 text-white text-[10px] font-bold rounded-lg shadow-xl z-50 pointer-events-none">
                    {errorMessage}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-red-600"></div>
                </div>
            )}

            {status === "success" && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-32 p-2 bg-green-600 text-white text-[10px] font-bold rounded-lg shadow-xl z-50 pointer-events-none text-center">
                    Succès !
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-green-600"></div>
                </div>
            )}
        </div>
    );
}
