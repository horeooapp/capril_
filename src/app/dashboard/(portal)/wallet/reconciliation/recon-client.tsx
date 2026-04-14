"use client"

import React, { useState, useTransition } from "react"
import { ShieldCheck, Activity, AlertTriangle, FileText, CheckCircle, RefreshCw, Smartphone } from "lucide-react"
import { toast } from "sonner"
import { triggerReconciliation } from "@/actions/reconciliation-actions"
import { PaymentCanal } from "@prisma/client"

export default function ReconDashboardClient({ initialRecons }: { initialRecons: any[] }) {
    const [recons, setRecons] = useState(initialRecons)
    const [isPending, startTransition] = useTransition()

    const handleRecon = (canal: PaymentCanal) => {
        startTransition(async () => {
            const promise = triggerReconciliation(canal)
            toast.promise(promise, {
                loading: `Audit financier en cours avec les serveurs ${canal}...`,
                success: (res) => {
                    if (res && res.data) {
                        setRecons([res.data, ...recons])
                        return res.data.nbEcarts > 0 
                            ? `Terminé avec ${res.data.nbEcarts} écart(s) détecté(s)!` 
                            : `Audit parfait ! Aucun écart détecté.`
                    }
                    return "Réconciliation terminée."
                },
                error: "Échec de l'audit financier."
            })
        })
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                     <div className="mb-2 bg-gradient-to-r from-blue-500 to-slate-800 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-flex items-center gap-2 shadow-sm">
                        <ShieldCheck size={12} /> Audit & Sécurité
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3 mt-2">
                        <Activity className="text-blue-500" size={32} /> Rapprochement Bancaire
                    </h1>
                    <p className="text-sm font-medium text-gray-500 mt-1">
                        Tableau de contrôle automatisé entre le système QAPRIL et les passerelles de paiement (Wave, Orange, etc.)
                    </p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => handleRecon(PaymentCanal.WAVE)}
                        disabled={isPending}
                        className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#2c6aa5] transition-all shadow-md flex items-center gap-2 disabled:opacity-50">
                        <RefreshCw size={16} className={isPending ? 'animate-spin' : ''} /> Synchroniser Wave
                    </button>
                    <button 
                         onClick={() => handleRecon(PaymentCanal.ORANGE)}
                        disabled={isPending}
                        className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-md flex items-center gap-2 disabled:opacity-50">
                        <Smartphone size={16} /> Synchroniser OM
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                     <p className="text-[10px] uppercase tracking-widest font-black text-gray-500">Opérations Contrôlées Ce Mois</p>
                     <p className="text-3xl font-black text-slate-800 mt-1">{recons.reduce((acc, r)=> acc + r.nbTransactionsQapril, 0)}</p>
                 </div>
                 <div className="bg-green-50 border border-green-200 rounded-3xl p-6 shadow-sm">
                     <p className="text-[10px] uppercase tracking-widest font-black text-green-700">Volume Total (FCFA)</p>
                     <p className="text-2xl font-black text-green-700 mt-1">{recons.reduce((acc, r)=> acc + r.montantTotalQapril, 0).toLocaleString()} <span className="text-sm">FCFA</span></p>
                 </div>
                 <div className="bg-red-50 border border-red-200 rounded-3xl p-6 shadow-sm">
                     <p className="text-[10px] uppercase tracking-widest font-black text-red-700">Écarts à régulariser (Anomalies)</p>
                     <p className="text-3xl font-black text-red-600 mt-1">{recons.reduce((acc, r)=> acc + r.nbEcarts, 0)}</p>
                 </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                        Historique des Audits
                    </h2>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-white border-b border-gray-100">
                                <th className="p-4 font-black text-[9px] uppercase tracking-widest text-gray-400">Date de l'Audit</th>
                                <th className="p-4 font-black text-[9px] uppercase tracking-widest text-gray-400">Passerelle</th>
                                <th className="p-4 font-black text-[9px] uppercase tracking-widest text-gray-400">Volume Vérifié (Qapril / Opérateur)</th>
                                <th className="p-4 font-black text-[9px] uppercase tracking-widest text-gray-400">Écarts (Différentiel)</th>
                                <th className="p-4 font-black text-[9px] uppercase tracking-widest text-gray-400 text-right">Statut / Rapport</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recons.map((r: any) => (
                                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4">
                                        <p className="font-bold text-sm text-slate-800">{new Date(r.dateRecon).toLocaleDateString()}</p>
                                        <p className="text-[10px] font-black uppercase text-gray-400">{new Date(r.dateRecon).toLocaleTimeString()}</p>
                                    </td>
                                    <td className="p-4 font-black text-xs text-slate-800">
                                         <span className={`px-3 py-1 rounded-full text-[9px] ${r.canal === 'WAVE' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {r.canal}
                                         </span>
                                    </td>
                                    <td className="p-4">
                                         <p className="font-bold text-xs text-green-600">{r.montantTotalQapril.toLocaleString()} F <span className="text-[9px] text-gray-400">({r.nbTransactionsQapril} trx)</span></p>
                                         <p className="text-[10px] font-medium text-gray-500 mt-1">{r.montantTotalOperateur?.toLocaleString() || '-'} F chez l'opérateur</p>
                                    </td>
                                    <td className="p-4">
                                        {r.nbEcarts === 0 ? (
                                             <span className="text-[10px] font-black uppercase text-green-600 flex items-center gap-1.5"><CheckCircle size={14}/> Zéro</span>
                                        ) : (
                                            <span className="text-[10px] font-black uppercase text-red-600 flex items-center gap-1.5"><AlertTriangle size={14}/> {r.nbEcarts} Éc.</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                         {r.nbEcarts === 0 ? (
                                              <span className="inline-flex items-center justify-center px-4 h-8 rounded-lg bg-green-50 text-green-600 text-[9px] uppercase font-black tracking-widest">OK Clôturé</span>
                                         ) : (
                                              <button onClick={() => toast.info('Ouverture du rapport des anomalies...')} className="inline-flex items-center justify-center px-4 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors text-[9px] uppercase font-black tracking-widest border border-red-200">
                                                  Visualiser Écarts
                                              </button>
                                         )}
                                    </td>
                                </tr>
                            ))}
                            {recons.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-gray-400 font-bold text-sm">
                                        Aucun audit de rapprochement financier n'a été effectué ce mois-ci.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
