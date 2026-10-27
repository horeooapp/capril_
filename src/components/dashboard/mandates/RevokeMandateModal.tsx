"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    ShieldAlert, AlertTriangle, X, Check, ArrowRight, 
    Home, UserCheck, Calendar, Info, ShieldCheck, HeartHandshake
} from "lucide-react"
import { toast } from "sonner"
import { revokeMandate, RevokeMandateInput } from "@/actions/mandate-actions"

interface RevokeMandateModalProps {
    isOpen: boolean;
    onClose: () => void;
    mandate: any | null;
    onMandateRevoked?: () => void;
}

const MOTIFS_REVOCATION = [
    {
        id: "GESTION_DIRECTE",
        label: "Reprise en gestion directe par le propriétaire",
        desc: "Le propriétaire souhaite désormais gérer lui-même ses locataires et ses quittances."
    },
    {
        id: "VENTE_BIEN",
        label: "Vente ou mise en vente du bien immobilier",
        desc: "Le logement va être cédé ou fait l'objet d'un projet de vente."
    },
    {
        id: "CHANGEMENT_AGENCE",
        label: "Changement de mandataire / nouvelle agence",
        desc: "Le bien sera confié à un autre professionnel de l'immobilier."
    },
    {
        id: "ACCORD_AMIABLE",
        label: "Rupture conventionnelle d'un commun accord",
        desc: "L'agence et le propriétaire s'accordent d'un commun accord pour clore le mandat."
    },
    {
        id: "INSATISFACTION",
        label: "Insatisfaction sur les prestations ou manquements",
        desc: "Délais de mise en location trop longs, défaut de suivi ou mésentente."
    },
    {
        id: "AUTRE",
        label: "Autre motif particulier",
        desc: "Précisez la raison ci-dessous."
    }
]

export default function RevokeMandateModal({
    isOpen,
    onClose,
    mandate,
    onMandateRevoked
}: RevokeMandateModalProps) {
    const [selectedMotif, setSelectedMotif] = useState(MOTIFS_REVOCATION[0].id)
    const [commentaire, setCommentaire] = useState("")
    const [typeEffet, setTypeEffet] = useState<"PREAVIS" | "IMMEDIAT">("PREAVIS")
    const [hasConfirmed, setHasConfirmed] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (!isOpen || !mandate) return null

    const property = mandate.property || {}
    const owner = property.owner || {}

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!hasConfirmed) {
            toast.warning("Veuillez cocher la case confirmant que vous comprenez les effets de la révocation.")
            return
        }

        const motifObj = MOTIFS_REVOCATION.find(m => m.id === selectedMotif)
        const motifLabel = motifObj?.label || "Révocation de mandat"
        const finalReason = commentaire.trim() 
            ? `${motifLabel} : ${commentaire.trim()} (${typeEffet === "IMMEDIAT" ? "Effet immédiat" : "Préavis standard"})` 
            : `${motifLabel} (${typeEffet === "IMMEDIAT" ? "Effet immédiat" : "Préavis standard"})`

        setIsSubmitting(true)

        try {
            const input: RevokeMandateInput = {
                mandateId: mandate.id,
                reason: finalReason,
                immediateEffect: typeEffet === "IMMEDIAT"
            }

            const res = await revokeMandate(input)

            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success(res.message || "Le mandat a été révoqué avec succès.")
                if (onMandateRevoked) onMandateRevoked()
                onClose()
            }
        } catch (err: any) {
            toast.error("Erreur lors de la révocation : " + (err?.message || "Veuillez réessayer."))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div 
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 15 }}
                className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-2xl my-auto overflow-hidden flex flex-col max-h-[92vh]"
            >
                {/* Header with warning styling */}
                <div className="px-6 py-5 bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 text-white flex justify-between items-center border-b border-rose-800/40">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-400 shadow-inner">
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-black text-white">
                                    Révocation du Mandat de Gérance
                                </h3>
                            </div>
                            <p className="text-xs text-rose-200 font-medium mt-0.5">
                                Référence : <span className="font-mono font-bold">{mandate.mandateRef || mandate.id.substring(0, 8)}</span> • {property.name || property.address}
                            </p>
                        </div>
                    </div>
                    <button 
                        type="button"
                        onClick={onClose} 
                        className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Reassuring Context Box */}
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
                        <div className="flex items-center gap-2 text-amber-900 font-black text-xs uppercase tracking-wider">
                            <Info size={15} className="text-amber-600" /> Ce qui se passe suite à la révocation
                        </div>
                        <ul className="text-xs text-slate-700 space-y-1.5 pl-5 list-disc leading-relaxed">
                            <li>
                                <strong>Vos locataires actuels restent en place :</strong> Leurs contrats de bail demeurent légalement valides et leurs dépôts de garantie protégés.
                            </li>
                            <li>
                                <strong>Le bien bascule en gestion directe :</strong> L&apos;agence ne percevra plus de commission sur les loyers futurs et n&apos;agira plus en votre nom.
                            </li>
                            <li>
                                <strong>Restitution des dossiers :</strong> L&apos;agence dispose de la période convenue pour vous restituer les doubles de clés, quittances et pièces administratives.
                            </li>
                        </ul>
                    </div>

                    {/* Step 1: Select Reason */}
                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-wider text-slate-800 block">
                            1. Motif de la Révocation
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {MOTIFS_REVOCATION.map(m => {
                                const isSelected = selectedMotif === m.id
                                return (
                                    <div
                                        key={m.id}
                                        onClick={() => setSelectedMotif(m.id)}
                                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                                            isSelected
                                                ? "border-rose-500 bg-rose-50/50 shadow-2xs"
                                                : "border-slate-200 hover:border-slate-300 bg-white"
                                        }`}
                                    >
                                        <div>
                                            <p className="text-xs font-black text-slate-900">{m.label}</p>
                                            <p className="text-[11px] text-slate-500 mt-1 leading-snug">{m.desc}</p>
                                        </div>
                                        <div className="mt-2 flex justify-end">
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                isSelected ? "border-rose-500 bg-rose-500 text-white" : "border-slate-300"
                                            }`}>
                                                {isSelected && <Check size={10} />}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Step 2: Date d'effet / Modalité de préavis */}
                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-wider text-slate-800 block">
                            2. Modalité de Prise d&apos;Effet
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div
                                onClick={() => setTypeEffet("PREAVIS")}
                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                    typeEffet === "PREAVIS"
                                        ? "border-amber-500 bg-amber-50/50"
                                        : "border-slate-200 bg-white"
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <Calendar size={16} className="text-amber-600" />
                                    <span className="text-xs font-black text-slate-900">Avec Préavis Standard (3 Mois)</span>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                    Conforme aux clauses contractuelles usuelles. L&apos;agence achève le mois en cours et organise la transition en douceur.
                                </p>
                            </div>

                            <div
                                onClick={() => setTypeEffet("IMMEDIAT")}
                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                    typeEffet === "IMMEDIAT"
                                        ? "border-rose-500 bg-rose-50/50"
                                        : "border-slate-200 bg-white"
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertTriangle size={16} className="text-rose-600" />
                                    <span className="text-xs font-black text-slate-900">Révocation Immédiate</span>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                    Résiliation immédiate (accord amiable entre les deux parties ou manquement grave). Fin immédiate des pouvoirs de l&apos;agence.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Commentaires facultatifs */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                            3. Précisions ou Message pour l&apos;Historique (Optionnel)
                        </label>
                        <textarea
                            rows={3}
                            value={commentaire}
                            onChange={(e) => setCommentaire(e.target.value)}
                            placeholder="Ex : Accord signé le 15 du mois pour reprise directe par le propriétaire..."
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-rose-500 focus:bg-white"
                        />
                    </div>

                    {/* Step 4: Mandatory acknowledgment checkbox */}
                    <div className="pt-2">
                        <label className="flex items-start gap-3 cursor-pointer bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                            <input
                                type="checkbox"
                                checked={hasConfirmed}
                                onChange={(e) => setHasConfirmed(e.target.checked)}
                                className="mt-0.5 rounded accent-rose-600 w-4 h-4"
                            />
                            <div className="text-xs text-slate-700 leading-snug">
                                <span className="font-black text-slate-900 block mb-0.5">
                                    Je confirme vouloir révoquer ce mandat de gérance
                                </span>
                                Je comprends que la procuration accordée à l&apos;agence prendra fin et que la responsabilité de gestion reviendra au propriétaire.
                            </div>
                        </label>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                        >
                            Annuler
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting || !hasConfirmed}
                            className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                        >
                            <ShieldAlert size={16} /> {isSubmitting ? "Révocation en cours..." : "Confirmer la Révocation du Mandat"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
