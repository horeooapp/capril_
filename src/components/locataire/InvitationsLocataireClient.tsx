"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Home, 
    Calendar, 
    Check, 
    X, 
    Clock, 
    ArrowRight,
    User,
    Building2,
    MessageSquare
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { respondToInvitation } from "@/actions/invitations"

interface InvitationsLocataireClientProps {
    initialInvitations: any[]
}

export function InvitationsLocataireClient({ initialInvitations }: InvitationsLocataireClientProps) {
    const [invitations, setInvitations] = useState(initialInvitations)
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const handleResponse = async (id: string, response: 'ACCEPTEE' | 'REFUSEE') => {
        setLoadingId(id)
        try {
            await respondToInvitation(id, response)
            toast.success(response === 'ACCEPTEE' ? "Félicitations ! Bail activé." : "Invitation refusée.")
            // Mettre à jour la liste localement
            setInvitations(invs => invs.map(i => i.id === id ? { ...i, statut: response } : i))
        } catch (error: any) {
            toast.error(error.message || "Une erreur est survenue")
        } finally {
            setLoadingId(null)
        }
    }

    if (invitations.length === 0) {
        return (
            <div className="glass-panel p-12 text-center rounded-[2rem]">
                <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium italic">Aucune invitation reçue pour le moment.</p>
                <p className="text-[12px] text-gray-400 mt-2 uppercase tracking-widest">Dès qu'un propriétaire vous invitera, elle apparaîtra ici.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
                {invitations.map((inv) => (
                    <motion.div 
                        key={inv.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass-panel p-6 rounded-[2rem] border border-white/40 shadow-xl bg-white flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    inv.statut === 'ENVOYEE' ? 'bg-orange-50 text-orange-500 border border-orange-100' :
                                    inv.statut === 'ACCEPTEE' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' :
                                    'bg-gray-50 text-gray-400 border border-gray-100'
                                }`}>
                                    {inv.statut}
                                </span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    {inv.invitantType}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-gray-50 rounded-2xl text-[#1F4E79]">
                                    {inv.invitantType === 'PROPRIETAIRE' ? <User size={24} /> : <Building2 size={24} />}
                                </div>
                                <div>
                                    <p className="font-black text-[#1F4E79] text-lg leading-tight">{inv.invitant?.fullName || "Bailleur QAPRIL"}</p>
                                    <p className="text-[11px] text-gray-400 uppercase font-black tracking-widest">Souhaite vous inviter</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-3 text-[13px] text-gray-600 font-bold">
                                    <Home size={16} className="text-[#1F4E79]" />
                                    <span>{inv.property?.commune || "Biens sans commune"} - {inv.property?.address?.substring(0, 20)}...</span>
                                </div>
                                <div className="flex items-center gap-3 text-[13px] text-gray-600 font-bold">
                                    <Calendar size={16} className="text-[#1F4E79]" />
                                    <span>Début : {new Date(inv.dateDebutProposee).toLocaleDateString()}</span>
                                </div>
                                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mb-1">Loyer Proposé</p>
                                    <p className="text-xl font-black text-[#1F4E79]">{Number(inv.loyerPropose).toLocaleString()} FCFA</p>
                                </div>

                                {inv.messageInvitant && (
                                    <div className="p-3 bg-gray-50 rounded-xl italic text-[12px] text-gray-500 flex gap-2 items-start">
                                        <MessageSquare size={14} className="shrink-0 mt-0.5" />
                                        "{inv.messageInvitant}"
                                    </div>
                                )}
                            </div>
                        </div>

                        {inv.statut === 'ENVOYEE' && (
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <button 
                                    onClick={() => handleResponse(inv.id, 'REFUSEE')}
                                    disabled={loadingId === inv.id}
                                    className="py-3 px-4 rounded-xl border-2 border-red-50 text-red-500 font-black uppercase tracking-widest text-[11px] hover:bg-red-50 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                >
                                    <X size={14} /> Refuser
                                </button>
                                <button 
                                    onClick={() => handleResponse(inv.id, 'ACCEPTEE')}
                                    disabled={loadingId === inv.id}
                                    className="py-3 px-4 rounded-xl bg-[#1F4E79] text-white font-black uppercase tracking-widest text-[11px] hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-50"
                                >
                                    <Check size={14} /> Accepter
                                </button>
                            </div>
                        )}

                        {inv.statut === 'ACCEPTEE' && (
                            <Link 
                                href="/locataire" 
                                className="w-full py-4 bg-emerald-500 text-white rounded-xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 shadow-lg hover:bg-emerald-600 transition-all"
                            >
                                Accéder au bail <ArrowRight size={14} />
                            </Link>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}
