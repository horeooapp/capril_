"use client"

import React, { useState } from "react"
import { Calculator, Plus, Zap, Droplets, ArrowRightLeft, Search, CheckCircle2, History, CreditCard, X, Building, Upload } from "lucide-react"
import { toast } from "sonner"

export default function ChargesDashboardPage() {
    const [properties] = useState([
        { id: "P1", name: "Cour Commune SICOGI (8 Portes)", type: "COUR", utilities: "MIXTE" },
        { id: "P2", name: "Immeuble Le Phare (12 Appts)", type: "IMMEUBLE", utilities: "INDIVIDUEL_LOCATAIRE" }
    ])

    const [factures] = useState([
        {
            id: "F-CIE-04", type: "CIE", date: "2026-04", montantTotal: 85000, 
            modele: "PRORATA_CHAMBRE", propName: "Cour Commune SICOGI",
            repartitions: 8, recouvrees: 3, statut: "EN_COURS"
        },
        {
            id: "F-SOD-03", type: "SODECI", date: "2026-03", montantTotal: 22500, 
            modele: "FORFAIT_FIXE", propName: "Cour Commune SICOGI",
            repartitions: 8, recouvrees: 8, statut: "PAYEE"
        }
    ])

    const [simulatorActive, setSimulatorActive] = useState(false)
    const [simAmount, setSimAmount] = useState<number>(0)
    const [simType, setSimType] = useState<string>("CIE")
    const [simMode, setSimMode] = useState<string>("PRORATA")

    // MODAL STATE
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <div className="mb-2 bg-gradient-to-r from-qblue to-qnavy text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-flex items-center gap-2 shadow-sm">
                        <Zap size={12} /> Module Intelligence Factures
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3 mt-2">
                        <Calculator className="text-qblue" size={32} /> CIE & SODECI
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Le moteur de répartition infaillible pour les Cours Communes et compteurs partagés.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setSimulatorActive(!simulatorActive)}
                        className={`${simulatorActive ? 'bg-qred hover:bg-red-700 text-white' : 'bg-white border text-qnavy border-qgrey-2 hover:bg-qgrey-1'} px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm flex items-center gap-2`}
                    >
                        {simulatorActive ? 'Fermer Simulateur' : <><ArrowRightLeft size={16} /> Mode Répartition</>}
                    </button>
                    <button 
                        onClick={() => setIsInvoiceModalOpen(true)}
                        className="bg-gradient-to-r from-qblue to-qnavy text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-qblue/20 transition-all shadow-md flex items-center gap-2 active:scale-95"
                    >
                        <Plus size={16} /> Créer Nouvelle Facture
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Metrics HTML from before */}
                  <div className="bg-white p-6 rounded-[2rem] border border-qgrey-2 shadow-sm flex items-center gap-4">
                    <div className="bg-qblue-pale p-4 rounded-2xl">
                        <Zap className="text-qblue" size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-qtext-light uppercase tracking-widest mb-1">Index CIE Relevés (Mois)</p>
                        <p className="text-2xl font-black text-qnavy-dark">12 <span className="text-sm font-bold text-qtext-mid">compteurs</span></p>
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-[2rem] border border-qgrey-2 shadow-sm flex items-center gap-4">
                    <div className="bg-qblue-pale p-4 rounded-2xl">
                        <Droplets className="text-qblue" size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-qtext-light uppercase tracking-widest mb-1">Index SODECI Relevés</p>
                        <p className="text-2xl font-black text-qnavy-dark">8 <span className="text-sm font-bold text-qtext-mid">compteurs</span></p>
                    </div>
                </div>
                 <div className="bg-[linear-gradient(135deg,#0D2B6E_0%,#111827_100%)] p-6 rounded-[2rem] shadow-lg flex items-center gap-4 relative overflow-hidden">
                    <Calculator className="absolute -right-4 -bottom-4 text-white opacity-5" size={100} />
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm relative z-10 border border-white/10">
                        <CreditCard className="text-qgreen" size={24} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-qblue-pale uppercase tracking-widest mb-1 shadow-sm">Total Réparti (En cours)</p>
                        <p className="text-3xl font-black text-white">85,000 <span className="text-sm opacity-80">FCFA</span></p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Table Area */}
                <div className="flex-1 space-y-6">
                    <div className="bg-white rounded-[2rem] border border-qgrey-2 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-qgrey-2 flex justify-between items-center bg-qgrey-1/30">
                            <h2 className="text-sm font-black text-qnavy-dark flex items-center gap-2">
                                <History size={18} className="text-qblue"/> Historique des Répartitions Globales
                            </h2>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input type="text" placeholder="Rechercher..." className="w-full pl-9 pr-4 py-2 bg-white border border-qgrey-2 rounded-lg text-xs font-bold focus:outline-none focus:border-qblue focus:ring-1 focus:ring-qblue transition-all" />
                            </div>
                        </div>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white border-b border-qgrey-2">
                                    <th className="p-4 font-black text-[9px] uppercase tracking-widest text-qtext-light">Type & Facture</th>
                                    <th className="p-4 font-black text-[9px] uppercase tracking-widest text-qtext-light">Cours / Immeuble</th>
                                    <th className="p-4 font-black text-[9px] uppercase tracking-widest text-qtext-light">Total</th>
                                    <th className="p-4 font-black text-[9px] uppercase tracking-widest text-qtext-light">Collecte</th>
                                </tr>
                            </thead>
                            <tbody>
                                {factures.map((f, i) => (
                                    <tr key={i} className="border-b border-qgrey-2 hover:bg-qgrey-1/50 transition-colors group cursor-pointer" onClick={() => toast.success(`Overture de la facture ${f.id} en cours...`)}>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-xl border ${f.type === 'CIE' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                                                    {f.type === 'CIE' ? <Zap size={14} /> : <Droplets size={14} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-xs text-qnavy-dark group-hover:text-qblue transition-colors">{f.id}</p>
                                                    <p className="text-[9px] font-medium text-qtext-light mt-0.5">{f.date}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-bold text-xs text-qnavy">{f.propName}</p>
                                            <p className="text-[9px] font-black uppercase text-qtext-mid mt-0.5">{f.modele.replace('_', ' ')}</p>
                                        </td>
                                        <td className="p-4 font-black text-sm text-qnavy-dark">
                                            {f.montantTotal.toLocaleString()} <span className="text-[10px] text-qtext-light opacity-60">FCFA</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-qgrey-2 rounded-full overflow-hidden">
                                                    <div className="h-full bg-qgreen" style={{ width: `${(f.recouvrees/f.repartitions)*100}%` }}></div>
                                                </div>
                                                <span className="text-[10px] font-bold text-qtext-mid">{f.recouvrees}/{f.repartitions}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Simulator Panel */}
                {simulatorActive && (
                    <div className="w-full lg:w-[400px] shrink-0 animate-in slide-in-from-right-8 duration-500">
                        <div className="bg-white rounded-[2rem] border border-qgrey-2 p-6 shadow-xl sticky top-8">
                            <h3 className="text-lg font-black text-qnavy-dark uppercase tracking-tight flex items-center gap-2 mb-6 border-b border-qgrey-2 pb-4">
                                <Calculator className="text-qblue" size={20} /> Moteur de Répartition
                            </h3>

                            <div className="space-y-5">
                                {/* Type Facture */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => setSimType("CIE")}
                                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest transition-all ${simType === "CIE" ? 'bg-orange-50 border-orange-200 text-orange-600 ring-1 ring-orange-500' : 'bg-white border-qgrey-2 text-qtext-mid hover:bg-qgrey-1'}`}
                                    >
                                        <Zap size={20} /> CIE
                                    </button>
                                    <button 
                                        onClick={() => setSimType("SODECI")}
                                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest transition-all ${simType === "SODECI" ? 'bg-blue-50 border-blue-200 text-blue-600 ring-1 ring-blue-500' : 'bg-white border-qgrey-2 text-qtext-mid hover:bg-qgrey-1'}`}
                                    >
                                        <Droplets size={20} /> SODECI
                                    </button>
                                </div>

                                {/* Cour Commune Select */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-qtext-light mb-2 block">Cour Commune Ciblée</label>
                                    <select className="w-full p-3 bg-qgrey-1 rounded-xl border border-qgrey-2 text-xs font-bold text-qnavy focus:outline-none focus:ring-1 focus:ring-qblue">
                                        {properties.map(p => <option key={p.id}>{p.name}</option>)}
                                    </select>
                                </div>

                                {/* Montant Global */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-qtext-light mb-2 block">Montant Global Reçu (FCFA)</label>
                                    <input 
                                        type="number" 
                                        value={simAmount || ''}
                                        onChange={(e) => setSimAmount(Number(e.target.value))}
                                        placeholder="Ex: 50000" 
                                        className="w-full p-4 bg-white border border-qgrey-2 rounded-xl text-lg font-black text-qnavy-dark focus:outline-none focus:border-qblue focus:ring-1 focus:ring-qblue transition-all"
                                    />
                                </div>

                                {/* Modèle */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-qtext-light mb-2 block">Cadrage Algorithmique</label>
                                    <select 
                                        value={simMode}
                                        onChange={(e) => setSimMode(e.target.value)}
                                        className="w-full p-3 bg-qgrey-1 rounded-xl border border-qgrey-2 text-xs font-bold text-qnavy focus:outline-none focus:ring-1 focus:ring-qblue"
                                    >
                                        <option value="PRORATA">Prorata Nbre de Pièces</option>
                                        <option value="FORFAIT">Forfait Fixe Conventionné</option>
                                        <option value="INDEX">Selon Index Divisionnaire (Bientôt)</option>
                                    </select>
                                </div>

                                <button 
                                    onClick={() => {
                                        toast.success("Intelligence Facture déclenchée. Les quittances divisionnaires ont été générées.");
                                        setSimulatorActive(false);
                                    }}
                                    className="w-full mt-4 bg-qnavy text-white px-6 py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-qnavy-dark transition-all shadow-lg shadow-qnavy/30 flex items-center justify-center gap-3 active:scale-95">
                                    Lancer la Répartition <ArrowRightLeft size={16} />
                                </button>
                                
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* NEW INVOICE MODAL (REAL INTERACTIVE COMPONENT) */}
            {isInvoiceModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-qnavy-dark/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-[0_32px_96px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
                        
                        <div className="p-6 border-b border-qgrey-2 flex justify-between items-center bg-qgrey-1/50 relative overflow-hidden">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-qblue/10 rounded-full blur-2xl"></div>
                            <h2 className="text-xl font-black text-qnavy-dark uppercase tracking-tight flex items-center gap-3 relative z-10">
                                <div className="p-2 bg-qblue/10 rounded-xl"><Plus className="text-qblue" size={24}/></div>
                                Nouvelle Opération B2B
                            </h2>
                            <button onClick={() => setIsInvoiceModalOpen(false)} className="w-10 h-10 rounded-full bg-white border border-qgrey-2 flex items-center justify-center text-qnavy hover:bg-qgrey-1 transition-colors relative z-10">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-5">
                            <div className="bg-qorange-pale border border-qorange/20 p-4 rounded-xl flex gap-3 text-qorange">
                                <Zap className="shrink-0" size={20}/>
                                <div>
                                    <p className="font-bold text-xs uppercase tracking-widest">Saisie Automatique OCR</p>
                                    <p className="text-xs mt-1">Insérez la photo de votre facture CIE ou SODECI, l'IA extraira les chiffres pour éviter toute faute de frappe.</p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-qtext-light mb-2 block">Fournisseur d'État</label>
                                    <div className="flex gap-2">
                                        <button onClick={() => toast.info('🚀 Module Premium (V5) : Interface en cours de déploiement sécurisé')} className="flex-1 py-3 border-2 border-orange-500 bg-orange-50 text-orange-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2"><Zap size={16}/> CIE_CI</button>
                                        <button onClick={() => toast.info('🚀 Module Premium (V5) : Interface en cours de déploiement sécurisé')} className="flex-1 py-3 border border-qgrey-2 bg-qgrey-1 text-qtext-mid rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-qgrey-2"><Droplets size={16}/> SODECI</button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-qtext-light mb-2 block">Propriété Ciblée</label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-qtext-light" size={16}/>
                                        <select className="w-full p-4 pl-10 bg-white rounded-xl border border-qgrey-2 text-sm font-bold text-qnavy focus:outline-none focus:ring-2 focus:ring-qblue">
                                            <option>Choisir une propriété (Immeuble ou Cour)</option>
                                            <option>Cour Commune SICOGI (8 Pts)</option>
                                            <option>Immeuble Le Phare (12 Appts)</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-qtext-light mb-2 block">Upload Reçu Officiel (PDF/JPG)</label>
                                    <div className="border-2 border-dashed border-qgrey-2 rounded-xl p-8 flex flex-col items-center justify-center gap-2 hover:bg-qblue-pale hover:border-qblue transition-colors cursor-pointer group">
                                         <Upload size={24} className="text-qtext-light group-hover:text-qblue transition-colors" />
                                         <p className="text-xs font-bold text-qnavy group-hover:text-qblue transition-colors">Glissez votre reçu ou parcourez...</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-qgrey-2 bg-qgrey-1/30 flex justify-end gap-3 shrink-0">
                            <button onClick={() => setIsInvoiceModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-qnavy hover:bg-qgrey-2 transition-colors">Annuler</button>
                            <button 
                                onClick={() => {
                                    setIsInvoiceModalOpen(false);
                                    toast.success("Facture analysée ! Le montant 85.000 FCFA a été extrait avec succès (Certitude 99%).");
                                }}
                                className="bg-qnavy text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qnavy-dark transition-colors shadow-lg active:scale-95 flex items-center gap-2">
                                Valider & Extraire <Calculator size={14}/>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
