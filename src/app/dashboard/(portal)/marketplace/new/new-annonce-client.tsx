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
        <div className="space-y-6 relative max-w-4xl mx-auto">
            {/* Header */}
            <div>
                <button 
                    onClick={() => router.back()} 
                    className="text-slate-400 hover:text-slate-700 flex items-center gap-2 font-bold uppercase tracking-widest text-[10px] mb-6 transition-colors"
                >
                    <ArrowLeft size={14} /> Retour au store
                </button>
                <div className="flex flex-col gap-2">
                     <div className="mb-2 bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-[6px] inline-flex items-center gap-2 shadow-sm max-w-max">
                        <Home size={12} /> Publication
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                        Rédiger une Annonce
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Préparez l'annonce pour votre bien. Elle sera enregistrée en brouillon avant diffusion.
                    </p>
                </div>
            </div>

            <form onSubmit={handleCreate} className="bg-white rounded-[24px] border border-slate-200 p-8 shadow-sm space-y-8">
                
                {/* Choix du Bien */}
                <div>
                    <label className="block text-[11px] font-bold text-slate-900 uppercase tracking-widest mb-3">Sélectionner le bien immobilier <span className="text-red-500">*</span></label>
                    <select 
                        value={form.logementId} 
                        onChange={(e) => setForm({...form, logementId: e.target.value})}
                        className="w-full p-4 bg-white border border-slate-200 rounded-[12px] text-[13px] font-bold text-slate-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors"
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

                <hr className="border-slate-100" />

                {/* Titre & Loyer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[11px] font-bold text-slate-900 uppercase tracking-widest mb-3">Titre Accrocheur <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            value={form.titre} 
                            onChange={(e) => setForm({...form, titre: e.target.value})}
                            placeholder="Ex: Magnifique Appartement 3 Pièces - Riviera Golf"
                            className="w-full p-4 bg-white border border-slate-200 rounded-[12px] text-[13px] font-bold text-slate-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-slate-900 uppercase tracking-widest mb-3">Loyer Mensuel (FCFA) <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[13px]">FCFA</span>
                            <input 
                                type="number" 
                                value={form.loyerDemande} 
                                onChange={(e) => setForm({...form, loyerDemande: e.target.value})}
                                placeholder="350000"
                                className="w-full pl-14 p-4 bg-white border border-slate-200 rounded-[12px] text-[13px] font-bold text-slate-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-[11px] font-bold text-slate-900 uppercase tracking-widest mb-3">Description Complète <span className="text-red-500">*</span></label>
                    <textarea 
                        rows={6}
                        value={form.description} 
                        onChange={(e) => setForm({...form, description: e.target.value})}
                        placeholder="Décrivez les atouts de votre bien, les pièces, les commodités à proximité..."
                        className="w-full p-4 bg-white border border-slate-200 rounded-[12px] text-[13px] font-medium text-slate-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors resize-none leading-relaxed"
                        required
                    />
                </div>

                <div className="pt-4 flex justify-end">
                    <button 
                        type="submit" 
                        disabled={isPending}
                        className="bg-orange-500 text-white px-8 py-3.5 rounded-[12px] font-bold text-[12px] uppercase tracking-widest hover:bg-orange-600 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                        {isPending ? "Création en cours..." : "Suivant : Sauvegarder Brouillon"}
                    </button>
                </div>
            </form>
        </div>
    )
}
