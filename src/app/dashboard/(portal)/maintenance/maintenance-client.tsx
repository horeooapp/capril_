"use client"

import React, { useState, useTransition } from "react"
import { Wrench, Search, MapPin, AlertTriangle, CheckCircle } from "lucide-react"
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { resolveMaintenanceTicket } from "@/actions/maintenance-actions";
import { SectionCard } from "@/components/dashboard/ui/SectionCard";
import { Badge } from "@/components/dashboard/ui/Badge";

export default function MaintenanceDashboardClient({ initialIncidents }: { initialIncidents: any[] }) {
    const [incidents] = useState<any[]>(initialIncidents.length > 0 ? initialIncidents : [])
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

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
        <div className="space-y-6">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                        <Wrench className="text-amber-500" size={32} /> Maintenance
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Gestion des incidents, sinistres et tickets locataires.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => router.push("/dashboard/maintenance/new")} className="bg-slate-800 text-white px-5 py-2.5 rounded-[10px] font-bold text-[11px] uppercase tracking-widest hover:bg-slate-700 transition-colors shadow-sm flex items-center gap-2">
                        Déclarer Sinistre
                    </button>
                </div>
            </div>

            <SectionCard title="Registre des Tickets" noPadding>
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="text" placeholder="Rechercher un ticket..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-[8px] text-[13px] font-medium focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-sm" />
                    </div>
                </div>

                <div className="p-6 space-y-4 bg-white">
                    {incidents.map(inc => {
                        const isResolved = inc.statut === 'RÉSOLU' || inc.statut === 'RESOLU';
                        return (
                            <div key={inc.id} className={`bg-white border ${isResolved ? 'border-emerald-200' : 'border-amber-200'} rounded-[12px] p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-center gap-6`}>
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 ${isResolved ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'} rounded-[10px] flex items-center justify-center font-black text-xl shadow-sm`}>
                                       {isResolved ? <CheckCircle size={22}/> : <AlertTriangle size={22}/>}
                                    </div>
                                    <div>
                                        <h3 className="text-[15px] font-bold text-slate-900">{inc.designation || inc.description?.substring(0,30) || 'Sinistre Declaré'}</h3>
                                        <p className="text-[12px] font-semibold text-slate-500 mt-1 flex items-center gap-1.5">
                                            <MapPin size={12} className="text-slate-400"/> {inc.logement?.address || 'Localisation Inconnue'}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase tracking-widest">{inc.locataire ? `${inc.locataire.firstName} ${inc.locataire.lastName}` : 'Anonyme'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                                    <div className="text-center md:mr-4 hidden md:block">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Statut</p>
                                        <Badge color={isResolved ? 'emerald' : 'amber'}>{inc.statut}</Badge>
                                    </div>
                                    {!isResolved && (
                                        <button 
                                            onClick={() => handleResolve(inc.id)} 
                                            disabled={isPending}
                                            className="w-full md:w-auto text-[11px] font-bold uppercase tracking-wider text-white transition-colors bg-slate-800 hover:bg-emerald-600 py-2.5 px-5 rounded-[8px] shadow-sm flex items-center justify-center gap-2 disabled:opacity-60">
                                            Résoudre
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}

                    {incidents.length === 0 && (
                        <div className="text-center py-12">
                             <Wrench className="text-slate-200 mx-auto mb-3" size={32} />
                             <p className="text-[13px] font-medium text-slate-500">Aucun ticket de maintenance à afficher.</p>
                        </div>
                    )}
                </div>
            </SectionCard>
        </div>
    )
}
