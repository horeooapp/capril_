"use client"

import { useState, useEffect } from "react"
import { toggleFeature, getFeatureFlags } from "@/actions/system-actions"
import { AppFeature } from "@/lib/features"
import { motion } from "framer-motion"

const FEATURES: { key: AppFeature; label: string; description: string }[] = [
    { 
        key: "M17_FISCAL", 
        label: "Enregistrement Fiscal (M17)", 
        description: "Active le calcul des droits DGI et la génération des certificats fiscaux." 
    },
    { 
        key: "M16_ANAH", 
        label: "Mode Institutionnel ANAH", 
        description: "Permet aux agents ANAH de consulter les baux et certifications." 
    },
    { 
        key: "CDC_CONSIGNATION", 
        label: "Consignation CDC-CI", 
        description: "Gestion des dépôts de garantie auprès de la Caisse des Dépôts." 
    },
    { 
        key: "ASSURANCE_LOYER", 
        label: "Assurance Loyers Impayés", 
        description: "Module de souscription aux assurances partenaires." 
    },
    { 
        key: "MEDIATION_CENTER", 
        label: "Centre de Médiation", 
        description: "Plateforme de résolution des litiges bailleur/locataire." 
    },
    { 
        key: "KYC_VERIFICATION", 
        label: "Vérification d'Identité (KYC)", 
        description: "Validation automatique des pièces d'identité via IA." 
    },
    { 
        key: "SMS_NOTIFICATIONS", 
        label: "Notifications SMS", 
        description: "Envoi de rappels de paiement et alertes par SMS." 
    },
    { 
        key: "USSD_PORTAL", 
        label: "Portail USSD (*600#)", 
        description: "Accès aux services de base sans connexion internet." 
    },
    { 
        key: "NEWS_TICKER", 
        label: "Espace Actualités", 
        description: "Affichage des flash infos et alertes sur le portail." 
    },
    { 
        key: "LANDING_PAGE", 
        label: "Page d'Accueil Marketing", 
        description: "Active ou désactive la Landing Page marketing pour les utilisateurs connectés." 
    },
    { 
        key: "M_MANDAT", 
        label: "Gestion Multi-Mandats", 
        description: "Permet aux propriétaires de confier leurs biens à plusieurs agences simultanément." 
    },
    { 
        key: "M_COLOC", 
        label: "Colocation Native", 
        description: "Gestion des occupants multiples, parts de loyer et quittances individuelles." 
    },
    { 
        key: "M_TERRAIN", 
        label: "Location Terrains Nus", 
        description: "Module spécifique pour les parcelles non bâties (parking, stockage, maraîchage)." 
    },
]

export default function SystemPage() {
    const [flags, setFlags] = useState<Record<string, boolean>>({})
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState<string | null>(null)

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
        const currentStatus = flags[feature] !== false // Default to true
        const newStatus = !currentStatus
        
        const result = await toggleFeature(feature, newStatus)
        if (result.success) {
            setFlags({ ...flags, [feature]: newStatus })
        }
        setUpdating(null)
    }

    if (loading) return <div className="text-gray-400 animate-pulse">Chargement de la configuration...</div>

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Configuration du Système</h1>
                <p className="text-gray-400">Activez ou désactivez les modules applicatifs en temps réel.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {FEATURES.map((feature) => {
                    const isActive = flags[feature.key] !== false
                    return (
                        <motion.div 
                            key={feature.key}
                            whileHover={{ scale: 1.02 }}
                            className={`p-6 rounded-xl border transition-all ${
                                isActive 
                                    ? "bg-gray-800/50 border-indigo-500/30 shadow-lg shadow-indigo-500/10" 
                                    : "bg-gray-900 border-gray-700 opacity-75"
                            }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-gray-700/50 rounded-lg">
                                    <span className="text-2xl">
                                        {
                                            feature.key.includes("FISCAL") ? "🏦" : 
                                            feature.key.includes("SMS") ? "📱" : 
                                            feature.key === "M_MANDAT" ? "📋" :
                                            feature.key === "M_COLOC" ? "👥" :
                                            feature.key === "M_TERRAIN" ? "🌳" :
                                            "⚙️"
                                        }
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleToggle(feature.key)}
                                    disabled={updating === feature.key}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        isActive ? "bg-indigo-600" : "bg-gray-600"
                                    } ${updating === feature.key ? "opacity-50" : ""}`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            isActive ? "translate-x-5" : "translate-x-0"
                                        }`}
                                    />
                                </button>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-1">{feature.label}</h3>
                            <p className="text-sm text-gray-400 line-clamp-2">{feature.description}</p>
                            
                            <div className="mt-4 flex items-center">
                                <span className={`h-2 w-2 rounded-full mr-2 ${isActive ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></span>
                                <span className={`text-xs font-medium ${isActive ? "text-green-400" : "text-red-400"}`}>
                                    {isActive ? "Opérationnel" : "Désactivé"}
                                </span>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            <div className="bg-amber-900/20 border border-amber-900/30 p-4 rounded-lg flex items-start space-x-3">
                <span className="text-amber-500 text-xl font-bold">⚠️</span>
                <div>
                    <h4 className="text-amber-500 font-semibold italic">Avertissement</h4>
                    <p className="text-sm text-amber-200/70">
                        La désactivation d'un module critique peut impacter l'expérience utilisateur ou bloquer certains flux de paiement. 
                        Toutes les modifications sont enregistrées dans le journal d'audit.
                    </p>
                </div>
            </div>
        </div>
    )
}
