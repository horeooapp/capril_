"use client"

import React, { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    FileSignature, Home, UserCheck, ShieldCheck, CheckCircle2, 
    AlertCircle, HelpCircle, ArrowRight, ArrowLeft, X, Sparkles, 
    Calendar, DollarSign, Building2, Phone, Mail, Award, Check,
    Info, BookOpen, Clock, Wrench, ShieldAlert, Edit3
} from "lucide-react"
import { toast } from "sonner"
import { updateMandate, UpdateMandateInput } from "@/actions/mandate-actions"
import { MandateType, MandateStatus } from "@prisma/client"

interface EditMandateModalProps {
    isOpen: boolean;
    onClose: () => void;
    mandate: any | null;
    onMandateUpdated?: () => void;
}

const FORMULES_MANDAT = [
    {
        type: "SIMPLE" as MandateType,
        title: "Gestion Simple",
        subtitle: "Sans engagement d'exclusivité",
        badge: "Flexibilité maximale",
        badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
        description: "Vous confiez la gestion à l'agence tout en gardant le droit de trouver vous-même un locataire ou de faire appel à d'autres professionnels.",
        caution: "Honoraires dus uniquement si l'agence trouve le locataire ou gère le bien."
    },
    {
        type: "EXCLUSIVE" as MandateType,
        title: "Gestion Exclusive",
        subtitle: "Service VIP 100% Dédié • Recommandé",
        badge: "Recommandé • Sérénité Absolue",
        badgeColor: "bg-amber-50 text-amber-800 border-amber-300 font-black",
        description: "L'agence s'engage à 100% sur votre bien avec un plan de publicité prioritaire. Vous avez un seul interlocuteur responsable qui gère tout de A à Z.",
        caution: "Vous vous engagez à ne pas confier le bien à une autre agence pendant la durée convenue."
    },
    {
        type: "CO_EXCLUSIVE" as MandateType,
        title: "Gestion Co-Exclusive",
        subtitle: "Partenariat entre deux agences",
        badge: "Équipe de deux",
        badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
        description: "Le bien est confié à deux agences partenaires qui collaborent en synergie pour accélérer la recherche du locataire idéal.",
        caution: "Nécessite une coordination entre les deux gestionnaires partenaires."
    }
]

const MISSIONS_OPTIONS = [
    {
        id: "RECHERCHE_LOCATAIRE",
        label: "Recherche & Vérification rigoureuse du locataire",
        desc: "Publicité de l'annonce, visites accompagnées, contrôle des fiches de paie, pièces d'identité (KYC) et solvabilité.",
        icon: <UserCheck className="text-blue-500" size={18} />
    },
    {
        id: "REDACTION_BAIL",
        label: "Rédaction du Bail & État des Lieux certifié",
        desc: "Bail d'habitation conforme aux normes CCH, inventaire contradictoire d'entrée et de sortie avec photos datées.",
        icon: <FileSignature className="text-emerald-500" size={18} />
    },
    {
        id: "ENCAISSEMENT_LOYERS",
        label: "Encaissement des Loyers & Quittances instantanées",
        desc: "Collecte mensuelle par Wave, Orange Money ou virement, quittances électroniques certifiées et reversement au propriétaire.",
        icon: <DollarSign className="text-amber-500" size={18} />
    },
    {
        id: "MAINTENANCE_TRAVAUX",
        label: "Gestion des Pannes & Petits Travaux sans tracas",
        desc: "Intervention des artisans certifiés QAPRIL pour plomberie, électricité et urgences courantes.",
        icon: <Wrench className="text-rose-500" size={18} />
    },
    {
        id: "GESTION_IMPAYES",
        label: "Relances & Protection contre les Impayés",
        desc: "Rappels automatiques par SMS/WhatsApp, relances amiables immédiates et assistance juridique si nécessaire.",
        icon: <ShieldCheck className="text-indigo-500" size={18} />
    },
    {
        id: "RAPPORT_GESTION",
        label: "Relevé Mensuel & Déclarations Fiscales Facilitées",
        desc: "Comptabilité claire des loyers et dépenses pour vos déclarations d'impôt foncier.",
        icon: <BookOpen className="text-purple-500" size={18} />
    }
]

export default function EditMandateModal({
    isOpen,
    onClose,
    mandate,
    onMandateUpdated
}: EditMandateModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [activeTab, setActiveTab] = useState<"formule" | "honoraires" | "missions" | "duree">("formule")

    // Form fields
    const [mandateType, setMandateType] = useState<MandateType>("EXCLUSIVE")
    const [commissionPct, setCommissionPct] = useState<number>(8)
    const [commissionFixed, setCommissionFixed] = useState<number | null>(null)
    const [startDate, setStartDate] = useState<string>("")
    const [endDate, setEndDate] = useState<string>("")
    const [taciteReconduction, setTaciteReconduction] = useState(true)
    const [selectedMissions, setSelectedMissions] = useState<string[]>([])
    const [mandateStatus, setMandateStatus] = useState<MandateStatus>("ACTIVE")

    // Initialize with mandate data when opened
    useEffect(() => {
        if (mandate) {
            setMandateType(mandate.mandateType || "EXCLUSIVE")
            setCommissionPct(mandate.commissionPct !== null && mandate.commissionPct !== undefined ? Number(mandate.commissionPct) : 8)
            setCommissionFixed(mandate.commissionFixed ? Number(mandate.commissionFixed) : null)
            
            if (mandate.startDate) {
                const d = new Date(mandate.startDate)
                setStartDate(d.toISOString().split("T")[0])
            } else {
                setStartDate(new Date().toISOString().split("T")[0])
            }

            if (mandate.endDate) {
                const d = new Date(mandate.endDate)
                setEndDate(d.toISOString().split("T")[0])
                setTaciteReconduction(false)
            } else {
                setEndDate("")
                setTaciteReconduction(true)
            }

            if (Array.isArray(mandate.scope) && mandate.scope.length > 0) {
                setSelectedMissions(mandate.scope)
            } else {
                setSelectedMissions(MISSIONS_OPTIONS.map(m => m.id))
            }

            setMandateStatus(mandate.status || "ACTIVE")
        }
    }, [mandate])

    if (!isOpen || !mandate) return null

    const property = mandate.property || {}
    const owner = property.owner || {}
    const rentAmount = property.declaredRentFcfa || 200000

    // Computed fees preview
    const fraisGestionMensuels = Math.round((rentAmount * commissionPct) / 100)
    const netProprietaire = rentAmount - fraisGestionMensuels

    const toggleMission = (id: string) => {
        if (selectedMissions.includes(id)) {
            if (selectedMissions.length === 1) {
                toast.warning("Vous devez sélectionner au moins une mission pour le mandat.")
                return
            }
            setSelectedMissions(selectedMissions.filter(m => m !== id))
        } else {
            setSelectedMissions([...selectedMissions, id])
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const input: UpdateMandateInput = {
                mandateId: mandate.id,
                mandateType,
                commissionPct,
                commissionFixed: commissionFixed ? Number(commissionFixed) : null,
                startDate,
                endDate: taciteReconduction ? null : (endDate || null),
                scope: selectedMissions,
                status: mandateStatus
            }

            const res = await updateMandate(input)

            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success("Le mandat a été modifié et mis à jour avec succès !")
                if (onMandateUpdated) onMandateUpdated()
                onClose()
            }
        } catch (err: any) {
            toast.error("Erreur lors de la modification du mandat : " + (err?.message || "Veuillez réessayer."))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[140] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div 
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 15 }}
                className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-3xl my-auto overflow-hidden flex flex-col max-h-[92vh]"
            >
                {/* Header */}
                <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex justify-between items-center border-b border-indigo-900/40">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-inner">
                            <Edit3 size={22} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-black text-white">
                                    Modifier le Mandat de Gérance
                                </h3>
                                <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full font-mono">
                                    {mandate.mandateRef || mandate.id.substring(0, 8)}
                                </span>
                            </div>
                            <p className="text-xs text-indigo-200 font-medium mt-0.5">
                                Bien : <strong>{property.name || property.address || "Bien sans adresse"}</strong> ({property.commune || "Abidjan"})
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

                {/* Navigation Tabs */}
                <div className="px-6 pt-3 bg-slate-50 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTab("formule")}
                        className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-t-xl transition-all border-b-2 ${
                            activeTab === "formule"
                                ? "bg-white text-slate-900 border-amber-500 shadow-2xs"
                                : "text-slate-500 hover:text-slate-800 border-transparent"
                        }`}
                    >
                        1. Formule de Gérance
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("honoraires")}
                        className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-t-xl transition-all border-b-2 ${
                            activeTab === "honoraires"
                                ? "bg-white text-slate-900 border-amber-500 shadow-2xs"
                                : "text-slate-500 hover:text-slate-800 border-transparent"
                        }`}
                    >
                        2. Honoraires & Frais ({commissionPct}%)
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("missions")}
                        className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-t-xl transition-all border-b-2 ${
                            activeTab === "missions"
                                ? "bg-white text-slate-900 border-amber-500 shadow-2xs"
                                : "text-slate-500 hover:text-slate-800 border-transparent"
                        }`}
                    >
                        3. Missions ({selectedMissions.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("duree")}
                        className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-t-xl transition-all border-b-2 ${
                            activeTab === "duree"
                                ? "bg-white text-slate-900 border-amber-500 shadow-2xs"
                                : "text-slate-500 hover:text-slate-800 border-transparent"
                        }`}
                    >
                        4. Durée & Statut
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* TAB 1: FORMULE DE GÉRANCE */}
                    {activeTab === "formule" && (
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-black text-slate-900 mb-1">
                                    Choisissez le type d&apos;engagement pour ce mandat
                                </h4>
                                <p className="text-xs text-slate-500">
                                    Définissez si l&apos;agence a l&apos;exclusivité totale de la gestion ou si le propriétaire conserve sa liberté de commercialiser le bien.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {FORMULES_MANDAT.map(f => {
                                    const isSelected = mandateType === f.type
                                    return (
                                        <div
                                            key={f.type}
                                            onClick={() => setMandateType(f.type)}
                                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                                isSelected
                                                    ? "border-amber-500 bg-amber-50/40 shadow-sm"
                                                    : "border-slate-200 hover:border-slate-300 bg-white"
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-black text-sm text-slate-900">{f.title}</span>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${f.badgeColor}`}>
                                                            {f.badge}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs font-bold text-amber-700 mt-0.5">{f.subtitle}</p>
                                                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{f.description}</p>
                                                    <p className="text-[11px] text-slate-400 mt-2 italic flex items-center gap-1">
                                                        <Info size={12} className="text-amber-500 flex-shrink-0" />
                                                        {f.caution}
                                                    </p>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all ${
                                                    isSelected ? "border-amber-500 bg-amber-500 text-white" : "border-slate-300"
                                                }`}>
                                                    {isSelected && <Check size={14} />}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* TAB 2: HONORAIRES & CALCULATEUR */}
                    {activeTab === "honoraires" && (
                        <div className="space-y-5">
                            <div>
                                <h4 className="text-sm font-black text-slate-900 mb-1">
                                    Honoraires de Gestion Locative
                                </h4>
                                <p className="text-xs text-slate-500">
                                    Le taux légal est généralement compris entre 7% et 10% (plafond légal de 15% selon les usages en Côte d&apos;Ivoire).
                                </p>
                            </div>

                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                                            <DollarSign size={14} className="text-amber-500" /> Taux de Commission (%)
                                        </label>
                                        <span className="text-lg font-black text-amber-600 font-mono bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                                            {commissionPct}%
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="3"
                                        max="15"
                                        step="0.5"
                                        value={commissionPct}
                                        onChange={(e) => setCommissionPct(parseFloat(e.target.value))}
                                        className="w-full accent-amber-500 h-2 bg-slate-200 rounded-lg cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1">
                                        <span>3% (Gestion allégée)</span>
                                        <span>8% (Taux standard recommandé)</span>
                                        <span>15% (Plafond légal)</span>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-200/80">
                                    <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5">
                                        Commission Fixe Forfaitaire Mensuelle (Optionnelle)
                                    </label>
                                    <input
                                        type="number"
                                        value={commissionFixed || ""}
                                        onChange={(e) => setCommissionFixed(e.target.value ? Number(e.target.value) : null)}
                                        placeholder="Ex: 0 ou 10000 XOF"
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Laissez vide si vous appliquez uniquement le pourcentage sur le loyer encaissé.
                                    </p>
                                </div>
                            </div>

                            {/* Simulation Card */}
                            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/60 rounded-2xl p-4">
                                <p className="text-xs font-black uppercase tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
                                    <Sparkles size={14} className="text-amber-500" /> Simulation sur le loyer indicatif du bien ({rentAmount.toLocaleString()} XOF/mois)
                                </p>
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Honoraires Agence</p>
                                        <p className="text-base font-black text-amber-600 mt-0.5">
                                            {fraisGestionMensuels.toLocaleString()} XOF
                                        </p>
                                        <p className="text-[10px] text-slate-400">par mois encaissé</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Net Reversé au Propriétaire</p>
                                        <p className="text-base font-black text-emerald-600 mt-0.5">
                                            {netProprietaire.toLocaleString()} XOF
                                        </p>
                                        <p className="text-[10px] text-slate-400">versé directement</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: MISSIONS DÉLÉGUÉES */}
                    {activeTab === "missions" && (
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-black text-slate-900 mb-1">
                                    Missions confiées au gestionnaire
                                </h4>
                                <p className="text-xs text-slate-500">
                                    Cochez les tâches que l&apos;agence prend en charge dans le cadre de ce contrat.
                                </p>
                            </div>

                            <div className="space-y-2.5">
                                {MISSIONS_OPTIONS.map(m => {
                                    const isChecked = selectedMissions.includes(m.id)
                                    return (
                                        <div
                                            key={m.id}
                                            onClick={() => toggleMission(m.id)}
                                            className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                                                isChecked
                                                    ? "bg-slate-50 border-amber-400 shadow-2xs"
                                                    : "bg-white border-slate-200 opacity-60 hover:opacity-100"
                                            }`}
                                        >
                                            <div className="mt-0.5 flex-shrink-0">
                                                {m.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black text-slate-900">{m.label}</p>
                                                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{m.desc}</p>
                                            </div>
                                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                                                isChecked ? "bg-amber-500 border-amber-500 text-white" : "border-slate-300 bg-white"
                                            }`}>
                                                {isChecked && <Check size={12} />}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* TAB 4: DURÉE & STATUT */}
                    {activeTab === "duree" && (
                        <div className="space-y-5">
                            <div>
                                <h4 className="text-sm font-black text-slate-900 mb-1">
                                    Durée du Mandat & Statut Contractuel
                                </h4>
                                <p className="text-xs text-slate-500">
                                    Précisez la date de début et la formule de reconduction du contrat de gérance.
                                </p>
                            </div>

                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5">
                                            Date de Prise d&apos;Effet (Début)
                                        </label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5">
                                            Statut Actuel du Mandat
                                        </label>
                                        <select
                                            value={mandateStatus}
                                            onChange={(e) => setMandateStatus(e.target.value as MandateStatus)}
                                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                                        >
                                            <option value="ACTIVE">Actif & En Vigueur</option>
                                            <option value="DRAFT">Brouillon (En attente de signature)</option>
                                            <option value="SUSPENDED">Suspendu temporairement</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-200/80">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={taciteReconduction}
                                            onChange={(e) => setTaciteReconduction(e.target.checked)}
                                            className="mt-0.5 rounded accent-amber-500 w-4 h-4"
                                        />
                                        <div>
                                            <span className="text-xs font-black text-slate-800 block">
                                                Renouvellement automatique chaque année (Tacite reconduction)
                                            </span>
                                            <span className="text-[11px] text-slate-500">
                                                Le mandat se prolonge d&apos;année en année automatiquement. Les deux parties peuvent y mettre fin à chaque date d&apos;anniversaire avec un préavis de 3 mois.
                                            </span>
                                        </div>
                                    </label>
                                </div>

                                {!taciteReconduction && (
                                    <div className="pt-2 animate-in fade-in duration-200">
                                        <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5">
                                            Date de Fin Précise
                                        </label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                                <ShieldCheck className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                                <p className="text-xs text-blue-900 leading-relaxed">
                                    <strong>Conformité juridique :</strong> Toute modification apportée au mandat mettra à jour l&apos;historique officiel et restera consultable à tout moment par le propriétaire et l&apos;agence.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                        >
                            Annuler
                        </button>

                        <div className="flex items-center gap-2">
                            {activeTab !== "duree" ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (activeTab === "formule") setActiveTab("honoraires")
                                        else if (activeTab === "honoraires") setActiveTab("missions")
                                        else if (activeTab === "missions") setActiveTab("duree")
                                    }}
                                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5"
                                >
                                    Suivant <ArrowRight size={14} />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Check size={16} /> {isSubmitting ? "Enregistrement..." : "Enregistrer les Modifications"}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
