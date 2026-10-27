"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Send, Camera, AlertCircle, CheckCircle2, Wrench, Droplet, Zap, Snowflake, Home, ShieldAlert } from "lucide-react"

export default function DeclareIncidentForm({ leaseId, propertyId }: { leaseId: string, propertyId: string }) {
    const router = useRouter()
    
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [category, setCategory] = useState("PLOMBERIE")
    const [priority, setPriority] = useState("MOYENNE")
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0] || null;
        setFile(selected);
        if (selected) {
            setPreviewUrl(URL.createObjectURL(selected));
        } else {
            setPreviewUrl(null);
        }
    };

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
            if (!data.success) throw new Error(data.error || "Impossible d'envoyer la demande.")

            setSuccess(true)
            setTitle("")
            setDescription("")
            setFile(null)
            setPreviewUrl(null)
            
            setTimeout(() => {
                setSuccess(false)
                router.refresh()
            }, 3000)

        } catch (err: any) {
            setError(err.message || "Erreur lors de la soumission du signalement.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl">
            <div className="border-b border-slate-100 pb-5 mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider mb-2">
                    <Wrench size={13} className="text-orange-500" />
                    Assistance Réparation
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Signaler une Panne ou un Incident
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                    Un imprévu dans votre logement ? Décrivez la situation simplement pour organiser l'intervention au plus vite.
                </p>
            </div>

            {success ? (
                <div className="bg-emerald-50 p-8 rounded-2xl text-center border border-emerald-200 animate-in zoom-in-95 space-y-3">
                    <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center text-3xl mx-auto shadow-md">
                        ✓
                    </div>
                    <h3 className="text-xl font-black text-emerald-900">Demande Envoyée avec Succès !</h3>
                    <p className="text-sm font-medium text-emerald-700 max-w-md mx-auto leading-relaxed">
                        Votre propriétaire et l'équipe de gestion ont été immédiatement prévenus. Vous serez recontacté dès la planification de l'artisan.
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Category Selector */}
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700">
                            Quel type d'incident rencontrez-vous ?
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[
                                { id: "PLOMBERIE", label: "Plomberie & Eau", icon: "💧" },
                                { id: "ELECTRICITE", label: "Électricité", icon: "⚡" },
                                { id: "SERRURERIE", label: "Serrure & Portes", icon: "🔑" },
                                { id: "CLIMATISATION", label: "Climatisation", icon: "❄️" },
                                { id: "STRUCTURE", label: "Murs & Toiture", icon: "🧱" },
                                { id: "AUTRE", label: "Autre panne", icon: "🛠️" },
                            ].map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => setCategory(c.id)}
                                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                                        category === c.id
                                            ? 'border-[#FF8200] bg-orange-50 font-bold text-slate-900 shadow-sm'
                                            : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:border-slate-300'
                                    }`}
                                >
                                    <span className="text-xl">{c.icon}</span>
                                    <span className="text-xs font-bold leading-tight">{c.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Priority Selector */}
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700">
                            Degré d'urgence
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: "FAIBLE", label: "Faible", sub: "Peut attendre" },
                                { id: "MOYENNE", label: "Modérée", sub: "Gêne le quotidien" },
                                { id: "CRITIQUE", label: "Urgente", sub: "Danger ou fuite continue" },
                            ].map((p) => (
                                <button 
                                    key={p.id}
                                    type="button" 
                                    onClick={() => setPriority(p.id)} 
                                    className={`p-3 rounded-xl border text-center transition-all ${
                                        priority === p.id 
                                            ? p.id === 'CRITIQUE'
                                                ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold ring-2 ring-rose-300'
                                                : 'bg-orange-50 border-[#FF8200] text-orange-950 font-bold ring-2 ring-orange-200'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="text-xs font-black">{p.label}</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">{p.sub}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Short Title */}
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700">
                            Objet du problème (bref) <span className="text-rose-500">*</span>
                        </label>
                        <input 
                            required
                            type="text" 
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Ex: Le robinet sous le lavabo coule sans arrêt"
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF8200] focus:bg-white transition-all"
                        />
                    </div>

                    {/* Detailed Description */}
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700">
                            Explications détaillées <span className="text-rose-500">*</span>
                        </label>
                        <textarea 
                            required
                            rows={4}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Indiquez dans quelle pièce cela se produit, depuis quand, et ce que vous avez déjà essayé..."
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF8200] focus:bg-white transition-all resize-none"
                        />
                    </div>

                    {/* Photo upload with preview */}
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700">
                            Photo ou image illustrative (Recommandé)
                        </label>
                        <div className="flex items-center gap-4">
                            <label className="flex-1 border-2 border-dashed border-slate-200 hover:border-orange-400 hover:bg-orange-50/20 p-4 rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-2 text-slate-600">
                                <Camera size={18} className="text-orange-500" />
                                <span className="text-xs font-bold">
                                    {file ? file.name : "Prendre une photo ou ajouter un fichier"}
                                </span>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                            {previewUrl && (
                                <img 
                                    src={previewUrl} 
                                    alt="Aperçu" 
                                    className="w-14 h-14 object-cover rounded-xl border border-slate-200" 
                                />
                            )}
                        </div>
                    </div>

                    {/* Explanatory notice */}
                    <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-200/80 text-xs text-orange-950 space-y-1">
                        <p className="font-bold text-orange-900 flex items-center gap-1.5">
                            <AlertCircle size={14} className="text-orange-600" /> Bon à savoir
                        </p>
                        <p className="leading-relaxed">
                            Les réparations dues à la vétusté ou aux installations du logement sont à la charge de votre propriétaire. Seul le petit entretien courant vous incombe. Votre déclaration sera examinée avec bienveillance.
                        </p>
                    </div>

                    {error && (
                        <div className="p-4 bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 rounded-2xl text-center">
                            ⚠️ {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-[#FF8200] hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-2xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        Envoyer ma déclaration
                    </button>
                </form>
            )}
        </div>
    )
}
