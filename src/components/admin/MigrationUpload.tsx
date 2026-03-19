"use client"

import { useState } from "react"
import { Upload, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { createMigrationSession, stageMigrationRow, validateMigrationSession } from "@/actions/migration"

export default function MigrationUpload() {
    const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle")
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setStatus("uploading")
        setError(null)

        try {
            // 1. Créer la session
            const sessionRes = await createMigrationSession("system-admin", file.name, "CSV")
            if (!sessionRes.success || !sessionRes.sessionId) {
                throw new Error(sessionRes.error || "Impossible de créer la session")
            }

            const sessionId = sessionRes.sessionId

            // 2. Lire le fichier (simulation simple CSV pour la démo/prod initiale)
            const text = await file.text()
            const lines = text.split("\n").filter(l => l.trim().length > 0)
            const headers = lines[0].split(",").map(h => h.trim())
            const rows = lines.slice(1)

            setStatus("processing")
            
            // 3. Charger en Staging (Staging iterate)
            for (let i = 0; i < rows.length; i++) {
                const values = rows[i].split(",").map(v => v.trim())
                const rawData: any = {}
                headers.forEach((h, index) => {
                    rawData[h] = values[index] || ""
                })

                // Déterminer le type d'entité (Simple détection par en-tête ou défaut)
                let type = "LOGEMENT"
                if (headers.some(h => h.toLowerCase().includes("locataire"))) type = "LOCATAIRE"

                await stageMigrationRow(sessionId, "system-admin", type, rawData)
                setProgress(Math.round(((i + 1) / rows.length) * 100))
            }

            // 4. Valider la session
            await validateMigrationSession(sessionId)

            setStatus("success")
        } catch (err: any) {
            console.error(err)
            setError(err.message || "Une erreur est survenue lors de l'importation.")
            setStatus("error")
        }
    }

    return (
        <div className="flex flex-col items-center">
            {status === "idle" && (
                <label className="group cursor-pointer">
                    <div className="px-8 py-4 bg-[#C55A11] text-white font-black rounded-2xl shadow-xl shadow-[#C55A11]/20 group-hover:scale-105 active:scale-95 transition-all flex items-center gap-3 uppercase tracking-widest text-sm">
                        <Upload size={20} />
                        Nouvel Import
                    </div>
                    <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
                </label>
            )}

            {(status === "uploading" || status === "processing") && (
                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-3 text-[#1F4E79] font-black uppercase tracking-widest text-sm animate-pulse">
                        <Loader2 className="animate-spin" size={20} />
                        {status === "uploading" ? "Téléchargement..." : `Traitement (${progress}%)`}
                    </div>
                    <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-[#C55A11] transition-all duration-300" 
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {status === "success" && (
                <div className="flex items-center gap-3 text-emerald-600 font-black uppercase tracking-widest text-sm bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100">
                    <CheckCircle2 size={20} />
                    Importation Terminée
                    <button 
                        onClick={() => { setStatus("idle"); setProgress(0); }}
                        className="ml-4 text-[10px] text-emerald-800 hover:underline"
                    >
                        Nouveau
                    </button>
                </div>
            )}

            {status === "error" && (
                <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-3 text-red-600 font-black uppercase tracking-widest text-sm bg-red-50 px-6 py-3 rounded-2xl border border-red-100">
                        <AlertCircle size={20} />
                        Échec de l&apos;import
                    </div>
                    <p className="text-[10px] text-red-500 font-bold">{error}</p>
                    <button 
                        onClick={() => setStatus("idle")}
                        className="text-[10px] text-gray-400 hover:text-gray-600 uppercase tracking-widest font-black underline"
                    >
                        Réessayer
                    </button>
                </div>
            )}
        </div>
    )
}
