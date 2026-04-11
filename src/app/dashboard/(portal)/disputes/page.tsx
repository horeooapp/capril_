"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { getDisputedLeases } from "@/actions/lease-procedures"
import { toast } from "sonner"
import { AlertOctagon, ArrowRight, Gavel, Loader2, ShieldOff, Search } from "lucide-react"
import Link from "next/link"

export default function DisputesDashboardPage() {
    const [disputes, setDisputes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const res = await getDisputedLeases()
            if (res.success) {
                setDisputes(res.disputes || [])
            } else {
                toast.error(res.error)
            }
        } catch (error) {
            toast.error("Erreur de chargement")
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-qred" size={40} /></div>

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'LOYER_IMPAYE': return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', label: 'Impayé Détecté' }
            case 'MISE_EN_DEMEURE': return { color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', label: 'Mise en Demeure' }
            case 'CLEMENCE_EN_COURS': return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Clémence' }
            case 'REPRISE_PROCEDURE': return { color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', label: 'Reprise Procédure' }
            case 'DEMANDE_RESILIATION': return { color: 'text-qnavy', bg: 'bg-qnavy-pale', border: 'border-qnavy/20', label: 'Résiliation (Huissier)' }
            default: return { color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', label: status }
        }
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-700">
            {/* Dark premium header */}
            <div className="bg-[linear-gradient(135deg,#0D2B6E_0%,#111827_100%)] rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 flex items-center gap-4">
                            <Gavel className="text-red-400" size={40} /> Contentieux
                        </h1>
                        <p className="text-sm font-medium text-gray-300 max-w-xl leading-relaxed">
                            Supervisez les Mises en Demeure, Échéanciers de Clémence et Procédures Légales d'Expulsion. 
                            Le verrouillage IOT est disponible pour les cas critiques.
                        </p>
                    </div>
                    <div className="flex bg-black/30 border border-white/10 rounded-2xl p-6 text-center backdrop-blur-sm">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Dossiers Actifs</p>
                            <p className="text-4xl font-black text-red-400">{disputes.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {disputes.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-16 border border-gray-100 flex flex-col items-center text-center shadow-sm">
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
                        <AlertOctagon size={40} className="text-green-500" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-wide">Zéro Contentieux</h2>
                    <p className="text-gray-500 font-medium">Tout votre parc immobilier est en règle ce mois-ci.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {disputes.map((lease) => {
                        const config = getStatusConfig(lease.status)
                        const lastPhaseDate = lease.procedurePhases?.[0]?.actionDate ? new Date(lease.procedurePhases[0].actionDate).toLocaleDateString() : 'Inconnue'
                        
                        return (
                            <Link key={lease.id} href={`/dashboard/leases/${lease.id}`}>
                                <motion.div 
                                    initial={{opacity:0, y:10}} 
                                    animate={{opacity:1, y:0}} 
                                    className={`bg-white hover:bg-gray-50 border ${config.border} p-6 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-6 cursor-pointer transition-all shadow-sm hover:shadow-md group relative overflow-hidden`}
                                >
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${config.bg.replace('bg-', 'bg-').replace('-50', '-500')}`}></div>
                                    
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-black text-gray-900 capitalize">{lease.tenant?.firstName} {lease.tenant?.lastName}</h3>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md ${config.bg} ${config.color} border ${config.border}`}>
                                                {config.label}
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-500 flex items-center gap-2">
                                            <span>{lease.property?.name || lease.property?.address}</span>
                                        </p>
                                        <p className="text-xs text-gray-400 italic">Phase enclenchée le {lastPhaseDate}</p>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        {lease.status === "DEMANDE_RESILIATION" && (
                                            <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-red-100">
                                                <ShieldOff size={14} /> IOT Suspendu
                                            </div>
                                        )}
                                        <div className="w-12 h-12 bg-white border border-gray-200 group-hover:border-qnavy group-hover:bg-qnavy group-hover:text-white text-gray-400 rounded-2xl flex items-center justify-center transition-all">
                                            <ArrowRight size={20} />
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
