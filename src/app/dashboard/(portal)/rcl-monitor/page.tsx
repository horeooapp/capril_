"use client"

import React from "react"
import { ScrollText, Search, Download, CheckCircle } from "lucide-react"
import { toast } from "sonner";

export default function RCLMonitorPage() {
    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <ScrollText className="text-qblue" size={32} /> Relevé RCL
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Le Relevé de Compte Locataire. Le journal infaillible des flux créditeurs/débiteurs.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => toast.info('🚀 Module Premium (V5) : Interface en cours de déploiement sécurisé')} className="bg-white border text-qnavy border-qgrey-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qgrey-1 transition-all shadow-sm flex items-center gap-2">
                        <Download size={16} /> Synthèse Globale
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-qgrey-2 overflow-hidden shadow-sm p-8 text-center min-h-[400px] flex flex-col justify-center items-center">
                <ScrollText size={64} className="text-qgrey-2 mb-6" />
                <h3 className="text-xl font-black text-qnavy-dark mb-4">Le livre de comptes dématérialisé</h3>
                <p className="text-sm font-medium text-qtext-mid max-w-xl mx-auto mb-8 line-clamp-3">
                    Sélectionnez un contrat de bail dans la barre de recherche pour éditer le relevé officiel reprenant chaque appel d'échéance et chaque versement WebPay, exigé par les organismes sociaux (ex: CAF).
                </p>
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" placeholder="Entrez le nom du locataire ou ID Bail..." className="w-full pl-10 pr-4 py-4 bg-white border-2 border-qgrey-2 rounded-2xl text-sm font-bold shadow-sm focus:outline-none focus:border-qblue" />
                </div>
            </div>
        </div>
    )
}
