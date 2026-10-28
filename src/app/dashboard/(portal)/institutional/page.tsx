"use client"

import React, { useEffect, useState } from "react"
import { getInstitutionalLicenses, purchaseDataLicense } from "@/actions/institutional.actions"
import { Database, ShieldCheck, Activity, Key, Loader2, Plus, Server, CheckCircle, Search } from "lucide-react"
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function InstitutionalDashboardPage() {
    const [contracts, setContracts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isSubscribing, setIsSubscribing] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    
    // Form state
    const [clientNom, setClientNom] = useState("")
    const [clientType, setClientType] = useState("BANQUE")
    const [typeAcces, setTypeAcces] = useState("API_SCORING")

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const res = await getInstitutionalLicenses()
            if (res.success) setContracts(res.contracts || [])
        } finally {
            setLoading(false)
        }
    }

    const handlePurchase = async () => {
        if (!clientNom) {
            toast.error("Veuillez renseigner le nom de l'institution");
            return;
        }

        setIsSubscribing(true);
        try {
            const res = await purchaseDataLicense(clientNom, clientType, typeAcces);
            if (res.success) {
                toast.success("Licence acquise avec succès !");
                setIsModalOpen(false);
                await loadData();
            } else {
                toast.error(res.error || "Erreur lors de l'acquisition.");
            }
        } finally {
            setIsSubscribing(false);
        }
    }

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>

    const activeContracts = contracts.filter(c => c.statut === "ACTIF");
    const totalRevenue = activeContracts.reduce((acc, c) => acc + c.montantAnnuel, 0);

    return (
        <div className="space-y-8 max-w-6xl mx-auto p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                        <Database className="text-indigo-500" size={32} /> Data Institutionnelle
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Acquisition et gestion des licences DaaS (Data as a Service) et accès Observatoire.
                    </p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-[12px] font-bold text-[12px] uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
                >
                    <Plus size={16} /> Nouvelle Licence
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-8 flex items-center space-x-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-[12px] flex items-center justify-center">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Contrats Actifs</p>
                        <h2 className="text-3xl font-black text-slate-900">{activeContracts.length}</h2>
                    </div>
                </div>

                <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-8 flex items-center space-x-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-[12px] flex items-center justify-center">
                        <Database size={24} />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">CA Licences</p>
                        <h2 className="text-3xl font-black text-slate-900">{totalRevenue.toLocaleString()} XOF</h2>
                    </div>
                </div>

                <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-8 flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-[12px] flex items-center justify-center">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Accès Premium</p>
                        <h2 className="text-3xl font-black text-slate-900">Illimité</h2>
                    </div>
                </div>
            </div>

            {/* Contracts List */}
            <div className="bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
                    <h3 className="text-[14px] font-bold text-slate-900 uppercase tracking-widest">Vos Licences d'Exploitation</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white border-b border-slate-100">
                                <th className="p-5 font-bold text-[10px] uppercase tracking-widest text-slate-500">Institution</th>
                                <th className="p-5 font-bold text-[10px] uppercase tracking-widest text-slate-500">Type / Accès</th>
                                <th className="p-5 font-bold text-[10px] uppercase tracking-widest text-slate-500">Validité</th>
                                <th className="p-5 font-bold text-[10px] uppercase tracking-widest text-slate-500 text-right">API Key</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contracts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-10 text-center text-[13px] font-medium text-slate-400">
                                        Aucune licence active.
                                    </td>
                                </tr>
                            ) : (
                                contracts.map((contract) => (
                                    <tr key={contract.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                        <td className="p-5">
                                            <div className="font-bold text-[13px] text-slate-900">{contract.clientNom}</div>
                                            <div className="text-[11px] text-slate-500 mt-1">{contract.clientType}</div>
                                        </td>
                                        <td className="p-5">
                                            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-[8px] text-[10px] font-bold uppercase tracking-widest border border-indigo-200">
                                                {contract.typeAcces}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <div className="text-[12px] font-bold text-slate-700">
                                                Jusqu'au {new Date(contract.dateFin).toLocaleDateString()}
                                            </div>
                                            <div className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${contract.statut === 'ACTIF' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {contract.statut}
                                            </div>
                                        </td>
                                        <td className="p-5 text-right">
                                            <code className="bg-slate-100 text-slate-600 px-3 py-2 rounded-[8px] text-[11px] font-mono border border-slate-200">
                                                {contract.apiKeyClient.substring(0, 15)}...
                                            </code>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODALE D'ACHAT */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isSubscribing && setIsModalOpen(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white w-full max-w-lg rounded-[24px] shadow-2xl relative z-[101] overflow-hidden border border-slate-200">
                            <div className="p-6 border-b border-slate-100 bg-indigo-50 flex items-center gap-4">
                                <div className="w-12 h-12 bg-white text-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                                    <Server size={24} />
                                </div>
                                <div>
                                    <h2 className="text-[16px] font-black text-slate-900 uppercase tracking-widest">Achat Licence DaaS</h2>
                                    <p className="text-[12px] text-indigo-600 font-bold mt-1">Accès API Observatoire QAPRIL</p>
                                </div>
                            </div>
                            <div className="p-6 space-y-5">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Nom de l'Institution</label>
                                    <input type="text" value={clientNom} onChange={e => setClientNom(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-4 py-3 text-[13px] font-medium text-slate-900 focus:outline-none focus:border-indigo-500" placeholder="Ex: SGCI, NSIA..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Type Client</label>
                                        <select value={clientType} onChange={e => setClientType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-4 py-3 text-[13px] font-medium text-slate-900 focus:outline-none focus:border-indigo-500">
                                            <option value="BANQUE">Banque</option>
                                            <option value="ASSUREUR">Assureur</option>
                                            <option value="ETAT">État / Institution</option>
                                            <option value="PROMOTEUR">Promoteur Immobilier</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Type d'Accès</label>
                                        <select value={typeAcces} onChange={e => setTypeAcces(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-4 py-3 text-[13px] font-medium text-slate-900 focus:outline-none focus:border-indigo-500">
                                            <option value="API_SCORING">API Scoring</option>
                                            <option value="AGREGAT">Données Agrégées</option>
                                            <option value="RAPPORT">Rapports Marché</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-slate-100 rounded-[16px] p-5 mt-4 border border-slate-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Tarif Annuel</span>
                                        <span className="text-[18px] font-black text-indigo-600">5 000 000 XOF</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500">Le montant sera déduit de votre Wallet QAPRIL immédiatement.</p>
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button disabled={isSubscribing} onClick={() => setIsModalOpen(false)} className="px-5 py-3 text-[12px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 rounded-[12px] hover:bg-slate-200">Annuler</button>
                                    <button disabled={isSubscribing} onClick={handlePurchase} className="px-6 py-3 text-[12px] font-bold uppercase tracking-widest text-white bg-indigo-600 rounded-[12px] hover:bg-indigo-700 flex items-center gap-2">
                                        {isSubscribing && <Loader2 size={16} className="animate-spin" />}
                                        Payer & Générer API
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
