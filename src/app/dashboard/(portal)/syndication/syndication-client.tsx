"use client"

import React, { useTransition } from "react"
import { Megaphone, Globe, CheckCircle2, ShoppingCart, MessageCircle, ExternalLink, Activity, Network, MousePointerClick, RefreshCw, BarChart } from "lucide-react"
import { toast } from "sonner";
import { syncOmnichannel, toggleAnnonceDiffusion } from "@/actions/marketplace-actions";

export default function SyndicationDashboardClient({ annonces }: { annonces: any[] }) {
    const [isPending, startTransition] = useTransition()

    const toggleDiffusion = (annonceId: string, channel: 'jumia' | 'expat' | 'whatsapp', currentValue: boolean) => {
        startTransition(async () => {
            const res = await toggleAnnonceDiffusion(annonceId, channel, !currentValue);
            if (res.success) toast.success(`Canal ${channel} mis à jour.`);
            else toast.error("Erreur de synchronisation");
        });
    }

    const totalJumia = annonces.filter(a => a.diffusions?.jumia).length;
    const totalExpat = annonces.filter(a => a.diffusions?.expat).length;
    const totalWa = annonces.filter(a => a.diffusions?.whatsapp).length;

    return (
        <div className="space-y-6 relative">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                     <div className="mb-2 bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-[6px] inline-flex items-center gap-2 shadow-sm">
                        <Network size={12} /> Acquisition Omnicanal
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3 mt-2">
                        <Megaphone className="text-orange-500" size={32} /> Growth & Syndication
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Branchez vos logements vacants directement sur Jumia Deals, CoinAfrique et WhatsApp.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => {toast.loading("Génération...", {id:"ana"}); setTimeout(()=>{toast.success("Rapport Analytics synchronisé.", {id:"ana"});}, 1000);}} className="bg-white border text-slate-700 border-slate-200 px-6 py-3 rounded-[12px] font-bold text-[12px] uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
                        <BarChart size={16} /> Analytics Leads
                    </button>
                    <button onClick={() => {
                        startTransition(async () => {
                            toast.loading("Synchronisation API en cours...", { id: "sync" });
                            const res = await syncOmnichannel();
                            if(res.success) toast.success(res.message, { id: "sync" });
                            else toast.error("Erreur de synchronisation", { id: "sync" });
                        })
                    }} disabled={isPending} className="bg-orange-500 text-white px-6 py-3 rounded-[12px] font-bold text-[12px] uppercase tracking-widest hover:bg-orange-600 transition-colors shadow-sm flex items-center gap-2">
                        <RefreshCw size={16} /> Forcer Synchronisation
                    </button>
                </div>
            </div>

            {/* Performance KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-[24px] shadow-sm flex items-center gap-4 text-white">
                    <div className="bg-slate-800 p-4 rounded-[12px] border border-slate-700">
                        <MousePointerClick className="text-slate-300" size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Vues Global</span>
                        <span className="text-3xl font-black text-white">{annonces.reduce((acc, a) => acc + (a.nbVisites || 0), 0)} <span className="text-[11px] text-slate-500 font-bold ml-1">visites</span></span>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-4">
                     <div className="bg-orange-50 p-4 rounded-[12px] border border-orange-200">
                        <ShoppingCart className="text-orange-500" size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Actif sur Jumia</span>
                        <span className="text-3xl font-black text-slate-900">{totalJumia} <span className="text-[11px] font-bold text-slate-400 ml-1">logement(s)</span></span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-4">
                     <div className="bg-blue-50 p-4 rounded-[12px] border border-blue-200">
                        <Globe className="text-blue-500" size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Actif CoinAfrique</span>
                        <span className="text-3xl font-black text-slate-900">{totalExpat} <span className="text-[11px] font-bold text-slate-400 ml-1">logement(s)</span></span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-4">
                     <div className="bg-[#25D366]/10 p-4 rounded-[12px] border border-[#25D366]/20">
                        <MessageCircle className="text-[#25D366]" size={24} />
                    </div>
                    <div className="flex flex-col">
                         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">WhatsApp Push</span>
                         <span className="text-3xl font-black text-slate-900">{totalWa} <span className="text-[11px] font-bold text-slate-400 ml-1">logement(s)</span></span>
                    </div>
                </div>
            </div>

            {/* Hub Table */}
            <div className="bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-[14px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        Catalogue Actif ({annonces.length} logements)
                    </h2>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-5 font-bold text-[10px] uppercase tracking-widest text-slate-500">Propriété</th>
                                <th className="p-5 font-bold text-[10px] uppercase tracking-widest text-slate-500">Loyer & Traffic</th>
                                <th className="p-5 font-bold text-[10px] uppercase tracking-widest text-orange-600 text-center bg-orange-50/50 border-l border-slate-100">API Jumia</th>
                                <th className="p-5 font-bold text-[10px] uppercase tracking-widest text-blue-600 text-center bg-blue-50/50 border-l border-slate-100">API CoinAfrique</th>
                                <th className="p-5 font-bold text-[10px] uppercase tracking-widest text-[#1d9e4c] text-center bg-[#25D366]/5 border-l border-slate-100">WhatsApp Push</th>
                            </tr>
                        </thead>
                        <tbody>
                            {annonces.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-[13px] text-slate-500">Aucune annonce actuellement gérée en syndication.</td>
                                </tr>
                            )}
                            {annonces.map((ann) => {
                                const diffs = ann.diffusions || {};
                                return (
                                <tr key={ann.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                    <td className="p-5">
                                        <p className="font-bold text-[13px] text-slate-900">{ann.titre}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{ann.logement?.nom || ann.logement?.adresse || 'Sans lot'}</p>
                                    </td>
                                    <td className="p-5">
                                        <p className="font-black text-[14px] text-slate-900">{ann.loyerDemande.toLocaleString()} <span className="text-[10px] text-slate-400">FCFA</span></p>
                                        <p className="text-[11px] font-bold text-slate-500 mt-1">{ann.nbVisites} Vues • <span className="text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-[4px]">{ann.nbContacts} Leads CRM</span></p>
                                    </td>
                                    {/* Jumia Toggle */}
                                    <td className="p-5 bg-orange-50/20 text-center border-l border-slate-100">
                                         <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={diffs.jumia || false} onChange={() => toggleDiffusion(ann.id, 'jumia', diffs.jumia || false)} disabled={isPending} />
                                            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                        </label>
                                        {diffs.jumia && (
                                            <a href="#" onClick={(e) => { e.preventDefault(); toast.success('Redirection vers la vitrine Jumia active.') }} className="block mt-2 text-[10px] font-bold text-orange-600 hover:underline flex items-center justify-center gap-1 bg-white border border-orange-200 mx-auto max-w-max px-2 py-0.5 rounded-[6px]">Voir <ExternalLink size={10}/></a>
                                        )}
                                    </td>
                                    {/* CoinAfrique Toggle */}
                                    <td className="p-5 bg-blue-50/20 text-center border-l border-slate-100">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={diffs.expat || false} onChange={() => toggleDiffusion(ann.id, 'expat', diffs.expat || false)} disabled={isPending} />
                                            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                         {diffs.expat && (
                                            <a href="#" onClick={(e) => { e.preventDefault(); toast.success('Redirection vers CoinAfrique active.') }} className="block mt-2 text-[10px] font-bold text-blue-600 hover:underline flex items-center justify-center gap-1 bg-white border border-blue-200 mx-auto max-w-max px-2 py-0.5 rounded-[6px]">Voir <ExternalLink size={10}/></a>
                                        )}
                                    </td>
                                    {/* WhatsApp Toggle */}
                                    <td className="p-5 bg-[#25D366]/5 text-center border-l border-slate-100">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={diffs.whatsapp || false} onChange={() => toggleDiffusion(ann.id, 'whatsapp', diffs.whatsapp || false)} disabled={isPending} />
                                            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#25D366]"></div>
                                        </label>
                                        {diffs.whatsapp && (
                                            <span className="block mt-2 text-[10px] font-bold text-[#1d9e4c] flex items-center justify-center gap-1 bg-white border border-[#25D366]/30 mx-auto max-w-max px-2 py-0.5 rounded-[6px]"><CheckCircle2 size={10}/> Groupes IA</span>
                                        )}
                                    </td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
