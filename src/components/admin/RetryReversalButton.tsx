"use client";

import { useState } from "react";
import { retryReversal } from "@/actions/reversal-admin";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function RetryReversalButton({ paymentId }: { paymentId: string }) {
    const [loading, setLoading] = useState(false);

    async function handleRetry() {
        if (!confirm("Voulez-vous vraiment relancer ce reversement ?")) return;
        
        setLoading(true);
        try {
            const res = await retryReversal(paymentId);
            if (res.success) {
                toast.success("Demande de reversement relancée avec succès");
            } else {
                toast.error(res.error || "Une erreur est survenue");
            }
        } catch (error) {
            toast.error("Erreur réseau");
        } finally {
            setLoading(false);
        }
    }

    return (
        <button 
            onClick={handleRetry}
            disabled={loading}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                loading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-amber-100 text-amber-700 hover:bg-amber-200 shadow-sm shadow-amber-200/50'
            } italic font-black`}
        >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "Envoi..." : "Relancer"}
        </button>
    );
}
