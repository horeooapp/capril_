"use client"

import React, { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CheckSquare, ArrowLeft, FileSignature, Home, User, Droplets, Zap, Key, Calendar, ClipboardList } from "lucide-react"
import { toast } from "sonner"
import { createEdl } from "@/actions/edl-actions"
import { SectionCard } from "@/components/dashboard/ui/SectionCard"

interface Lease {
    id: string;
    property?: { id: string; address?: string; propertyCode?: string; name?: string } | null;
    tenant?: { id: string; firstName?: string | null; lastName?: string | null; phone?: string | null } | null;
}

export default function NewInspectionClient({ leases }: { leases: Lease[] }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const [form, setForm] = useState({
        leaseId: "",
        typeEdl: "ENTREE" as "ENTREE" | "SORTIE",
        dateEdl: new Date().toISOString().split("T")[0],
        indexEau: "",
        indexElec: "",
        clesRemises: "1",
        clesDetail: "",
        reservesLocataire: "",
    })

    const selectedLease = leases.find(l => l.id === form.leaseId)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!form.leaseId) {
            toast.error("Veuillez sélectionner un bail.")
            return
        }

        startTransition(async () => {
            try {
                const res = await createEdl({
                    leaseId: form.leaseId,
                    typeEdl: form.typeEdl,
                    indexEau: form.indexEau ? parseFloat(form.indexEau) : undefined,
                    indexElec: form.indexElec ? parseFloat(form.indexElec) : undefined,
                    clesRemises: parseInt(form.clesRemises) || 0,
                    clesDetail: form.clesDetail || undefined,
                    sections: form.reservesLocataire
                        ? [{ type: 'note', label: 'Réserves locataire', content: form.reservesLocataire, dateEdl: form.dateEdl }]
                        : [{ type: 'note', label: 'Date inspection', content: form.dateEdl }],
                })

                if (res?.success) {
                    toast.success("État des lieux créé avec succès.")
                    router.push("/dashboard/inspections")
                } else {
                    toast.error((res as any)?.error || "Erreur lors de la création.")
                }
            } catch (err) {
                toast.error("Une erreur système est survenue.")
            }
        })
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push("/dashboard/inspections")}
                    className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                >
                    <ArrowLeft size={16} />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                        <CheckSquare className="text-emerald-500" size={28} /> Planifier une Inspection
                    </h1>
                    <p className="text-[13px] font-medium text-slate-500 mt-0.5">
                        Créer un nouvel état des lieux d&apos;entrée ou de sortie.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Bail */}
                <SectionCard title="Bail concerné" icon={<ClipboardList className="text-slate-500" size={18} />}>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                                Sélectionner le bail actif
                            </label>
                            <select
                                required
                                value={form.leaseId}
                                onChange={e => setForm({ ...form, leaseId: e.target.value })}
                                className="w-full p-3 bg-slate-50 rounded-[10px] border border-slate-200 text-[13px] font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                            >
                                <option value="">Choisir un bail...</option>
                                {leases.map(l => (
                                    <option key={l.id} value={l.id}>
                                        {l.property?.address || l.property?.propertyCode || "Bien inconnu"} — {l.tenant?.firstName} {l.tenant?.lastName}
                                    </option>
                                ))}
                            </select>
                            {leases.length === 0 && (
                                <p className="text-[11px] text-amber-600 font-bold mt-2 bg-amber-50 border border-amber-200 rounded-[8px] px-3 py-2">
                                    Aucun bail actif trouvé pour votre compte.
                                </p>
                            )}
                        </div>

                        {/* Aperçu du bail sélectionné */}
                        {selectedLease && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-[12px] p-4 flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-[12px] font-bold text-emerald-800">
                                    <Home size={13} /> {selectedLease.property?.address || "Adresse N/A"}
                                </div>
                                <div className="flex items-center gap-2 text-[12px] font-bold text-emerald-700">
                                    <User size={13} /> {selectedLease.tenant?.firstName} {selectedLease.tenant?.lastName}
                                    {selectedLease.tenant?.phone && (
                                        <span className="text-emerald-500 font-medium">— {selectedLease.tenant.phone}</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </SectionCard>

                {/* Type & Date */}
                <SectionCard title="Type d'inspection" icon={<FileSignature className="text-slate-500" size={18} />}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                                Type d&apos;état des lieux
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {(["ENTREE", "SORTIE"] as const).map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setForm({ ...form, typeEdl: type })}
                                        className={`py-3 rounded-[10px] font-bold text-[11px] uppercase tracking-widest border transition-all ${
                                            form.typeEdl === type
                                                ? type === "ENTREE"
                                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                                                    : "bg-sky-600 text-white border-sky-600 shadow-md"
                                                : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                                        }`}
                                    >
                                        {type === "ENTREE" ? "🔑 Entrée" : "🚪 Sortie"}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block flex items-center gap-1">
                                <Calendar size={10} /> Date de l&apos;inspection
                            </label>
                            <input
                                type="date"
                                required
                                value={form.dateEdl}
                                onChange={e => setForm({ ...form, dateEdl: e.target.value })}
                                className="w-full p-3 bg-slate-50 rounded-[10px] border border-slate-200 text-[13px] font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                            />
                        </div>
                    </div>
                </SectionCard>

                {/* Relevés & Clés */}
                <SectionCard title="Relevés de compteurs & clés" icon={<Key className="text-slate-500" size={18} />}>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block flex items-center gap-1">
                                <Droplets size={10} /> Index Eau (m³)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="Ex: 1234.56"
                                value={form.indexEau}
                                onChange={e => setForm({ ...form, indexEau: e.target.value })}
                                className="w-full p-3 bg-slate-50 rounded-[10px] border border-slate-200 text-[13px] font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block flex items-center gap-1">
                                <Zap size={10} /> Index Électricité (kWh)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="Ex: 5678.90"
                                value={form.indexElec}
                                onChange={e => setForm({ ...form, indexElec: e.target.value })}
                                className="w-full p-3 bg-slate-50 rounded-[10px] border border-slate-200 text-[13px] font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block flex items-center gap-1">
                                <Key size={10} /> Nombre de clés remises
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="20"
                                value={form.clesRemises}
                                onChange={e => setForm({ ...form, clesRemises: e.target.value })}
                                className="w-full p-3 bg-slate-50 rounded-[10px] border border-slate-200 text-[13px] font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                                Détail des clés
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: 2 clés porte principale, 1 boîte aux lettres"
                                value={form.clesDetail}
                                onChange={e => setForm({ ...form, clesDetail: e.target.value })}
                                className="w-full p-3 bg-slate-50 rounded-[10px] border border-slate-200 text-[13px] font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                            />
                        </div>
                    </div>
                </SectionCard>

                {/* Réserves */}
                <SectionCard title="Réserves locataire" icon={<ClipboardList className="text-slate-500" size={18} />}>
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                            Réserves ou observations (optionnel)
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Noter ici les réserves émises par le locataire lors de l'inspection..."
                            value={form.reservesLocataire}
                            onChange={e => setForm({ ...form, reservesLocataire: e.target.value })}
                            className="w-full p-3 bg-slate-50 rounded-[10px] border border-slate-200 text-[13px] font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-none"
                        />
                    </div>
                </SectionCard>

                {/* Actions */}
                <div className="flex gap-3 pb-8">
                    <button
                        type="button"
                        onClick={() => router.push("/dashboard/inspections")}
                        className="flex-1 py-3.5 rounded-[10px] font-bold text-[11px] uppercase tracking-widest text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={isPending || !form.leaseId}
                        className="flex-1 bg-slate-900 text-white py-3.5 rounded-[10px] font-bold text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isPending ? "Création en cours..." : "Créer l'état des lieux"}
                        <CheckSquare size={14} />
                    </button>
                </div>
            </form>
        </div>
    )
}
