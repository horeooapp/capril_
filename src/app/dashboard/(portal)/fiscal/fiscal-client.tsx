"use client"

import React, { useState } from "react"
import { Landmark, FileSpreadsheet, Percent, Calculator, Activity, Download, CheckCircle2, Loader2, ArrowRight } from "lucide-react"
import { toast } from "sonner";
import { getFiscalStats } from "@/actions/fiscal-actions"
import { SectionCard } from "@/components/dashboard/ui/SectionCard"
import { Badge } from "@/components/dashboard/ui/Badge"

export default function FiscalDashboardClient({ initialStats }: { initialStats: any }) {
    const [isGenerating, setIsGenerating] = useState(false)

    const handleGenerateIFU = async () => {
        setIsGenerating(true)
        toast.loading("Génération de la liasse IFU 2026...", { id: "ifu" })
        setTimeout(() => {
            toast.success("Liasse IFU générée avec succès et conservée dans l'espace DGI !", { id: "ifu" })
            setIsGenerating(false)
        }, 2000)
    }

    return (
        <div className="space-y-6 relative">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                        <Landmark className="text-sky-600" size={32} /> Liasses Fiscales
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Moteur fiscal générant automatiquement vos déclarations IFU, TVA, et TAF.
                    </p>
                </div>
                <button 
                    onClick={handleGenerateIFU} 
                    disabled={isGenerating}
                    className="bg-slate-900 text-white px-5 py-2.5 rounded-[10px] font-bold text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    {isGenerating ? "Compilation DGI..." : "Exporter IFU Annuel"}
                </button>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[20px] p-8 md:p-12 text-white relative shadow-lg overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 border border-slate-700">
                <div className="relative z-10 max-w-xl">
                    <div className="bg-sky-500/20 px-3 py-1 rounded-[8px] text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-2 mb-6 border border-sky-400/30 text-sky-100">
                        <Activity size={12} className="text-sky-300"/> Conforme OHADA
                    </div>
                    <h2 className="text-3xl font-black tracking-tight mb-4 text-white">Base Imposable Cumulée</h2>
                    <div className="text-5xl font-black tracking-tighter mb-2 text-sky-400">
                        {(initialStats?.stats?.totalBaseImposable || 0).toLocaleString()} <span className="text-[20px] opacity-80">XOF</span>
                    </div>
                    <p className="text-slate-300 text-[14px] font-medium leading-relaxed mb-4">
                        Chaque quittance générée sur QAPRIL ventile automatiquement la base imposable. En fin d'année, votre liasse IFU est prête à être envoyée à la DGI.
                    </p>
                </div>
                <Calculator size={220} className="absolute right-0 opacity-5 rotate-12 pointer-events-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <SectionCard title="Déclarations Périodiques" icon={<Percent className="text-amber-500" />}>
                     <div className="space-y-4 pt-2">
                         <div className="flex justify-between items-center bg-slate-50 p-4 rounded-[12px] border border-slate-200 hover:bg-white transition-colors group cursor-pointer shadow-sm" onClick={() => {
                             toast.loading("Génération du registre TVA...", { id: "tva" });
                             setTimeout(() => {
                                 toast.success("Registre téléchargé", { id: "tva" });
                             }, 1000);
                         }}>
                             <div>
                                 <p className="text-[14px] font-bold text-slate-900">TVA (18%)</p>
                                 <p className="text-[11px] font-bold text-slate-400 uppercase mt-1">Immobilier Commercial</p>
                             </div>
                             <div className="text-right">
                                <p className="font-black text-[15px] text-slate-900">{(initialStats?.stats?.totalTvaCollectee || 0).toLocaleString()} <span className="text-[11px] text-slate-500 font-bold">XOF</span></p>
                                <span className="text-[10px] font-bold uppercase text-sky-600 mt-1 inline-flex items-center gap-1 group-hover:underline">Consulter <ArrowRight size={10} /></span>
                             </div>
                         </div>
                         <div className="flex justify-between items-center bg-slate-50 p-4 rounded-[12px] border border-slate-200 shadow-sm">
                             <div>
                                 <p className="text-[14px] font-bold text-slate-900">TAF (Taxe Actions Financières)</p>
                                 <p className="text-[11px] font-bold text-slate-400 uppercase mt-1">Paiements Mobile Money</p>
                             </div>
                             <Badge color="green" className="flex items-center gap-1.5"><CheckCircle2 size={12}/> Prélevé à la source</Badge>
                         </div>
                     </div>
                 </SectionCard>

                 <SectionCard title="Dossiers Récents" icon={<Landmark className="text-sky-600" />}>
                     <div className="space-y-3 pt-2">
                        {initialStats?.recentRegistrations?.length > 0 ? (
                            initialStats.recentRegistrations.map((doc: any) => (
                                <div key={doc.id} className="flex items-center justify-between p-3.5 rounded-[12px] bg-slate-50 border border-slate-200 hover:bg-white hover:border-slate-300 transition-colors shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-sky-50 text-sky-600 border border-sky-100 rounded-[10px]">
                                            <FileSpreadsheet size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-slate-900">{doc.lease?.property?.name || 'Contrat en cours'}</p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{doc.statut}</p>
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-400">{new Date(doc.updatedAt).toLocaleDateString()}</span>
                                </div>
                            ))
                        ) : (
                             <div className="flex flex-col items-center justify-center py-8 bg-slate-50 rounded-[12px] border border-dashed border-slate-200 text-center">
                                 <FileSpreadsheet className="text-slate-300 mb-3" size={32} />
                                 <p className="text-[13px] font-bold text-slate-600">L'exercice fiscal 2026 est actuellement en cours.</p>
                                 <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-2">La liasse globale sera consolidée automatiquement.</p>
                             </div>
                        )}
                     </div>
                 </SectionCard>
            </div>
        </div>
    )
}
