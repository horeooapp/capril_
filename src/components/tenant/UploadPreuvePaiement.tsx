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
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-qgrey-2 shadow-[0_12px_40px_rgba(13,43,110,0.06)] mt-8">
            <h2 className="text-xl font-black text-qnavy-dark mb-2 flex items-center uppercase tracking-widest border-b border-qgrey-2 pb-4">
                <span className="mr-3 text-qorange">📷</span> Uploader une Preuve de Paiement
            </h2>
            <p className="text-sm font-bold text-qtext-mid mb-6">Avez-vous effectué un virement bancaire ou un dépôt en espèces ? Numérisez le bordereau. M-PAYMENTS extraira le montant pour validation par votre bailleur.</p>

            {!result ? (
                <form onSubmit={handleUpload} className="space-y-6">
                    <div className="border-2 border-dashed border-qgrey-2 bg-background p-8 rounded-2xl text-center group hover:border-qnavy transition-colors relative cursor-pointer">
                        <input 
                            type="file" 
                            accept="image/*,.pdf" 
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center gap-3">
                            <span className="text-3xl grayscale group-hover:grayscale-0 transition-all opacity-50 group-hover:opacity-100">🧾</span>
                            {file ? (
                                <p className="text-sm font-black text-qnavy-dark">{file.name}</p>
                            ) : (
                                <div>
                                    <p className="text-xs font-black text-qtext-mid uppercase tracking-widest">Cliquez ou déposez un reçu</p>
                                    <p className="text-[10px] text-qtext-light mt-1">Accepté : PNG, JPG, PDF</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {error && <p className="text-[11px] font-black uppercase tracking-widest text-qred bg-qred-pale p-3 rounded-xl border border-qred/20">{error}</p>}

                    <button 
                        type="submit" 
                        disabled={isScanning || !file}
                        className="w-full py-4 bg-qnavy hover:bg-qnavy-light text-white font-black rounded-xl uppercase tracking-widest shadow-[0_8px_16px_rgba(13,43,110,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-3"
                    >
                        {isScanning ? (
                            <>
                                <span className="animate-spin text-xl">⚙️</span>
                                ANALYSE IA EN COURS...
                            </>
                        ) : (
                            "SOUMETTRE POUR VALIDATION"
                        )}
                    </button>
                </form>
            ) : (
                <div className="p-6 bg-qgreen-pale border-2 border-qgreen/20 rounded-2xl text-center space-y-4 animate-in zoom-in-95 duration-500">
                    <div className="w-16 h-16 bg-qgreen text-white rounded-full flex items-center justify-center text-2xl mx-auto shadow-lg shadow-qgreen/30">
                        ✓
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-qgreen-dark uppercase tracking-widest">Preuve Détectée avec Succès</h3>
                        <p className="text-xs text-qgreen font-medium mt-1">Soumise pour validation au bailleur</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-qgreen/10 mt-4">
                        <p className="text-[10px] font-black text-qtext-light uppercase tracking-widest">Montant Extrait (O.C.R)</p>
                        <p className="text-2xl font-black text-qnavy-dark mt-1">{result.amount?.toLocaleString() || "N/A"} <span className="text-sm">FCFA</span></p>
                    </div>
                    
                    <button 
                        onClick={() => { setResult(null); setFile(null); }}
                        className="mt-6 text-xs font-black text-qtext-mid hover:text-qnavy underline decoration-qgrey-2 underline-offset-4"
                    >
                        Numériser une autre preuve
                    </button>
                </div>
            )}
        </div>
    )
}
