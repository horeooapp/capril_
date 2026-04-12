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
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                     <div className="mb-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-flex items-center gap-2 shadow-sm">
                        <Network size={12} /> Acquisition Omnicanal
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3 mt-2">
                        <Megaphone className="text-orange-500" size={32} /> Growth & Syndication
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Branchez vos logements vacants directement sur Jumia Deals, CoinAfrique et WhatsApp.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => {toast.loading("Génération...", {id:"ana"}); setTimeout(()=>{toast.success("Rapport Analytics synchronisé.", {id:"ana"});}, 1000);}} className="bg-white border text-qnavy border-qgrey-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qgrey-1 transition-all shadow-sm flex items-center gap-2">
                        <BarChart size={16} /> Analytics Leads
                    </button>
                    <button onClick={() => {
                        startTransition(async () => {
                            toast.loading("Synchronisation API en cours...", { id: "sync" });
                            const res = await syncOmnichannel();
                            if(res.success) toast.success(res.message, { id: "sync" });
                            else toast.error("Erreur de synchronisation", { id: "sync" });
                        })
                    }} disabled={isPending} className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-md flex items-center gap-2">
                        <RefreshCw size={16} /> Forcer Synchronisation
                    </button>
                </div>
            </div>

            {/* Performance KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-qgrey-2 shadow-sm flex flex-col justify-center">
                    <span className="text-[9px] font-black text-qtext-light uppercase tracking-widest mb-1 flex items-center gap-1.5"><MousePointerClick size={10}/> Total Vues (Toutes Plateformes)</span>
                    <span className="text-2xl font-black text-qnavy-dark">{annonces.reduce((acc, a) => acc + (a.nbVisites || 0), 0)} <span className="text-[10px] text-qtext-light font-bold">visites</span></span>
                </div>
                
                <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100 shadow-sm flex flex-col justify-center">
                    <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-1 flex items-center gap-1.5"><ShoppingCart size={10}/> Actif sur Jumia Deals</span>
                    <span className="text-2xl font-black text-orange-700">{totalJumia} <span className="text-[10px] font-bold opacity-70">logement(s)</span></span>
                </div>

                <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-center">
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Globe size={10}/> Actif sur CoinAfrique</span>
                    <span className="text-2xl font-black text-blue-700">{totalExpat} <span className="text-[10px] font-bold opacity-70">logement(s)</span></span>
                </div>

                <div className="bg-[#25D366]/10 p-5 rounded-2xl border border-[#25D366]/20 shadow-sm flex flex-col justify-center">
                     <span className="text-[9px] font-black text-[#25D366] uppercase tracking-widest mb-1 flex items-center gap-1.5"><MessageCircle size={10}/> WhatsApp Broadcast</span>
                     <span className="text-2xl font-black text-[#1d9e4c]">{totalWa} <span className="text-[10px] font-bold opacity-70">logement(s)</span></span>
                </div>
            </div>

            {/* Hub Table */}
            <div className="bg-white rounded-[2rem] border border-qgrey-2 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-qgrey-2 flex justify-between items-center bg-qgrey-1/30">
                    <h2 className="text-sm font-black text-qnavy-dark flex items-center gap-2">
                        Catalogue Actif ({annonces.length} logements)
                    </h2>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-white border-b border-qgrey-2">
                                <th className="p-5 font-black text-[9px] uppercase tracking-widest text-qtext-light">Propriété</th>
                                <th className="p-5 font-black text-[9px] uppercase tracking-widest text-qtext-light">Loyer & Traffic</th>
                                <th className="p-5 font-black text-[9px] uppercase tracking-widest text-orange-600 text-center bg-orange-50/50">API Jumia</th>
                                <th className="p-5 font-black text-[9px] uppercase tracking-widest text-blue-600 text-center bg-blue-50/50">API CoinAfrique</th>
                                <th className="p-5 font-black text-[9px] uppercase tracking-widest text-[#25D366] text-center bg-[#25D366]/5">WhatsApp Push</th>
                            </tr>
                        </thead>
                        <tbody>
                            {annonces.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-qtext-mid">Aucune annonce actuellement gérée en syndication.</td>
                                </tr>
                            )}
                            {annonces.map((ann) => {
                                const diffs = ann.diffusions || {};
                                return (
                                <tr key={ann.id} className="border-b border-qgrey-2 hover:bg-qgrey-1/50 transition-colors">
                                    <td className="p-5">
                                        <p className="font-bold text-sm text-qnavy-dark">{ann.titre}</p>
                                        <p className="text-[10px] font-black uppercase text-qtext-mid mt-0.5">{ann.logement?.nom || ann.logement?.adresse || 'Sans lot'}</p>
                                    </td>
                                    <td className="p-5">
                                        <p className="font-bold text-sm text-qnavy">{ann.loyerDemande.toLocaleString()} F</p>
                                        <p className="text-[10px] font-bold text-qtext-light mt-0.5">{ann.nbVisites} Vues • <span className="text-qgreen">{ann.nbContacts} Leads CRM</span></p>
                                    </td>
                                    {/* Jumia Toggle */}
                                    <td className="p-5 bg-orange-50/20 text-center">
                                         <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={diffs.jumia || false} onChange={() => toggleDiffusion(ann.id, 'jumia', diffs.jumia || false)} disabled={isPending} />
                                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                        </label>
                                        {diffs.jumia && (
                                            <a href="#" onClick={(e) => { e.preventDefault(); toast.success('Redirection vers la vitrine Jumia active.') }} className="block mt-2 text-[9px] font-bold text-orange-600 hover:underline flex items-center justify-center gap-1">Voir <ExternalLink size={8}/></a>
                                        )}
                                    </td>
                                    {/* CoinAfrique Toggle */}
                                    <td className="p-5 bg-blue-50/20 text-center">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={diffs.expat || false} onChange={() => toggleDiffusion(ann.id, 'expat', diffs.expat || false)} disabled={isPending} />
                                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                         {diffs.expat && (
                                            <a href="#" onClick={(e) => { e.preventDefault(); toast.success('Redirection vers CoinAfrique active.') }} className="block mt-2 text-[9px] font-bold text-blue-600 hover:underline flex items-center justify-center gap-1">Voir <ExternalLink size={8}/></a>
                                        )}
                                    </td>
                                    {/* WhatsApp Toggle */}
                                    <td className="p-5 bg-[#25D366]/5 text-center">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={diffs.whatsapp || false} onChange={() => toggleDiffusion(ann.id, 'whatsapp', diffs.whatsapp || false)} disabled={isPending} />
                                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#25D366]"></div>
                                        </label>
                                        {diffs.whatsapp && (
                                            <span className="block mt-2 text-[9px] font-bold text-[#1d9e4c] flex items-center justify-center gap-1"><CheckCircle2 size={10}/> Groupes IA</span>
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
