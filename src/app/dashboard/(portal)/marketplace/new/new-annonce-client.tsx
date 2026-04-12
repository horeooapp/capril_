"use client"

import React, { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Store, Megaphone, ArrowLeft, Home, Building2, MapPin } from "lucide-react"
import { createAnnonce } from "@/actions/marketplace-actions"

export default function NewAnnonceClient({ properties }: { properties: any[] }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const [form, setForm] = useState({
        logementId: "",
        titre: "",
        description: "",
        loyerDemande: ""
    })

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!form.logementId || !form.titre || !form.description || !form.loyerDemande) {
            return toast.error("Veuillez remplir tous les champs obligatoires.")
        }

        startTransition(async () => {
            const res = await createAnnonce({
                ...form,
                loyerDemande: parseFloat(form.loyerDemande)
            })

            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success("Votre annonce a été créée et enregistrée en brouillon.")
                router.push("/dashboard/marketplace")
            }
        })
    }

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <button 
                    onClick={() => router.back()} 
                    className="text-qtext-light hover:text-qnavy flex items-center gap-2 font-bold uppercase tracking-widest text-[10px] mb-6 transition-colors"
                >
                    <ArrowLeft size={14} /> Retour au store
                </button>
                <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                    <Megaphone className="text-qorange" size={32} /> Rédiger une Annonce
                </h1>
                <p className="text-sm font-medium text-qtext-mid mt-1">
                    Préparez l'annonce pour votre bien. Elle sera enregistrée en brouillon avant diffusion.
                </p>
            </div>

            <form onSubmit={handleCreate} className="bg-white rounded-[2rem] border border-qgrey-2 p-8 shadow-sm space-y-8">
                
                {/* Choix du Bien */}
                <div>
                    <label className="block text-xs font-black text-qnavy-dark uppercase tracking-widest mb-3">Sélectionner le bien immobilier <span className="text-red-500">*</span></label>
                    <select 
                        value={form.logementId} 
                        onChange={(e) => setForm({...form, logementId: e.target.value})}
                        className="w-full p-4 bg-white border-2 border-qgrey-2 rounded-xl text-sm font-bold text-qnavy focus:border-qorange focus:ring-0 outline-none transition-colors"
                        required
                    >
                        <option value="" disabled>--- Choisissez un bien dans votre portefeuille ---</option>
                        {properties.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.propertyCode} - {p.name || p.address} ({p.propertyType})
                            </option>
                        ))}
                    </select>
                </div>

                <hr className="border-qgrey-2" />

                {/* Titre & Loyer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-black text-qnavy-dark uppercase tracking-widest mb-3">Titre Accrocheur <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            value={form.titre} 
                            onChange={(e) => setForm({...form, titre: e.target.value})}
                            placeholder="Ex: Magnifique Appartement 3 Pièces - Riviera Golf"
                            className="w-full p-4 bg-white border-2 border-qgrey-2 rounded-xl text-sm font-bold text-qnavy focus:border-qorange focus:ring-0 outline-none transition-colors"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-qnavy-dark uppercase tracking-widest mb-3">Loyer Mensuel (FCFA) <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₣</span>
                            <input 
                                type="number" 
                                value={form.loyerDemande} 
                                onChange={(e) => setForm({...form, loyerDemande: e.target.value})}
                                placeholder="350000"
                                className="w-full pl-8 p-4 bg-white border-2 border-qgrey-2 rounded-xl text-sm font-bold text-qnavy focus:border-qorange focus:ring-0 outline-none transition-colors"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-xs font-black text-qnavy-dark uppercase tracking-widest mb-3">Description Complète <span className="text-red-500">*</span></label>
                    <textarea 
                        rows={6}
                        value={form.description} 
                        onChange={(e) => setForm({...form, description: e.target.value})}
                        placeholder="Décrivez les atouts de votre bien, les pièces, les commodités à proximité..."
                        className="w-full p-4 bg-white border-2 border-qgrey-2 rounded-xl text-sm font-medium text-gray-700 focus:border-qorange focus:ring-0 outline-none transition-colors resize-none"
                        required
                    />
                </div>

                <div className="pt-4 flex justify-end">
                    <button 
                        type="submit" 
                        disabled={isPending}
                        className="bg-qorange text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:-translate-y-1 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isPending ? "Création en cours..." : "Suivant : Sauvegarder Brouillon"}
                    </button>
                </div>
            </form>
        </div>
    )
}
