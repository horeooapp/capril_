"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function UploadPreuvePaiement({ leaseId }: { leaseId: string }) {
    const [file, setFile] = useState<File | null>(null)
    const [isScanning, setIsScanning] = useState(false)
    const [result, setResult] = useState<{ amount: number, dueDate: string } | null>(null)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) return setError("Veuillez choisir un fichier.")
        
        setIsScanning(true)
        setError(null)
        
        const formData = new FormData()
        formData.append("file", file)
        formData.append("leaseId", leaseId)

        try {
            const res = await fetch("/api/v1/tenant/ocr-payment", {
                method: "POST",
                body: formData
            })
            
            const data = await res.json()
            if (!data.success) throw new Error(data.error)

            setResult(data.data)
            router.refresh()
        } catch (err: any) {
            setError(err.message || "Impossible d'analyser la preuve de paiement.")
        } finally {
            setIsScanning(false)
        }
    }

    return (
        <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-slate-200/80 shadow-[0_12px_40px_rgba(13,43,110,0.06)] mt-8">
            <div className="flex items-start gap-4 pb-5 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-sm">
                    <span className="text-xl">📸</span>
                </div>
                <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                        Transmettre un Reçu ou une Preuve de Paiement
                    </h2>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                        Vous avez payé par virement, en agence ou par bordereau bancaire ? Prenez-le en photo ou joignez le PDF pour mise à jour immédiate de votre quittance.
                    </p>
                </div>
            </div>

            {!result ? (
                <form onSubmit={handleUpload} className="space-y-6 pt-6">
                    <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/20 p-8 rounded-2xl text-center group transition-all relative cursor-pointer">
                        <input 
                            type="file" 
                            accept="image/*,.pdf" 
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-200 group-hover:scale-105 transition-transform text-2xl">
                                🧾
                            </div>
                            {file ? (
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-900">{file.name}</p>
                                    <p className="text-[11px] font-semibold text-emerald-600">✓ Document sélectionné (prêt pour analyse)</p>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                        Cliquez ou déposez votre reçu / bordereau
                                    </p>
                                    <p className="text-[11px] text-slate-400 font-medium mt-1">
                                        Formats acceptés : Photos (JPG, PNG) ou Document PDF
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center gap-3">
                        <span className="text-base text-blue-600">ℹ️</span>
                        <p className="text-xs text-blue-800 font-medium">
                            Notre système extrait automatiquement le montant et la date de paiement pour les soumettre au bailleur.
                        </p>
                    </div>

                    {error && (
                        <p className="text-xs font-bold text-rose-600 bg-rose-50 p-3.5 rounded-xl border border-rose-200">
                            {error}
                        </p>
                    )}

                    <button 
                        type="submit" 
                        disabled={isScanning || !file}
                        className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed group flex items-center justify-center gap-3 cursor-pointer active:scale-[0.98]"
                    >
                        {isScanning ? (
                            <>
                                <span className="animate-spin text-lg">⏳</span>
                                Analyse automatique en cours...
                            </>
                        ) : (
                            "Envoyer pour validation et quittance"
                        )}
                    </button>
                </form>
            ) : (
                <div className="p-6 sm:p-8 bg-emerald-50/70 border-2 border-emerald-200/80 rounded-2xl text-center space-y-4 animate-in zoom-in-95 duration-500 mt-6">
                    <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center text-2xl mx-auto shadow-lg shadow-emerald-600/30">
                        ✓
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-emerald-950">
                            Preuve Reçue avec Succès !
                        </h3>
                        <p className="text-xs text-emerald-700 font-medium mt-1">
                            Votre justificatif est transmis à votre bailleur pour validation de quittance.
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm inline-block min-w-[200px]">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Montant détecté</p>
                        <p className="text-2xl font-black text-slate-900 mt-0.5">
                            {result.amount?.toLocaleString() || "N/A"} <span className="text-sm font-bold text-emerald-600">XOF</span>
                        </p>
                    </div>

                    <div className="pt-2">
                        <button 
                            type="button"
                            onClick={() => { setResult(null); setFile(null); }}
                            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline underline-offset-4"
                        >
                            Numériser une autre preuve
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
