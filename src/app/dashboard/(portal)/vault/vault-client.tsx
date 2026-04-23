"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShieldAlert, ShieldCheck, Lock, UploadCloud, FileSignature, ArrowRight, RefreshCw, Key, ChevronRight, X } from "lucide-react"
import { toast } from "sonner"

export default function VaultClient({ data }: { data: any }) {
    const [cautions, setCautions] = useState(data.cautions)
    const [selectedCaution, setSelectedCaution] = useState<any>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleConsigner = async () => {
        if (!selectedCaution) return;
        setLoading(true);

        // Simulation de la transaction bancaire vers le séquestre
        setTimeout(() => {
            setCautions(cautions.map((c: any) => 
                c.id === selectedCaution.id 
                ? { ...c, status: "CONSIGNEE", hash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`, dateConsignation: new Date().toISOString().split('T')[0] } 
                : c
            ))
            setModalOpen(false)
            setSelectedCaution(null)
            setLoading(false)
            toast.success("Caution consignée avec succès à la CDC-CI ! Le locataire a été notifié.")
        }, 2000);
    }

    return (
        <div className="space-y-8 pb-32 max-w-6xl mx-auto pt-6 px-4 md:px-0">
            {/* INSTITUTIONAL HERO */}
            <div className="relative glass-panel rounded-[3rem] p-8 md:p-14 overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row gap-12 justify-between items-center">
                    <div className="space-y-5 flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                            <ShieldCheck size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Partenaire CDC-CI</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
                            Le Séquestre <span className="text-emerald-500">Institutionnel.</span>
                        </h1>
                        <p className="text-slate-400 max-w-lg text-sm font-medium leading-relaxed">
                            Rétablissez la confiance. Transférez les cautions de vos locataires sur un compte séquestre sécurisé. En fin de bail, le remboursement est instantané. Fini les litiges.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 w-full md:w-auto shrink-0">
                        <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-[2rem] border border-slate-700 w-full md:w-[300px]">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                <Lock size={12} /> Cautions Sécurisées
                            </p>
                            <div className="flex items-end gap-1 mb-4">
                                <p className="text-3xl font-black text-white">{data.totalSecuredFcfa.toLocaleString()}</p>
                                <span className="text-xs text-emerald-500 font-bold mb-1.5">FCFA</span>
                            </div>
                            
                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1 mt-6 border-t border-slate-700 pt-4 flex items-center gap-2">
                                <ShieldAlert size={12} /> À Transférer
                            </p>
                            <div className="flex items-end gap-1">
                                <p className="text-xl font-black text-slate-300">{data.totalPendingFcfa.toLocaleString()}</p>
                                <span className="text-[10px] text-slate-500 font-bold mb-1">FCFA</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CAUTIONS LIST */}
            <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 px-2">Coffre des Cautions</h3>
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="p-5 font-black text-[10px] uppercase tracking-widest text-slate-500">Locataire & Bien</th>
                                    <th className="p-5 font-black text-[10px] uppercase tracking-widest text-slate-500">Montant</th>
                                    <th className="p-5 font-black text-[10px] uppercase tracking-widest text-slate-500">Statut du Coffre</th>
                                    <th className="p-5 font-black text-[10px] uppercase tracking-widest text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {cautions.map((caution: any) => (
                                    <tr key={caution.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${caution.status === 'CONSIGNEE' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                    {caution.status === 'CONSIGNEE' ? <Lock size={20} /> : <ShieldAlert size={20} />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 text-base">{caution.locataire}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{caution.bien}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <p className="font-black text-slate-800">{caution.montant.toLocaleString()} <span className="text-xs text-slate-400 font-bold">FCFA</span></p>
                                            {caution.hash && (
                                                <p className="text-[9px] font-mono font-bold text-emerald-500 mt-1 flex items-center gap-1">
                                                    <Key size={10} /> {caution.hash}
                                                </p>
                                            )}
                                        </td>
                                        <td className="p-5">
                                            {caution.status === 'CONSIGNEE' ? (
                                                <div>
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
                                                        <ShieldCheck size={14} /> Consignée
                                                    </div>
                                                    <p className="text-[9px] font-bold text-slate-400 mt-2">Le {caution.dateConsignation}</p>
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest">
                                                    <UploadCloud size={14} /> À transférer
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-5 text-right">
                                            {caution.status === 'CONSIGNEE' ? (
                                                <button className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors">
                                                    Restituer
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => { setSelectedCaution(caution); setModalOpen(true); }}
                                                    className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-md flex items-center gap-2 ml-auto"
                                                >
                                                    Consigner <ChevronRight size={14} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL CONSIGNATION */}
            <AnimatePresence>
                {modalOpen && selectedCaution && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" 
                            onClick={() => setModalOpen(false)} 
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase flex items-center gap-2">
                                        <Lock size={20} className="text-amber-500" /> Transfert au Séquestre
                                    </h3>
                                </div>
                                <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="text-center space-y-2">
                                    <p className="text-sm font-bold text-slate-500">Montant de la caution à consigner</p>
                                    <p className="text-4xl font-black text-slate-900">{selectedCaution.montant.toLocaleString()} <span className="text-lg text-slate-400">FCFA</span></p>
                                </div>

                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-bold text-slate-500">Locataire</span>
                                        <span className="font-black text-slate-800">{selectedCaution.locataire}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-bold text-slate-500">Bien</span>
                                        <span className="font-black text-slate-800 truncate max-w-[200px]">{selectedCaution.bien}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm pt-4 border-t border-slate-200">
                                        <span className="font-bold text-slate-500">Destination</span>
                                        <span className="font-black text-emerald-600 flex items-center gap-1"><ShieldCheck size={14} /> Coffre CDC-CI</span>
                                    </div>
                                </div>

                                <p className="text-[10px] font-medium text-slate-400 text-center px-4">
                                    En validant, le montant sera transféré de votre portefeuille vers le compte séquestre. Le locataire recevra un certificat de consignation infalsifiable.
                                </p>
                            </div>

                            <div className="p-6 border-t border-slate-100 bg-white shrink-0">
                                <button 
                                    onClick={handleConsigner}
                                    disabled={loading}
                                    className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <><RefreshCw size={20} className="animate-spin" /> Verrouillage...</>
                                    ) : (
                                        <><Lock size={20} /> Valider la consignation</>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
