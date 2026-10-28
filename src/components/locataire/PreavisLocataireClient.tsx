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
                    <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase mb-2">Préavis.</h1>
                    <p className="text-gray-500 font-medium tracking-wide">Déclaration de départ officielle et certifiée SHA-256.</p>
                </div>
                {!isCreating && (
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-2 px-8 py-4 bg-amber-600 text-white rounded-2xl font-black uppercase tracking-widest text-[13px] hover:bg-black transition-all shadow-xl active:scale-95"
                    >
                        <MessageSquare size={18} />
                        Déclarer mon départ
                    </button>
                )}
            </div>

            {isCreating && (
                <div className="bg-white p-8 md:p-10 rounded-[32px] border border-amber-200/80 shadow-2xl animate-in zoom-in-95 duration-300">
                    <div className="flex items-center gap-3.5 mb-6 pb-5 border-b border-slate-100">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
                            <Clock size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Déclarer mon Préavis de Départ</h2>
                            <p className="text-xs font-semibold text-slate-500">Procédure officielle et sécurisée de congé locatif</p>
                        </div>
                    </div>
                     
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="p-4 bg-amber-50/70 border border-amber-200/70 rounded-2xl flex items-start gap-3.5">
                            <Clock size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-amber-950 font-medium leading-relaxed">
                                <span className="font-bold block mb-0.5">Rappel légal (Loi ivoirienne CCH) :</span>
                                Le délai normal de préavis donné par le locataire est de <strong>3 mois</strong> avant la date souhaitée de départ (ou selon les clauses particulières de votre bail). Cette démarche officielle avertit immédiatement votre propriétaire et programme la date de restitution des clés.
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    Date effective de libération des lieux
                                </label>
                                <input 
                                    type="date"
                                    required
                                    className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 outline-none font-bold text-slate-800 text-sm shadow-sm transition-all"
                                    value={formData.dateDepartPrevue}
                                    onChange={(e) => setFormData({...formData, dateDepartPrevue: e.target.value})}
                                />
                                <p className="text-[10px] text-slate-400 font-medium mt-1.5">
                                    Jour où vous remettrez les clés et réaliserez l'état des lieux de sortie.
                                </p>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    Motif du départ (Facultatif mais utile)
                                </label>
                                <input 
                                    type="text"
                                    placeholder="Ex: Mutation professionnelle, achat d'un bien..."
                                    className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 outline-none font-semibold text-slate-800 text-sm shadow-sm transition-all"
                                    value={formData.motif}
                                    onChange={(e) => setFormData({...formData, motif: e.target.value})}
                                />
                                <p className="text-[10px] text-slate-400 font-medium mt-1.5">
                                    Permet de conserver une relation cordiale avec le propriétaire.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                            <button 
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-6 py-3.5 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all uppercase tracking-wider"
                            >
                                Annuler
                            </button>
                            <button 
                                type="submit"
                                disabled={loading || !formData.dateDepartPrevue}
                                className="px-8 py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg shadow-amber-600/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                            >
                                <Send size={16} />
                                {loading ? "Certification en cours..." : "Transmettre mon préavis officiel"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-6">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Historique des demandes</h2>
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
                                     <span className={`px-4 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-widest ${pre.statut === 'EMIS' ? 'bg-orange-50 text-amber-600' : 'bg-emerald-50 text-[#375623]'}`}>
                                         {pre.statut}
                                     </span>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-slate-800 text-white rounded-2xl flex items-center justify-center shadow-lg">
                                            <Calendar size={28} />
                                        </div>
                                        <div>
                                            <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1">Date de départ prévue</p>
                                            <p className="text-2xl font-black text-slate-800">
                                                {new Date(pre.dateDepartPrevue).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-50">
                                        <div>
                                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Référence Certifiée</p>
                                            <div className="flex items-center gap-3">
                                                 <Hash size={16} className="text-amber-600" />
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
