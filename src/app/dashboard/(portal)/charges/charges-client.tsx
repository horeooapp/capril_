"use client"

import React, { useState, useRef } from "react"
import { Calculator, Plus, Zap, Droplets, ArrowRightLeft, Search, CheckCircle2, History, CreditCard, X, Building, Upload, AlertCircle, Loader2, Scan, PenTool } from "lucide-react"
import { toast } from "sonner"
import { scanUtilityBillOCR, registerAndDistributeUtility } from "@/actions/utility-actions"
import { UtilityType } from "@prisma/client"
import { SectionCard } from "@/components/dashboard/ui/SectionCard"
import { StatCard } from "@/components/dashboard/ui/StatCard"
import { Badge } from "@/components/dashboard/ui/Badge"

export default function ChargesDashboardClient({ properties, factures }: { properties: any[], factures: any[] }) {

    const [simulatorActive, setSimulatorActive] = useState(false)
    const [simAmount, setSimAmount] = useState<number>(0)
    const [simType, setSimType] = useState<UtilityType>("CIE")
    const [simMode, setSimMode] = useState<string>("PRORATA")
    const [simPropertyId, setSimPropertyId] = useState<string>("")
    const [isSimulating, setIsSimulating] = useState(false)

    // MODAL STATE
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
    const [uploadType, setUploadType] = useState<UtilityType>("CIE")
    const [uploadPropertyId, setUploadPropertyId] = useState<string>("")
    const [entryMode, setEntryMode] = useState<"OCR" | "MANUAL">("OCR")
    const [manualAmount, setManualAmount] = useState<number | "">("")
    
    const [isScanning, setIsScanning] = useState(false)
    const [scanResult, setScanResult] = useState<{montant: number, confidence: string} | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsScanning(true)
        setScanResult(null)
        
        try {
            const formData = new FormData()
            formData.append("billFile", file)
            formData.append("typeUtility", uploadType)

            const promise = scanUtilityBillOCR(formData)
            
            toast.promise(promise, {
                loading: "Analyse OCR et fouille de données en cours...",
                success: "Extraction terminée.",
                error: "Échec de l'extraction."
            })

            const response = await promise
            
            if (response.success && response.montant) {
                setScanResult({ montant: response.montant, confidence: response.confidence || "100%" })
                setSimAmount(response.montant)
            } else {
                toast.error(response.error || "Impossible de déterminer le montant.")
            }
        } catch (err) {
            toast.error("Erreur technique lors du scan.")
        } finally {
            setIsScanning(false)
        }
    }

    const handleValidation = async () => {
        if (!uploadPropertyId) {
            toast.error("Veuillez sélectionner la propriété.")
            return;
        }

        if (entryMode === "OCR" && !scanResult?.montant) {
             toast.error("Veuillez d'abord scanner une facture avec succès.")
             return;
        }
        
        if (entryMode === "MANUAL" && (!manualAmount || manualAmount <= 0)) {
            toast.error("Veuillez saisir un montant valide.")
            return;
        }

        setIsScanning(true)
        try {
            const finalAmount = entryMode === "OCR" ? scanResult!.montant : Number(manualAmount);
            
            const res = await registerAndDistributeUtility({
                leaseId: uploadPropertyId,
                typeUtility: uploadType,
                identifiantCompteur: entryMode === "OCR" ? "EXTRACT_OCR" : "SAISIE_MANUELLE",
                moisFacture: new Date(),
                montantTotal: finalAmount,
                source: entryMode === "OCR" ? "SCAN_IA" : "SAISIE_MANUELLE"
            })

            if (res.success) {
                toast.success("Facture répartie avec succès !")
                setIsInvoiceModalOpen(false)
                setScanResult(null)
            } else {
                toast.error(res.error || "Erreur lors de la répartition")
            }
        } catch (e) {
             toast.error("Une erreur est survenue")
        } finally {
             setIsScanning(false)
        }
    }

    const totalReparti = factures.reduce((acc, f) => acc + (f.montantCharge || 0), 0)

    return (
        <div className="space-y-6 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <div className="mb-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-flex items-center gap-2 shadow-sm">
                        <Zap size={12} /> Module Intelligence Factures
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3 mt-2">
                        <Calculator className="text-sky-600" size={32} /> CIE & SODECI
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Le moteur de répartition infaillible pour les Cours Communes et compteurs partagés.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setSimulatorActive(!simulatorActive)}
                        className={`${simulatorActive ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-white border text-slate-700 border-slate-200 hover:bg-slate-50'} px-5 py-2.5 rounded-[10px] font-bold text-[11px] uppercase tracking-widest transition-all shadow-sm flex items-center gap-2`}
                    >
                        {simulatorActive ? 'Fermer Simulateur' : <><ArrowRightLeft size={16} /> Mode Répartition</>}
                    </button>
                    <button 
                        onClick={() => setIsInvoiceModalOpen(true)}
                        className="bg-slate-900 text-white px-5 py-2.5 rounded-[10px] font-bold text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md flex items-center gap-2 active:scale-95"
                    >
                        <Plus size={16} /> Créer Nouvelle Facture
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <StatCard
                     title="Index CIE Relevés (Mois)"
                     value={`${properties.length * 2} compteurs`}
                     icon={<Zap />}
                 />
                 <StatCard
                     title="Index SODECI Relevés"
                     value={`${properties.length} compteurs`}
                     icon={<Droplets />}
                 />
                 <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-[16px] shadow-md flex items-center gap-4 relative overflow-hidden border border-slate-700">
                    <Calculator className="absolute -right-4 -bottom-4 text-white/5" size={100} />
                    <div className="bg-white/10 p-3.5 rounded-[12px] backdrop-blur-sm relative z-10 border border-white/10">
                        <CreditCard className="text-emerald-400" size={24} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1 shadow-sm">Total Réparti (En cours)</p>
                        <p className="text-2xl font-black text-white">{totalReparti.toLocaleString()} <span className="text-[13px] opacity-80 font-bold">FCFA</span></p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Table Area */}
                <div className="flex-1 space-y-6">
                    <SectionCard noPadding>
                        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-[14px] font-black text-slate-900 flex items-center gap-2">
                                <History size={18} className="text-sky-600"/> Historique des Répartitions
                            </h2>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input type="text" placeholder="Rechercher..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-[8px] text-[12px] font-bold focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all shadow-sm" />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[500px]">
                                <thead>
                                    <tr className="bg-white border-b border-slate-200">
                                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Type & Facture</th>
                                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Contrat</th>
                                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Montant</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {factures.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="p-8 text-center text-slate-500 font-bold text-[13px]">
                                                Aucune facture enregistrée pour cette période.
                                            </td>
                                        </tr>
                                    )}
                                    {factures.map((f, i) => (
                                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group cursor-pointer">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-[10px] border ${f.facture?.typeUtility === 'CIE' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-sky-50 text-sky-600 border-sky-200'}`}>
                                                        {f.facture?.typeUtility === 'CIE' ? <Zap size={14} /> : <Droplets size={14} />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[13px] text-slate-900 group-hover:text-sky-600 transition-colors">{f.id || 'N/A'}</p>
                                                        <p className="text-[10px] font-medium text-slate-500 mt-0.5">{new Date(f.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <p className="font-bold text-[13px] text-slate-700">{f.leaseId?.substring(0, 8)}...</p>
                                            </td>
                                            <td className="p-4 font-black text-[14px] text-slate-900">
                                                {f.montantCharge?.toLocaleString()} <span className="text-[10px] text-slate-400 opacity-80 font-bold">FCFA</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </SectionCard>
                </div>

                {/* Simulator Panel */}
                {simulatorActive && (
                    <div className="w-full lg:w-[400px] shrink-0 animate-in slide-in-from-right-8 duration-500">
                        <SectionCard title="Moteur de Répartition" icon={<Calculator className="text-sky-600" size={20} />}>
                            <div className="space-y-5 pt-2">
                                {/* Type Facture */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => setSimType("CIE")}
                                        className={`p-3 rounded-[10px] border flex flex-col items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest transition-all ${simType === "CIE" ? 'bg-amber-50 border-amber-200 text-amber-600 ring-1 ring-amber-500' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        <Zap size={20} /> CIE
                                    </button>
                                    <button 
                                        onClick={() => setSimType("SODECI")}
                                        className={`p-3 rounded-[10px] border flex flex-col items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest transition-all ${simType === "SODECI" ? 'bg-sky-50 border-sky-200 text-sky-600 ring-1 ring-sky-500' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        <Droplets size={20} /> SODECI
                                    </button>
                                </div>

                                {/* Cour Commune Select */}
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Cour Commune Ciblée</label>
                                    <select 
                                        value={simPropertyId}
                                        onChange={(e) => setSimPropertyId(e.target.value)}
                                        className="w-full p-3 bg-slate-50 rounded-[10px] border border-slate-200 text-[13px] font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 shadow-sm"
                                    >
                                        <option value="">Sélectionner une propriété...</option>
                                        {properties.map((p) => (
                                            <option key={p.id} value={p.id}>{p.name || p.propertyCode}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Montant Global */}
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Montant Global Reçu (FCFA)</label>
                                    <input 
                                        type="number" 
                                        value={simAmount || ''}
                                        onChange={(e) => setSimAmount(Number(e.target.value))}
                                        placeholder="Ex: 50000" 
                                        className="w-full p-4 bg-white border border-slate-200 rounded-[10px] text-lg font-black text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all shadow-sm"
                                    />
                                </div>

                                {/* Modèle */}
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Cadrage Algorithmique</label>
                                    <select 
                                        value={simMode}
                                        onChange={(e) => setSimMode(e.target.value)}
                                        className="w-full p-3 bg-slate-50 rounded-[10px] border border-slate-200 text-[13px] font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 shadow-sm"
                                    >
                                        <option value="PRORata">Prorata Nbre de Pièces</option>
                                        <option value="FORFAIT">Forfait Fixe Conventionné</option>
                                        <option value="INDEX">Selon Index Divisionnaire</option>
                                    </select>
                                </div>

                                <button 
                                    disabled={isSimulating || !simPropertyId || simAmount <= 0}
                                    onClick={async () => {
                                        setIsSimulating(true);
                                        try {
                                            const res = await registerAndDistributeUtility({
                                                leaseId: simPropertyId,
                                                typeUtility: simType,
                                                identifiantCompteur: "SIMULATEUR_" + simMode,
                                                moisFacture: new Date(),
                                                montantTotal: simAmount,
                                                source: "ALGORITHME_REPARTITION"
                                            });
                                            if (res.success) {
                                                toast.success("Intelligence Facture déclenchée avec succès. Répartition effectuée !");
                                                setSimulatorActive(false);
                                                setSimAmount(0);
                                                setSimPropertyId("");
                                            } else {
                                                toast.error(res.error || "Erreur lors de la répartition");
                                            }
                                        } catch (e) {
                                            toast.error("Une erreur technique s'est produite.");
                                        } finally {
                                            setIsSimulating(false);
                                        }
                                    }}
                                    className="w-full mt-4 bg-slate-900 text-white px-6 py-3.5 rounded-[10px] font-bold text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                                    {isSimulating ? "Calcul en cours..." : "Lancer la Répartition"} <ArrowRightLeft size={16} />
                                </button>
                            </div>
                        </SectionCard>
                    </div>
                )}
            </div>

            {isInvoiceModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[20px] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
                        
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 relative overflow-hidden">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-sky-500/10 rounded-full blur-2xl"></div>
                            <h2 className="text-[16px] font-black text-slate-900 uppercase tracking-tight flex items-center gap-3 relative z-10">
                                <div className="p-2 bg-sky-50 rounded-[10px] border border-sky-100"><Plus className="text-sky-600" size={20}/></div>
                                Nouvelle Opération B2B
                            </h2>
                            <button onClick={() => {setIsInvoiceModalOpen(false); setScanResult(null); setManualAmount("");}} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors relative z-10 shadow-sm">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
                            
                            {/* Toggle Entry Mode */}
                            <div className="flex bg-slate-100 rounded-[10px] p-1 border border-slate-200">
                                <button 
                                    onClick={() => setEntryMode("OCR")}
                                    className={`flex-1 py-2 text-[11px] font-bold rounded-[8px] flex items-center justify-center gap-2 transition-all uppercase tracking-widest ${entryMode === "OCR" ? "bg-white text-sky-600 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>
                                    <Scan size={14}/> Intelligence OCR
                                </button>
                                <button 
                                    onClick={() => setEntryMode("MANUAL")}
                                    className={`flex-1 py-2 text-[11px] font-bold rounded-[8px] flex items-center justify-center gap-2 transition-all uppercase tracking-widest ${entryMode === "MANUAL" ? "bg-white text-sky-600 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>
                                    <PenTool size={14}/> Saisie Manuelle
                                </button>
                            </div>

                            {entryMode === "OCR" ? (
                                <div className="bg-amber-50 border border-amber-200 p-4 rounded-[12px] flex gap-3 text-amber-700">
                                    <Zap className="shrink-0 mt-0.5" size={18}/>
                                    <div>
                                        <p className="font-bold text-[11px] uppercase tracking-widest text-amber-800">Saisie Automatique OCR</p>
                                        <p className="text-[12px] mt-1 font-medium opacity-90">Insérez la photo de votre facture CIE ou SODECI, l'IA extraira les chiffres pour éviter toute faute de frappe.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-sky-50 border border-sky-200 p-4 rounded-[12px] flex gap-3 text-sky-700">
                                    <PenTool className="shrink-0 mt-0.5" size={18}/>
                                    <div>
                                        <p className="font-bold text-[11px] uppercase tracking-widest text-sky-800">Mode Express</p>
                                        <p className="text-[12px] mt-1 font-medium opacity-90">Générez la répartition immédiatement en saisissant manuellement le total de la facture.</p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-5 pt-2">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Fournisseur d'État</label>
                                    <div className="flex gap-2">
                                        <button onClick={() => setUploadType('CIE')} className={`flex-1 py-3 border rounded-[10px] font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${uploadType === 'CIE' ? 'border-amber-500 bg-amber-50 text-amber-600 shadow-sm' : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'}`}><Zap size={14}/> CIE_CI</button>
                                        <button onClick={() => setUploadType('SODECI')} className={`flex-1 py-3 border rounded-[10px] font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${uploadType === 'SODECI' ? 'border-sky-500 bg-sky-50 text-sky-600 shadow-sm' : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'}`}><Droplets size={14}/> SODECI</button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Propriété Ciblée</label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                                        <select value={uploadPropertyId} onChange={(e) => setUploadPropertyId(e.target.value)} className="w-full p-3.5 pl-10 bg-white rounded-[10px] border border-slate-200 text-[13px] font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 shadow-sm">
                                            <option value="">Choisir une propriété...</option>
                                            {properties.map(p => <option key={p.id} value={p.id}>{p.name || p.propertyCode}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {entryMode === "OCR" ? (
                                    <>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Upload Reçu Officiel (PDF/JPG)</label>
                                            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                                            <div 
                                                onClick={() => !isScanning && fileInputRef.current?.click()}
                                                className={`border border-dashed border-slate-300 bg-slate-50 rounded-[12px] p-8 flex flex-col items-center justify-center gap-2 hover:bg-sky-50/50 hover:border-sky-300 transition-colors cursor-pointer group ${isScanning ? 'opacity-50 pointer-events-none' : ''}`}>
                                                 {isScanning ? (
                                                    <Loader2 size={24} className="text-sky-600 animate-spin" />
                                                 ) : (
                                                    <Upload size={24} className="text-slate-400 group-hover:text-sky-600 transition-colors" />
                                                 )}
                                                 <p className="text-[12px] font-bold text-slate-600 group-hover:text-sky-600 transition-colors">
                                                    {isScanning ? "Analyse Tesseract en cours..." : "Glissez votre reçu ou parcourez..."}
                                                 </p>
                                            </div>
                                        </div>

                                        {scanResult && (
                                            <div className="bg-emerald-50 p-4 rounded-[12px] border border-emerald-200">
                                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-1"><CheckCircle2 size={12}/> Lecture OCR Complète (Confiance: {scanResult.confidence})</p>
                                                <p className="text-2xl font-black text-emerald-700">{scanResult.montant.toLocaleString()} <span className="text-[12px] opacity-80">FCFA</span></p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Montant Facturé (FCFA)</label>
                                        <input 
                                            type="number" 
                                            value={manualAmount}
                                            onChange={(e) => setManualAmount(Number(e.target.value))}
                                            placeholder="Ex: 27500"
                                            className="w-full p-4 bg-white rounded-[10px] border border-slate-200 text-xl font-black text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500 shadow-sm"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-5 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0">
                            <button onClick={() => setIsInvoiceModalOpen(false)} className="px-5 py-2.5 rounded-[8px] font-bold text-[11px] uppercase tracking-widest text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors">Annuler</button>
                            <button 
                                onClick={handleValidation}
                                disabled={isScanning || (entryMode === "OCR" && !scanResult) || (entryMode === "MANUAL" && (!manualAmount || manualAmount <= 0))}
                                className="bg-slate-900 text-white px-6 py-2.5 rounded-[8px] font-bold text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-md active:scale-95 flex items-center gap-2 disabled:opacity-50">
                                Valider & Extraire <Calculator size={14}/>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
