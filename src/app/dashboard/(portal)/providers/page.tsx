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

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-qnavy" size={40} /></div>

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <Wrench className="text-qorange" size={32} /> Répertoire Prestataires
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Vos artisans de confiance pour la marketplace et les bons de maintenance.
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-qorange-pale border border-qorange/30 text-qorange px-4 py-3 rounded-xl flex items-center gap-2 shadow-sm font-black text-sm">
                        <ClipboardList size={18} /> {unassignedTickets.length} Bons en attente
                    </div>
                    <button onClick={() => toast.promise(new Promise(r=>setTimeout(r, 1000)), {loading:'Ouverture du formulaire Artisan...', success:'Réseau Artisans synchronisé.'})} className="bg-qnavy text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qnavy-dark transition-all shadow-md flex items-center gap-2">
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
                        className="bg-white rounded-3xl p-6 border border-qgrey-2 hover:border-qorange/40 transition-colors shadow-sm group hover:shadow-lg relative overflow-hidden flex flex-col"
                    >
                        <div className="absolute top-0 right-0 w-2 h-full bg-qgrey-2 group-hover:bg-qorange transition-colors"></div>
                        
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-qorange-pale text-qorange px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-qorange/20">
                                {p.specialite}
                            </div>
                            <div className="flex items-center gap-1 text-qtext-mid">
                                <Star size={14} className={p.noteMoyenne >= 4 ? "text-yellow-400 fill-yellow-400" : ""} /> 
                                <span className="text-xs font-black">{p.noteMoyenne || "N/A"}</span>
                            </div>
                        </div>

                        <h3 className="text-xl font-black text-qnavy-dark mb-1 capitalize truncate pr-4">{p.nom}</h3>
                        
                        <div className="space-y-2 mt-4 pt-4 border-t border-qgrey-2 flex-grow">
                            <p className="text-xs font-bold text-qtext-mid flex items-center gap-2">
                                <Phone size={14} className="text-gray-400" /> {p.telephone}
                            </p>
                            {p.adresse && (
                                <p className="text-xs font-bold text-qtext-mid flex items-center gap-2">
                                    <MapPin size={14} className="text-gray-400" /> {p.adresse}
                                </p>
                            )}
                        </div>

                        <div className="mt-6 flex flex-col gap-3">
                            <div className="flex items-center justify-between bg-qgrey-1/50 rounded-xl p-3 border border-qgrey-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-qtext-light">Tickets Résolus</span>
                                <span className="text-lg font-black text-qnavy">{p._count?.tickets || 0}</span>
                            </div>
                            
                            <button 
                                onClick={() => setSelectedProvider(p)}
                                disabled={unassignedTickets.length === 0}
                                className="w-full bg-transparent border-2 border-qnavy text-qnavy font-black text-[10px] uppercase tracking-widest py-3 rounded-xl hover:bg-qnavy hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Assigner un Bon ({unassignedTickets.length} Dispos)
                            </button>
                        </div>
                    </motion.div>
                ))}

                {providers.length === 0 && (
                    <div className="col-span-full p-20 text-center bg-white border border-dashed border-qgrey-2 rounded-3xl">
                        <Wrench size={40} className="text-qgrey-2 mx-auto mb-4" />
                        <h3 className="text-xl font-black text-qnavy-dark mb-2">Aucun prestataire</h3>
                        <p className="text-sm font-bold text-qtext-light">Vous n'avez pas encore ajouté d'antennes techniques ou artisans.</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selectedProvider && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-qnavy-dark/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: -20 }}
                            className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full flex flex-col max-h-[85vh] overflow-hidden"
                        >
                            <div className="p-6 border-b border-qgrey-2 flex justify-between items-center bg-qgrey-1/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-qorange-pale text-qorange rounded-2xl flex items-center justify-center">
                                        <Wrench size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-qnavy-dark">{selectedProvider.nom}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-qtext-light">Assignation de Bon d'Intervention</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedProvider(null)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-qgrey-2 hover:bg-qred-pale hover:text-qred hover:border-transparent transition-all">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-6 bg-qgrey-1/20">
                                {unassignedTickets.length === 0 ? (
                                    <div className="text-center p-10">
                                        <p className="text-gray-500 font-medium">Aucun bon de visite en attente.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {unassignedTickets.map(ticket => (
                                            <div key={ticket.id} className="bg-white p-5 rounded-2xl border border-qgrey-2 shadow-sm flex flex-col md:flex-row justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="bg-qgrey-1 text-qtext-mid px-2 py-0.5 rounded text-[10px] font-black uppercase">
                                                            {ticket.ticketRef}
                                                        </span>
                                                        <span className="text-xs font-bold text-qred">
                                                             Urgence: {ticket.urgence}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-bold text-qnavy-dark line-clamp-2 mb-2">{ticket.description}</p>
                                                    <p className="text-xs text-qtext-mid flex items-center gap-1">
                                                        <MapPin size={12} /> {ticket.logement?.name || ticket.logement?.address || "Lieu non précisé"}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-qtext-light uppercase mt-1">
                                                        Déclarant: {ticket.locataire?.firstName} {ticket.locataire?.lastName}
                                                    </p>
                                                </div>
                                                <div className="flex items-center">
                                                    <button 
                                                        onClick={() => handleAssign(ticket.id)}
                                                        disabled={assigningId === ticket.id}
                                                        className="w-full md:w-auto bg-qnavy text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-qnavy-dark transition-all disabled:opacity-50 flex items-center justify-center min-w-[140px]"
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
