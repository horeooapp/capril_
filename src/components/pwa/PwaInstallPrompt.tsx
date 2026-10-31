"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
    Download, 
    X, 
    Share, 
    PlusSquare, 
    ArrowRight, 
    Building2, 
    Home, 
    Landmark, 
    Handshake,
    Sparkles,
    CheckCircle2
} from "lucide-react"
import { PWA_ROLES, PwaRoleId, resolvePwaRole } from "./pwa-roles"
import { usePwaInstall } from "./usePwaInstall"

export default function PwaInstallPrompt() {
    const router = useRouter()
    const { 
        isStandalone, 
        isIos, 
        activeRoleKey, 
        userRole, 
        userName, 
        isSessionLoaded,
        triggerInstall 
    } = usePwaInstall()

    const [selectedRole, setSelectedRole] = useState<PwaRoleId>(activeRoleKey)
    const [isVisible, setIsVisible] = useState(false)
    const [showIosGuide, setShowIosGuide] = useState(false)

    // Synchroniser avec le rôle détecté
    useEffect(() => {
        if (activeRoleKey) {
            setSelectedRole(activeRoleKey)
        }
    }, [activeRoleKey])

    useEffect(() => {
        // Ne pas afficher si déjà en mode standalone
        if (isStandalone) return

        // Vérifier si l'utilisateur a masqué récemment
        const dismissedAt = localStorage.getItem('qapril_pwa_dismissed')
        if (dismissedAt) {
            const daysSince = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24)
            if (daysSince < 5) return
        }

        // Délai d'apparition
        const timer = setTimeout(() => {
            setIsVisible(true)
        }, 2200)

        return () => clearTimeout(timer)
    }, [isStandalone])

    const handleDismiss = () => {
        setIsVisible(false)
        localStorage.setItem('qapril_pwa_dismissed', Date.now().toString())
    }

    const currentRoleConfig = PWA_ROLES[selectedRole] || PWA_ROLES.landlord

    const handleInstallClick = async () => {
        const result = await triggerInstall(selectedRole)
        if (result === 'ios') {
            setShowIosGuide(true)
        } else if (result === 'accepted') {
            setIsVisible(false)
        }
    }

    const handleDirectAccess = () => {
        setIsVisible(false)
        router.push(currentRoleConfig.directUrl)
    }

    const getRoleIcon = (roleId: PwaRoleId, size = 16) => {
        switch (roleId) {
            case 'tenant':
                return <Home size={size} />
            case 'landlord':
                return <Building2 size={size} />
            case 'agency':
                return <Landmark size={size} />
            case 'intermediary':
                return <Handshake size={size} />
            default:
                return <Building2 size={size} />
        }
    }

    if (!isVisible || isStandalone) return null

    return (
        <aside 
            role="region"
            aria-label="Installation de l'application QAPRIL par rôle"
            className="fixed bottom-20 lg:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-[420px] z-[95] animate-in fade-in slide-in-from-bottom-5 duration-300 font-sans"
        >
            <div className="bg-slate-950/95 backdrop-blur-2xl text-white p-4 sm:p-5 rounded-2xl shadow-2xl border border-slate-700/80 flex flex-col gap-3.5 ring-1 ring-white/10">
                {/* Header avec Logo, Rôle Actif et Bouton Fermer */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img 
                                src="/icon-192.png" 
                                alt="Logo QAPRIL" 
                                className="w-11 h-11 rounded-xl object-contain bg-white p-1 shadow-md shrink-0" 
                            />
                            <span 
                                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-950 flex items-center justify-center text-[9px] text-white"
                                style={{ backgroundColor: currentRoleConfig.themeColor }}
                            >
                                ✓
                            </span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-sm text-white leading-tight">
                                    Installer l'app QAPRIL
                                </h4>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${currentRoleConfig.badgeBg} ${currentRoleConfig.badgeText} uppercase tracking-wider`}>
                                    {currentRoleConfig.shortLabel}
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-1">
                                {userName ? `Connecté : ${userName}` : currentRoleConfig.description}
                            </p>
                        </div>
                    </div>

                    <button 
                        onClick={handleDismiss}
                        className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors shrink-0"
                        aria-label="Fermer la suggestion"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Sélecteur rapide des 4 Rôles (Locataire, Propriétaire, Agence, Intermédiaire) */}
                <div className="bg-slate-900/90 p-1 rounded-xl border border-slate-800 flex items-center justify-between gap-1">
                    {(Object.keys(PWA_ROLES) as PwaRoleId[]).map((rId) => {
                        const r = PWA_ROLES[rId]
                        const isSelected = selectedRole === rId
                        return (
                            <button
                                key={rId}
                                onClick={() => {
                                    setSelectedRole(rId)
                                    setShowIosGuide(false)
                                }}
                                className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all ${
                                    isSelected 
                                        ? `bg-slate-800 text-white shadow border ${r.borderActive}` 
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                                }`}
                                title={r.fullTitle}
                            >
                                <span style={{ color: isSelected ? r.themeColor : undefined }}>
                                    {getRoleIcon(rId, 13)}
                                </span>
                                <span className="truncate">{r.shortLabel}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Guide iOS Safari */}
                {showIosGuide ? (
                    <div className="bg-slate-900/90 rounded-xl p-3.5 text-xs text-slate-200 space-y-2.5 border border-slate-800">
                        <p className="font-bold text-amber-300 flex items-center gap-1.5">
                            <PlusSquare size={16} /> Installation sur iPhone & iPad :
                        </p>
                        <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300">
                            <li>Appuyez sur le bouton <strong>Partager</strong> <Share size={13} className="inline mx-1 text-sky-400" /> en bas de Safari.</li>
                            <li>Faites défiler vers le bas et sélectionnez <strong>« Sur l'écran d'accueil »</strong>.</li>
                            <li>Validez en haut à droite en appuyant sur <strong>« Ajouter »</strong>.</li>
                        </ol>
                        <div className="flex items-center gap-2 pt-1">
                            <button 
                                onClick={handleDirectAccess}
                                className="flex-1 py-2 bg-gradient-to-r from-[#FF8200] to-amber-500 text-slate-950 rounded-xl text-xs font-bold text-center transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                            >
                                <span>Accéder à {currentRoleConfig.shortLabel}</span>
                                <ArrowRight size={13} />
                            </button>
                            <button 
                                onClick={() => setShowIosGuide(false)}
                                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                            >
                                Retour
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Description du rôle sélectionné */}
                        <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800/70 text-[11.5px] text-slate-300 flex items-start gap-2">
                            <span className="mt-0.5 text-amber-400 shrink-0">
                                <Sparkles size={14} />
                            </span>
                            <div className="leading-snug">
                                <strong className="text-white block font-semibold">{currentRoleConfig.fullTitle}</strong>
                                <span>{currentRoleConfig.description}</span>
                            </div>
                        </div>

                        {/* Actions : 1. Installer l'application  |  2. Accéder directement */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-0.5">
                            <button
                                onClick={handleInstallClick}
                                className={`flex-1 bg-gradient-to-r ${currentRoleConfig.gradient} text-slate-950 font-black text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 uppercase tracking-wider`}
                            >
                                <Download size={15} strokeWidth={2.5} />
                                <span>Installer {currentRoleConfig.shortLabel}</span>
                            </button>

                            <button
                                onClick={handleDirectAccess}
                                className="bg-slate-800/90 hover:bg-slate-800 text-white border border-slate-700 font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors active:scale-95 whitespace-nowrap"
                                title={`Ouvrir directement ${currentRoleConfig.fullTitle}`}
                            >
                                <span>Accéder directement</span>
                                <ArrowRight size={14} className="text-amber-400" />
                            </button>
                        </div>

                        {/* Bouton Plus tard */}
                        <div className="flex justify-center pt-0.5">
                            <button
                                onClick={handleDismiss}
                                className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                            >
                                Plus tard
                            </button>
                        </div>
                    </>
                )}
            </div>
        </aside>
    )
}
