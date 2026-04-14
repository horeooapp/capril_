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

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>

    const totalClaims = insurances.reduce((acc, ins) => acc + (ins.claims?.length || 0), 0)

    return (
        <div className="space-y-6 relative">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                        <Shield className="text-emerald-500" size={32} /> Assurances & Sinistres
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Couvertures Loyers Impayés et dommages, gérées au sein de QAPRIL.
                    </p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-emerald-500 text-white px-6 py-3 rounded-[12px] font-bold text-[12px] uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-sm flex items-center gap-2">
                    <Plus size={16} /> Déclarer Sinistre
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-emerald-50 p-8 rounded-[24px] border border-emerald-200">
                    <div className="w-12 h-12 bg-white rounded-[12px] shadow-sm text-emerald-500 flex items-center justify-center mb-4">
                        <Shield size={24} />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 mb-1">Polices Actives</p>
                    <p className="text-4xl font-black text-emerald-600">{insurances.filter(i => i.status === 'ACTIVE').length}</p>
                </div>
                <div className="bg-rose-50 p-8 rounded-[24px] border border-rose-200 relative overflow-hidden">
                    <div className="w-12 h-12 bg-white rounded-[12px] shadow-sm text-rose-500 flex items-center justify-center mb-4 relative z-10">
                        <AlertTriangle size={24} />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-rose-600 mb-1 relative z-10">Sinistres Déclarés</p>
                    <p className="text-4xl font-black text-rose-500 relative z-10">{totalClaims}</p>
                    <AlertTriangle size={150} className="absolute -bottom-10 -right-10 text-rose-500 opacity-10" />
                </div>
            </div>

            <div className="bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-5 font-bold text-[10px] uppercase tracking-widest text-slate-500">Police N°</th>
                                <th className="p-5 font-bold text-[10px] uppercase tracking-widest text-slate-500">Assureur</th>
                                <th className="p-5 font-bold text-[10px] uppercase tracking-widest text-slate-500">Bien & Locataire</th>
                                <th className="p-5 font-bold text-[10px] uppercase tracking-widest text-slate-500 text-center">Sinistres</th>
                                <th className="p-5 font-bold text-[10px] uppercase tracking-widest text-slate-500 text-right">Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {insurances.map(ins => (
                                <tr key={ins.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                    <td className="p-5">
                                        <div className="flex items-center gap-2 text-slate-900 font-bold text-[13px]">
                                            <FileText size={16} className="text-slate-400" /> {ins.policyNo}
                                        </div>
                                    </td>
                                    <td className="p-5 font-bold text-[13px] text-slate-700">{ins.provider}</td>
                                    <td className="p-5">
                                        <p className="text-[12px] font-bold text-slate-700">{ins.lease?.property?.name || ins.lease?.property?.address}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Preneur: {ins.lease?.tenant?.firstName} {ins.lease?.tenant?.lastName}</p>
                                    </td>
                                    <td className="p-5 text-center">
                                        <span className="bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-full text-[11px] border border-slate-200">{ins.claims?.length || 0}</span>
                                    </td>
                                    <td className="p-5 text-right flex justify-end">
                                        <span className={`px-3 py-1 rounded-[8px] text-[9px] font-bold uppercase tracking-widest border ${ins.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                                            {ins.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {insurances.length === 0 && (
                    <div className="p-10 text-center">
                        <p className="text-[13px] font-medium text-slate-400">Aucune police d'assurance attachée à vos baux.</p>
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
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => !isSubmitting && setIsModalOpen(false)}
                        />

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                            className="bg-white w-full max-w-2xl rounded-[24px] shadow-2xl relative z-[101] overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="p-8 pb-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                                <div>
                                    <div className="flex items-center gap-3 text-emerald-600 mb-2">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-[10px] flex items-center justify-center">
                                            <AlertTriangle size={20} />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-[6px] text-emerald-700">Procédure Formelle</span>
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Déclaration de Sinistre</h2>
                                    <p className="text-[13px] font-medium text-slate-500 mt-1">
                                        Enregistrement blockchain conformément à la police d'assurance.
                                    </p>
                                </div>
                                <button disabled={isSubmitting} onClick={() => setIsModalOpen(false)} className="w-8 h-8 bg-white border border-slate-200 rounded-[8px] flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-50">
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-8 overflow-y-auto custom-scrollbar">
                                <form id="claimForm" onSubmit={handleSubmitClaim} className="space-y-6">
                                    
                                    {/* Police Selection */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Police d'Assurance Associée *</label>
                                        <select required disabled={isSubmitting} className="w-full border border-slate-200 rounded-[12px] px-5 py-3.5 text-[13px] font-bold text-slate-900 focus:outline-none flex-shrink-0 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors bg-white cursor-pointer disabled:bg-slate-50 shadow-sm">
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
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Nature du Sinistre *</label>
                                            <select required disabled={isSubmitting} className="w-full border border-slate-200 rounded-[12px] px-5 py-3.5 text-[13px] font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors bg-white cursor-pointer disabled:bg-slate-50 shadow-sm">
                                                <option value="">Choisissez...</option>
                                                <option value="IMPAYE">Loyers Impayés (GLI)</option>
                                                <option value="DOMMAGE">Dégâts Matériels / Dégradations</option>
                                                <option value="EAU">Dégât des Eaux</option>
                                                <option value="INCENDIE">Incendie / Explosion</option>
                                                <option value="AUTRE">Autre incident</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Date du Constat *</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                <input type="date" required disabled={isSubmitting} className="w-full border border-slate-200 rounded-[12px] pl-10 pr-5 py-3.5 text-[13px] font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors bg-white disabled:bg-slate-50 shadow-sm" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Description Détaillée</label>
                                        <textarea required disabled={isSubmitting} rows={4} placeholder="Veuillez décrire précisément les faits et les dommages observés..." className="w-full border border-slate-200 rounded-[12px] px-5 py-4 text-[13px] font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors bg-white resize-none disabled:bg-slate-50 shadow-sm"></textarea>
                                    </div>

                                    {/* Upload Evidence */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Pièces Justificatives (Photos, Constat)</label>
                                        <div className={`border-2 border-dashed ${isSubmitting ? 'border-slate-300 bg-slate-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 cursor-pointer'} rounded-[16px] p-6 text-center transition-colors group`}>
                                            <div className={`w-12 h-12 bg-white border border-slate-200 rounded-[10px] shadow-sm flex items-center justify-center mx-auto mb-3 transition-transform ${isSubmitting ? 'text-slate-400' : 'text-slate-700 group-hover:scale-105'}`}>
                                                <Upload size={20} />
                                            </div>
                                            <h4 className={`text-[13px] font-bold ${isSubmitting ? 'text-slate-500' : 'text-slate-700'}`}>Déposez vos documents ici</h4>
                                            <p className="text-[11px] font-medium text-slate-500 mt-1">PDF, JPG, PNG (Max 10Mo)</p>
                                        </div>
                                    </div>

                                </form>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
                                <button type="button" disabled={isSubmitting} onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-[10px] font-bold text-[11px] uppercase tracking-widest text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50">
                                    Annuler
                                </button>
                                <button form="claimForm" disabled={isSubmitting} type="submit" className="bg-emerald-500 text-white px-8 py-3 rounded-[10px] font-bold text-[11px] uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-600">
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
