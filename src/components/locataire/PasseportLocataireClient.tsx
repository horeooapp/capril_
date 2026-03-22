"use client"

import { useState } from "react"
import { 
    FileBadge, 
    Download, 
    ShieldCheck, 
    History, 
    TrendingUp, 
    CheckCircle2,
    Hash,
    Plus,
    Lock
} from "lucide-react"
import { generatePasseportLocatif } from "@/actions/passeport"
import { toast } from "sonner"
import { motion } from "framer-motion"

export default function PasseportLocataireClient({ passeports: initialPasseports, userId }: any) {
    const [list, setList] = useState(initialPasseports)
    const [loading, setLoading] = useState(false)

    const handleGenerate = async () => {
        setLoading(true)
        try {
            const res = await generatePasseportLocatif(userId)
            setList([res, ...list])
            toast.success("Nouveau passeport généré !")
        } catch (err) {
            toast.error("Erreur lors de la génération")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-[#1F4E79] tracking-tighter uppercase mb-2">Passeport Locatif.</h1>
                    <p className="text-gray-500 font-medium tracking-wide">Valorisez votre historique et facilitez vos futurs emménagements.</p>
                </div>
                <button 
                    onClick={handleGenerate}
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-4 bg-[#1F4E79] text-white rounded-2xl font-black uppercase tracking-widest text-[13px] hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-50"
                >
                    <Plus size={18} />
                    {loading ? "Génération..." : "Générer mon Passeport"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Info Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-panel p-8 rounded-[2.5rem] border border-white/40 shadow-xl bg-gradient-to-br from-[#1F4E79] to-[#0d2133] text-white">
                        <FileBadge size={40} className="mb-6 text-orange-400" />
                        <h3 className="text-xl font-black uppercase tracking-tight mb-4">La Garantie QAPRIL</h3>
                        <p className="text-[14px] leading-relaxed opacity-80 mb-6">
                             Votre Passeport Locatif compile vos succès : paiements réguliers, baux menés à terme et score de confiance certifié. 
                             C'est un dossier complet, infalsifiable (SHA-256), prêt à être présenté aux bailleurs les plus exigeants.
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-[12px] font-black uppercase tracking-widest">
                                <ShieldCheck size={16} className="text-emerald-400" /> Certifié par l'État (DGI)
                            </div>
                            <div className="flex items-center gap-3 text-[12px] font-black uppercase tracking-widest">
                                <Lock size={16} className="text-orange-400" /> Sécurisé par SHA-256
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-8 rounded-[2.5rem] border border-white/40 shadow-lg bg-white">
                         <h4 className="font-black text-[#1F4E79] uppercase tracking-tighter mb-4">Statistiques Incluses</h4>
                         <div className="space-y-4">
                             {[
                                { label: "Historique Paiements", val: "12 mois" },
                                { label: "Indice de Confiance", val: "Temps Réel" },
                                { label: "Validité", val: "12 mois" }
                             ].map((st, i) => (
                                <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-3">
                                    <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest">{st.label}</span>
                                    <span className="text-[13px] font-bold text-[#1F4E79]">{st.val}</span>
                                </div>
                             ))}
                         </div>
                    </div>
                </div>

                {/* History Panel */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-black text-[#1F4E79] uppercase tracking-tighter">Mes Passeports Certifiés</h2>
                    
                    {list.length === 0 ? (
                        <div className="glass-panel p-20 rounded-[3rem] text-center border border-white/40 bg-white">
                            <History size={48} className="mx-auto text-gray-100 mb-6" />
                            <p className="text-gray-400 font-medium italic">Vous n'avez pas encore généré de passeport.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {list.map((pass: any, index: number) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    key={pass.id} 
                                    className="glass-panel p-8 rounded-[2.5rem] border border-white/40 shadow-lg bg-white relative group hover:shadow-2xl transition-all"
                                >
                                    <div className="flex flex-col md:flex-row justify-between gap-8">
                                        <div className="space-y-6 flex-1">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-[#1F4E79] text-white rounded-2xl flex items-center justify-center shadow-xl group-hover:rotate-3 transition-transform">
                                                    <FileBadge size={32} />
                                                </div>
                                                <div>
                                                    <h4 className="text-2xl font-black text-[#1F4E79] tracking-tighter italic uppercase">{pass.refPasseport}</h4>
                                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Généré le: {new Date(pass.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-6">
                                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Score ICL</p>
                                                    <p className="text-xl font-black text-[#1F4E79]">{pass.scoreGlobal}</p>
                                                </div>
                                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Sérieux</p>
                                                    <p className="text-xl font-black text-[#C55A11]">{pass.tauxPaiementGlobal}%</p>
                                                </div>
                                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Bails</p>
                                                    <p className="text-xl font-black text-gray-700">{pass.nbBailsInclus}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 p-3 bg-gray-900 text-white rounded-xl shadow-inner">
                                                <Hash size={14} className="text-orange-400" />
                                                <span className="text-[10px] font-mono truncate opacity-60">{pass.hashSha256}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col justify-center items-center md:items-end w-full md:w-auto pt-6 md:pt-0 border-t md:border-t-0 border-gray-100">
                                            <button className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-5 bg-[#1F4E79] text-white rounded-2xl font-black uppercase tracking-widest text-[14px] hover:bg-black transition-all shadow-xl group/btn">
                                                <Download size={20} className="group-hover/btn:translate-y-1 transition-transform" />
                                                PDF Premium
                                            </button>
                                            <p className="mt-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Expire le: {new Date(pass.expireAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
