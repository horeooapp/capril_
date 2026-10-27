"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    FileSignature, Home, UserCheck, ShieldCheck, CheckCircle2, 
    X, DollarSign, Calendar, Clock, Wrench, BookOpen, 
    Phone, Mail, ArrowRight, ShieldAlert, Check, Printer, Edit3, AlertTriangle
} from "lucide-react"
import { toast } from "sonner"
import { signMandate, updateMandateStatus } from "@/actions/mandate-actions"

interface MandateDetailModalProps {
    mandate: any | null;
    onClose: () => void;
    onStatusChanged?: () => void;
    onEdit?: (mandate: any) => void;
    onRevoke?: (mandate: any) => void;
}

const MISSIONS_LABELS: Record<string, { label: string; desc: string }> = {
    RECHERCHE_LOCATAIRE: {
        label: "Recherche & Sélection des Locataires",
        desc: "Publicité, vérification des fiches de paie et pièces d'identité (KYC)."
    },
    REDACTION_BAIL: {
        label: "Rédaction du Bail & États des Lieux",
        desc: "Bail officiel conforme CCH, inventaire d'entrée et de sortie avec photos."
    },
    ENCAISSEMENT_LOYERS: {
        label: "Encaissement des Loyers & Quittances",
        desc: "Collecte mensuelle (Wave, OM, virement) et versement direct au propriétaire."
    },
    MAINTENANCE_TRAVAUX: {
        label: "Gestion des Pannes & Dépannages",
        desc: "Interventions d'artisans certifiés avec validation écrite des devis."
    },
    GESTION_IMPAYES: {
        label: "Protection & Recouvrement des Impayés",
        desc: "Relances amiables et gestion des procédures sans stress pour le propriétaire."
    },
    RAPPORT_GESTION: {
        label: "Relevé Mensuel & Aide Fiscale",
        desc: "Comptabilité claire des loyers et dépenses pour les déclarations d'impôt."
    }
}

export default function MandateDetailModal({
    mandate,
    onClose,
    onStatusChanged,
    onEdit,
    onRevoke
}: MandateDetailModalProps) {
    const [isLoading, setIsLoading] = useState(false)

    if (!mandate) return null

    const property = mandate.property || {}
    const owner = property.owner || {}
    const agent = mandate.agent || {}
    const isDraft = mandate.status === "DRAFT"
    const isActive = mandate.status === "ACTIVE" || mandate.status === "ACTIF"
    const isCancelled = mandate.status === "CANCELLED"
    const isSuspended = mandate.status === "SUSPENDED"

    const scopeList: string[] = Array.isArray(mandate.scope) && mandate.scope.length > 0
        ? mandate.scope
        : ["RECHERCHE_LOCATAIRE", "REDACTION_BAIL", "ENCAISSEMENT_LOYERS", "MAINTENANCE_TRAVAUX", "GESTION_IMPAYES"]

    const handleSign = async () => {
        setIsLoading(true)
        try {
            const res = await signMandate(mandate.id)
            if (res.success) {
                toast.success("Mandat signé avec succès ! Le bien est désormais sous gestion active.")
                if (onStatusChanged) onStatusChanged()
                onClose()
            } else {
                toast.error(res.error || "Erreur lors de la signature.")
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="fixed inset-0 z-[130] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div 
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 15 }}
                className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-3xl my-auto overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none"
            >
                {/* Header */}
                <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex justify-between items-center border-b border-slate-800 print:text-slate-900 print:bg-none">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-inner print:hidden">
                            <FileSignature size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-black text-white print:text-slate-900">
                                    Contrat de Mandat de Gérance
                                </h3>
                                <span className="text-xs font-mono font-bold text-amber-300 print:text-slate-600">
                                    • {mandate.mandateRef || mandate.id.substring(0, 8)}
                                </span>
                                {isActive ? (
                                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                                        Actif & En Vigueur
                                    </span>
                                ) : isDraft ? (
                                    <span className="bg-amber-500/20 text-amber-400 border border-amber-400/30 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                                        Brouillon en attente
                                    </span>
                                ) : isCancelled ? (
                                    <span className="bg-rose-500/20 text-rose-400 border border-rose-400/30 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                                        Mandat Révoqué
                                    </span>
                                ) : (
                                    <span className="bg-slate-500/20 text-slate-400 border border-slate-400/30 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                                        {mandate.status}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-300 font-medium mt-0.5 print:text-slate-500">
                                Formule : <strong className="text-amber-400 print:text-slate-900">{mandate.mandateType === "EXCLUSIVE" ? "Gestion Exclusive" : mandate.mandateType === "CO_EXCLUSIVE" ? "Gestion Co-Exclusive" : "Gestion Simple"}</strong> • Honoraires : <strong>{mandate.commissionPct}%</strong>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 print:hidden">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                            title="Imprimer ou exporter en PDF"
                        >
                            <Printer size={15} /> Imprimer
                        </button>
                        <button 
                            type="button"
                            onClick={onClose} 
                            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Cancellation Alert if Revoked */}
                    {isCancelled && (
                        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
                            <ShieldAlert className="text-rose-600 flex-shrink-0 mt-0.5" size={20} />
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-wider text-rose-900">
                                    Mandat Révoqué / Résilié
                                </h4>
                                <p className="text-xs text-rose-800 mt-1">
                                    Ce contrat a pris fin le{" "}
                                    <strong>
                                        {mandate.cancelledAt ? new Date(mandate.cancelledAt).toLocaleDateString('fr-FR') : "récemment"}
                                    </strong>.
                                    {mandate.cancelReason && (
                                        <span className="block mt-1 italic">
                                            Motif enregistré : &quot;{mandate.cancelReason}&quot;
                                        </span>
                                    )}
                                </p>
                                <p className="text-[11px] text-rose-600 mt-1.5">
                                    La gestion du logement a été basculée sous la responsabilité directe du propriétaire.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Property & Owner Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                                <Home size={14} className="text-amber-600" /> Le Bien Immobilier Confié
                            </div>
                            <p className="text-sm font-black text-slate-900">{property.name || property.address || "Adresse non précisée"}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {property.commune || "Abidjan"} • Code : <span className="font-mono font-bold text-slate-700">{property.propertyCode || "N/A"}</span>
                            </p>
                            {property.declaredRentFcfa && (
                                <p className="text-xs text-emerald-700 font-bold mt-1">
                                    Loyer indicatif : {property.declaredRentFcfa.toLocaleString()} FCFA/mois
                                </p>
                            )}
                        </div>

                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                                <UserCheck size={14} className="text-emerald-600" /> Le Mandant (Propriétaire / Bailleur)
                            </div>
                            <p className="text-sm font-black text-slate-900">
                                {owner.firstName || owner.lastName ? `${owner.firstName || ''} ${owner.lastName || ''}`.trim() : "Propriétaire enregistré"}
                            </p>
                            {owner.phone && (
                                <p className="text-xs text-slate-600 font-semibold flex items-center gap-1.5 mt-0.5">
                                    <Phone size={12} className="text-slate-400" /> {owner.phone}
                                </p>
                            )}
                            {owner.email && (
                                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                                    <Mail size={12} className="text-slate-400" /> {owner.email}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Financial Terms & Calendar */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4">
                        <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 mb-3 flex items-center gap-2">
                            <BookOpen size={14} /> Modalités Financières & Calendrier du Contrat
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div className="bg-white/90 p-3 rounded-xl border border-amber-200/60 shadow-2xs">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Honoraires</p>
                                <p className="text-base font-black text-slate-900 mt-0.5">{mandate.commissionPct}%</p>
                                <p className="text-[10px] text-slate-500">du loyer mensuel encaissé</p>
                            </div>
                            <div className="bg-white/90 p-3 rounded-xl border border-amber-200/60 shadow-2xs">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date Début</p>
                                <p className="text-xs font-black text-slate-900 mt-1">
                                    {mandate.startDate ? new Date(mandate.startDate).toLocaleDateString('fr-FR') : "Immédiat"}
                                </p>
                            </div>
                            <div className="bg-white/90 p-3 rounded-xl border border-amber-200/60 shadow-2xs">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Échéance</p>
                                <p className="text-xs font-black text-slate-900 mt-1">
                                    {mandate.endDate ? new Date(mandate.endDate).toLocaleDateString('fr-FR') : "1 an renouvelable"}
                                </p>
                            </div>
                            <div className="bg-white/90 p-3 rounded-xl border border-amber-200/60 shadow-2xs">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Résiliation</p>
                                <p className="text-xs font-black text-slate-900 mt-1">Préavis 3 mois</p>
                                <p className="text-[10px] text-slate-500">Sans pénalité</p>
                            </div>
                        </div>
                    </div>

                    {/* Missions delegated */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-3">
                            Missions prises en charge par le mandataire ({scopeList.length})
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {scopeList.map((mKey: string) => {
                                const info = MISSIONS_LABELS[mKey] || { label: mKey, desc: "Mission contractuelle enregistrée" }
                                return (
                                    <div key={mKey} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-start gap-2.5">
                                        <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-black text-slate-800">{info.label}</p>
                                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">{info.desc}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                        Fermer
                    </button>

                    <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
                        {isDraft && (
                            <button
                                type="button"
                                onClick={handleSign}
                                disabled={isLoading}
                                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                            >
                                <Check size={16} /> Signer le Mandat
                            </button>
                        )}

                        {/* Edit Button */}
                        <button
                            type="button"
                            onClick={() => {
                                onClose()
                                if (onEdit) onEdit(mandate)
                            }}
                            className="px-4 py-2.5 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-2xs"
                        >
                            <Edit3 size={14} /> Modifier
                        </button>

                        {/* Revoke Button (only if not cancelled) */}
                        {!isCancelled && (
                            <button
                                type="button"
                                onClick={() => {
                                    onClose()
                                    if (onRevoke) onRevoke(mandate)
                                }}
                                className="px-4 py-2.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-800 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-2xs"
                            >
                                <ShieldAlert size={14} /> Révoquer
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
