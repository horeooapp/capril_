"use client";

import React, { useState } from "react";
import { ShoppingCart, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface BuyLeadButtonProps {
    leadId: string;
    prix?: number;
}

export function BuyLeadButton({ leadId, prix = 10000 }: BuyLeadButtonProps) {
    const [loading, setLoading] = useState(false);
    const [bought, setBought] = useState(false);
    const router = useRouter();

    const handleBuy = async () => {
        if (!confirm(`Confirmer l'achat de ce prospect qualifié (${prix.toLocaleString("fr-FR")} XOF) débité sur votre Wallet ?`)) {
            return;
        }

        setLoading(true);
        try {
            const { purchaseLead } = await import("@/actions/lead.actions");
            // agenceId will be inferred or resolved from session in action
            const res = await purchaseLead("", leadId);
            if (!res.success) {
                if (res.error?.includes("Solde") || res.error?.includes("Wallet")) {
                    toast.error("Solde insuffisant dans votre Wallet. Veuillez recharger votre portefeuille.");
                    router.push("/dashboard/wallet");
                } else {
                    toast.error(res.error || "Impossible d'acquérir le lead pour le moment.");
                }
                return;
            }

            toast.success("Lead acquis avec succès ! Coordonnées débloquées.");
            setBought(true);
            router.refresh();
        } catch (err: any) {
            toast.error(err.message || "Erreur de connexion au service Wallet.");
        } finally {
            setLoading(false);
        }
    };

    if (bought) {
        return (
            <span className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-lg">
                <Check size={14} className="mr-1" /> Acquis
            </span>
        );
    }

    return (
        <button
            onClick={handleBuy}
            disabled={loading}
            className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 rounded-lg transition-all shadow-sm"
        >
            {loading ? (
                <Loader2 size={16} className="animate-spin mr-1.5" />
            ) : (
                <ShoppingCart size={16} className="mr-1.5" />
            )}
            Acheter
        </button>
    );
}
