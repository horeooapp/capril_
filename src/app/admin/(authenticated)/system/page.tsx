"use client"

import { useState, useEffect, useMemo } from "react"
import { toggleFeature, getFeatureFlags } from "@/actions/system-actions"
import { AppFeature } from "@/lib/features"
import { motion } from "framer-motion"
import KycLevelManager from "@/components/admin/KycLevelManager"
import { 
    Search, Filter, ShieldCheck, CheckCircle2, XCircle, 
    Smartphone, CreditCard, Landmark, FileText, Briefcase, 
    Users, Trees, Scale, Bot, AlertTriangle, Eye, Layers
} from "lucide-react"

export interface SystemFeatureDef {
    key: AppFeature
    label: string
    description: string
    category: "PAIEMENT" | "JURIDIQUE" | "OPERATIONS" | "COMMUNICATION" | "MARKETING" | "INTELLIGENCE"
    icon: string
    badge?: string
    critical?: boolean
}

const CATEGORIES = [
    { id: "ALL", label: "Tous les modules" },
    { id: "PAIEMENT", label: "💳 Paiements & Finance" },
    { id: "JURIDIQUE", label: "⚖️ Juridique & Fiscalité" },
    { id: "OPERATIONS", label: "🏢 Gestion & Baux" },
    { id: "COMMUNICATION", label: "📱 Communication & SMS" },
    { id: "INTELLIGENCE", label: "🤖 Intelligence & IA" },
    { id: "MARKETING", label: "🌍 Vitrine & Observatoire" },
]

const SYSTEM_FEATURES: SystemFeatureDef[] = [
    // ─── PAIEMENTS & FINANCE ───
    {
        key: "PAYMENT_GATEWAY",
        label: "Passerelle de Paiement (PGW)",
        description: "Contrôle global de tous les encaissements en ligne (Wave, FeexPay: Orange/MTN/Moov, Cartes).",
        category: "PAIEMENT",
        icon: "💳",
        badge: "Cœur",
        critical: true
    },
    {
        key: "PAYMENT_TEST_MODE",
        label: "Mode Sandbox (Paiements)",
        description: "Bascule FeexPay et les passerelles mobiles en environnement de test/sandbox sans mouvement bancaire réel.",
        category: "PAIEMENT",
        icon: "🧪",
        badge: "FeexPay"
    },
    {
        key: "CDC_CONSIGNATION",
        label: "Séquestre Caisse des Dépôts (CDC-CI)",
        description: "Module officiel de consignation des dépôts de garantie (2 mois max) selon la loi ivoirienne.",
        category: "PAIEMENT",
        icon: "🏦",
        badge: "Légal CI",
        critical: true
    },
    {
        key: "ASSURANCE_LOYER",
        label: "Assurance Loyers Impayés (GLI)",
        description: "Souscription et gestion des garanties contre les loyers impayés via nos partenaires assureurs.",
        category: "PAIEMENT",
        icon: "🛡️"
    },
    {
        key: "DIASPORA_PACKAGE",
        label: "Pack Propriétaires Diaspora",
        description: "Services dédiés aux bailleurs ivoiriens résidant à l'étranger (paiement CB international Stripe, suivi à distance).",
        category: "PAIEMENT",
        icon: "✈️"
    },

    // ─── JURIDIQUE & FISCALITÉ ───
    {
        key: "M17_FISCAL",
        label: "Enregistrement Fiscal DGI (M17)",
        description: "Calcul automatique des droits d'enregistrement (1% annuel), télé-déclaration et certificats fiscaux.",
        category: "JURIDIQUE",
        icon: "📜",
        badge: "DGI",
        critical: true
    },
    {
        key: "M16_ANAH",
        label: "Portail Institutionnel & Aides",
        description: "Accès de vérification pour les inspecteurs d'État, conformité habitat et subventions de rénovation.",
        category: "JURIDIQUE",
        icon: "🏛️"
    },
    {
        key: "MEDIATION_CENTER",
        label: "Centre de Médiation & Entente",
        description: "Plateforme de conciliation amiable et rédaction des protocoles d'accord pré-contentieux.",
        category: "JURIDIQUE",
        icon: "⚖️"
    },
    {
        key: "KYC_VERIFICATION",
        label: "Vérification d'Identité KYC (IA)",
        description: "Contrôle automatique et certification des CNI, passeports, attestations et statuts professionnels.",
        category: "JURIDIQUE",
        icon: "🪪",
        critical: true
    },

    // ─── GESTION & OPÉRATIONS ───
    {
        key: "BDQ_VERBAL",
        label: "Bail Déclaratif & Baux Verbaux (BDQ)",
        description: "Formalisation et scellement numérique des accords locatifs verbaux avec confirmation unilatérale par SMS.",
        category: "OPERATIONS",
        icon: "📝",
        badge: "Exclusif"
    },
    {
        key: "M_MANDAT",
        label: "Multi-Mandats Propriétaire-Agence",
        description: "Gestion des mandats de gestion déléguée, co-exclusifs ou simples entre propriétaires et cabinets immobiliers.",
        category: "OPERATIONS",
        icon: "🤝"
    },
    {
        key: "M_COLOC",
        label: "Colocation Native & Parts de Loyer",
        description: "Baux à occupants multiples, ventilation automatique des montants et quittances individuelles séparées.",
        category: "OPERATIONS",
        icon: "👥"
    },
    {
        key: "M_TERRAIN",
        label: "Location Terrains Nus & Foncier",
        description: "Contrats spécifiques pour parcelles nues, maraîchage, entreposage, parkings et baux emphytéotiques.",
        category: "OPERATIONS",
        icon: "🌳"
    },

    // ─── COMMUNICATION & MESSAGERIE ───
    {
        key: "SMS_NOTIFICATIONS",
        label: "Notifications & Rappels SMS / WhatsApp",
        description: "Relances d'échéance automatisées, envoi des liens de signature et alertes de paiement via OpenWA / SMS.",
        category: "COMMUNICATION",
        icon: "📲",
        critical: true
    },
    {
        key: "USSD_PORTAL",
        label: "Portail USSD Sans Internet (*600#)",
        description: "Accès simplifié par menu USSD pour consultation du solde de loyer et validation par téléphone basique.",
        category: "COMMUNICATION",
        icon: "📟"
    },
    {
        key: "NEWS_TICKER",
        label: "Bandeau Flash Actualités Immobilières",
        description: "Diffusion d'alertes légales, lois de finances et conseils pratiques sur les tableaux de bord utilisateurs.",
        category: "COMMUNICATION",
        icon: "📢"
    },

    // ─── INTELLIGENCE & IA ───
    {
        key: "AI_ASSISTANT",
        label: "Assistant Juridique IA (Claude / Gemini)",
        description: "Génération de clauses sur-mesure, assistance conversationnelle bilingue et aide aux états des lieux.",
        category: "INTELLIGENCE",
        icon: "🤖",
        badge: "IA"
    },
    {
        key: "CANDIDATURES",
        label: "Qapril Match & Scoring ICL",
        description: "Moteur intelligent de recommandation locataire/bien et calcul de l'Indice de Confiance Locative.",
        category: "INTELLIGENCE",
        icon: "🎯",
        badge: "Matching"
    },

    // ─── MARKETING & OBSERVATOIRE ───
    {
        key: "LANDING_PAGE",
        label: "Vitrine Publique & Landing Page",
        description: "Portail marketing d'accueil pour la présentation des solutions, piliers et tarifs.",
        category: "MARKETING",
        icon: "🌐"
    },
    {
        key: "HOME_OBSERVATORY",
        label: "Observatoire National des Loyers",
        description: "Indicateurs de tension locative, baromètre trimestriel et tendances par type de logement.",
        category: "MARKETING",
        icon: "📈"
    },
    {
        key: "HOME_GEO_ANALYSIS",
        label: "Analyse Géo-Spatiale & Cartographie",
        description: "Comparateur de prix au m² par commune (Cocody, Yopougon, Marcory) et zones côtières.",
        category: "MARKETING",
        icon: "🗺️"
    },
    {
        key: "HOME_RENT_RANKING",
        label: "Palmarès & Classement des Quartiers",
        description: "Top des zones à forte rentabilité locative et quartiers les plus accessibles pour les familles.",
        category: "MARKETING",
        icon: "🏆"
    },
    {
        key: "HOME_IMPACT_STATS",
        label: "Compteur d'Impact National",
        description: "Statistiques en temps réel sur les volumes de cautions protégées, baux déclarés et litiges évités.",
        category: "MARKETING",
        icon: "📊"
    },
]

export default function SystemPage() {
    const [flags, setFlags] = useState<Record<string, boolean>>({})
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState<string | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<string>("ALL")
    const [searchQuery, setSearchQuery] = useState<string>("")

    async function loadFlags() {
        const data = await getFeatureFlags()
        setFlags(data)
        setLoading(false)
    }

    useEffect(() => {
        loadFlags()
    }, [])

    async function handleToggle(feature: AppFeature) {
        setUpdating(feature)
        const currentStatus = flags[feature] !== false // Défaut = actif
        const newStatus = !currentStatus
        
        const result = await toggleFeature(feature, newStatus)
        if (result?.success) {
            setFlags(prev => ({ ...prev, [feature]: newStatus }))
        } else if (result?.error) {
            alert(result.error)
        }
        setUpdating(null)
    }

    // Filtrage dynamique
    const filteredFeatures = useMemo(() => {
        return SYSTEM_FEATURES.filter(f => {
            const matchesCat = selectedCategory === "ALL" || f.category === selectedCategory
            const matchesSearch = searchQuery === "" || 
                f.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                f.key.toLowerCase().includes(searchQuery.toLowerCase())
            return matchesCat && matchesSearch
        })
    }, [selectedCategory, searchQuery])

    // Métriques globales
    const activeCount = SYSTEM_FEATURES.filter(f => flags[f.key] !== false).length
    const totalCount = SYSTEM_FEATURES.length

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-slate-400 animate-pulse font-medium">
                Chargement de la configuration système QAPRIL...
            </div>
        )
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-16">
            
            {/* EN-TÊTE DE PAGE */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-amber-400 text-[11px] font-black uppercase tracking-widest mb-3">
                        <Layers className="w-3.5 h-3.5" />
                        QAPRIL Core Engine · Administration Centrale
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Configuration Système & Modules
                    </h1>
                    <p className="text-sm text-slate-600 font-medium mt-1 max-w-2xl">
                        Supervisez les niveaux de certification KYC, pilotez les passerelles de paiement (FeexPay, Wave) et activez ou coupez les modules applicatifs en temps réel.
                    </p>
                </div>

                {/* BADGE STATUT GLOBAL */}
                <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 font-black text-lg">
                        {activeCount}/{totalCount}
                    </div>
                    <div>
                        <div className="text-xs font-black uppercase tracking-wider text-slate-400">Modules Actifs</div>
                        <div className="text-sm font-bold text-slate-900">
                            {activeCount === totalCount ? "100% Opérationnel" : `${totalCount - activeCount} module(s) en pause`}
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTRÔLE PRINCIPAL DES NIVEAUX KYC */}
            <KycLevelManager showBulkUserActions={true} />

            {/* SECTION MODULES APPLICATIFS */}
            <div className="space-y-6 pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                Modules Applicatifs & Fonctionnalités
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-black">
                                {filteredFeatures.length}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                            Basculez chaque fonctionnalité en 1 clic. Les modifications s'appliquent immédiatement sur l'ensemble de la plateforme et sont tracées en audit.
                        </p>
                    </div>

                    {/* CHAMP DE RECHERCHE */}
                    <div className="relative w-full md:w-72">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Rechercher un module..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                        />
                    </div>
                </div>

                {/* FILTRES PAR CATÉGORIE */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                selectedCategory === cat.id
                                    ? "bg-slate-900 text-white shadow-sm"
                                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* GRILLE DES MODULES */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredFeatures.map((feature) => {
                        const isActive = flags[feature.key] !== false
                        const isUpdating = updating === feature.key

                        return (
                            <motion.div 
                                key={feature.key}
                                layout
                                transition={{ duration: 0.2 }}
                                className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                                    isActive 
                                        ? "bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300" 
                                        : "bg-slate-50/70 border-dashed border-slate-300 opacity-75"
                                }`}
                            >
                                <div>
                                    {/* TOP CARD : ICONE + BADGES + TOGGLE */}
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                                                isActive ? "bg-amber-50 border border-amber-200/60" : "bg-slate-200 text-slate-400"
                                            }`}>
                                                {feature.icon}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    {feature.badge && (
                                                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider">
                                                            {feature.badge}
                                                        </span>
                                                    )}
                                                    {feature.critical && (
                                                        <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 text-[10px] font-black uppercase tracking-wider">
                                                            Critique
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] font-mono font-bold text-slate-400 mt-0.5">
                                                    {feature.key}
                                                </div>
                                            </div>
                                        </div>

                                        {/* INTERRUPTEUR TOGGLE */}
                                        <button
                                            type="button"
                                            onClick={() => handleToggle(feature.key)}
                                            disabled={isUpdating}
                                            className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                isActive ? "bg-emerald-600" : "bg-slate-300"
                                            } ${isUpdating ? "opacity-50 cursor-wait" : ""}`}
                                            title={isActive ? "Désactiver ce module" : "Activer ce module"}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                                    isActive ? "translate-x-5" : "translate-x-0"
                                                }`}
                                            />
                                        </button>
                                    </div>

                                    {/* TITRE & DESCRIPTION */}
                                    <h3 className="text-base font-black text-slate-900 mb-1.5 leading-snug">
                                        {feature.label}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>

                                {/* FOOTER DE CARTE : STATUT VISUEL */}
                                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5 font-bold">
                                        {isActive ? (
                                            <>
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-emerald-700 text-[11px]">Opérationnel</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="w-2 h-2 rounded-full bg-slate-400" />
                                                <span className="text-slate-400 text-[11px]">Désactivé</span>
                                            </>
                                        )}
                                    </div>

                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                        {feature.category}
                                    </span>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                {filteredFeatures.length === 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                        <h4 className="font-bold text-slate-900 mb-1">Aucun module ne correspond à votre recherche</h4>
                        <p className="text-xs text-slate-500">Essayez un autre mot-clé ou réinitialisez le filtre de catégorie.</p>
                    </div>
                )}
            </div>

            {/* AVERTISSEMENT DE SÉCURITÉ */}
            <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex items-start gap-4">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                    <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider">
                        Gouvernance & Sécurité des Modules
                    </h4>
                    <p className="text-xs text-amber-800 leading-relaxed font-medium">
                        La désactivation d'un module critique (ex: Passerelle de Paiement ou Notifications SMS) met immédiatement en pause les transactions correspondantes pour l'ensemble des utilisateurs (Propriétaires, Locataires, Agences). Les données stockées en base restent scellées et ne sont jamais supprimées.
                    </p>
                </div>
            </div>
        </div>
    )
}
