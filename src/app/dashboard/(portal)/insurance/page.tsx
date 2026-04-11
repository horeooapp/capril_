"use client"

import React, { useEffect, useState } from "react"
import { getAllInsurances } from "@/actions/insurance"
import { Shield, AlertTriangle, FileText, Loader2, Plus, X, Calendar, Upload, FileSignature } from "lucide-react"
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function InsuranceDashboardPage() {
    const [insurances, setInsurances] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const res = await getAllInsurances()
            if (res.success) setInsurances(res.insurances || [])
        } finally {
            setLoading(false)
        }
    }

    const handleSubmitClaim = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        // Simulation
        setTimeout(() => {
            setIsSubmitting(false)
            setIsModalOpen(false)
            toast.success("Sinistre déclaré avec succès. Un inspecteur prendra en charge votre dossier et initiera le recouvrement sous 48h.", {
                icon: '⚖️'
            })
        }, 2000)
    }

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-qgreen" size={40} /></div>

    const totalClaims = insurances.reduce((acc, ins) => acc + (ins.claims?.length || 0), 0)

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <Shield className="text-qgreen" size={32} /> Assurances & Sinistres
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Couvertures Loyers Impayés et dommages, gérées au sein de QAPRIL.
                    </p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-qgreen text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qgreen-dark transition-all shadow-md flex items-center gap-2 hover:scale-105 active:scale-95">
                    <Plus size={16} /> Déclarer Sinistre
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-qgreen-pale p-8 rounded-[2rem] border border-qgreen/20">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm text-qgreen flex items-center justify-center mb-4">
                        <Shield size={24} />
                    </div>
                    <p className="text-[12px] font-black uppercase tracking-widest text-qgreen-dark mb-1">Polices Actives</p>
                    <p className="text-5xl font-black text-qgreen">{insurances.filter(i => i.status === 'ACTIVE').length}</p>
                </div>
                <div className="bg-qred-pale p-8 rounded-[2rem] border border-qred/20 relative overflow-hidden">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm text-qred flex items-center justify-center mb-4 relative z-10">
                        <AlertTriangle size={24} />
                    </div>
                    <p className="text-[12px] font-black uppercase tracking-widest text-qred mb-1 relative z-10">Sinistres Déclarés</p>
                    <p className="text-5xl font-black text-qred relative z-10">{totalClaims}</p>
                    <AlertTriangle size={150} className="absolute -bottom-10 -right-10 text-qred opacity-10" />
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-qgrey-2 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-qgrey-1/50 border-b border-qgrey-2">
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-mid">Police N°</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-mid">Assureur</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-mid">Bien & Locataire</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-mid text-center">Sinistres</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-mid text-right">Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        {insurances.map(ins => (
                            <tr key={ins.id} className="border-b border-qgrey-2 hover:bg-qgrey-1/30">
                                <td className="p-5">
                                    <div className="flex items-center gap-2 text-qnavy-dark font-black text-sm">
                                        <FileText size={16} className="text-gray-400" /> {ins.policyNo}
                                    </div>
                                </td>
                                <td className="p-5 font-bold text-sm text-qnavy">{ins.provider}</td>
                                <td className="p-5">
                                    <p className="text-xs font-black text-qnavy">{ins.lease?.property?.name || ins.lease?.property?.address}</p>
                                    <p className="text-[10px] font-bold text-qtext-light uppercase tracking-widest mt-1">Preneur: {ins.lease?.tenant?.firstName} {ins.lease?.tenant?.lastName}</p>
                                </td>
                                <td className="p-5 text-center">
                                    <span className="bg-qgrey-2 text-qnavy font-black px-3 py-1 rounded-full text-xs">{ins.claims?.length || 0}</span>
                                </td>
                                <td className="p-5 text-right">
                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${ins.status === 'ACTIVE' ? 'bg-qgreen-pale text-qgreen border border-qgreen/20' : 'bg-qred-pale text-qred border border-qred/20'}`}>
                                        {ins.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {insurances.length === 0 && (
                    <div className="p-10 text-center">
                        <p className="text-sm font-bold text-qtext-light">Aucune police d'assurance attachée à vos baux.</p>
                    </div>
                )}
            </div>

            {/* MODALE DE DECLARATION DE SINISTRE */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            className="fixed inset-0 bg-[#0D2B6E]/60 backdrop-blur-md"
                            onClick={() => !isSubmitting && setIsModalOpen(false)}
                        />

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                            className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-[101] overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="p-8 pb-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                                <div>
                                    <div className="flex items-center gap-3 text-qgreen mb-2">
                                        <div className="w-10 h-10 bg-qgreen-pale rounded-xl flex items-center justify-center">
                                            <AlertTriangle size={20} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest bg-qgreen-pale px-3 py-1 rounded-full text-qgreen-dark">Procédure Formelle</span>
                                    </div>
                                    <h2 className="text-2xl font-black text-[#1F4E79] uppercase tracking-tighter">Déclaration de Sinistre</h2>
                                    <p className="text-sm font-medium text-slate-500 mt-1">
                                        Enregistrement blockchain conformément à la police d'assurance.
                                    </p>
                                </div>
                                <button disabled={isSubmitting} onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm disabled:opacity-50">
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-8 overflow-y-auto custom-scrollbar">
                                <form id="claimForm" onSubmit={handleSubmitClaim} className="space-y-6">
                                    
                                    {/* Police Selection */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-[#1F4E79]">Police d'Assurance Associée *</label>
                                        <select required disabled={isSubmitting} className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none flex-shrink-0 focus:border-qgreen transition-colors bg-white cursor-pointer disabled:bg-slate-50">
                                            <option value="">Sélectionnez un contrat de bail couvert...</option>
                                            {insurances.filter(i => i.status === 'ACTIVE').map(ins => (
                                                <option key={ins.id} value={ins.id}>
                                                    Contrat N°{ins.policyNo} - {ins.lease?.property?.name || "Propriété"} ({ins.provider})
                                                </option>
                                            ))}
                                            {insurances.filter(i => i.status === 'ACTIVE').length === 0 && (
                                                <option disabled>Aucune couverture active</option>
                                            )}
                                        </select>
                                    </div>

                                    {/* Type & Date */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-widest text-[#1F4E79]">Nature du Sinistre *</label>
                                            <select required disabled={isSubmitting} className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-qgreen transition-colors bg-white cursor-pointer disabled:bg-slate-50">
                                                <option value="">Choisissez...</option>
                                                <option value="IMPAYE">Loyers Impayés (GLI)</option>
                                                <option value="DOMMAGE">Dégâts Matériels / Dégradations</option>
                                                <option value="EAU">Dégât des Eaux</option>
                                                <option value="INCENDIE">Incendie / Explosion</option>
                                                <option value="AUTRE">Autre incident</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-widest text-[#1F4E79]">Date du Constat *</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input type="date" required disabled={isSubmitting} className="w-full border-2 border-slate-100 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-qgreen transition-colors bg-white disabled:bg-slate-50" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-[#1F4E79]">Description Détaillée</label>
                                        <textarea required disabled={isSubmitting} rows={4} placeholder="Veuillez décrire précisément les faits et les dommages observés..." className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-qgreen transition-colors bg-white resize-none disabled:bg-slate-50"></textarea>
                                    </div>

                                    {/* Upload Evidence */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-[#1F4E79]">Pièces Justificatives (Photos, Constat)</label>
                                        <div className={`border-2 border-dashed ${isSubmitting ? 'border-slate-300 bg-slate-50' : 'border-qgreen/30 bg-qgreen-pale/30 hover:bg-qgreen-pale/60 cursor-pointer'} rounded-3xl p-6 text-center transition-colors group`}>
                                            <div className={`w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-3 transition-transform ${isSubmitting ? 'text-slate-400' : 'text-qgreen group-hover:scale-110'}`}>
                                                <Upload size={24} />
                                            </div>
                                            <h4 className={`text-sm font-black ${isSubmitting ? 'text-slate-500' : 'text-[#1F4E79]'}`}>Déposez vos documents ici</h4>
                                            <p className="text-xs font-medium text-slate-400 mt-1">PDF, JPG, PNG (Max 10Mo)</p>
                                        </div>
                                    </div>

                                </form>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
                                <button type="button" disabled={isSubmitting} onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-200 transition-colors disabled:opacity-50">
                                    Annuler
                                </button>
                                <button form="claimForm" disabled={isSubmitting} type="submit" className="bg-qgreen text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qgreen-dark transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <FileSignature size={16} />}
                                    Soumettre le dossier
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
