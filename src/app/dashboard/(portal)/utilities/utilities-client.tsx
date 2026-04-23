"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Zap, Droplets, Plus, FileText, ChevronRight, Calculator, PieChart, Users, AlertCircle, X, Check, Building2 } from "lucide-react"
import { toast } from "sonner"

interface UtilitiesClientProps {
    properties: any[]
    initialFactures: any[]
}

export default function UtilitiesClient({ properties, initialFactures }: UtilitiesClientProps) {
    const [factures, setFactures] = useState(initialFactures)
    const [modalOpen, setModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        propertyId: "",
        type: "CIE",
        montantGlobal: "",
        mois: "",
        repartitionMode: "PRORATA_CHAMBRE" // PRORATA_CHAMBRE, FORFAIT_FIXE, MANUEL
    })

    const handleCreateFacture = async () => {
        if (!formData.propertyId || !formData.montantGlobal || !formData.mois) {
            return toast.error("Veuillez remplir tous les champs obligatoires.")
        }
        
        setLoading(true)
        // Simulation d'une action serveur
        setTimeout(() => {
            const prop = properties.find(p => p.id === formData.propertyId)
            const newFacture = {
                id: `FAC-${Math.floor(Math.random() * 1000)}`,
                type: formData.type,
                montantGlobal: parseInt(formData.montantGlobal),
                mois: formData.mois,
                property: { name: prop?.name || "Propriété inconnue" },
                status: "REPARTIE",
                repartitions: [
                    { locataireName: "Locataire 1", montant: parseInt(formData.montantGlobal) * 0.4, status: "EN_ATTENTE" },
                    { locataireName: "Locataire 2", montant: parseInt(formData.montantGlobal) * 0.6, status: "EN_ATTENTE" }
                ]
            }
            setFactures([newFacture, ...factures])
            setModalOpen(false)
            setLoading(false)
            toast.success("Facture enregistrée et répartie avec succès !")
        }, 1500)
    }

    return (
        <div className="space-y-8 pb-32">
            {/* HERO SECTION */}
            <div className="relative glass-panel rounded-[2rem] p-8 md:p-12 overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between items-start md:items-center">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-amber-400">
                            <Calculator size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Factures & Charges Communes</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter">
                            CIE / SODECI <br />
                            <span className="text-slate-400">Fini les disputes de cour.</span>
                        </h1>
                        <p className="text-slate-400 max-w-xl text-sm font-medium leading-relaxed">
                            Saisissez la facture globale de votre cour commune ou immeuble. QAPRIL s'occupe de diviser le montant selon vos règles de répartition et d'envoyer les appels de fonds aux locataires.
                        </p>
                    </div>
                    <button 
                        onClick={() => setModalOpen(true)}
                        className="px-8 py-4 bg-white text-slate-900 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-xl hover:bg-gray-100 transition-all flex items-center gap-3 active:scale-95 group shrink-0"
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                        Ajouter une Facture
                    </button>
                </div>
            </div>

            {/* DASHBOARD STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-[1.5rem] bg-white border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                        <Zap size={24} />
                    </div>
                    <div>
                        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Factures CIE en cours</h3>
                        <p className="text-2xl font-black text-slate-800">45,000 <span className="text-sm text-gray-400 font-bold">FCFA</span></p>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-[1.5rem] bg-white border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center">
                        <Droplets size={24} />
                    </div>
                    <div>
                        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Factures SODECI en cours</h3>
                        <p className="text-2xl font-black text-slate-800">0 <span className="text-sm text-gray-400 font-bold">FCFA</span></p>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-[1.5rem] bg-slate-900 border border-slate-800 shadow-xl flex items-center gap-4 text-white relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 opacity-10"><PieChart size={100} className="-mr-6 -mb-6" /></div>
                    <div className="relative z-10">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Taux de recouvrement</h3>
                        <p className="text-3xl font-black">68%</p>
                        <p className="text-xs text-emerald-400 font-medium mt-1 flex items-center gap-1"><Check size={12}/> Ce mois-ci</p>
                    </div>
                </div>
            </div>

            {/* LISTE DES FACTURES */}
            <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 px-2">Historique des Répartitions</h3>
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="p-5 font-black text-[10px] uppercase tracking-widest text-slate-500">Facture</th>
                                    <th className="p-5 font-black text-[10px] uppercase tracking-widest text-slate-500">Bien / Résidence</th>
                                    <th className="p-5 font-black text-[10px] uppercase tracking-widest text-slate-500">Montant Global</th>
                                    <th className="p-5 font-black text-[10px] uppercase tracking-widest text-slate-500">État de la collecte</th>
                                    <th className="p-5 font-black text-[10px] uppercase tracking-widest text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {factures.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-10 text-center text-slate-400 font-medium">Aucune facture enregistrée.</td>
                                    </tr>
                                )}
                                {factures.map((fac) => (
                                    <tr key={fac.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${fac.type === 'CIE' ? 'bg-amber-100 text-amber-600' : 'bg-sky-100 text-sky-600'}`}>
                                                    {fac.type === 'CIE' ? <Zap size={18} /> : <Droplets size={18} />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800">{fac.type} - {fac.mois}</p>
                                                    <p className="text-xs text-gray-400 font-medium">{fac.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2 text-slate-600 font-medium">
                                                <Building2 size={14} className="text-gray-400" />
                                                {fac.property.name}
                                            </div>
                                        </td>
                                        <td className="p-5 font-black text-slate-800">
                                            {Number(fac.montantGlobal).toLocaleString()} <span className="text-xs text-gray-400">FCFA</span>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex -space-x-2">
                                                    {fac.repartitions.map((rep: any, idx: number) => (
                                                        <div key={idx} className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white ${rep.status === 'PAYEE' ? 'bg-emerald-500' : 'bg-rose-400'}`} title={`${rep.locataireName}: ${rep.status}`}>
                                                            {rep.locataireName.charAt(0)}
                                                        </div>
                                                    ))}
                                                </div>
                                                <span className="text-xs font-bold text-gray-500">
                                                    {fac.repartitions.filter((r: any) => r.status === 'PAYEE').length}/{fac.repartitions.length} payé
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-right">
                                            <button className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-colors">
                                                Détails
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL AJOUT FACTURE */}
            {modalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Nouvelle Facture</h3>
                                    <p className="text-xs text-gray-400 font-medium">Diviser une facture globale entre locataires</p>
                                </div>
                            </div>
                            <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 overflow-y-auto space-y-8 flex-1">
                            {/* Property Selection */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                    <Building2 size={14} /> Bien concerné (Cour commune / Immeuble)
                                </label>
                                <select 
                                    className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold text-slate-800 focus:ring-2 focus:ring-slate-900"
                                    value={formData.propertyId}
                                    onChange={(e) => setFormData({...formData, propertyId: e.target.value})}
                                >
                                    <option value="">Sélectionnez un bien...</option>
                                    {properties.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} - {p.commune}</option>
                                    ))}
                                </select>
                                {properties.length === 0 && (
                                    <p className="text-xs text-amber-600 font-medium flex items-center gap-1 mt-2">
                                        <AlertCircle size={12} /> Aucun bien de type multi-unités trouvé.
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Type de Facture</label>
                                    <div className="flex p-1 bg-gray-100 rounded-[1rem]">
                                        <button 
                                            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-[0.8rem] transition-all flex justify-center items-center gap-2 ${formData.type === 'CIE' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-400 hover:text-gray-600'}`}
                                            onClick={() => setFormData({...formData, type: 'CIE'})}
                                        >
                                            <Zap size={14} /> CIE
                                        </button>
                                        <button 
                                            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-[0.8rem] transition-all flex justify-center items-center gap-2 ${formData.type === 'SODECI' ? 'bg-white shadow-sm text-sky-600' : 'text-gray-400 hover:text-gray-600'}`}
                                            onClick={() => setFormData({...formData, type: 'SODECI'})}
                                        >
                                            <Droplets size={14} /> SODECI
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Mois facturé</label>
                                    <input 
                                        type="month" 
                                        className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold text-slate-800"
                                        value={formData.mois}
                                        onChange={(e) => setFormData({...formData, mois: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Montant Global de la facture (FCFA)</label>
                                <input 
                                    type="number" 
                                    placeholder="Ex: 54000"
                                    className="w-full p-5 text-2xl rounded-2xl bg-gray-50 border-none font-black text-slate-800"
                                    value={formData.montantGlobal}
                                    onChange={(e) => setFormData({...formData, montantGlobal: e.target.value})}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Règle de Répartition</label>
                                <div className="space-y-2">
                                    <label className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-colors ${formData.repartitionMode === 'PRORATA_CHAMBRE' ? 'border-slate-800 bg-slate-50' : 'border-transparent bg-gray-50 hover:bg-gray-100'}`}>
                                        <input type="radio" name="mode" className="mt-1" checked={formData.repartitionMode === 'PRORATA_CHAMBRE'} onChange={() => setFormData({...formData, repartitionMode: 'PRORATA_CHAMBRE'})} />
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">Prorata par nombre de pièces</p>
                                            <p className="text-xs text-gray-500 mt-1">Divise automatiquement la facture selon la taille des portes (ex: un 3 pièces paie plus qu'un studio).</p>
                                        </div>
                                    </label>
                                    <label className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-colors ${formData.repartitionMode === 'EQUITABLE' ? 'border-slate-800 bg-slate-50' : 'border-transparent bg-gray-50 hover:bg-gray-100'}`}>
                                        <input type="radio" name="mode" className="mt-1" checked={formData.repartitionMode === 'EQUITABLE'} onChange={() => setFormData({...formData, repartitionMode: 'EQUITABLE'})} />
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">Division Équitable stricte</p>
                                            <p className="text-xs text-gray-500 mt-1">Divise le montant total en parts égales selon le nombre de locataires actifs.</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0">
                            <button 
                                onClick={handleCreateFacture}
                                disabled={loading}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {loading ? "Traitement..." : "Générer la Répartition"} 
                                {!loading && <ChevronRight size={18} />}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
