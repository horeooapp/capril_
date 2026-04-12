"use client"

import React, { useState, useRef } from "react"
import { Calculator, Plus, Zap, Droplets, ArrowRightLeft, Search, CheckCircle2, History, CreditCard, X, Building, Upload, AlertCircle, Loader2, Scan, PenTool } from "lucide-react"
import { toast } from "sonner"
import { scanUtilityBillOCR, registerAndDistributeUtility } from "@/actions/utility-actions"
import { UtilityType } from "@prisma/client"

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
                  <div className="bg-white p-6 rounded-[2rem] border border-qgrey-2 shadow-sm flex items-center gap-4">
                    <div className="bg-qblue-pale p-4 rounded-2xl">
                        <Zap className="text-qblue" size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-qtext-light uppercase tracking-widest mb-1">Index CIE Relevés (Mois)</p>
                        <p className="text-2xl font-black text-qnavy-dark">{properties.length * 2} <span className="text-sm font-bold text-qtext-mid">compteurs</span></p>
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-[2rem] border border-qgrey-2 shadow-sm flex items-center gap-4">
                    <div className="bg-qblue-pale p-4 rounded-2xl">
                        <Droplets className="text-qblue" size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-qtext-light uppercase tracking-widest mb-1">Index SODECI Relevés</p>
                        <p className="text-2xl font-black text-qnavy-dark">{properties.length} <span className="text-sm font-bold text-qtext-mid">compteurs</span></p>
                    </div>
                </div>
                 <div className="bg-[linear-gradient(135deg,#0D2B6E_0%,#111827_100%)] p-6 rounded-[2rem] shadow-lg flex items-center gap-4 relative overflow-hidden">
                    <Calculator className="absolute -right-4 -bottom-4 text-white opacity-5" size={100} />
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm relative z-10 border border-white/10">
                        <CreditCard className="text-qgreen" size={24} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-qblue-pale uppercase tracking-widest mb-1 shadow-sm">Total Réparti (En cours)</p>
                        <p className="text-3xl font-black text-white">{totalReparti.toLocaleString()} <span className="text-sm opacity-80">FCFA</span></p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Table Area */}
                <div className="flex-1 space-y-6">
                    <div className="bg-white rounded-[2rem] border border-qgrey-2 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-qgrey-2 flex justify-between items-center bg-qgrey-1/30">
                            <h2 className="text-sm font-black text-qnavy-dark flex items-center gap-2">
                                <History size={18} className="text-qblue"/> Historique des Répartitions
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
                                    <th className="p-4 font-black text-[9px] uppercase tracking-widest text-qtext-light">Contrat</th>
                                    <th className="p-4 font-black text-[9px] uppercase tracking-widest text-qtext-light">Montant</th>
                                </tr>
                            </thead>
                            <tbody>
                                {factures.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="p-8 text-center text-gray-500 font-bold text-sm">
                                            Aucune facture enregistrée pour cette période.
                                        </td>
                                    </tr>
                                )}
                                {factures.map((f, i) => (
                                    <tr key={i} className="border-b border-qgrey-2 hover:bg-qgrey-1/50 transition-colors group cursor-pointer">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-xl border ${f.facture?.typeUtility === 'CIE' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                                                    {f.facture?.typeUtility === 'CIE' ? <Zap size={14} /> : <Droplets size={14} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-xs text-qnavy-dark group-hover:text-qblue transition-colors">{f.id || 'N/A'}</p>
                                                    <p className="text-[9px] font-medium text-qtext-light mt-0.5">{new Date(f.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-bold text-xs text-qnavy">{f.leaseId?.substring(0, 8)}...</p>
                                        </td>
                                        <td className="p-4 font-black text-sm text-qnavy-dark">
                                            {f.montantCharge?.toLocaleString()} <span className="text-[10px] text-qtext-light opacity-60">FCFA</span>
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
                                    <select 
                                        value={simPropertyId}
                                        onChange={(e) => setSimPropertyId(e.target.value)}
                                        className="w-full p-3 bg-qgrey-1 rounded-xl border border-qgrey-2 text-xs font-bold text-qnavy focus:outline-none focus:ring-1 focus:ring-qblue"
                                    >
                                        <option value="">Sélectionner une propriété...</option>
                                        {properties.map((p) => (
                                            <option key={p.id} value={p.id}>{p.name || p.propertyCode}</option>
                                        ))}
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
                                    className="w-full mt-4 bg-qnavy text-white px-6 py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-qnavy-dark transition-all shadow-lg shadow-qnavy/30 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                                    {isSimulating ? "Calcul en cours..." : "Lancer la Répartition"} <ArrowRightLeft size={16} />
                                </button>
                                
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {isInvoiceModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-qnavy-dark/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-[0_32px_96px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
                        
                        <div className="p-6 border-b border-qgrey-2 flex justify-between items-center bg-qgrey-1/50 relative overflow-hidden">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-qblue/10 rounded-full blur-2xl"></div>
                            <h2 className="text-xl font-black text-qnavy-dark uppercase tracking-tight flex items-center gap-3 relative z-10">
                                <div className="p-2 bg-qblue/10 rounded-xl"><Plus className="text-qblue" size={24}/></div>
                                Nouvelle Opération B2B
                            </h2>
                            <button onClick={() => {setIsInvoiceModalOpen(false); setScanResult(null); setManualAmount("");}} className="w-10 h-10 rounded-full bg-white border border-qgrey-2 flex items-center justify-center text-qnavy hover:bg-qgrey-1 transition-colors relative z-10">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-5">
                            
                            {/* Toggle Entry Mode */}
                            <div className="flex bg-qgrey-1 rounded-xl p-1 border border-qgrey-2">
                                <button 
                                    onClick={() => setEntryMode("OCR")}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${entryMode === "OCR" ? "bg-white text-qblue shadow-sm" : "text-qtext-mid hover:text-qnavy"}`}>
                                    <Scan size={14}/> Intelligence OCR
                                </button>
                                <button 
                                    onClick={() => setEntryMode("MANUAL")}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${entryMode === "MANUAL" ? "bg-white text-qblue shadow-sm" : "text-qtext-mid hover:text-qnavy"}`}>
                                    <PenTool size={14}/> Saisie Manuelle
                                </button>
                            </div>

                            {entryMode === "OCR" ? (
                                <div className="bg-qorange-pale border border-qorange/20 p-4 rounded-xl flex gap-3 text-qorange">
                                    <Zap className="shrink-0" size={20}/>
                                    <div>
                                        <p className="font-bold text-xs uppercase tracking-widest">Saisie Automatique OCR</p>
                                        <p className="text-xs mt-1">Insérez la photo de votre facture CIE ou SODECI, l'IA extraira les chiffres pour éviter toute faute de frappe.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex gap-3 text-blue-600">
                                    <PenTool className="shrink-0" size={20}/>
                                    <div>
                                        <p className="font-bold text-xs uppercase tracking-widest">Mode Express</p>
                                        <p className="text-xs mt-1">Générez la répartition immédiatement en saisissant manuellement le total de la facture.</p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4 pt-2">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-qtext-light mb-2 block">Fournisseur d'État</label>
                                    <div className="flex gap-2">
                                        <button onClick={() => setUploadType('CIE')} className={`flex-1 py-3 border-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 ${uploadType === 'CIE' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-qgrey-2 bg-qgrey-1 text-qtext-mid hover:bg-qgrey-2'}`}><Zap size={16}/> CIE_CI</button>
                                        <button onClick={() => setUploadType('SODECI')} className={`flex-1 py-3 border-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 ${uploadType === 'SODECI' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-qgrey-2 bg-qgrey-1 text-qtext-mid hover:bg-qgrey-2'}`}><Droplets size={16}/> SODECI</button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-qtext-light mb-2 block">Propriété Ciblée</label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-qtext-light" size={16}/>
                                        <select value={uploadPropertyId} onChange={(e) => setUploadPropertyId(e.target.value)} className="w-full p-4 pl-10 bg-white rounded-xl border border-qgrey-2 text-sm font-bold text-qnavy focus:outline-none focus:ring-2 focus:ring-qblue">
                                            <option value="">Choisir une propriété...</option>
                                            {properties.map(p => <option key={p.id} value={p.id}>{p.name || p.propertyCode}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {entryMode === "OCR" ? (
                                    <>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-qtext-light mb-2 block">Upload Reçu Officiel (PDF/JPG)</label>
                                            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                                            <div 
                                                onClick={() => !isScanning && fileInputRef.current?.click()}
                                                className={`border-2 border-dashed border-qgrey-2 rounded-xl p-8 flex flex-col items-center justify-center gap-2 hover:bg-qblue-pale hover:border-qblue transition-colors cursor-pointer group ${isScanning ? 'opacity-50 pointer-events-none' : ''}`}>
                                                 {isScanning ? (
                                                    <Loader2 size={24} className="text-qblue animate-spin" />
                                                 ) : (
                                                    <Upload size={24} className="text-qtext-light group-hover:text-qblue transition-colors" />
                                                 )}
                                                 <p className="text-xs font-bold text-qnavy group-hover:text-qblue transition-colors">
                                                    {isScanning ? "Analyse Tesseract en cours..." : "Glissez votre reçu ou parcourez..."}
                                                 </p>
                                            </div>
                                        </div>

                                        {scanResult && (
                                            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                                                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1 flex items-center gap-1"><CheckCircle2 size={12}/> Lecture OCR Complète (Confiance: {scanResult.confidence})</p>
                                                <p className="text-2xl font-black text-green-700">{scanResult.montant.toLocaleString()} <span className="text-sm">FCFA</span></p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-qtext-light mb-2 block">Montant Facturé (FCFA)</label>
                                        <input 
                                            type="number" 
                                            value={manualAmount}
                                            onChange={(e) => setManualAmount(Number(e.target.value))}
                                            placeholder="Ex: 27500"
                                            className="w-full p-4 bg-white rounded-xl border border-qgrey-2 text-xl font-black text-qnavy focus:outline-none focus:ring-2 focus:ring-qblue"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-qgrey-2 bg-qgrey-1/30 flex justify-end gap-3 shrink-0">
                            <button onClick={() => setIsInvoiceModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-qnavy hover:bg-qgrey-2 transition-colors">Annuler</button>
                            <button 
                                onClick={handleValidation}
                                disabled={isScanning || (entryMode === "OCR" && !scanResult) || (entryMode === "MANUAL" && (!manualAmount || manualAmount <= 0))}
                                className="bg-qnavy text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qnavy-dark transition-colors shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-50">
                                Valider & Extraire <Calculator size={14}/>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
