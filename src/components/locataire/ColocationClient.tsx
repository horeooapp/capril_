"use client"

import { useState } from "react"
import { Users, Plus, ShieldCheck, Mail, ArrowRight } from "lucide-react"
import { splitColocPayment } from "@/actions/tenant-actions"
import { toast } from "sonner"

export default function ColocationClient({ bails }: { bails: any[] }) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        leaseId: bails[0]?.id || "",
        targetEmail: "",
        splitPercentage: 50
    })

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await splitColocPayment(formData)
            if (res.success) {
                toast.success("Invitation de colocation envoyée avec succès !")
                setFormData({...formData, targetEmail: ""})
            } else {
                toast.error(res.error || "Une erreur est survenue")
            }
        } catch (err) {
            toast.error("Erreur serveur")
        } finally {
            setLoading(false)
        }
    }

    if (!bails.length) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm mt-8">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Users size={32} className="text-gray-400" />
                </div>
                <h3 className="font-black text-gray-800 uppercase tracking-widest">Aucun bail actif</h3>
                <p className="text-gray-500 text-sm mt-2 max-w-sm">Vous devez disposer d'un bail principal actif pour pouvoir inviter un colocataire.</p>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 py-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase mb-2">Colocation & Scission.</h1>
                    <p className="text-gray-500 font-medium tracking-wide">Divisez votre loyer. Invitez un colocataire enregistré à payer sa part directement.</p>
                </div>
                <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full flex items-center gap-2 font-black text-[10px] uppercase tracking-widest">
                    <ShieldCheck size={14} /> Module Actif
                </div>
            </div>

            <div className="glass-panel p-8 rounded-[2.5rem] bg-white border border-gray-200 shadow-xl">
                <form onSubmit={handleInvite} className="space-y-6">
                    <div className="space-y-4">
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">Sélectionner le Bail</label>
                        <select 
                            className="w-full px-4 py-4 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-[#1F4E79]/20 outline-none font-bold text-slate-800"
                            value={formData.leaseId}
                            onChange={(e) => setFormData({...formData, leaseId: e.target.value})}
                            required
                        >
                            {bails.map((b: any) => (
                                <option key={b.id} value={b.id}>{b.property?.name || b.leaseReference} - Loyer: {b.rentAmount} XOF</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">Email du Colocataire <span className="lowercase font-normal opacity-60">(doit être inscrit)</span></label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="email"
                                    required
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-[#1F4E79]/20 outline-none font-bold text-gray-700"
                                    placeholder="email@exemple.com"
                                    value={formData.targetEmail}
                                    onChange={(e) => setFormData({...formData, targetEmail: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">Quote-part (%)</label>
                            <div className="flex items-center gap-4">
                                <input 
                                    type="range" 
                                    min="1" max="99" 
                                    className="flex-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1F4E79]"
                                    value={formData.splitPercentage}
                                    onChange={(e) => setFormData({...formData, splitPercentage: Number(e.target.value)})}
                                />
                                <div className="w-16 text-center font-black text-slate-800 bg-blue-50 py-2 rounded-xl border border-blue-100">
                                    {formData.splitPercentage}%
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                        <button 
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-8 py-4 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-[13px] hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-50"
                        >
                            <Users size={18} />
                            {loading ? "Envoi..." : "Envoyer l'invitation"}
                            <ArrowRight size={18} className="ml-2" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
