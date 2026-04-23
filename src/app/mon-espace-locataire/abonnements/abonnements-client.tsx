"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Wifi, Zap, Droplets, ArrowRight, Download, CheckCircle2, ShieldAlert, MonitorPlay, Plus, Phone, Clock, X } from "lucide-react"
import { toast } from "sonner"

export default function AbonnementsClient({ lease, abonnements: initialAbs }: { lease: any, abonnements: any[] }) {
    const [abonnements, setAbonnements] = useState(initialAbs)
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedOperateur, setSelectedOperateur] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const operateurs = [
        { id: "ORANGE", name: "Orange CI", desc: "Fibre Optique & Box 4G", icon: <Wifi size={24} />, color: "text-orange-500", bg: "bg-orange-50" },
        { id: "MTN", name: "MTN CI", desc: "Box Internet 4G/5G", icon: <Wifi size={24} />, color: "text-yellow-500", bg: "bg-yellow-50" },
        { id: "MOOV", name: "Moov Africa", desc: "Internet Box", icon: <Wifi size={24} />, color: "text-sky-600", bg: "bg-sky-50" },
        { id: "CIE", name: "CIE", desc: "Abonnement Électricité", icon: <Zap size={24} />, color: "text-amber-500", bg: "bg-amber-50" },
        { id: "SODECI", name: "SODECI", desc: "Raccordement Eau", icon: <Droplets size={24} />, color: "text-blue-500", bg: "bg-blue-50" },
        { id: "CANAL_PLUS", name: "Canal+", desc: "Bouquet TV", icon: <MonitorPlay size={24} />, color: "text-black", bg: "bg-gray-100" },
    ]

    const handleGenererDossier = async () => {
        if (!selectedOperateur) return;
        setLoading(true);

        // Simulation de l'appel backend qui utilise OrangeCiAdapter.genererDossierPdf()
        setTimeout(() => {
            const newDossier = {
                id: `DOS-${Math.floor(Math.random() * 90000) + 10000}`,
                operateur: selectedOperateur,
                statut: "DOSSIER_GENERE",
                date: new Date().toISOString().split('T')[0]
            }
            setAbonnements([newDossier, ...abonnements])
            setModalOpen(false)
            setSelectedOperateur(null)
            setLoading(false)
            toast.success("Votre dossier d'abonnement a été généré avec succès ! Le lien a été envoyé par SMS.")
        }, 2000);
    }

    return (
        <div className="space-y-8 pb-32 max-w-5xl mx-auto pt-6 px-4 md:px-0">
            {/* HERO */}
            <div className="relative glass-panel rounded-[2rem] p-8 md:p-12 overflow-hidden bg-white border border-slate-200 shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-900/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between items-start md:items-center">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800">
                            <MonitorPlay size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Connectivité & Utilités</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">
                            Abonnements <br />
                            <span className="text-slate-400 italic">sans paperasse.</span>
                        </h1>
                        <p className="text-slate-500 max-w-xl text-sm font-medium leading-relaxed">
                            Fini les longues files d'attente avec des photocopies. QAPRIL génère automatiquement votre dossier d'abonnement (Orange, CIE, SODECI) en compilant votre CNI et votre contrat de bail.
                        </p>
                    </div>
                    <button 
                        onClick={() => setModalOpen(true)}
                        className="px-8 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-slate-800 transition-all flex items-center gap-3 active:scale-95 group shrink-0"
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                        Nouvelle Demande
                    </button>
                </div>
            </div>

            {/* LISTE DES DOSSIERS */}
            <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 px-2">Vos Dossiers en cours</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {abonnements.length === 0 && (
                        <div className="col-span-1 md:col-span-2 p-12 bg-white rounded-[2rem] border border-dashed border-slate-300 text-center space-y-3">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                <Clock size={32} />
                            </div>
                            <p className="font-bold text-slate-500">Aucune demande en cours.</p>
                            <p className="text-xs text-slate-400">Générez un dossier pour votre nouveau logement.</p>
                        </div>
                    )}
                    {abonnements.map((abo: any) => {
                        const op = operateurs.find(o => o.id === abo.operateur) || operateurs[0]
                        return (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={abo.id} 
                                className="glass-panel bg-white p-6 rounded-[2rem] border border-slate-100 shadow-md flex flex-col justify-between gap-6 hover:shadow-xl transition-shadow group"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${op.bg} ${op.color}`}>
                                            {op.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-800 text-lg">{op.name}</h4>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Réf: {abo.id}</p>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                        <Clock size={10} /> {abo.statut.replace('_', ' ')}
                                    </div>
                                </div>
                                
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm">
                                            <Phone size={14} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-700">Dossier reçu par SMS</p>
                                            <p className="text-[10px] text-slate-500 font-medium">À déposer en agence.</p>
                                        </div>
                                    </div>
                                    <button className="p-3 bg-white rounded-xl text-slate-700 hover:bg-slate-900 hover:text-white transition-all shadow-sm group-hover:scale-105" title="Télécharger le PDF complet">
                                        <Download size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            {/* MODAL NOUVELLE DEMANDE */}
            <AnimatePresence>
                {modalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                            onClick={() => setModalOpen(false)} 
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-3xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="px-8 md:px-12 py-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Demande d'Abonnement</h3>
                                    <p className="text-xs text-slate-500 font-medium mt-1">Génération automatique du dossier physique.</p>
                                </div>
                                <button onClick={() => setModalOpen(false)} className="w-10 h-10 bg-white shadow-sm border border-slate-100 hover:bg-slate-100 rounded-full flex items-center justify-center transition-colors">
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>

                            <div className="p-8 md:p-12 overflow-y-auto space-y-8 flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {operateurs.map((op) => (
                                        <button
                                            key={op.id}
                                            onClick={() => setSelectedOperateur(op.id)}
                                            className={`p-6 rounded-[2rem] border-2 text-left transition-all flex items-start gap-4 ${selectedOperateur === op.id ? 'border-slate-800 bg-slate-800 text-white shadow-xl scale-[1.02]' : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
                                        >
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${selectedOperateur === op.id ? 'bg-white/20' : op.bg} ${selectedOperateur === op.id ? 'text-white' : op.color}`}>
                                                {op.icon}
                                            </div>
                                            <div>
                                                <h4 className={`font-black text-lg ${selectedOperateur === op.id ? 'text-white' : 'text-slate-800'}`}>{op.name}</h4>
                                                <p className={`text-xs font-medium ${selectedOperateur === op.id ? 'text-slate-300' : 'text-slate-500'}`}>{op.desc}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {selectedOperateur && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="bg-emerald-50 rounded-[2rem] p-6 border border-emerald-100"
                                    >
                                        <h4 className="text-sm font-black text-emerald-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <CheckCircle2 size={16} /> Ce que QAPRIL va générer
                                        </h4>
                                        <ul className="space-y-3">
                                            <li className="flex items-center gap-3 text-sm font-bold text-emerald-900">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                Copie certifiée de votre Pièce d'Identité
                                            </li>
                                            <li className="flex items-center gap-3 text-sm font-bold text-emerald-900">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                Contrat de Bail avec QR Code de certification
                                            </li>
                                            <li className="flex items-center gap-3 text-sm font-bold text-emerald-900">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                Formulaire officiel de souscription {operateurs.find(o => o.id === selectedOperateur)?.name} pré-rempli
                                            </li>
                                        </ul>
                                    </motion.div>
                                )}
                            </div>

                            <div className="p-6 border-t border-slate-100 bg-white shrink-0 flex justify-end">
                                <button 
                                    onClick={handleGenererDossier}
                                    disabled={!selectedOperateur || loading}
                                    className="w-full md:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Génération..." : "Générer mon Dossier PDF"} 
                                    {!loading && <ArrowRight size={20} />}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
