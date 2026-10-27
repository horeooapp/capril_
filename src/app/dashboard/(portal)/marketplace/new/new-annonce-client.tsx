"use client"

import React, { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { 
    Store, 
    Megaphone, 
    ArrowLeft, 
    Home, 
    Building2, 
    MapPin, 
    Sparkles, 
    Check, 
    Coins, 
    Calendar, 
    ShieldCheck, 
    Eye,
    CheckCircle2
} from "lucide-react"
import { createAnnonce } from "@/actions/marketplace-actions"

const AMENITIES = [
    { id: "clim", label: "Climatisation", icon: "❄️" },
    { id: "gardien", label: "Gardien 24h/24", icon: "🛡️" },
    { id: "parking", label: "Parking sécurisé", icon: "🚗" },
    { id: "groupe", label: "Groupe électrogène", icon: "⚡" },
    { id: "cuve", label: "Réserve d'eau (Cuve/Surpresseur)", icon: "💧" },
    { id: "fibre", label: "Internet Fibre Optique", icon: "🌐" },
    { id: "balcon", label: "Balcon / Terrasse", icon: "🌿" },
    { id: "chauffe_eau", label: "Chauffe-eau", icon: "🚿" },
    { id: "piscine", label: "Piscine", icon: "🏊" },
]

export default function NewAnnonceClient({ properties }: { properties: any[] }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const [form, setForm] = useState({
        logementId: "",
        titre: "",
        description: "",
        loyerDemande: "",
        cautionMois: "2",
        avanceMois: "2",
        isMeuble: false,
        disponibilite: "IMMEDIATE"
    })

    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])

    const selectedProp = properties.find(p => p.id === form.logementId)

    const toggleAmenity = (id: string) => {
        setSelectedAmenities(prev => 
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        )
    }

    const handlePropertyChange = (propId: string) => {
        const found = properties.find(p => p.id === propId)
        setForm(prev => ({
            ...prev,
            logementId: propId,
            loyerDemande: found?.declaredRentFcfa ? String(found.declaredRentFcfa) : prev.loyerDemande,
            titre: prev.titre || (found ? `${found.propertyType || "Logement"} de standing - ${found.commune || found.city || "Abidjan"}` : "")
        }))
    }

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!form.logementId) {
            return toast.error("Veuillez sélectionner le bien immobilier concerné.")
        }
        if (!form.titre.trim()) {
            return toast.error("Veuillez donner un titre à votre annonce.")
        }
        if (!form.loyerDemande || parseFloat(form.loyerDemande) <= 0) {
            return toast.error("Veuillez indiquer un loyer mensuel supérieur à zéro.")
        }
        if (!form.description.trim()) {
            return toast.error("Veuillez ajouter une description pour valoriser le logement.")
        }

        // Build enriched description
        const amenitiesText = selectedAmenities.length > 0 
            ? `\n\nÉquipements et atouts inclus :\n` + selectedAmenities.map(id => `• ${AMENITIES.find(a => a.id === id)?.label}`).join("\n")
            : ""
        const conditionsText = `\n\nConditions d'entrée : Caution ${form.cautionMois} mois • Avance ${form.avanceMois} mois • ${form.isMeuble ? "Logement Meublé" : "Logement Non Meublé"}.`

        const finalDescription = form.description + amenitiesText + conditionsText

        startTransition(async () => {
            const res = await createAnnonce({
                logementId: form.logementId,
                titre: form.titre,
                description: finalDescription,
                loyerDemande: parseFloat(form.loyerDemande)
            })

            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success("Votre annonce a été préparée et enregistrée avec succès !")
                router.push("/dashboard/marketplace")
            }
        })
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto py-6 px-4 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <button 
                    onClick={() => router.back()} 
                    className="text-slate-400 hover:text-slate-700 flex items-center gap-2 font-bold uppercase tracking-wider text-[11px] mb-4 transition-colors"
                >
                    <ArrowLeft size={14} /> Revenir aux annonces
                </button>
                <div className="flex flex-col gap-2">
                    <div className="bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full inline-flex items-center gap-2 max-w-max">
                        <Megaphone size={14} className="text-orange-500" /> Mise en Location
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                        Rédiger une Annonce Immobilière
                    </h1>
                    <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
                        Présentez votre logement dans des termes clairs et attrayants pour attirer les meilleurs candidats et recevoir des dossiers complets.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Form column */}
                <form onSubmit={handleCreate} className="lg:col-span-2 space-y-6">
                    {/* 1. Choix du bien */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                            <Home className="text-[#FF8200]" size={18} /> 
                            1. Quel logement souhaitez-vous proposer ? <span className="text-rose-500">*</span>
                        </h2>
                        
                        <select 
                            value={form.logementId} 
                            onChange={(e) => handlePropertyChange(e.target.value)}
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF8200] focus:bg-white transition-all"
                            required
                        >
                            <option value="">-- Choisissez un bien dans votre portefeuille --</option>
                            {properties.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.propertyCode} - {p.name || p.address} ({p.propertyType || "Logement"}) — {p.commune || "Abidjan"}
                                </option>
                            ))}
                        </select>

                        {selectedProp && (
                            <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-4 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-slate-800">
                                        📍 {selectedProp.address || selectedProp.name} • {selectedProp.commune || selectedProp.city}
                                    </p>
                                    <p className="text-[11px] text-slate-500">
                                        Code du bien : {selectedProp.propertyCode} • Type : {selectedProp.propertyType}
                                    </p>
                                </div>
                                {selectedProp.declaredRentFcfa && (
                                    <span className="text-xs font-bold text-[#FF8200] bg-white px-3 py-1 rounded-full border border-orange-200">
                                        Loyer de base : {selectedProp.declaredRentFcfa.toLocaleString()} FCFA
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 2. Titre & Loyer */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                            <Sparkles className="text-[#FF8200]" size={18} /> 
                            2. Présentation & Loyer mensuel
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-700 mb-2 block">
                                    Titre de l'annonce <span className="text-rose-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    value={form.titre} 
                                    onChange={(e) => setForm({...form, titre: e.target.value})}
                                    placeholder="Ex: Superbe Appartement 3 Pièces Lumineux avec Balcon - Angré"
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF8200] focus:bg-white transition-all"
                                    required
                                />
                                <p className="text-[11px] text-slate-400 mt-1">Un titre accrocheur augmente de 60% les visites.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 mb-2 block">
                                        Loyer mensuel demandé (FCFA) <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            min="1"
                                            value={form.loyerDemande} 
                                            onChange={(e) => setForm({...form, loyerDemande: e.target.value})}
                                            placeholder="Ex: 300000"
                                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF8200] focus:bg-white transition-all"
                                            required
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">FCFA</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-700 mb-2 block">
                                        Type d'aménagement
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setForm({...form, isMeuble: false})}
                                            className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all ${
                                                !form.isMeuble
                                                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                            }`}
                                        >
                                            Non meublé
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setForm({...form, isMeuble: true})}
                                            className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all ${
                                                form.isMeuble
                                                    ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                            }`}
                                        >
                                            Meublé ✨
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Conditions de caution et avance */}
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 mb-2 block">
                                        Caution requise
                                    </label>
                                    <select 
                                        value={form.cautionMois} 
                                        onChange={e => setForm({...form, cautionMois: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800"
                                    >
                                        <option value="1">1 mois de loyer</option>
                                        <option value="2">2 mois de loyer (Standard)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-700 mb-2 block">
                                        Avance demandée
                                    </label>
                                    <select 
                                        value={form.avanceMois} 
                                        onChange={e => setForm({...form, avanceMois: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800"
                                    >
                                        <option value="1">1 mois d'avance</option>
                                        <option value="2">2 mois d'avance (Standard)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Équipements inclus */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                        <div>
                            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <Building2 className="text-[#FF8200]" size={18} /> 
                                3. Équipements & Commodités incluses
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">
                                Cochez les équipements disponibles pour valoriser votre bien.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {AMENITIES.map((am) => {
                                const active = selectedAmenities.includes(am.id)
                                return (
                                    <button
                                        key={am.id}
                                        type="button"
                                        onClick={() => toggleAmenity(am.id)}
                                        className={`p-3 rounded-2xl text-left border text-xs font-bold flex items-center gap-2 transition-all ${
                                            active
                                                ? 'bg-orange-50 border-orange-300 text-orange-950 shadow-sm ring-1 ring-orange-200'
                                                : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                    >
                                        <span className="text-base">{am.icon}</span>
                                        <span className="leading-tight flex-1">{am.label}</span>
                                        {active && <Check size={14} className="text-orange-600 shrink-0" />}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* 4. Description complète */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                        <div>
                            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <Megaphone className="text-[#FF8200]" size={18} /> 
                                4. Description détaillée <span className="text-rose-500">*</span>
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">
                                Décrivez l'environnement, la proximité des commerces, des écoles et les points forts du quartier.
                            </p>
                        </div>

                        <textarea 
                            rows={6}
                            value={form.description} 
                            onChange={(e) => setForm({...form, description: e.target.value})}
                            placeholder="Ex: Dans une résidence calme et sécurisée, découvrez ce magnifique appartement rénové comprenant un grand salon baigné de lumière, deux chambres spacieuses avec placards intégrés, une cuisine aménagée et un balcon sans vis-à-vis..."
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF8200] focus:bg-white transition-all resize-none leading-relaxed"
                            required
                        />
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex items-center justify-between pt-2">
                        <button 
                            type="button" 
                            onClick={() => router.back()}
                            className="px-6 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors"
                        >
                            Annuler
                        </button>
                        <button 
                            type="submit" 
                            disabled={isPending}
                            className="bg-[#FF8200] hover:bg-orange-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 disabled:opacity-40 transition-all flex items-center gap-2"
                        >
                            {isPending ? "Enregistrement..." : "Créer l'Annonce"}
                            <CheckCircle2 size={16} />
                        </button>
                    </div>
                </form>

                {/* Right column: LIVE PREVIEW CARD */}
                <div className="space-y-4 sticky top-6">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <Eye size={14} className="text-[#FF8200]" />
                        Aperçu de ce que verront les locataires
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                        {/* Image preview */}
                        <div className="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                            {selectedProp?.coverImageUrl || selectedProp?.images?.[0] ? (
                                <img 
                                    src={selectedProp?.coverImageUrl || selectedProp?.images?.[0]} 
                                    alt="Photo du bien" 
                                    className="w-full h-full object-cover" 
                                />
                            ) : (
                                <div className="text-center p-4 text-slate-400">
                                    <Home className="w-10 h-10 mx-auto mb-1 opacity-40" />
                                    <span className="text-[11px] font-bold">Photo principale du logement</span>
                                </div>
                            )}
                            {form.isMeuble && (
                                <span className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shadow-sm">
                                    Meublé
                                </span>
                            )}
                        </div>

                        {/* Card body */}
                        <div className="p-5 space-y-3">
                            <div className="flex items-baseline justify-between">
                                <span className="text-xl font-black text-[#FF8200]">
                                    {form.loyerDemande ? Number(form.loyerDemande).toLocaleString() : "---"} <span className="text-xs text-slate-600 font-bold">FCFA/mois</span>
                                </span>
                            </div>

                            <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug">
                                {form.titre || "Titre de votre annonce"}
                            </h3>

                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                <MapPin size={12} className="text-slate-400 shrink-0" />
                                {selectedProp?.commune || selectedProp?.city || "Abidjan, Côte d'Ivoire"}
                            </p>

                            {selectedAmenities.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {selectedAmenities.slice(0, 4).map(id => (
                                        <span key={id} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                                            {AMENITIES.find(a => a.id === id)?.label}
                                        </span>
                                    ))}
                                    {selectedAmenities.length > 4 && (
                                        <span className="text-[10px] text-slate-400">+{selectedAmenities.length - 4} autres</span>
                                    )}
                                </div>
                            )}

                            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                                <span>Caution : {form.cautionMois} mois</span>
                                <span>Avance : {form.avanceMois} mois</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
