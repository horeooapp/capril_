"use client"

import React, { useState, useTransition } from "react"
import { Wrench, Search, MapPin, AlertTriangle, PenTool, CheckCircle, Clock } from "lucide-react"
import { toast } from "sonner";
import { resolveMaintenanceTicket } from "@/actions/maintenance-actions";

export default function MaintenanceDashboardClient({ initialIncidents }: { initialIncidents: any[] }) {
    const [incidents] = useState<any[]>(initialIncidents.length > 0 ? initialIncidents : [])
    const [isPending, startTransition] = useTransition()

    const handleResolve = (id: string) => {
        startTransition(async () => {
             const promise = resolveMaintenanceTicket(id)
             toast.promise(promise, {
                 loading: "Fermeture du ticket en cours...",
                 success: "Le ticket de maintenance a été résolu avec succès.",
                 error: "Erreur lors de la résolution."
             })
        })
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <Wrench className="text-qorange" size={32} /> Maintenance
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Gestion des incidents, sinistres et tickets locataires.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => toast.success('Ouverture de la déclaration CACI...')} className="bg-qnavy text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qnavy-dark transition-all shadow-md flex items-center gap-2">
                        Déclarer Sinistre
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-qgrey-2 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-qgrey-2 flex items-center justify-between bg-qgrey-1/30">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Rechercher un ticket..." className="w-full pl-10 pr-4 py-3 bg-white border border-qgrey-2 rounded-xl text-sm font-bold focus:outline-none focus:border-qorange focus:ring-1 focus:ring-qorange transition-all" />
                    </div>
                </div>

                <div className="p-10 space-y-4">
                    {incidents.map(inc => (
                        <div key={inc.id} className={`bg-white border ${inc.statut === 'RÉSOLU' || inc.statut === 'RESOLU' ? 'border-qgreen' : 'border-qorange'} rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-center gap-6`}>
                            <div className="flex items-center gap-6">
                                <div className={`w-14 h-14 ${inc.statut === 'RÉSOLU' || inc.statut === 'RESOLU' ? 'bg-qgreen-pale text-qgreen' : 'bg-qorange-pale text-qorange'} rounded-xl flex items-center justify-center font-black text-xl`}>
                                   {inc.statut === 'RÉSOLU' || inc.statut === 'RESOLU' ? <CheckCircle size={24}/> : <AlertTriangle size={24}/>}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-qnavy-dark">{inc.designation || inc.description?.substring(0,30) || 'Sinistre Declaré'}</h3>
                                    <p className="text-xs font-bold text-qtext-mid mt-1 flex items-center gap-1"><MapPin size={12}/> {inc.logement?.address || 'Localisation Inconnue'}</p>
                                    <p className="text-[10px] text-qtext-light font-bold mt-1 uppercase tracking-widest">{inc.locataire ? `${inc.locataire.firstName} ${inc.locataire.lastName}` : 'Anonyme'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-center md:mr-8 hidden md:block">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-qtext-light">Statut</p>
                                    <p className={`text-xs font-black ${inc.statut === 'RÉSOLU' || inc.statut === 'RESOLU' ? 'text-qgreen' : 'text-qorange'}`}>{inc.statut}</p>
                                </div>
                                {inc.statut !== 'RÉSOLU' && inc.statut !== 'RESOLU' && (
                                    <button 
                                        onClick={() => handleResolve(inc.id)} 
                                        disabled={isPending}
                                        className="text-[10px] font-black uppercase tracking-widest text-white transition-colors bg-qnavy hover:bg-qgreen-dark py-2 px-4 rounded-lg shadow disabled:opacity-50">
                                        Résoudre
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {incidents.length === 0 && (
                        <div className="text-center p-10 font-bold text-qtext-light">
                            Aucun ticket de maintenance à afficher.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
