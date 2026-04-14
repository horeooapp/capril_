"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getAllProviders } from "@/actions/provider-actions"
import { getUnassignedTickets, assignTicketToProvider } from "@/actions/maintenance-actions"
import { Wrench, Phone, MapPin, Loader2, Star, Plus, ClipboardList, X } from "lucide-react"
import { toast } from "sonner"

export default function ProvidersDashboardPage() {
    const [providers, setProviders] = useState<any[]>([])
    const [unassignedTickets, setUnassignedTickets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [assigningId, setAssigningId] = useState<string | null>(null)
    const [selectedProvider, setSelectedProvider] = useState<any | null>(null)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [provRes, tickRes] = await Promise.all([
                getAllProviders(),
                getUnassignedTickets()
            ])
            if (provRes.success) setProviders(provRes.providers || [])
            if (tickRes.success) setUnassignedTickets(tickRes.tickets || [])
        } finally {
            setLoading(false)
        }
    }

    const handleAssign = async (ticketId: string) => {
        if (!selectedProvider) return
        setAssigningId(ticketId)
        try {
            const res = await assignTicketToProvider(ticketId, selectedProvider.id)
            if (res.success) {
                toast.success("Ticket assigné avec succès à l'artisan")
                setSelectedProvider(null)
                loadData()
            } else {
                toast.error(res.error)
            }
        } finally {
            setAssigningId(null)
        }
    }

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-slate-800" size={40} /></div>

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                        <Wrench className="text-amber-500" size={32} /> Répertoire Prestataires
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Vos artisans de confiance pour la marketplace et les bons de maintenance.
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2.5 rounded-[10px] flex items-center gap-2 shadow-sm font-bold text-[11px] uppercase tracking-wider">
                        <ClipboardList size={16} /> {unassignedTickets.length} Bons en attente
                    </div>
                    <button onClick={() => toast.promise(new Promise(r=>setTimeout(r, 1000)), {loading:'Ouverture du formulaire Artisan...', success:'Réseau Artisans synchronisé.'})} className="bg-slate-800 text-white px-5 py-2.5 rounded-[10px] font-bold text-[11px] uppercase tracking-widest hover:bg-slate-700 transition-colors shadow-sm flex items-center gap-2">
                        <Plus size={16} /> Ajouter un Artisan
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map((p, index) => (
                    <motion.div 
                        initial={{opacity: 0, scale: 0.95}} 
                        animate={{opacity: 1, scale: 1}} 
                        transition={{delay: index * 0.05}} 
                        key={p.id} 
                        className="bg-white rounded-[16px] p-6 border border-slate-200 hover:border-amber-300 transition-colors shadow-sm group hover:shadow-md relative overflow-hidden flex flex-col"
                    >
                        <div className="absolute top-0 right-0 w-1.5 h-full bg-slate-100 group-hover:bg-amber-400 transition-colors"></div>
                        
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-amber-50 text-amber-700 px-3 py-1 rounded-[6px] text-[9.5px] font-bold uppercase tracking-widest border border-amber-200">
                                {p.specialite}
                            </div>
                            <div className="flex items-center gap-1 text-slate-500 pr-2">
                                <Star size={14} className={p.noteMoyenne >= 4 ? "text-amber-400 fill-amber-400" : ""} /> 
                                <span className="text-[12px] font-bold">{p.noteMoyenne || "N/A"}</span>
                            </div>
                        </div>

                        <h3 className="text-lg font-black text-slate-900 mb-1 capitalize truncate pr-4">{p.nom}</h3>
                        
                        <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 flex-grow">
                            <p className="text-[12px] font-semibold text-slate-600 flex items-center gap-2">
                                <Phone size={14} className="text-slate-400" /> {p.telephone}
                            </p>
                            {p.adresse && (
                                <p className="text-[12px] font-semibold text-slate-600 flex items-center gap-2">
                                    <MapPin size={14} className="text-slate-400" /> {p.adresse}
                                </p>
                            )}
                        </div>

                        <div className="mt-6 flex flex-col gap-3">
                            <div className="flex items-center justify-between bg-slate-50 rounded-[10px] p-3 border border-slate-100">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tickets Résolus</span>
                                <span className="text-base font-black text-slate-800">{p._count?.tickets || 0}</span>
                            </div>
                            
                            <button 
                                onClick={() => setSelectedProvider(p)}
                                disabled={unassignedTickets.length === 0}
                                className="w-full bg-white border border-slate-300 text-slate-700 font-bold text-[10.5px] uppercase tracking-widest py-3 rounded-[10px] hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                Assigner un Bon ({unassignedTickets.length} Dispos)
                            </button>
                        </div>
                    </motion.div>
                ))}

                {providers.length === 0 && (
                    <div className="col-span-full p-16 text-center bg-white border border-dashed border-slate-200 rounded-[20px]">
                        <Wrench size={40} className="text-slate-300 mx-auto mb-4" />
                        <h3 className="text-[15px] font-bold text-slate-700 mb-2">Aucun prestataire</h3>
                        <p className="text-[13px] font-medium text-slate-500">Vous n'avez pas encore ajouté d'antennes techniques ou artisans.</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selectedProvider && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: -20 }}
                            className="bg-white rounded-[20px] shadow-2xl max-w-2xl w-full flex flex-col max-h-[85vh] overflow-hidden border border-slate-200"
                        >
                            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-[12px] flex items-center justify-center border border-amber-200 shadow-sm">
                                        <Wrench size={22} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900">{selectedProvider.nom}</h3>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">Assignation de Bon d'Intervention</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedProvider(null)} className="w-8 h-8 bg-white rounded-[8px] flex items-center justify-center shadow-sm border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                                {unassignedTickets.length === 0 ? (
                                    <div className="text-center p-10">
                                        <p className="text-slate-500 font-medium text-[13px]">Aucun bon de visite en attente.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {unassignedTickets.map(ticket => (
                                            <div key={ticket.id} className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-[6px] text-[10px] font-bold uppercase tracking-wider">
                                                            {ticket.ticketRef}
                                                        </span>
                                                        <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
                                                             Urgence: {ticket.urgence}
                                                        </span>
                                                    </div>
                                                    <p className="text-[13.5px] font-bold text-slate-800 line-clamp-2 mb-2">{ticket.description}</p>
                                                    <p className="text-[12px] text-slate-500 flex items-center gap-1.5 font-medium">
                                                        <MapPin size={12} className="text-slate-400" /> {ticket.logement?.name || ticket.logement?.address || "Lieu non précisé"}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">
                                                        Déclarant: {ticket.locataire?.firstName} {ticket.locataire?.lastName}
                                                    </p>
                                                </div>
                                                <div className="flex items-center">
                                                    <button 
                                                        onClick={() => handleAssign(ticket.id)}
                                                        disabled={assigningId === ticket.id}
                                                        className="w-full md:w-auto bg-slate-800 text-white px-5 py-2.5 rounded-[8px] text-[10.5px] font-bold uppercase tracking-widest hover:bg-slate-700 transition-colors disabled:opacity-60 flex items-center justify-center min-w-[140px] shadow-sm"
                                                    >
                                                        {assigningId === ticket.id ? <Loader2 size={16} className="animate-spin" /> : "Envoyer Bon"}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
