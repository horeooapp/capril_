"use client"

import { Printer } from "lucide-react"

interface PrintButtonProps {
    targetId?: string;
    label?: string;
    className?: string;
}

export default function PrintButton({ 
    targetId = "print-area", 
    label = "Imprimer le Contrat", 
    className = "" 
}: PrintButtonProps) {
    const handlePrint = () => {
        if (targetId && targetId !== "print-area") {
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                const prevId = targetEl.id;
                targetEl.id = "print-area";
                window.print();
                targetEl.id = prevId;
                return;
            }
        }
        window.print();
    };

    return (
        <button
            type="button"
            onClick={handlePrint}
            title="Imprimer exclusivement ce document ou l'enregistrer au format PDF"
            className={className || "inline-flex items-center gap-2 bg-[#FF8200] hover:bg-orange-600 text-white shadow-md px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"}
        >
            <Printer size={16} />
            <span>{label}</span>
        </button>
    );
}
