"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Users, PieChart, Plus, CheckCircle2, ShieldAlert, Loader2, X } from "lucide-react"
import { addColocataire } from "@/actions/coloc-actions"
import { toast } from "sonner"

export default function ColocDashboardBox({ leaseId, colocataires, synthesis }: { leaseId: string, colocataires: any[], synthesis: any }) {
    const [showAdd, setShowAdd] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState<{
        userId: string,
        role: "PRINCIPAL" | "SECONDAIRE" | "GARANT",
        partLoyer: string,
        pctLoyer: string,
        modePaiement: "INDIVIDUEL" | "GROUPE"
    }>({
        userId: "",
        role: "SECONDAIRE",
        partLoyer: "",
        pctLoyer: "",
        modePaiement: "GROUPE"
    })

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            await addColocataire({
                leaseId,
                userId: formData.userId,
                role: formData.role as any,
                partLoyer: formData.partLoyer ? Number(formData.partLoyer) : undefined,
                pctLoyer: formData.pctLoyer ? Number(formData.pctLoyer) : undefined,
                modePaiement: formData.modePaiement as any
            })
            toast.success("Colocataire ajouté avec succès. Actualisez la page pour le voir.")
            setShowAdd(false)
        } catch (error: any) {
            toast.error(error.message || "Impossible d'ajouter le colocataire")
        } finally {
            setSubmitting(false)
        }
    }

    const totalCollected = synthesis?.amountCollected || 0
    const totalExpected = synthesis?.totalExpected || 100 // Avoid div by zero
    const progress = Math.min((totalCollected / totalExpected) * 100, 100)

    return (
        <div className="bg-white rounded-[2rem] p-8 border border-qgrey-2 shadow-[0_12px_40px_rgba(13,43,110,0.06)] relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-qnavy-pale rounded-bl-[100%] z-0"></div>
            
            <div className="flex justify-between items-start mb-6 relative z-10 border-b border-qgrey-2 pb-4">
                <h2 className="text-xl font-black text-qnavy-dark flex items-center uppercase tracking-widest">
                    <span className="mr-3 text-qorange">👥</span> Gestion Colocation
                </h2>
                <button 
                    onClick={() => setShowAdd(true)}
                    className="p-2 bg-qnavy-pale text-qnavy rounded-xl hover:bg-qnavy hover:text-white transition-colors"
                >
                    <Plus size={20} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                {/* Synthesis gauge */}
                <div className="bg-background rounded-3xl p-6 border border-qgrey-2 flex flex-col justify-center items-center">
                    <PieChart size={32} className="text-qorange mb-2" />
                    <h3 className="text-[10px] font-black text-qtext-light uppercase tracking-widest">Synthèse Mensuelle</h3>
                    <div className="w-full mt-4 bg-qgrey-2 rounded-full h-3 overflow-hidden border border-qgrey-2 shadow-inner">
                        <div 
                            className={`h-full transition-all duration-1000 ${progress === 100 ? 'bg-qgreen' : 'bg-qorange'}`} 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between w-full mt-2 text-[10px] font-bold text-qtext-mid">
                        <span>{totalCollected.toLocaleString()} FCFA</span>
                        <span>{totalExpected.toLocaleString()} FCFA</span>
                    </div>
                    <div className="mt-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                            synthesis?.status === 'COMPLET' ? 'bg-qgreen/10 text-qgreen border-qgreen/20' : 
                            synthesis?.status === 'PARTIEL' ? 'bg-qorange/10 text-qorange border-qorange/20 animate-pulse' :
                            'bg-qgrey-1 text-qtext-mid border-qgrey-2'
                        }`}>
                            Statut de Quittance: {synthesis?.status || "ATTENTE"}
                        </span>
                    </div>
                </div>

                {/* Colocataires List */}
                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    {colocataires.length === 0 ? (
                        <div className="text-center p-6 text-qtext-light text-xs font-bold bg-qgrey-1/50 rounded-2xl border border-dashed border-qgrey-2">
                            Maison individuelle. Aucun colocataire rattaché.
                        </div>
                    ) : (
                        colocataires.map((coloc: any) => (
                            <div key={coloc.id} className={`p-4 rounded-xl border flex justify-between items-center ${
                                coloc.role === 'PRINCIPAL' ? 'bg-qnavy-pale border-qnavy/20' : 'bg-white border-qgrey-2'
                            }`}>
                                <div>
                                    <p className="text-sm font-black text-qnavy-dark capitalize">{coloc.user?.firstName} {coloc.user?.lastName}</p>
                                    <div className="flex gap-2 mt-1">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-qtext-mid bg-qgrey-1 px-2 py-0.5 rounded">
                                            {coloc.role}
                                        </span>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-qorange bg-qorange-pale px-2 py-0.5 rounded border border-qorange/10">
                                            {coloc.pctLoyer ? `${coloc.pctLoyer}%` : `${coloc.partLoyer} FCFA`}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <ShieldAlert size={16} className={coloc.role === 'PRINCIPAL' ? 'text-qnavy' : 'text-qgrey-2'} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal Add Coloc */}
            {showAdd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-qnavy-dark/40 backdrop-blur-sm">
                    <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black text-qnavy-dark uppercase tracking-widest flex items-center gap-2">
                                <Users className="text-qorange" size={20} /> Ajouter Colocataire
                            </h3>
                            <button onClick={() => setShowAdd(false)} className="text-qtext-light hover:text-qnavy p-2 bg-qgrey-1 rounded-full"><X size={16}/></button>
                        </div>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-qtext-light mb-1">ID Utilisateur (Locataire Inscrit)</label>
                                <input required type="text" value={formData.userId} onChange={e => setFormData({...formData, userId: e.target.value})} className="w-full bg-qgrey-1 border-none focus:ring-2 px-4 py-3 rounded-xl text-sm" placeholder="Ex: uuid-1234"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-qtext-light mb-1">Rôle</label>
                                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as "PRINCIPAL" | "SECONDAIRE" | "GARANT"})} className="w-full bg-qgrey-1 border-none focus:ring-2 px-4 py-3 rounded-xl text-sm font-bold text-qnavy">
                                        <option value="SECONDAIRE">Secondaire</option>
                                        <option value="PRINCIPAL">Principal</option>
                                        <option value="GARANT">Garant Solidaire</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-qtext-light mb-1">Mode de Paiement</label>
                                    <select value={formData.modePaiement} onChange={e => setFormData({...formData, modePaiement: e.target.value as "INDIVIDUEL" | "GROUPE"})} className="w-full bg-qgrey-1 border-none focus:ring-2 px-4 py-3 rounded-xl text-sm font-bold text-qnavy">
                                        <option value="INDIVIDUEL">Individuel (Prorata)</option>
                                        <option value="GROUPE">Groupe (Unique)</option>
                                    </select>
                                </div>
                            </div>
                            {formData.modePaiement === "INDIVIDUEL" && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-qtext-light mb-1">Quote Part (%)</label>
                                        <input type="number" value={formData.pctLoyer} onChange={e => setFormData({...formData, pctLoyer: e.target.value})} className="w-full bg-qgrey-1 border-none px-4 py-3 rounded-xl text-sm" placeholder="Ex: 50"/>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-qtext-light mb-1">Ou Montant Fixe</label>
                                        <input type="number" value={formData.partLoyer} onChange={e => setFormData({...formData, partLoyer: e.target.value})} className="w-full bg-qgrey-1 border-none px-4 py-3 rounded-xl text-sm" placeholder="Ex: 150000"/>
                                    </div>
                                </div>
                            )}
                            <button type="submit" disabled={submitting} className="w-full mt-4 bg-qnavy text-white font-black py-4 rounded-xl flex justify-center items-center uppercase text-xs tracking-widest hover:bg-qnavy-dark transition-all active:scale-95 shadow-md">
                                {submitting ? <Loader2 className="animate-spin" size={18} /> : "Rattacher au Bail"}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
