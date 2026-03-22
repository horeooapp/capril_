"use client"

import { useState } from "react"
import { 
    MessageSquare, 
    Calendar, 
    AlertCircle, 
    Send,
    CheckCircle2,
    Clock,
    Hash,
    MoreHorizontal
} from "lucide-react"
import { createPreavisLocataire } from "@/actions/preavis"
import { toast } from "sonner"

export default function PreavisLocataireClient({ preavisList, bail, userId }: any) {
    const [isCreating, setIsCreating] = useState(false)
    const [loading, setLoading] = useState(false)
    const [list, setList] = useState(preavisList)

    const [formData, setFormData] = useState({
        dateDepartPrevue: "",
        motif: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!bail) return
        setLoading(true)
        try {
            const res = await createPreavisLocataire(userId, bail.id, {
                dateDepartPrevue: new Date(formData.dateDepartPrevue),
                motif: formData.motif
            })
            setList([res, ...list])
            setIsCreating(false)
            toast.success("Préavis enregistré et certifié")
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de l'envoi")
        } finally {
            setLoading(false)
        }
    }

    if (!bail) {
        return (
            <div className="glass-panel p-20 rounded-[3rem] text-center border border-white/40">
                <AlertCircle size={48} className="mx-auto text-gray-200 mb-6" />
                <h3 className="text-xl font-black text-gray-400 uppercase tracking-tighter">Accès Restreint</h3>
                <p className="text-gray-400 font-medium">Aucun bail actif éligible au préavis numérique.</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-[#1F4E79] tracking-tighter uppercase mb-2">Préavis.</h1>
                    <p className="text-gray-500 font-medium tracking-wide">Déclaration de départ officielle et certifiée SHA-256.</p>
                </div>
                {!isCreating && (
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-2 px-8 py-4 bg-[#C55A11] text-white rounded-2xl font-black uppercase tracking-widest text-[13px] hover:bg-black transition-all shadow-xl active:scale-95"
                    >
                        <MessageSquare size={18} />
                        Déclarer mon départ
                    </button>
                )}
            </div>

            {isCreating && (
                <div className="glass-panel p-8 md:p-10 rounded-[2.5rem] border-2 border-[#C55A11]/20 bg-white/80 shadow-2xl animate-in zoom-in-95 duration-300">
                     <h2 className="text-2xl font-black text-[#1F4E79] uppercase tracking-tighter mb-8 italic">Notice de départ</h2>
                     
                     <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-4">
                             <Clock size={20} className="text-blue-500 mt-1 flex-shrink-0" />
                             <p className="text-[13px] text-blue-700 font-medium">
                                En émettant ce préavis, vous vous engagez à libérer le logement à la date indiquée. Le délai légal ivoirien est généralement de 3 mois pour le locataire (modulé selon votre bail). QAPRIL impose un minimum de 30 jours pour la validation numérique.
                             </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Date de départ prévue</label>
                                <input 
                                    type="date"
                                    required
                                    className="w-full px-6 py-4 rounded-xl border border-gray-100 bg-gray-50/50 outline-none font-black text-[#1F4E79]"
                                    value={formData.dateDepartPrevue}
                                    onChange={(e) => setFormData({...formData, dateDepartPrevue: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Motif (Optionnel)</label>
                                <input 
                                    type="text"
                                    className="w-full px-6 py-4 rounded-xl border border-gray-100 bg-gray-50/50 outline-none font-bold text-gray-700"
                                    placeholder="Ex: Mutation, Achat, etc."
                                    value={formData.motif}
                                    onChange={(e) => setFormData({...formData, motif: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-6 border-t border-gray-100">
                             <button 
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-5 bg-[#C55A11] text-white rounded-2xl font-black uppercase tracking-widest text-[14px] hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                             >
                                <Send size={18} />
                                {loading ? "Certification en cours..." : "Signer et envoyer le préavis"}
                             </button>
                             <button 
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-8 py-5 bg-white border border-gray-100 rounded-2xl text-[14px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
                             >
                                Annuler
                             </button>
                        </div>
                     </form>
                </div>
            )}

            <div className="space-y-6">
                <h2 className="text-xl font-black text-[#1F4E79] uppercase tracking-tighter">Historique des demandes</h2>
                {list.length === 0 ? (
                    <div className="glass-panel p-16 rounded-[2.5rem] border border-white/40 text-center">
                        <MessageSquare size={40} className="mx-auto text-gray-100 mb-4" />
                        <p className="text-gray-400 font-medium italic">Aucun préavis actif.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {list.map((pre: any) => (
                            <div key={pre.id} className="glass-panel p-8 rounded-[2.5rem] border border-white/40 shadow-lg bg-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 flex items-center gap-2">
                                     <span className={`px-4 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-widest ${pre.statut === 'EMIS' ? 'bg-orange-50 text-[#C55A11]' : 'bg-emerald-50 text-[#375623]'}`}>
                                         {pre.statut}
                                     </span>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-[#1F4E79] text-white rounded-2xl flex items-center justify-center shadow-lg">
                                            <Calendar size={28} />
                                        </div>
                                        <div>
                                            <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1">Date de départ prévue</p>
                                            <p className="text-2xl font-black text-[#1F4E79]">
                                                {new Date(pre.dateDepartPrevue).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-50">
                                        <div>
                                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Référence Certifiée</p>
                                            <div className="flex items-center gap-3">
                                                 <Hash size={16} className="text-[#C55A11]" />
                                                 <span className="text-[14px] font-bold text-gray-700">{pre.refPreavis}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Preuve SHA-256</p>
                                            <p className="text-[11px] font-mono text-gray-400 truncate max-w-[200px]">{pre.hashSha256}</p>
                                        </div>
                                    </div>

                                    {pre.statut === 'EMIS' && (
                                        <div className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                            <Clock size={16} className="text-gray-400" />
                                            <p className="text-[12px] text-gray-500 font-medium italic">En attente d'accusé de réception par le propriétaire...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
