"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Send } from "lucide-react"

export default function DeclareIncidentForm({ leaseId, propertyId }: { leaseId: string, propertyId: string }) {
    const router = useRouter()
    
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [category, setCategory] = useState("PLOMBERIE")
    const [priority, setPriority] = useState("MOYENNE")
    const [file, setFile] = useState<File | null>(null)
    
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        
        try {
            const formData = new FormData()
            formData.append("title", title)
            formData.append("description", description)
            formData.append("category", category)
            formData.append("priority", priority)
            formData.append("leaseId", leaseId)
            formData.append("propertyId", propertyId)
            if (file) {
                formData.append("file", file)
            }

            const res = await fetch("/api/v1/tenant/maintenance", {
                method: "POST",
                body: formData
            })

            const data = await res.json()
            if (!data.success) throw new Error(data.error)

            setSuccess(true)
            setTitle("")
            setDescription("")
            setFile(null)
            
            setTimeout(() => {
                setSuccess(false)
                router.refresh()
            }, 3000)

        } catch (err: any) {
            setError(err.message || "Erreur lors de la soumission du ticket.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-qgrey-2 shadow-[0_12px_40px_rgba(13,43,110,0.06)]">
            <h2 className="text-xl font-black text-qnavy-dark mb-6 flex items-center uppercase tracking-widest border-b border-qgrey-2 pb-4 pt-2">
                Nouveau Ticket
            </h2>

            {success ? (
                <div className="bg-qgreen-pale p-8 rounded-2xl text-center border border-qgreen/20 animate-in zoom-in-95">
                    <div className="w-16 h-16 bg-qgreen text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                        ✓
                    </div>
                    <h3 className="text-lg font-black text-qgreen-dark uppercase tracking-widest">Ticket Envoyé !</h3>
                    <p className="text-sm font-medium text-qgreen mt-2">Votre propriétaire/agence a été notifié et le traitement est en cours.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-black text-qtext-light uppercase tracking-widest mb-2">
                            Catégorie de l'incident
                        </label>
                        <select 
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            className="w-full p-4 bg-background border border-qgrey-2 rounded-xl text-sm font-bold text-qnavy-dark focus:outline-none focus:border-qnavy transition-all"
                        >
                            <option value="PLOMBERIE">Plomberie (Fuite, canalisation...)</option>
                            <option value="ELECTRICITE">Électricité (Coupure, prise défectueuse...)</option>
                            <option value="SERRURERIE">Serrurerie (Porte bloquée, clé...)</option>
                            <option value="CLIMATISATION">Climatisation / Chauffage</option>
                            <option value="STRUCTURE">Structure (Mur, plafond, infiltration...)</option>
                            <option value="AUTRE">Autre</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-qtext-light uppercase tracking-widest mb-2">
                            Urgence
                        </label>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setPriority("FAIBLE")} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${priority === 'FAIBLE' ? 'bg-qgrey-1 text-qtext-dark border-2 border-qgrey-2' : 'border border-qgrey-2 text-qtext-light'}`}>Faible</button>
                            <button type="button" onClick={() => setPriority("MOYENNE")} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${priority === 'MOYENNE' ? 'bg-qorange-pale text-qorange border-2 border-qorange/50' : 'border border-qgrey-2 text-qtext-light'}`}>Moyenne</button>
                            <button type="button" onClick={() => setPriority("CRITIQUE")} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${priority === 'CRITIQUE' ? 'bg-qred-pale text-qred border-2 border-qred/50' : 'border border-qgrey-2 text-qtext-light'}`}>Critique</button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-qtext-light uppercase tracking-widest mb-2">
                            Titre bref
                        </label>
                        <input 
                            required
                            type="text" 
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Ex: Fuite d'eau sous le lavabo"
                            className="w-full p-4 bg-background border border-qgrey-2 rounded-xl text-sm font-bold text-qnavy-dark focus:outline-none focus:border-qnavy transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-qtext-light uppercase tracking-widest mb-2">
                            Description Détaillée
                        </label>
                        <textarea 
                            required
                            rows={4}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Précisez la situation pour aider à l'intervention..."
                            className="w-full p-4 bg-background border border-qgrey-2 rounded-xl text-sm font-bold text-qnavy-dark focus:outline-none focus:border-qnavy transition-all resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-qtext-light uppercase tracking-widest mb-2">
                            Preuve Visuelle (Optionnel)
                        </label>
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={e => setFile(e.target.files?.[0] || null)}
                            className="w-full text-sm text-qtext-light file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-qnavy-pale file:text-qnavy hover:file:bg-qnavy-pale/80"
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-qred-pale text-xs font-bold text-qred rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-qnavy hover:bg-qnavy-dark text-white font-black uppercase text-xs tracking-widest py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        Envoyer ma déclaration
                    </button>
                </form>
            )}
        </div>
    )
}
