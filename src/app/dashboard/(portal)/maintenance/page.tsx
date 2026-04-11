"use client"

import React, { useState } from "react"
import { Wrench, CheckCircle, Clock, AlertTriangle, Plus, Search, Filter, PenTool } from "lucide-react"

export default function MaintenanceDashboardPage() {
    const [tickets] = useState<any[]>([
        { id: "MAI-26-001", location: "Résidence Le Saphir, Appt 2B", categorie: "PLOMBERIE", urgence: "HAUTE", status: "SIGNALE" },
        { id: "MAI-26-002", location: "Villa Riviera 3", categorie: "ELECTRICITE", urgence: "NORMALE", status: "EN_COURS" },
        { id: "MAI-26-003", location: "Studio Palmeraie", categorie: "MENUISERIE", urgence: "BASSE", status: "RESOLU" }
    ])

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <Wrench className="text-qblue" size={32} /> Tickets & Pannes
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Gérez les incidents déclarés par les locataires et suivez les réparations.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-qnavy text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qnavy-dark transition-all shadow-md flex items-center gap-2">
                        <Plus size={16} /> Déclarer Panne
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                 <div className="bg-white border border-qgrey-2 rounded-3xl p-6 shadow-sm">
                     <p className="text-[10px] uppercase tracking-widest font-black text-qtext-light">Tickets Ouverts</p>
                     <p className="text-3xl font-black text-qred mt-1">2</p>
                 </div>
                 <div className="bg-white border border-qgrey-2 rounded-3xl p-6 shadow-sm">
                     <p className="text-[10px] uppercase tracking-widest font-black text-qtext-light">En cours d'intervention</p>
                     <p className="text-3xl font-black text-qorange mt-1">1</p>
                 </div>
                 <div className="bg-qblue-pale border border-qblue/20 rounded-3xl p-6 shadow-sm">
                     <p className="text-[10px] uppercase tracking-widest font-black text-qblue-dark">Coût Total Artisans</p>
                     <p className="text-3xl font-black text-qblue mt-1">0 <span className="text-sm">FCFA</span></p>
                 </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-qgrey-2 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-qgrey-2 flex flex-col md:flex-row justify-between items-center gap-4 bg-qgrey-1/30">
                    <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Rechercher un ticket..." className="w-full pl-10 pr-4 py-3 bg-white border border-qgrey-2 rounded-xl text-sm font-bold focus:outline-none focus:border-qblue focus:ring-1 focus:ring-qblue transition-all" />
                    </div>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white border-b border-qgrey-2">
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">ID Incident</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Lieu</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Catégorie</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Urgence</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Statut</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light text-right">Devis</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map(t => (
                            <tr key={t.id} className="border-b border-qgrey-2 hover:bg-qgrey-1/30 transition-colors group cursor-pointer">
                                <td className="p-5 font-bold text-xs text-qnavy-dark">{t.id}</td>
                                <td className="p-5 font-bold text-sm text-qtext-mid">{t.location}</td>
                                <td className="p-5">
                                    <div className="flex items-center gap-2">
                                        <PenTool size={14} className="text-qblue"/>
                                        <span className="font-bold text-xs text-qnavy">{t.categorie}</span>
                                    </div>
                                </td>
                                <td className="p-5">
                                    {t.urgence === 'HAUTE' && <span className="text-[10px] font-black tracking-widest text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">HAUTE</span>}
                                    {t.urgence === 'NORMALE' && <span className="text-[10px] font-black tracking-widest text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100">NORMALE</span>}
                                    {t.urgence === 'BASSE' && <span className="text-[10px] font-black tracking-widest text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100">BASSE</span>}
                                </td>
                                <td className="p-5">
                                    {t.status === 'SIGNALE' && <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-qnavy bg-qgrey-2 px-3 py-1.5 rounded-lg"><AlertTriangle size={10}/> Signalé</span>}
                                    {t.status === 'EN_COURS' && <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-qorange bg-qorange-pale px-3 py-1.5 rounded-lg"><Clock size={10}/> En Travaux</span>}
                                    {t.status === 'RESOLU' && <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-qgreen bg-qgreen-pale px-3 py-1.5 rounded-lg"><CheckCircle size={10}/> Résolu</span>}
                                </td>
                                <td className="p-5 text-right">
                                    <button className="text-[10px] font-black uppercase tracking-widest text-qnavy hover:text-qblue transition-colors border border-qgrey-2 px-3 py-1.5 rounded-lg">Estimer</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
