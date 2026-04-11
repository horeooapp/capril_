"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { getAllProviders } from "@/actions/provider-actions"
import { Wrench, Phone, MapPin, Loader2, Star, Plus } from "lucide-react"

export default function ProvidersDashboardPage() {
    const [providers, setProviders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const res = await getAllProviders()
            if (res.success) setProviders(res.providers || [])
        } finally {
            setLoading(false)
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
                <button className="bg-qnavy text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qnavy-dark transition-all shadow-md flex items-center gap-2">
                    <Plus size={16} /> Ajouter un Artisan
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map((p, index) => (
                    <motion.div 
                        initial={{opacity: 0, scale: 0.95}} 
                        animate={{opacity: 1, scale: 1}} 
                        transition={{delay: index * 0.05}} 
                        key={p.id} 
                        className="bg-white rounded-3xl p-6 border border-qgrey-2 hover:border-qorange/40 transition-colors shadow-sm group hover:shadow-lg relative overflow-hidden"
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
                        
                        <div className="space-y-2 mt-4 pt-4 border-t border-qgrey-2">
                            <p className="text-xs font-bold text-qtext-mid flex items-center gap-2">
                                <Phone size={14} className="text-gray-400" /> {p.telephone}
                            </p>
                            {p.adresse && (
                                <p className="text-xs font-bold text-qtext-mid flex items-center gap-2">
                                    <MapPin size={14} className="text-gray-400" /> {p.adresse}
                                </p>
                            )}
                        </div>

                        <div className="mt-6 flex items-center justify-between bg-qgrey-1/50 rounded-xl p-3 border border-qgrey-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-qtext-light">Tickets Résolus</span>
                            <span className="text-lg font-black text-qnavy">{p._count?.tickets || 0}</span>
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
        </div>
    )
}
