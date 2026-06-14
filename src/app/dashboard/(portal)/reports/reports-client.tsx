"use client"

import React, { useState, useTransition } from "react"
import { FileText, Download, ChartPie, CheckCircle, Clock, Calendar, CheckSquare, Search, SendHorizontal, Calculator } from "lucide-react"
import { toast } from "sonner";
import { payFinancialReport, exportExcelHistory, exportPdfReport, closeMonthWithAI } from "@/actions/report-actions"
import { SectionCard } from "@/components/dashboard/ui/SectionCard"
import { StatCard } from "@/components/dashboard/ui/StatCard"
import { Badge } from "@/components/dashboard/ui/Badge"

export default function ReportsDashboardClient({ initialReports }: { initialReports: any[] }) {
    const [reports, setReports] = useState(initialReports)
    const [isPending, startTransition] = useTransition()

    const totalNetAttente = reports.filter((c: any) => c.status === "EN_ATTENTE").reduce((acc: number, c: any) => acc + c.netPayout, 0)
    const totalComActuelle = reports.filter((c: any) => c.status === "EN_ATTENTE").reduce((acc: number, c: any) => acc + c.agencyFee, 0)
    const totalNetPaye = reports.filter((c: any) => c.status === "PAYE").reduce((acc: number, c: any) => acc + c.netPayout, 0)

    const handlePay = (id: string) => {
        startTransition(async () => {
             const res = await payFinancialReport(id)
             if (res.error) toast.error(res.error)
             else {
                 toast.success("Reversement CRG effectué avec succès au propriétaire.")
                 setReports(prev => prev.map(r => r.id === id ? { ...r, status: "PAYE" } : r))
             }
        })
    }

    return (
        <div className="space-y-6 relative">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                     <div className="mb-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full inline-flex items-center gap-2 shadow-sm">
                        <ChartPie size={12} /> B2B Finance
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3 mt-2">
                        <FileText className="text-emerald-600" size={32} /> Comptes Rendus (CRG)
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Le récapitulatif comptable exact à reverser à vos propriétaires mandants.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => {
                        startTransition(async () => {
                            const res = await exportExcelHistory();
                            if(res.success) toast.success("Historique Excel prêt et téléchargé.");
                        })
                    }} disabled={isPending} className="bg-white border text-slate-700 border-slate-200 px-5 py-2.5 rounded-[10px] font-bold text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50">
                        <Calendar size={16} /> Historique Mensuel
                    </button>
                    <button onClick={() => {
                        startTransition(async () => {
                            toast.loading("Lancement du moteur IA comptable...", { id: "ai-close" })
                            const res = await closeMonthWithAI(reports[0]?.period || 'mois');
                            if(res.success) toast.success(res.message, { id: "ai-close" });
                            else toast.error("Échec IA", { id: "ai-close" });
                        })
                    }} disabled={isPending} className="bg-emerald-600 text-white px-5 py-2.5 rounded-[10px] font-bold text-[11px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md flex items-center gap-2 disabled:opacity-50">
                        <Calculator size={16} /> Clôturer {reports[0]?.period || 'le mois'}
                    </button>
                </div>
            </div>

            {/* Dashboard KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    label="Mois en cours" 
                    value={reports[0]?.period || new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' })} 
                    sub="Clôture IA disponible" 
                />
                <StatCard 
                    label="Chiffre d'Affaire" 
                    value={`${reports.reduce((acc: number, c: any) => acc + c.totalGross, 0).toLocaleString()} FCFA`} 
                    sub="Loyer Brut Global" 
                />
                <StatCard 
                    label="Commissions Agence" 
                    value={`${totalComActuelle.toLocaleString()} FCFA`} 
                    sub="Gains nets attendus" 
                />
                 <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 p-6 rounded-[16px] shadow-lg flex flex-col justify-center relative overflow-hidden text-white border border-emerald-700">
                    <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest mb-1 relative z-10 flex items-center gap-1.5"><SendHorizontal size={14}/> À Virer (Propriétaires)</span>
                    <span className="text-3xl font-black relative z-10">{totalNetAttente.toLocaleString()} <span className="text-sm">FCFA</span></span>
                    <Calculator className="absolute -right-4 -bottom-4 text-emerald-400 opacity-10" size={100} />
                </div>
            </div>

            {/* CRG Table */}
            <SectionCard title="Bordereaux de Reversement" noPadding>
                <div className="p-4 border-b border-slate-100 flex items-center justify-end bg-slate-50">
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input type="text" placeholder="Rechercher propriétaire..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-[8px] text-[13px] font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm" />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Propriétaire & Mois</th>
                                <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Loyer Brut</th>
                                <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Retenues (Comm + TVA)</th>
                                <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Travaux</th>
                                <th className="p-4 font-black text-[10px] uppercase tracking-widest text-emerald-700 bg-emerald-50 border-x border-emerald-100">NET À VIRER</th>
                                <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {reports.map((c: any) => (
                                <tr key={c.id} className={`transition-colors ${c.status === 'PAYE' ? 'bg-slate-50/50 opacity-75' : 'hover:bg-slate-50/50'}`}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-[13.5px] text-slate-800 shadow-sm">
                                                {c.ownerName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[13.5px] text-slate-900">{c.ownerName}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{c.period}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                    <span className="text-[11px] font-bold text-slate-400">{c.propertiesCount} Bien(s)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-[13.5px] text-slate-800">
                                        {c.totalGross.toLocaleString()} FCFA
                                    </td>
                                    <td className="p-4">
                                        <p className="font-bold text-[13px] text-rose-600">-{c.agencyFee.toLocaleString()} FCFA</p>
                                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">TVA: {c.tva.toLocaleString()} FCFA</p>
                                    </td>
                                    <td className="p-4 font-bold text-[13px] text-amber-600">
                                        {c.repairCosts > 0 ? `-${c.repairCosts.toLocaleString()} FCFA` : '-'}
                                    </td>
                                    <td className="p-4 bg-emerald-50/50 font-black text-[15px] text-emerald-700 border-x border-emerald-50">
                                        {c.netPayout.toLocaleString()} FCFA
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {c.status === 'PAYE' ? (
                                                <span className="inline-flex items-center justify-center px-3 h-8 gap-1.5 rounded-[8px] bg-emerald-100 text-emerald-700 cursor-default text-[10px] uppercase font-bold tracking-widest" title="Reversement Effectué">
                                                    <CheckCircle size={14} /> Réglé
                                                </span>
                                            ) : (
                                                <button 
                                                    onClick={() => handlePay(c.id)} 
                                                    disabled={isPending}
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-[8px] bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors disabled:opacity-50" 
                                                    title="Payer (Reversement)">
                                                    <Clock size={14} />
                                                </button>
                                            )}
                                            <button onClick={() => {
                                                startTransition(async () => {
                                                    await exportPdfReport(c.id);
                                                    toast.success("Bordereau PDF téléchargé avec succès.");
                                                })
                                            }} className="inline-flex items-center justify-center w-8 h-8 rounded-[8px] bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm" title="Télécharger PDF">
                                                <Download size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </SectionCard>
        </div>
    )
}
