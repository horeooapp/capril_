"use client"

import React, { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { 
    CheckSquare, 
    ArrowLeft, 
    FileSignature, 
    Home, 
    User, 
    Droplets, 
    Zap, 
    Key, 
    Calendar, 
    ClipboardList,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    Info,
    Sparkles,
    Check
} from "lucide-react"
import { toast } from "sonner"
import { createEdl } from "@/actions/edl-actions"

interface Lease {
    id: string;
    property?: { id: string; address?: string; propertyCode?: string; name?: string; commune?: string } | null;
    tenant?: { id: string; firstName?: string | null; lastName?: string | null; phone?: string | null } | null;
}

const DEFAULT_PIECES = [
    { id: "salon", label: "Salon & Séjour", etat: "BON_ETAT", notes: "" },
    { id: "cuisine", label: "Cuisine & Robinetterie", etat: "BON_ETAT", notes: "" },
    { id: "chambres", label: "Chambre(s) & Climatisation", etat: "BON_ETAT", notes: "" },
    { id: "salle_eau", label: "Salle d'eau & WC", etat: "BON_ETAT", notes: "" },
    { id: "balcon", label: "Balcon / Terrasse / Extérieur", etat: "BON_ETAT", notes: "" },
];

const ETATS = [
    { id: "NEUF", label: "Neuf / Impeccable", color: "bg-emerald-50 text-emerald-800 border-emerald-300" },
    { id: "BON_ETAT", label: "Bon état d'usage", color: "bg-blue-50 text-blue-800 border-blue-300" },
    { id: "USURE_NORMALE", label: "Usure normale", color: "bg-amber-50 text-amber-800 border-amber-300" },
    { id: "A_REPARER", label: "À réparer / Remplacer", color: "bg-rose-50 text-rose-800 border-rose-300" },
];

export default function NewInspectionClient({ leases }: { leases: Lease[] }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const [form, setForm] = useState({
        leaseId: "",
        typeEdl: "ENTREE" as "ENTREE" | "SORTIE",
        dateEdl: new Date().toISOString().split("T")[0],
        indexEau: "",
        numeroCompteurEau: "",
        indexElec: "",
        typeCompteurElec: "POSTPAYE" as "POSTPAYE" | "PREPAYE",
        clesRemises: "2",
        clesDetail: "2 clés de la porte d'entrée principale",
        reservesLocataire: "",
    })

    const [pieces, setPieces] = useState(DEFAULT_PIECES)

    const selectedLease = leases.find(l => l.id === form.leaseId)

    const updatePieceEtat = (id: string, newEtat: string) => {
        setPieces(prev => prev.map(p => p.id === id ? { ...p, etat: newEtat } : p))
    }

    const updatePieceNotes = (id: string, notes: string) => {
        setPieces(prev => prev.map(p => p.id === id ? { ...p, notes } : p))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!form.leaseId) {
            toast.error("Veuillez sélectionner le contrat de bail concerné.")
            return
        }

        startTransition(async () => {
            try {
                const sectionsPayload = [
                    {
                        type: 'pieces_inspection',
                        label: 'Vérification détaillée des pièces',
                        items: pieces
                    },
                    {
                        type: 'compteurs',
                        label: 'Relevé des compteurs',
                        eau: { index: form.indexEau, compteur: form.numeroCompteurEau },
                        electricite: { index: form.indexElec, type: form.typeCompteurElec }
                    },
                    {
                        type: 'cles',
                        label: 'Remise des clés et accès',
                        total: form.clesRemises,
                        detail: form.clesDetail
                    },
                    ...(form.reservesLocataire ? [{
                        type: 'reserves',
                        label: 'Observations et réserves constatées',
                        content: form.reservesLocataire
                    }] : [])
                ]

                const res = await createEdl({
                    leaseId: form.leaseId,
                    typeEdl: form.typeEdl,
                    indexEau: form.indexEau ? parseFloat(form.indexEau) : undefined,
                    indexElec: form.indexElec ? parseFloat(form.indexElec) : undefined,
                    clesRemises: parseInt(form.clesRemises) || 0,
                    clesDetail: form.clesDetail || undefined,
                    sections: sectionsPayload,
                })

                if (res?.success) {
                    toast.success("État des lieux enregistré avec succès !")
                    router.push("/dashboard/inspections")
                    router.refresh()
                } else {
                    toast.error((res as any)?.error || "Erreur lors de la création de l'état des lieux.")
                }
            } catch (err) {
                toast.error("Une erreur système est survenue.")
            }
        })
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto py-6 px-4 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/dashboard/inspections")}
                        className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors shrink-0 shadow-sm"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
                            <ClipboardList size={13} className="text-emerald-600" />
                            Constat Transparent
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                            Établir un État des Lieux
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500">
                            Un document protecteur qui certifie l'état du logement pour rassurer locataire et propriétaire.
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. CHOIX DU TYPE D'ETAT DES LIEUX */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                    <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <FileSignature className="text-[#FF8200]" size={18} /> 
                        1. Moment de l'inspection
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, typeEdl: "ENTREE" })}
                            className={`p-5 rounded-2xl border-2 text-left transition-all ${
                                form.typeEdl === "ENTREE"
                                    ? "border-emerald-500 bg-emerald-50/40 shadow-sm"
                                    : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl">🔑</span>
                                {form.typeEdl === "ENTREE" && (
                                    <span className="bg-emerald-600 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
                                        Sélectionné
                                    </span>
                                )}
                            </div>
                            <h3 className="font-bold text-slate-900 text-base mb-1">État des Lieux d'Entrée</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Réalisé lors de la remise des clés au locataire entrant. Il fixe l'état initial du logement.
                            </p>
                        </button>

                        <button
                            type="button"
                            onClick={() => setForm({ ...form, typeEdl: "SORTIE" })}
                            className={`p-5 rounded-2xl border-2 text-left transition-all ${
                                form.typeEdl === "SORTIE"
                                    ? "border-sky-500 bg-sky-50/40 shadow-sm"
                                    : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl">🚪</span>
                                {form.typeEdl === "SORTIE" && (
                                    <span className="bg-sky-600 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
                                        Sélectionné
                                    </span>
                                )}
                            </div>
                            <h3 className="font-bold text-slate-900 text-base mb-1">État des Lieux de Sortie</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Réalisé au départ du locataire. Il permet de vérifier la conformité du logement pour restituer la caution.
                            </p>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div>
                            <label className="text-xs font-bold text-slate-700 mb-2 block flex items-center gap-1.5">
                                <Calendar size={14} className="text-[#FF8200]" /> Date de l'inspection <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="date"
                                required
                                value={form.dateEdl}
                                onChange={e => setForm({ ...form, dateEdl: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF8200] focus:bg-white transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. LOGEMENT & BAIL CONCERNE */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                    <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <Home className="text-[#FF8200]" size={18} /> 
                        2. Logement et locataire concernés
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-700 mb-2 block">
                                Sélectionner le contrat de location actif <span className="text-rose-500">*</span>
                            </label>
                            <select
                                required
                                value={form.leaseId}
                                onChange={e => setForm({ ...form, leaseId: e.target.value })}
                                className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF8200] focus:bg-white transition-all"
                            >
                                <option value="">-- Choisissez le bail du logement --</option>
                                {leases.map(l => (
                                    <option key={l.id} value={l.id}>
                                        {l.property?.address || l.property?.propertyCode || "Logement"} — Locataire : {l.tenant?.firstName} {l.tenant?.lastName}
                                    </option>
                                ))}
                            </select>

                            {leases.length === 0 && (
                                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl p-4 mt-2">
                                    Vous n'avez pas encore de contrat de bail actif enregistré. Vous pouvez d'abord enregistrer le bail dans la rubrique "Baux".
                                </p>
                            )}
                        </div>

                        {selectedLease && (
                            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                                        <Home size={14} className="text-emerald-700" />
                                        {selectedLease.property?.address || selectedLease.property?.name || "Adresse non renseignée"}
                                    </p>
                                    <p className="text-xs text-emerald-800 flex items-center gap-1.5">
                                        <User size={14} className="text-emerald-700" />
                                        Locataire : <strong>{selectedLease.tenant?.firstName} {selectedLease.tenant?.lastName}</strong>
                                        {selectedLease.tenant?.phone && (
                                            <span className="text-emerald-600 font-normal">({selectedLease.tenant.phone})</span>
                                        )}
                                    </p>
                                </div>
                                <span className="bg-emerald-600 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full">
                                    Contrat Actif Validé
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. RELEVÉ DES COMPTEURS */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                    <div>
                        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                            <Droplets className="text-[#FF8200]" size={18} /> 
                            3. Relevé des compteurs d'énergie & d'eau
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Relever les index évite tout litige sur les factures d'eau et d'électricité entre le propriétaire et le locataire.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Eau (SODECI) */}
                        <div className="p-5 bg-sky-50/40 border border-sky-100 rounded-2xl space-y-3">
                            <div className="flex items-center gap-2 text-sky-800 font-bold text-sm">
                                <Droplets size={16} className="text-sky-600" />
                                Compteur d'Eau (SODECI)
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                                    Index visible sur le compteur (m³)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="Ex: 1245.8"
                                    value={form.indexEau}
                                    onChange={e => setForm({ ...form, indexEau: e.target.value })}
                                    className="w-full px-4 py-3 bg-white rounded-xl border border-sky-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                                    Numéro gravé du compteur (optionnel)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: 08-SOD-44912"
                                    value={form.numeroCompteurEau}
                                    onChange={e => setForm({ ...form, numeroCompteurEau: e.target.value })}
                                    className="w-full px-4 py-3 bg-white rounded-xl border border-sky-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                />
                            </div>
                        </div>

                        {/* Électricité (CIE) */}
                        <div className="p-5 bg-amber-50/40 border border-amber-100 rounded-2xl space-y-3">
                            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                                <Zap size={16} className="text-amber-600" />
                                Compteur d'Électricité (CIE)
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                                    Type de compteur électrique
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, typeCompteurElec: "POSTPAYE" })}
                                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                                            form.typeCompteurElec === "POSTPAYE"
                                                ? "bg-amber-500 text-white border-amber-500"
                                                : "bg-white text-slate-600 border-amber-200"
                                        }`}
                                    >
                                        Facture mensuelle
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, typeCompteurElec: "PREPAYE" })}
                                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                                            form.typeCompteurElec === "PREPAYE"
                                                ? "bg-amber-500 text-white border-amber-500"
                                                : "bg-white text-slate-600 border-amber-200"
                                        }`}
                                    >
                                        Carte / Recharge
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                                    Index actuel (kWh)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="Ex: 5820"
                                    value={form.indexElec}
                                    onChange={e => setForm({ ...form, indexElec: e.target.value })}
                                    className="w-full px-4 py-3 bg-white rounded-xl border border-amber-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. VERIFICATION PIECE PAR PIECE */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                    <div>
                        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                            <Sparkles className="text-[#FF8200]" size={18} /> 
                            4. Constat d'état pièce par pièce
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Cliquez sur le bouton correspondant pour chaque zone du logement.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {pieces.map((piece) => (
                            <div key={piece.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <h3 className="font-bold text-sm text-slate-900">{piece.label}</h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {ETATS.map((et) => (
                                            <button
                                                key={et.id}
                                                type="button"
                                                onClick={() => updatePieceEtat(piece.id, et.id)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                                    piece.etat === et.id
                                                        ? et.color + " shadow-sm ring-1 ring-slate-300"
                                                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                                }`}
                                            >
                                                {piece.etat === et.id && "✓ "}
                                                {et.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Observations particulières pour cette pièce (optionnel, ex: légère marque sur le mur nord)..."
                                    value={piece.notes}
                                    onChange={e => updatePieceNotes(piece.id, e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 outline-none focus:ring-1 focus:ring-orange-400"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* 5. INVENTAIRE DES CLES */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                    <div>
                        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                            <Key className="text-[#FF8200]" size={18} /> 
                            5. Remise des clés et télécommandes
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Comptez précisément toutes les clés, badges d'immeuble et bips de portail remis au locataire.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-700 mb-2 block">
                                Nombre total de clés remises
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="20"
                                value={form.clesRemises}
                                onChange={e => setForm({ ...form, clesRemises: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF8200] focus:bg-white"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-xs font-bold text-slate-700 mb-2 block">
                                Détail descriptif des clés et accès
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: 2 clés porte principale, 1 clé chambre parentale, 1 badge portail"
                                value={form.clesDetail}
                                onChange={e => setForm({ ...form, clesDetail: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF8200] focus:bg-white"
                            />
                        </div>
                    </div>
                </div>

                {/* 6. REMARQUES GENERALES */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                    <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <CheckSquare className="text-[#FF8200]" size={18} /> 
                        6. Réserves ou accords particuliers (Optionnel)
                    </h2>
                    <textarea
                        rows={3}
                        placeholder="Ex: Le propriétaire s'engage à changer le flexible de douche d'ici vendredi..."
                        value={form.reservesLocataire}
                        onChange={e => setForm({ ...form, reservesLocataire: e.target.value })}
                        className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF8200] focus:bg-white transition-all resize-none"
                    />
                </div>

                {/* VALIDATION BUTTONS */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <button
                        type="button"
                        onClick={() => router.push("/dashboard/inspections")}
                        className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-wider text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={isPending || !form.leaseId}
                        className="w-full sm:w-auto px-10 py-4 bg-[#FF8200] hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-orange-500/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                    >
                        {isPending ? "Création en cours..." : "Valider l'état des lieux"}
                        <CheckCircle2 size={16} />
                    </button>
                </div>
            </form>
        </div>
    )
}
