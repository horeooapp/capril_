"use client"

import React from "react"
import { ScrollText, Search, Download, CheckCircle } from "lucide-react"
import { toast } from "sonner";

export default function RCLMonitorPage() {
    return (
        <div className="space-y-6 relative">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                     <div className="mb-2 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-[6px] inline-flex items-center gap-2 shadow-sm">
                        <ScrollText size={12} /> Gestion Comptable
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3 mt-2">
                        Relevé RCL
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Le Relevé de Compte Locataire. Le journal infaillible des flux créditeurs/débiteurs.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={async () => {
                        toast.loading('Génération Synthèse Globale...', { id: 'rcl' });
                        const { exportExcelHistory } = await import('@/actions/report-actions');
                        await exportExcelHistory();
                        toast.success('Document RCL Global exporté.', { id: 'rcl' });
                    }} className="bg-white border text-slate-700 border-slate-200 px-6 py-3 rounded-[12px] font-bold text-[12px] uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
                        <Download size={16} /> Synthèse Globale
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-sm p-8 text-center min-h-[400px] flex flex-col justify-center items-center">
                <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100 mb-6 flex items-center justify-center">
                    <ScrollText size={48} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Le livre de comptes dématérialisé</h3>
                <p className="text-[13px] font-medium text-slate-500 max-w-xl mx-auto mb-8 leading-relaxed">
                    Sélectionnez un contrat de bail dans la barre de recherche pour éditer le relevé officiel reprenant chaque appel d'échéance et chaque versement WebPay, exigé par les organismes sociaux (ex: CAF).
                </p>
                <div className="relative w-full max-w-lg">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="Entrez le nom du locataire ou ID Bail..." className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-[16px] text-[13px] font-bold shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
                </div>
            </div>
        </div>
    )
}
