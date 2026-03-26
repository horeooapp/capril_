"use client"

import { useState } from "react"
import { 
    AlertTriangle, 
    Plus, 
    Clock, 
    CheckCircle2, 
    MessageSquare,
    Camera,
    Send,
    X
} from "lucide-react"
import { createSignalement } from "@/actions/signalements"
import { toast } from "sonner"

export default function SignalementsLocataireClient({ initialSignalements, bails, userId }: any) {
    const [signalements, setSignalements] = useState(initialSignalements)
    const [isAdding, setIsAdding] = useState(false)
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        bailId: bails[0]?.id || "",
        categorie: "FUITE_EAU",
        urgence: "NORMAL",
        description: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await createSignalement(userId, formData.bailId, {
                ...formData,
                photos: [] // Simplification : pas d'upload S3 implémenté ici
            })
            setSignalements([res, ...signalements])
            setIsAdding(false)
            setFormData({ ...formData, description: "" })
            toast.success("Signalement envoyé au propriétaire")
        } catch (err) {
            toast.error("Erreur lors de l'envoi")
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (s: string) => {
        if (s === "RESOLU") return "text-emerald-500 bg-emerald-50 border-emerald-100"
        if (s === "VU_PROPRIO") return "text-blue-500 bg-blue-50 border-blue-100"
        if (s === "EN_COURS") return "text-orange-500 bg-orange-50 border-orange-100"
        return "text-gray-500 bg-gray-50 border-gray-100"
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 items-center text-center md:text-left">
                <div className="max-w-md">
                    <h1 className="text-4xl md:text-5xl font-black text-[#1F4E79] tracking-tighter uppercase mb-2">Signalements.</h1>
                    <p className="text-gray-500 font-medium">Tracez vos interventions et communiquez avec votre bailleur de manière professionnelle.</p>
                </div>
                <button 
                    onClick={() => setIsAdding(true)}
                    className="flex items-center justify-center gap-3 px-10 py-5 bg-[#1F4E79] text-white rounded-3xl font-black uppercase tracking-widest text-[13px] hover:bg-[#C55A11] transition-all shadow-2xl hover:shadow-[#1F4E79]/20 active:scale-95 w-full md:w-auto"
                >
                    <Plus size={20} />
                    Nouveau Ticket
                </button>
            </div>

            {isAdding && (
                <div className="glass-panel p-8 rounded-[2.5rem] border-2 border-primary/20 bg-white/80 shadow-2xl animate-in zoom-in-95 duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black text-[#1F4E79] uppercase tracking-tight">Ouvrir un ticket d'intervention</h2>
                        <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-red-50 text-red-400 rounded-xl transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Logement</label>
                                <select 
                                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-white/50 focus:ring-2 focus:ring-primary/20 outline-none font-bold text-[#1F4E79]"
                                    value={formData.bailId}
                                    onChange={(e) => setFormData({...formData, bailId: e.target.value})}
                                >
                                    {bails.map((b: any) => (
                                        <option key={b.id} value={b.id}>{b.property.name || b.property.address}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Catégorie</label>
                                <select 
                                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-white/50 focus:ring-2 focus:ring-primary/20 outline-none font-bold text-[#1F4E79]"
                                    value={formData.categorie}
                                    onChange={(e) => setFormData({...formData, categorie: e.target.value})}
                                >
                                    <option value="FUITE_EAU">Fuite d'eau</option>
                                    <option value="ELECTRICITE">Électricité</option>
                                    <option value="PORTE_SERRURE">Serrurerie</option>
                                    <option value="NUISANCE">Nuisance</option>
                                    <option value="DEGRADATION">Dégradation</option>
                                    <option value="AUTRE">Autre</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Urgence</label>
                                <select 
                                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-white/50 focus:ring-2 focus:ring-primary/20 outline-none font-bold text-[#1F4E79]"
                                    value={formData.urgence}
                                    onChange={(e) => setFormData({...formData, urgence: e.target.value})}
                                >
                                    <option value="NORMAL">Normal</option>
                                    <option value="URGENT">Urgent</option>
                                    <option value="TRES_URGENT">Critique</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Description du problème</label>
                            <textarea 
                                required
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-white/50 focus:ring-2 focus:ring-primary/20 outline-none font-medium text-gray-700"
                                placeholder="Décrivez précisément ce qui ne va pas..."
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                             <div className="flex gap-2">
                                <button type="button" className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-colors">
                                    <Camera size={20} />
                                </button>
                             </div>
                             <button 
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-8 py-4 bg-[#1F4E79] text-white rounded-2xl font-black uppercase tracking-widest text-[13px] hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-50"
                             >
                                <Send size={18} />
                                {loading ? "Envoi..." : "Envoyer au bailleur"}
                             </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                {signalements.length === 0 ? (
                    <div className="glass-panel p-20 rounded-[3rem] text-center border border-white/40">
                        <MessageSquare size={48} className="mx-auto text-gray-200 mb-6" />
                        <h3 className="text-xl font-black text-gray-400 uppercase tracking-tighter">Aucun signalement actif</h3>
                        <p className="text-gray-400 font-medium">Tout semble en ordre dans votre logement.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {signalements.map((sig: any) => (
                            <div key={sig.id} className="glass-panel p-6 rounded-[2rem] border border-white/40 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center border border-gray-100 group-hover:bg-white transition-colors">
                                        <AlertTriangle size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="font-black text-[#1F4E79] uppercase tracking-tight">{sig.categorie}</h4>
                                            <span className={`px-3 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusColor(sig.statut)}`}>
                                                {sig.statut}
                                            </span>
                                        </div>
                                        <p className="text-[14px] text-gray-500 font-medium line-clamp-1">{sig.description}</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                <Clock size={12} /> {new Date(sig.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="text-[11px] font-black text-[#C55A11] uppercase tracking-widest">
                                                Urgence: {sig.urgence}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0">
                                    <button className="px-6 py-3 bg-white border border-gray-100 rounded-xl text-[12px] font-black uppercase tracking-widest text-gray-400 hover:text-[#1F4E79] transition-colors">
                                        Voir Détails
                                    </button>
                                    {sig.statut !== "RESOLU" && (
                                        <button className="px-6 py-3 bg-[#375623]/10 border border-[#375623]/20 text-[#375623] rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[#375623] hover:text-white transition-all">
                                            Marquer Résolu
                                        </button>
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
