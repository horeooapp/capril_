"use client"

import React, { useState } from "react"
import { Megaphone, Globe, CheckCircle2, ShoppingCart, MessageCircle, ExternalLink, Activity, Network, MousePointerClick, RefreshCw, BarChart } from "lucide-react"
import { toast } from "sonner";

export default function SyndicationDashboardPage() {
    // Mock Annonces Vacantes
    const [annonces, setAnnonces] = useState([
        {
            id: "ANN-1092",
            titre: "Studio Haut Standing - Biétry",
            loyer: 350000,
            statut: "VACANT",
            vues: 142,
            leads: 12,
            jumia: true,
            expat: false,
            whatsapp: true,
            jumiaRef: "JUMIA-CI-84729"
        },
        {
            id: "ANN-1095",
            titre: "Villa Duplex 5 Pièces - Angré",
            loyer: 800000,
            statut: "VACANT",
            vues: 56,
            leads: 3,
            jumia: false,
            expat: true,
            whatsapp: false,
            expatRef: "COINAF-2291"
        }
    ])

    const toggleDiffusion = (index: number, channel: 'jumia' | 'expat' | 'whatsapp') => {
        const updated = [...annonces]
        updated[index][channel] = !updated[index][channel]
        // Simulate API call to Marketplace
        setAnnonces(updated)
    }

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
                    <button onClick={() => toast.promise(new Promise(r=>setTimeout(r,1000)), {loading:'Génération...', success:'Rapport Analytics synchronisé.'})} className="bg-white border text-qnavy border-qgrey-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qgrey-1 transition-all shadow-sm flex items-center gap-2">
                        <BarChart size={16} /> Analytics Leads
                    </button>
                    <button onClick={() => toast.promise(new Promise(r=>setTimeout(r,2000)), {loading:'Synchronisation API en cours...', success:'Toutes les plateformes sont à jour.'})} className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-md flex items-center gap-2">
                        <RefreshCw size={16} /> Forcer Synchronisation
                    </button>
                </div>
            </div>

            {/* Performance KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-qgrey-2 shadow-sm flex flex-col justify-center">
                    <span className="text-[9px] font-black text-qtext-light uppercase tracking-widest mb-1 flex items-center gap-1.5"><MousePointerClick size={10}/> Total Vues (Toutes Plateformes)</span>
                    <span className="text-2xl font-black text-qnavy-dark">198 <span className="text-[10px] text-qtext-light font-bold">visites</span></span>
                </div>
                
                <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100 shadow-sm flex flex-col justify-center">
                    <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-1 flex items-center gap-1.5"><ShoppingCart size={10}/> Actif sur Jumia Deals</span>
                    <span className="text-2xl font-black text-orange-700">01 <span className="text-[10px] font-bold opacity-70">logement</span></span>
                </div>

                <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-center">
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Globe size={10}/> Actif sur CoinAfrique</span>
                    <span className="text-2xl font-black text-blue-700">01 <span className="text-[10px] font-bold opacity-70">logement</span></span>
                </div>

                <div className="bg-[#25D366]/10 p-5 rounded-2xl border border-[#25D366]/20 shadow-sm flex flex-col justify-center">
                     <span className="text-[9px] font-black text-[#25D366] uppercase tracking-widest mb-1 flex items-center gap-1.5"><MessageCircle size={10}/> WhatsApp Broadcast</span>
                     <span className="text-2xl font-black text-[#1d9e4c]">01 <span className="text-[10px] font-bold opacity-70">logement</span></span>
                </div>
            </div>

            {/* Hub Table */}
            <div className="bg-white rounded-[2rem] border border-qgrey-2 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-qgrey-2 flex justify-between items-center bg-qgrey-1/30">
                    <h2 className="text-sm font-black text-qnavy-dark flex items-center gap-2">
                        Catalogue Actif (Logements Vacants)
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
                            {annonces.map((ann, idx) => (
                                <tr key={ann.id} className="border-b border-qgrey-2 hover:bg-qgrey-1/50 transition-colors">
                                    <td className="p-5">
                                        <p className="font-bold text-sm text-qnavy-dark">{ann.titre}</p>
                                        <p className="text-[10px] font-black uppercase text-qtext-mid mt-0.5">{ann.id}</p>
                                    </td>
                                    <td className="p-5">
                                        <p className="font-bold text-sm text-qnavy">{ann.loyer.toLocaleString()} F</p>
                                        <p className="text-[10px] font-bold text-qtext-light mt-0.5">{ann.vues} Vues • <span className="text-qgreen">{ann.leads} Leads CRM</span></p>
                                    </td>
                                    {/* Jumia Toggle */}
                                    <td className="p-5 bg-orange-50/20 text-center">
                                         <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={ann.jumia} onChange={() => toggleDiffusion(idx, 'jumia')} />
                                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                        </label>
                                        {ann.jumia && ann.jumiaRef && (
                                            <a href="#" onClick={(e) => { e.preventDefault(); toast.success('Redirection vers la vitrine Jumia active.') }} className="block mt-2 text-[9px] font-bold text-orange-600 hover:underline flex items-center justify-center gap-1">Voir <ExternalLink size={8}/></a>
                                        )}
                                    </td>
                                    {/* CoinAfrique Toggle */}
                                    <td className="p-5 bg-blue-50/20 text-center">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={ann.expat} onChange={() => toggleDiffusion(idx, 'expat')} />
                                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                         {ann.expat && ann.expatRef && (
                                            <a href="#" onClick={(e) => { e.preventDefault(); toast.success('Redirection vers CoinAfrique active.') }} className="block mt-2 text-[9px] font-bold text-blue-600 hover:underline flex items-center justify-center gap-1">Voir <ExternalLink size={8}/></a>
                                        )}
                                    </td>
                                    {/* WhatsApp Toggle */}
                                    <td className="p-5 bg-[#25D366]/5 text-center">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={ann.whatsapp} onChange={() => toggleDiffusion(idx, 'whatsapp')} />
                                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#25D366]"></div>
                                        </label>
                                        {ann.whatsapp && (
                                            <span className="block mt-2 text-[9px] font-bold text-[#1d9e4c] flex items-center justify-center gap-1"><CheckCircle2 size={10}/> Groupes IA</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
