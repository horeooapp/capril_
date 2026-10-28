"use client"

import React, { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    FileSignature, Home, UserCheck, ShieldCheck, CheckCircle2, 
    AlertCircle, HelpCircle, ArrowRight, ArrowLeft, X, Sparkles, 
    Calendar, DollarSign, Building2, Phone, Mail, Award, Check,
    Info, BookOpen, Clock, KeyRound, Wrench, ShieldAlert
} from "lucide-react"
import { toast } from "sonner"
import { createMandate, CreateMandateInput } from "@/actions/mandate-actions"
import { MandateType } from "@prisma/client"

interface CreateMandateModalProps {
    isOpen: boolean;
    onClose: () => void;
    properties: any[];
    onMandateCreated?: () => void;
}

const FORMULES_MANDAT = [
    {
        type: "SIMPLE" as MandateType,
        title: "Gestion Simple",
        subtitle: "Liberté totale & Sans engagement d'exclusivité",
        badge: "Flexibilité maximale",
        badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
        description: "Vous confiez la gestion à l'agence tout en gardant le droit de trouver vous-même un locataire ou de faire appel à d'autres professionnels.",
        pros: [
            "Aucune exclusivité : vous restez 100% libre",
            "Possibilité de louer par vous-même sans payer de frais",
            "Idéal pour tester les services de l'agence"
        ],
        caution: "Moins de budget publicitaire investi par l'agence car sans garantie d'exclusivité."
    },
    {
        type: "EXCLUSIVE" as MandateType,
        title: "Gestion Exclusive",
        subtitle: "Service VIP 100% Dédié • Recommandé",
        badge: "Recommandé • Sérénité Absolue",
        badgeColor: "bg-amber-50 text-amber-800 border-amber-300 font-black",
        description: "L'agence s'engage à 100% sur votre bien avec un plan de publicité prioritaire. Vous avez un seul interlocuteur responsable qui gère tout de A à Z.",
        pros: [
            "Bien loué 2 à 3 fois plus vite (diffusion prioritaire)",
            "Dossiers de locataires triés sur le volet avec vérification stricte",
            "Un seul interlocuteur dédié responsable de votre patrimoine"
        ],
        caution: "Vous vous engagez à ne pas confier le bien à une autre agence pendant la durée convenue."
    },
    {
        type: "CO_EXCLUSIVE" as MandateType,
        title: "Gestion Co-Exclusive",
        subtitle: "Partenariat entre deux agences",
        badge: "Équipe de deux",
        badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
        description: "Le bien est confié à deux agences partenaires qui collaborent en synergie pour accélérer la recherche du locataire idéal.",
        pros: [
            "Deux réseaux complémentaires d'acheteurs ou de locataires",
            "Maintien d'un cadre contractuel clair et coordonné"
        ],
        caution: "Nécessite une bonne coordination entre les deux gestionnaires."
    }
]

const MISSIONS_OPTIONS = [
    {
        id: "RECHERCHE_LOCATAIRE",
        label: "Recherche & Vérification rigoureuse du locataire",
        desc: "Publicité de l'annonce, visites accompagnées, contrôle des bulletins de salaire, pièces d'identité (KYC) et solvabilité financière.",
        icon: <UserCheck className="text-blue-500" size={18} />,
        defaultChecked: true
    },
    {
        id: "REDACTION_BAIL",
        label: "Rédaction du Bail & État des Lieux certifié",
        desc: "Contrat de bail conforme aux lois ivoiriennes, inventaire contradictoire d'entrée et de sortie avec reportage photos daté.",
        icon: <FileSignature className="text-emerald-500" size={18} />,
        defaultChecked: true
    },
    {
        id: "ENCAISSEMENT_LOYERS",
        label: "Encaissement des Loyers & Quittances instantanées",
        desc: "Collecte mensuelle par Wave, Orange Money ou virement, émission des quittances officielles avec QR Code, virement automatique sur votre compte.",
        icon: <DollarSign className="text-amber-500" size={18} />,
        defaultChecked: true
    },
    {
        id: "MAINTENANCE_TRAVAUX",
        label: "Gestion des Pannes & Petits Travaux sans tracas",
        desc: "Coordination des artisans agréés QAPRIL (plombiers, électriciens). Demande systématique de votre accord écrit pour tout devis dépassant un plafond fixé.",
        icon: <Wrench className="text-rose-500" size={18} />,
        defaultChecked: true
    },
    {
        id: "GESTION_IMPAYES",
        label: "Relances & Protection contre les Impayés",
        desc: "Rappels automatiques par SMS/WhatsApp avant échéance, relances amiables immédiates en cas de retard et gestion des démarches d'huissier.",
        icon: <ShieldCheck className="text-indigo-500" size={18} />,
        defaultChecked: true
    },
    {
        id: "RAPPORT_GESTION",
        label: "Relevé Mensuel & Déclarations Fiscales Facilitées",
        desc: "Rapport comptable mensuel clair récapitulant chaque loyer perçu et chaque dépense déduite, prêt pour vos déclarations d'impôt foncier.",
        icon: <BookOpen className="text-purple-500" size={18} />,
        defaultChecked: true
    }
]

export default function CreateMandateModal({
    isOpen,
    onClose,
    properties = [],
    onMandateCreated
}: CreateMandateModalProps) {
    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showFAQ, setShowFAQ] = useState(false)

    // Form State
    const [selectedPropertyId, setSelectedPropertyId] = useState("")
    const [mandateType, setMandateType] = useState<MandateType>("EXCLUSIVE")
    const [commissionPct, setCommissionPct] = useState<number>(8)
    const [customRentFcfa, setCustomRentFcfa] = useState<number>(0)
    const [selectedMissions, setSelectedMissions] = useState<string[]>(
        MISSIONS_OPTIONS.map(m => m.id)
    )
    const [durationYears, setDurationYears] = useState(1)
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
    const [taciteReconduction, setTaciteReconduction] = useState(true)
    const [preavisMois, setPreavisMois] = useState(3)
    const [seuilTravauxAccord, setSeuilTravauxAccord] = useState(30000)

    // Find currently selected property
    const selectedProperty = useMemo(() => {
        return properties.find(p => p.id === selectedPropertyId) || null
    }, [properties, selectedPropertyId])

    // Compute active rent for simulator
    const activeRent = useMemo(() => {
        if (customRentFcfa > 0) return customRentFcfa
        if (selectedProperty?.declaredRentFcfa) return selectedProperty.declaredRentFcfa
        return 200000 // default fallback for demonstration
    }, [customRentFcfa, selectedProperty])

    // Compute fee breakdown
    const fraisGestionMensuels = useMemo(() => {
        return Math.round((activeRent * commissionPct) / 100)
    }, [activeRent, commissionPct])

    const revenuNetProprietaire = useMemo(() => {
        return Math.max(0, activeRent - fraisGestionMensuels)
    }, [activeRent, fraisGestionMensuels])

    // Calculate End Date
    const endDate = useMemo(() => {
        if (!startDate) return ""
        const d = new Date(startDate)
        d.setFullYear(d.getFullYear() + durationYears)
        return d.toISOString().split('T')[0]
    }, [startDate, durationYears])

    if (!isOpen) return null

    const handleMissionToggle = (id: string) => {
        setSelectedMissions(prev => 
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedPropertyId) {
            toast.error("Veuillez sélectionner un bien immobilier à confier en gestion.")
            setCurrentStep(1)
            return
        }

        if (commissionPct < 0 || commissionPct > 15) {
            toast.error("La commission doit être comprise entre 0% et 15% (plafond légal).")
            setCurrentStep(4)
            return
        }

        setIsSubmitting(true)
        try {
            const res = await createMandate({
                propertyId: selectedPropertyId,
                mandateType,
                commissionPct: Number(commissionPct),
                startDate,
                endDate,
                scope: selectedMissions,
                taciteReconduction,
                seuilTravauxSansAccord: seuilTravauxAccord
            })

            if (res.success) {
                toast.success(`Mandat ${res.mandateRef || ""} créé avec succès ! Le propriétaire recevra une notification de signature.`)
                if (onMandateCreated) onMandateCreated()
                onClose()
            } else {
                toast.error(res.error || "Impossible de créer le mandat.")
            }
        } catch (err: any) {
            toast.error(err?.message || "Une erreur inattendue est survenue.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[130] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div 
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 15 }}
                className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-4xl my-auto overflow-hidden flex flex-col max-h-[92vh]"
            >
                {/* Header */}
                <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex justify-between items-center border-b border-slate-800">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-inner">
                            <FileSignature size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                                Nouveau Mandat de Gestion Locative
                            </h2>
                            <p className="text-xs text-slate-300 font-medium mt-0.5">
                                Accord officiel de gérance entre le propriétaire et l&apos;agence • Rédigé en termes clairs
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            type="button"
                            onClick={() => setShowFAQ(!showFAQ)}
                            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-200 hover:text-white transition-all flex items-center gap-1.5 border border-white/10"
                        >
                            <HelpCircle size={14} /> Questions Fréquentes
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

                {/* FAQ Drawer */}
                <AnimatePresence>
                    {showFAQ && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-indigo-950 text-white p-5 border-b border-indigo-900 overflow-hidden text-xs"
                        >
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                                    <BookOpen size={14} /> Guide du Visiteur : Tout comprendre sur le mandat
                                </h4>
                                <button onClick={() => setShowFAQ(false)} className="text-slate-400 hover:text-white">
                                    <X size={14} />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                                    <p className="font-bold text-white mb-1">1. Qu&apos;est-ce qu&apos;un mandat ?</p>
                                    <p className="text-slate-300 leading-relaxed">
                                        C&apos;est une procuration légale par laquelle le propriétaire donne pouvoir à l&apos;agence de chercher un locataire, signer le bail, collecter les loyers et gérer les pannes à sa place. Le propriétaire reste propriétaire à 100%.
                                    </p>
                                </div>
                                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                                    <p className="font-bold text-white mb-1">2. Comment suis-je payé ?</p>
                                    <p className="text-slate-300 leading-relaxed">
                                        Dès que le locataire paie son loyer sur QAPRIL, les frais de gestion convenus sont automatiquement déduits et le reste vous est immédiatement transféré sur votre compte bancaire ou Mobile Money (Wave, OM, MTN).
                                    </p>
                                </div>
                                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                                    <p className="font-bold text-white mb-1">3. Comment arrêter le contrat ?</p>
                                    <p className="text-slate-300 leading-relaxed">
                                        Le contrat est signé pour 1, 2 ou 3 ans. Vous pouvez y mettre fin à chaque date d&apos;anniversaire avec un préavis écrit simple de 3 mois, sans pénalité ni justification compliquée.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stepper Bar */}
                <div className="bg-slate-50 px-6 py-3 border-b border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
                        {[
                            { num: 1, title: "1. Le Logement", desc: "Bien & Propriétaire" },
                            { num: 2, title: "2. La Formule", desc: "Simple ou Exclusif" },
                            { num: 3, title: "3. Les Missions", desc: "Ce que fait l'agence" },
                            { num: 4, title: "4. Honoraires", desc: "Tarifs & Validation" },
                        ].map((s) => (
                            <button
                                key={s.num}
                                type="button"
                                onClick={() => setCurrentStep(s.num)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-left transition-all ${
                                    currentStep === s.num 
                                        ? "bg-slate-900 text-white shadow-sm font-bold" 
                                        : currentStep > s.num
                                        ? "text-emerald-700 font-semibold bg-emerald-50 hover:bg-emerald-100"
                                        : "text-slate-400 hover:text-slate-600 font-medium"
                                }`}
                            >
                                <span className={`w-6 h-6 rounded-lg text-xs flex items-center justify-center font-bold ${
                                    currentStep === s.num 
                                        ? "bg-amber-400 text-slate-950" 
                                        : currentStep > s.num
                                        ? "bg-emerald-500 text-white"
                                        : "bg-slate-200 text-slate-600"
                                }`}>
                                    {currentStep > s.num ? <Check size={14} /> : s.num}
                                </span>
                                <div className="hidden sm:block">
                                    <p className="text-xs leading-none">{s.title}</p>
                                    <p className="text-[10px] opacity-75 mt-0.5">{s.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest hidden md:inline">
                        Étape {currentStep} / 4
                    </span>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* STEP 1: Choisir le Bien et le Propriétaire */}
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3">
                                <Info size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-900">
                                        Quel bien immobilier confiez-vous en gérance ?
                                    </h4>
                                    <p className="text-xs text-amber-800 font-medium mt-1 leading-relaxed">
                                        Sélectionnez la maison, l&apos;appartement ou l&apos;immeuble concerné. Les coordonnées du propriétaire seront automatiquement rattachées au contrat pour la signature électronique.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-2">
                                    Sélectionnez le bien immobilier <span className="text-rose-500">*</span>
                                </label>
                                <select 
                                    required
                                    value={selectedPropertyId}
                                    onChange={(e) => setSelectedPropertyId(e.target.value)}
                                    className="w-full p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-all shadow-sm"
                                >
                                    <option value="">-- Choisissez un bien dans la liste --</option>
                                    {properties.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.propertyCode ? `[${p.propertyCode}] ` : ""}{p.name ? `${p.name} - ` : ""}{p.address || "Adresse non précisée"} {p.commune ? `(${p.commune})` : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Preview of Selected Property & Owner */}
                            {selectedProperty ? (
                                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/90 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                                                <Home size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-900">
                                                    {selectedProperty.name || selectedProperty.address}
                                                </h4>
                                                <p className="text-xs text-slate-500 font-medium">
                                                    {selectedProperty.commune || "Abidjan"} • Code: <span className="font-mono font-bold text-slate-700">{selectedProperty.propertyCode}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
                                            Prêt pour Mandat
                                        </span>
                                    </div>

                                    {/* Owner Card */}
                                    <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                                Propriétaire (Bailleur)
                                            </p>
                                            <p className="text-sm font-black text-slate-800">
                                                {selectedProperty.owner 
                                                    ? `${selectedProperty.owner.firstName || ''} ${selectedProperty.owner.lastName || ''}`.trim() || 'Propriétaire Enregistré'
                                                    : 'Compte Propriétaire Associé'}
                                            </p>
                                            {selectedProperty.owner?.phone && (
                                                <p className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 mt-1">
                                                    <Phone size={12} className="text-slate-400" /> {selectedProperty.owner.phone}
                                                </p>
                                            )}
                                            {selectedProperty.owner?.email && (
                                                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5 truncate">
                                                    <Mail size={12} className="text-slate-400" /> {selectedProperty.owner.email}
                                                </p>
                                            )}
                                        </div>

                                        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                                    Loyer Mensuel Estimé (XOF)
                                                </p>
                                                <p className="text-base font-black text-slate-900">
                                                    {Number(selectedProperty.declaredRentFcfa || 0).toLocaleString('fr-FR')} XOF / mois
                                                </p>
                                            </div>
                                            <p className="text-[11px] text-slate-400 font-medium mt-1">
                                                Sert de base de calcul pour la simulation d&apos;honoraires.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                                    <Home size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-xs font-semibold">Veuillez sélectionner un bien ci-dessus pour afficher ses informations.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2: Formule de Mandat (Simple vs Exclusif) */}
                    {currentStep === 2 && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-1">
                                    Choisissez la Formule de Gestion
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">
                                    Chaque formule définit vos droits et les engagements de l&apos;agence. Tout est expliqué en langage direct.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {FORMULES_MANDAT.map(f => {
                                    const isSelected = mandateType === f.type
                                    return (
                                        <div
                                            key={f.type}
                                            onClick={() => setMandateType(f.type)}
                                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between relative ${
                                                isSelected 
                                                    ? "border-amber-500 bg-amber-50/30 shadow-md" 
                                                    : "border-slate-200 hover:border-slate-300 bg-white"
                                            }`}
                                        >
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${f.badgeColor}`}>
                                                        {f.badge}
                                                    </span>
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                                        isSelected ? "bg-amber-500 border-amber-500 text-white" : "border-slate-300"
                                                    }`}>
                                                        {isSelected && <Check size={12} />}
                                                    </div>
                                                </div>

                                                <h4 className="text-base font-black text-slate-900 mb-1">
                                                    {f.title}
                                                </h4>
                                                <p className="text-xs font-bold text-amber-700 mb-3">
                                                    {f.subtitle}
                                                </p>
                                                <p className="text-xs text-slate-600 mb-4 leading-relaxed font-medium">
                                                    {f.description}
                                                </p>

                                                <div className="space-y-2 pt-3 border-t border-slate-100">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ce que vous gagnez :</p>
                                                    {f.pros.map((pro, i) => (
                                                        <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700 font-medium">
                                                            <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                                                            <span>{pro}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50/50 p-2.5 rounded-xl">
                                                <p className="text-[10.5px] text-slate-500 font-medium italic">
                                                    ⚠️ {f.caution}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Les Missions Confiées à l'Agence */}
                    {currentStep === 3 && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-1">
                                        Que doit faire l&apos;agence pour vous au quotidien ?
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium">
                                        Cochez les tâches prises en charge. Tout est transparent et consigné dans le contrat.
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        type="button"
                                        onClick={() => setSelectedMissions(MISSIONS_OPTIONS.map(m => m.id))}
                                        className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 transition-colors"
                                    >
                                        Tout cocher (Formule Complète)
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {MISSIONS_OPTIONS.map(m => {
                                    const isChecked = selectedMissions.includes(m.id)
                                    return (
                                        <div 
                                            key={m.id}
                                            onClick={() => handleMissionToggle(m.id)}
                                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                                                isChecked 
                                                    ? "border-amber-400 bg-amber-50/20" 
                                                    : "border-slate-200 bg-slate-50 opacity-60"
                                            }`}
                                        >
                                            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                                                {m.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <h4 className="text-xs font-black text-slate-900">{m.label}</h4>
                                                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                                                        isChecked ? "bg-amber-500 border-amber-500 text-white" : "border-slate-300 bg-white"
                                                    }`}>
                                                        {isChecked && <Check size={11} />}
                                                    </div>
                                                </div>
                                                <p className="text-[11.5px] text-slate-600 font-medium leading-relaxed">
                                                    {m.desc}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Spending Limit for Maintenance without Prior Approval */}
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div>
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                                        Plafond d&apos;urgence travaux sans accord préalable
                                    </h4>
                                    <p className="text-xs text-slate-500 font-medium">
                                        Pour une petite fuite ou panne critique, l&apos;artisan peut intervenir jusqu&apos;à ce montant. Au-delà, votre accord écrit est obligatoire.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number"
                                        step="5000"
                                        min="0"
                                        value={seuilTravauxAccord}
                                        onChange={(e) => setSeuilTravauxAccord(Number(e.target.value))}
                                        className="w-32 p-2 bg-white border border-slate-300 rounded-xl text-xs font-black text-right"
                                    />
                                    <span className="text-xs font-bold text-slate-600">XOF</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Rémunération & Durée du Mandat */}
                    {currentStep === 4 && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            {/* Simulator Card */}
                            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-indigo-500/30">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-400">
                                            <DollarSign size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-white uppercase tracking-wider">
                                                Simulateur de Gain en Direct
                                            </h4>
                                            <p className="text-xs text-indigo-200">
                                                Visualisez exactement ce qui vous revient net chaque mois.
                                            </p>
                                        </div>
                                    </div>
                                    <span className="bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                                        {commissionPct}% d&apos;honoraires
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                    <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10">
                                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">
                                            Loyer Mensuel Estimé
                                        </p>
                                        <p className="text-lg font-black text-white">
                                            {activeRent.toLocaleString('fr-FR')} XOF
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Payé par le locataire</p>
                                    </div>

                                    <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10">
                                        <p className="text-[10px] font-bold text-amber-300 uppercase tracking-widest mb-1">
                                            Frais de Gestion ({commissionPct}%)
                                        </p>
                                        <p className="text-lg font-black text-amber-400">
                                            - {fraisGestionMensuels.toLocaleString('fr-FR')} XOF
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Rémunération du gestionnaire</p>
                                    </div>

                                    <div className="bg-emerald-500/20 p-3.5 rounded-2xl border border-emerald-400/30">
                                        <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest mb-1">
                                            Net dans votre poche
                                        </p>
                                        <p className="text-xl font-black text-emerald-400">
                                            {revenuNetProprietaire.toLocaleString('fr-FR')} XOF
                                        </p>
                                        <p className="text-[10px] text-emerald-200 mt-0.5">Reversé chaque mois</p>
                                    </div>
                                </div>
                            </div>

                            {/* Commission Slider & Settings */}
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-black uppercase tracking-wider text-slate-800">
                                        Pourcentage d&apos;honoraires de gestion (%)
                                    </label>
                                    <span className="text-base font-black text-slate-900 bg-white px-3 py-1 rounded-xl border border-slate-200">
                                        {commissionPct}%
                                    </span>
                                </div>

                                <input 
                                    type="range"
                                    min="3"
                                    max="15"
                                    step="0.5"
                                    value={commissionPct}
                                    onChange={(e) => setCommissionPct(Number(e.target.value))}
                                    className="w-full accent-amber-500 cursor-pointer"
                                />

                                <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                                    <span>3% (Gestion allégée)</span>
                                    <span className="text-amber-700 font-bold">8% - 10% (Usage standard Abidjan)</span>
                                    <span>15% (Plafond légal max)</span>
                                </div>
                            </div>

                            {/* Duration & Dates */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                                    <label className="text-xs font-black uppercase tracking-wider text-slate-800 block">
                                        Durée d&apos;engagement initiale
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[1, 2, 3].map(years => (
                                            <button
                                                key={years}
                                                type="button"
                                                onClick={() => setDurationYears(years)}
                                                className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                                                    durationYears === years 
                                                        ? "bg-slate-900 text-white shadow-sm" 
                                                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                                                }`}
                                            >
                                                {years} an{years > 1 ? "s" : ""}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-medium mt-1">
                                        Du <strong>{new Date(startDate).toLocaleDateString('fr-FR')}</strong> au <strong>{new Date(endDate).toLocaleDateString('fr-FR')}</strong>.
                                    </p>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                                    <label className="text-xs font-black uppercase tracking-wider text-slate-800 block">
                                        Date de prise d&apos;effet
                                    </label>
                                    <input 
                                        type="date"
                                        required
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                                    />
                                    <p className="text-[11px] text-slate-400 font-medium">
                                        Généralement dès la signature du mandat.
                                    </p>
                                </div>
                            </div>

                            {/* Tacite reconduction */}
                            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                                <ShieldCheck size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                                <div className="text-xs">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-black text-emerald-950 uppercase tracking-wider">
                                            Clause de Reconduction Tacite & Préavis de 3 mois
                                        </h4>
                                        <span className="bg-emerald-200 text-emerald-900 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                                            Inclus
                                        </span>
                                    </div>
                                    <p className="text-emerald-800 font-medium leading-relaxed">
                                        Le contrat se renouvelle chaque année automatiquement pour vous éviter des démarches administratives. Vous ou l&apos;agence pouvez y mettre fin à chaque date d&apos;anniversaire avec un préavis écrit de 3 mois, sans pénalité.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                        {currentStep > 1 ? (
                            <button
                                type="button"
                                onClick={() => setCurrentStep(prev => prev - 1)}
                                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2"
                            >
                                <ArrowLeft size={14} /> Étape précédente
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                            >
                                Annuler
                            </button>
                        )}

                        {currentStep < 4 ? (
                            <button
                                type="button"
                                onClick={() => {
                                    if (currentStep === 1 && !selectedPropertyId) {
                                        toast.error("Veuillez sélectionner un bien immobilier pour continuer.")
                                        return
                                    }
                                    setCurrentStep(prev => prev + 1)
                                }}
                                className="px-6 py-2.5 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-sm"
                            >
                                Étape suivante <ArrowRight size={14} />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-7 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                            >
                                {isSubmitting ? "Génération du contrat..." : "Émettre et Transmettre le Mandat"}
                                <ArrowRight size={16} />
                            </button>
                        )}
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
