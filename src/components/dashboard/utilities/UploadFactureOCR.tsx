"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { createManualUtilityBill } from "@/actions/utility-actions"

export default function UploadFactureOCR({ leaseId }: { leaseId: string }) {
    const [file, setFile] = useState<File | null>(null)
    const [type, setType] = useState<"CIE" | "SODECI" | null>(null)
    const [isScanning, setIsScanning] = useState(false)
    const [result, setResult] = useState<{ amount: number, dueDate: string, fractureId: string } | null>(null)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    
    // Nouveaux états pour la saisie manuelle
    const [activeMode, setActiveMode] = useState<"OCR" | "MANUAL">("OCR")
    const [manualAmount, setManualAmount] = useState("")
    const [manualDate, setManualDate] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file || !type) return setError("Veuillez choisir un fichier et un fournisseur.")
        
        setIsScanning(true)
        setError(null)
        
        const formData = new FormData()
        formData.append("file", file)
        formData.append("typeUtility", type)
        formData.append("leaseId", leaseId)

        try {
            const res = await fetch("/api/v1/utilities/ocr", {
                method: "POST",
                body: formData
            })
            
            const data = await res.json()
            if (!data.success) throw new Error(data.error)

            setResult(data.data)
            router.refresh()
        } catch (err: any) {
            setError(err.message || "Impossible d'analyser la facture.")
        } finally {
            setIsScanning(false)
        }
    }

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!type || !manualAmount || !manualDate) return setError("Veuillez remplir tous les champs.")

        setIsSubmitting(true)
        setError(null)

        try {
            const res = await createManualUtilityBill({
                leaseId,
                typeUtility: type,
                montantTotal: parseFloat(manualAmount),
                dateLimitePaiement: new Date(manualDate),
            })

            if (res.error) throw new Error(res.error)

            setResult({
                amount: parseFloat(manualAmount),
                dueDate: new Date(manualDate).toISOString(),
                fractureId: res.fractureId!
            })
            router.refresh()
        } catch (err: any) {
            setError(err.message || "Erreur lors de la création manuelle.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-qgrey-2 shadow-[0_12px_40px_rgba(13,43,110,0.06)]">
            <h2 className="text-xl font-black text-qnavy-dark mb-2 flex items-center uppercase tracking-widest border-b border-qgrey-2 pb-4">
                <span className="mr-3 text-qorange">📱</span> Scanner de Facture OCR
            </h2>
            <p className="text-sm font-bold text-qtext-mid mb-6">Numérisez une facture <span className="text-qorange">CIE</span> ou <span className="text-blue-500">SODECI</span>. M-UTILITIES va extraire les montants ou utilisez la saisie rapide.</p>
            
            <div className="flex bg-qgrey-1 p-1 rounded-xl mb-6">
                <button 
                    onClick={() => setActiveMode("OCR")}
                    className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeMode === "OCR" ? "bg-white shadow-sm text-qnavy-dark" : "text-qtext-mid"}`}
                >
                    🔍 Scan OCR
                </button>
                <button 
                    onClick={() => setActiveMode("MANUAL")}
                    className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeMode === "MANUAL" ? "bg-white shadow-sm text-qnavy-dark" : "text-qtext-mid"}`}
                >
                    ✍️ Saisie Rapide
                </button>
            </div>

            {!result ? (
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <button 
                            type="button"
                            onClick={() => setType("CIE")}
                            className={`flex-1 p-4 rounded-2xl border-2 font-black uppercase tracking-widest transition-all ${type === "CIE" ? "border-qorange bg-qorange-pale text-qorange shadow-[0_4px_16px_rgba(255,130,0,0.2)]" : "border-qgrey-2 text-qtext-light hover:border-qorange/50"}`}
                        >
                            ⚡ CIE
                        </button>
                        <button 
                            type="button"
                            onClick={() => setType("SODECI")}
                            className={`flex-1 p-4 rounded-2xl border-2 font-black uppercase tracking-widest transition-all ${type === "SODECI" ? "border-blue-500 bg-blue-50 text-blue-600 shadow-[0_4px_16px_rgba(59,130,246,0.2)]" : "border-qgrey-2 text-qtext-light hover:border-blue-400/50"}`}
                        >
                            💧 SODECI
                        </button>
                    </div>

                    {activeMode === "OCR" ? (
                        <form onSubmit={handleUpload} className="space-y-6">
                            <div className="border-2 border-dashed border-qgrey-2 bg-background p-8 rounded-2xl text-center group hover:border-qnavy transition-colors relative cursor-pointer">
                                <input 
                                    type="file" 
                                    accept="image/*,.pdf" 
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="flex flex-col items-center gap-3">
                                    <span className="text-3xl grayscale group-hover:grayscale-0 transition-all opacity-50 group-hover:opacity-100">📄</span>
                                    {file ? (
                                        <p className="text-sm font-black text-qnavy-dark">{file.name}</p>
                                    ) : (
                                        <div>
                                            <p className="text-xs font-black text-qtext-mid uppercase tracking-widest">Cliquez ou déposez un reçu</p>
                                            <p className="text-[10px] text-qtext-light mt-1">Photo nette ou PDF original privilégié</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {error && <p className="text-[11px] font-black uppercase tracking-widest text-qred bg-qred-pale p-3 rounded-xl border border-qred/20">{error}</p>}

                            <button 
                                type="submit" 
                                disabled={isScanning || !file || !type}
                                className="w-full py-4 bg-qnavy hover:bg-qnavy-light text-white font-black rounded-xl uppercase tracking-widest shadow-[0_8px_16px_rgba(13,43,110,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-3"
                            >
                                {isScanning ? (
                                    <>
                                        <span className="animate-spin text-xl">⚙️</span>
                                        ANALYSE IA EN COURS...
                                    </>
                                ) : (
                                    "LANCER LA DÉTECTION"
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleManualSubmit} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-qtext-mid">Montant Total (FCFA)</label>
                                <input 
                                    type="number" 
                                    value={manualAmount}
                                    onChange={(e) => setManualAmount(e.target.value)}
                                    placeholder="Ex: 25000"
                                    required
                                    className="w-full mt-1 p-4 rounded-xl border border-qgrey-2 bg-background focus:border-qnavy focus:ring-1 focus:ring-qnavy transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-qtext-mid">Date Limite de Paiement</label>
                                <input 
                                    type="date" 
                                    value={manualDate}
                                    onChange={(e) => setManualDate(e.target.value)}
                                    required
                                    className="w-full mt-1 p-4 rounded-xl border border-qgrey-2 bg-background focus:border-qnavy focus:ring-1 focus:ring-qnavy transition-all"
                                />
                            </div>
                            
                            {error && <p className="text-[11px] font-black uppercase tracking-widest text-qred bg-qred-pale p-3 rounded-xl border border-qred/20">{error}</p>}

                            <button 
                                type="submit" 
                                disabled={isSubmitting || !manualAmount || !manualDate || !type}
                                className="w-full py-4 bg-qgreen hover:bg-qgreen-dark text-white font-black rounded-xl uppercase tracking-widest shadow-[0_8px_16px_rgba(39,174,96,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-3 mt-4!"
                            >
                                {isSubmitting ? "ENREGISTREMENT..." : "VALIDER LA FACTURE"}
                            </button>
                        </form>
                    )}
                </div>
            ) : (
                <div className="p-6 bg-qgreen-pale border-2 border-qgreen/20 rounded-2xl text-center space-y-4 animate-in zoom-in-95 duration-500">
                    <div className="w-16 h-16 bg-qgreen text-white rounded-full flex items-center justify-center text-2xl mx-auto shadow-lg shadow-qgreen/30">
                        ✓
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-qgreen-dark uppercase tracking-widest">Facture {type} Détectée</h3>
                        <p className="text-xs text-qgreen font-medium mt-1">Les données ont été extraites avec succès (Fiabilité 95%+)</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-white p-4 rounded-xl border border-qgreen/10">
                            <p className="text-[10px] font-black text-qtext-light uppercase tracking-widest">Montant Exigé</p>
                            <p className="text-2xl font-black text-qnavy-dark mt-1">{result.amount.toLocaleString()} <span className="text-sm">FCFA</span></p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-qgreen/10">
                            <p className="text-[10px] font-black text-qtext-light uppercase tracking-widest">Limite de Paiement</p>
                            <p className="text-lg font-black text-qred mt-2">{new Date(result.dueDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <p className="text-[10px] text-qnavy mt-4 font-bold bg-white/50 py-2 px-4 rounded-lg">M-UTILITIES relancera le locataire automatiquement à la date convenue (J-10 puis tous les 3 jours).</p>
                    
                    <button 
                        onClick={() => { setResult(null); setFile(null); setType(null); }}
                        className="mt-6 text-xs font-black text-qtext-mid hover:text-qnavy underline decoration-qgrey-2 underline-offset-4"
                    >
                        Numériser une autre facture
                    </button>
                </div>
            )}
        </div>
    )
}
